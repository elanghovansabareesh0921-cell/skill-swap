"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Whiteboard from "@/components/Whiteboard";
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  MonitorUp,
  PhoneOff,
  Edit3,
  Palette,
  Subtitles,
  ShieldCheck,
  Minimize2,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface VideoRoomProps {
  sessionId: string;
  currentUserId: string;
  onClose: () => void;
  onComplete?: () => void;
}

const DEFAULT_ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
  iceCandidatePoolSize: 10,
};

// Helper: Generate a silent video/audio stream if user has no media devices
function createDummyStream(): MediaStream {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#64748b";
    ctx.font = "20px sans-serif";
    ctx.fillText("Camera Offline", 240, 240);
  }
  const canvasStream = canvas.captureStream(10);
  return canvasStream;
}

export default function VideoRoom({
  sessionId,
  currentUserId,
  onClose,
  onComplete,
}: VideoRoomProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const channelRef = useRef<any>(null);

  // Queues to solve ICE candidate race conditions
  const pendingRemoteCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const pendingLocalCandidatesRef = useRef<any[]>([]);
  const isChannelSubscribedRef = useRef<boolean>(false);

  // Glare / collision management
  const isMakingOfferRef = useRef<boolean>(false);
  const isSettingRemoteAnswerPendingRef = useRef<boolean>(false);

  // States
  const [callStatus, setCallStatus] = useState<string>("Initializing WebRTC...");
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>("new");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [remotePeerActive, setRemotePeerActive] = useState(false);

  // Dynamic drawer tool
  const [activeTool, setActiveTool] = useState<"NONE" | "SCRATCHPAD" | "WHITEBOARD">("NONE");
  const [sharedNotes, setSharedNotes] = useState<string>(
    "// Collaborative Session Notes & Code\n// Synced live between peers\n"
  );

  // Live Speech Recognition & Closed Captions
  const [isTranscribing, setIsTranscribing] = useState(true);
  const [currentCaption, setCurrentCaption] = useState<string>("");
  const fullTranscriptRef = useRef<string>("");
  const recognitionRef = useRef<any>(null);

  const supabase = createClient();

  // Helper: Flush pending remote ICE candidates after setRemoteDescription
  const flushRemoteCandidates = useCallback(async (pc: RTCPeerConnection) => {
    if (!pc.remoteDescription) return;
    const candidates = [...pendingRemoteCandidatesRef.current];
    pendingRemoteCandidatesRef.current = [];
    for (const candidate of candidates) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.warn("Failed to add queued remote candidate:", e);
      }
    }
  }, []);

  // Helper: Send message over Supabase broadcast channel safely
  const sendBroadcast = useCallback((event: string, payload: any) => {
    if (channelRef.current && isChannelSubscribedRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event,
        payload: { ...payload, senderId: currentUserId },
      });
    } else {
      pendingLocalCandidatesRef.current.push({ event, payload });
    }
  }, [currentUserId]);

  // Main WebRTC Initialization
  useEffect(() => {
    let channel: any;
    let isMounted = true;

    async function setupWebRTC() {
      try {
        setCallStatus("Fetching ICE servers...");

        let rtcConfig = DEFAULT_ICE_SERVERS;
        try {
          const res = await fetch("/api/webrtc/ice");
          const data = await res.json();
          if (data.iceServers && data.iceServers.length > 0) {
            rtcConfig = { ...DEFAULT_ICE_SERVERS, iceServers: data.iceServers };
          }
        } catch (e) {
          console.warn("Falling back to standard STUN:", e);
        }

        if (!isMounted) return;

        // 1. Acquire User Media with progressive fallback
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: { echoCancellation: true, noiseSuppression: true },
          });
        } catch (videoError) {
          console.warn("Camera failed, attempting audio-only:", videoError);
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: false,
              audio: true,
            });
          } catch (audioError) {
            console.warn("No audio/video hardware accessible, creating placeholder stream:", audioError);
            stream = createDummyStream();
          }
        }

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // 2. Instantiate RTCPeerConnection
        const pc = new RTCPeerConnection(rtcConfig);
        pcRef.current = pc;

        // Add local stream tracks to RTCPeerConnection
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        // 3. Handle remote inbound tracks
        pc.ontrack = (event) => {
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
            setRemotePeerActive(true);
            setCallStatus("Peer Connected (P2P Stream)");
            remoteVideoRef.current.play().catch((err) => {
              console.warn("Remote video auto-play interrupted:", err);
            });
          }
        };

        // 4. Connection state monitoring
        pc.onconnectionstatechange = () => {
          setConnectionState(pc.connectionState);
          if (pc.connectionState === "connected") {
            setCallStatus("Connected (P2P Encrypted)");
            setRemotePeerActive(true);
          } else if (pc.connectionState === "connecting") {
            setCallStatus("Negotiating P2P connection...");
          } else if (pc.connectionState === "disconnected") {
            setCallStatus("Peer disconnected. Reconnecting...");
          } else if (pc.connectionState === "failed") {
            setCallStatus("Connection failed. Attempting ICE restart...");
            pc.restartIce();
          }
        };

        pc.oniceconnectionstatechange = () => {
          if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
            setRemotePeerActive(true);
          }
        };

        // 5. Outbound ICE candidates
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            sendBroadcast("ice-candidate", { candidate: event.candidate.toJSON() });
          }
        };

        // 6. Supabase Realtime Signaling Channel
        channel = supabase.channel(`call_room_${sessionId}`, {
          config: { broadcast: { self: false } },
        });
        channelRef.current = channel;

        // Perfect negotiation helper: Polite peer yields on collision
        const isPolite = (peerId: string) => currentUserId > peerId;

        channel
          .on("broadcast", { event: "user-joined" }, async (msg: any) => {
            const senderId = msg.payload?.senderId;
            if (senderId && senderId !== currentUserId) {
              setCallStatus("Peer joined room, sending offer...");
              try {
                isMakingOfferRef.current = true;
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                sendBroadcast("offer", { offer, targetId: senderId });
              } catch (err) {
                console.error("Error creating offer:", err);
              } finally {
                isMakingOfferRef.current = false;
              }
            }
          })
          .on("broadcast", { event: "offer" }, async (msg: any) => {
            const senderId = msg.payload?.senderId;
            if (senderId === currentUserId) return;

            const offer = msg.payload?.offer;
            if (!offer) return;

            // Detect Offer Collision / Glare
            const isCollision =
              isMakingOfferRef.current || pc.signalingState !== "stable";

            if (isCollision) {
              if (!isPolite(senderId)) {
                // Impolite peer ignores colliding offer
                return;
              }
              // Polite peer rolls back local description to accept incoming offer
              await pc.setLocalDescription({ type: "rollback" } as any);
            }

            try {
              setCallStatus("Offer received, generating answer...");
              await pc.setRemoteDescription(new RTCSessionDescription(offer));
              await flushRemoteCandidates(pc);

              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              sendBroadcast("answer", { answer, targetId: senderId });
            } catch (err) {
              console.error("Error handling offer:", err);
            }
          })
          .on("broadcast", { event: "answer" }, async (msg: any) => {
            const senderId = msg.payload?.senderId;
            if (senderId === currentUserId) return;

            const answer = msg.payload?.answer;
            if (!answer) return;

            try {
              isSettingRemoteAnswerPendingRef.current = true;
              await pc.setRemoteDescription(new RTCSessionDescription(answer));
              await flushRemoteCandidates(pc);
              setCallStatus("Connected (P2P Stream Active)");
              setRemotePeerActive(true);
            } catch (err) {
              console.error("Error setting remote answer:", err);
            } finally {
              isSettingRemoteAnswerPendingRef.current = false;
            }
          })
          .on("broadcast", { event: "ice-candidate" }, async (msg: any) => {
            const senderId = msg.payload?.senderId;
            if (senderId === currentUserId) return;

            const candidate = msg.payload?.candidate;
            if (!candidate) return;

            if (pc.remoteDescription && pc.remoteDescription.type) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
              } catch (err) {
                console.warn("addIceCandidate error:", err);
              }
            } else {
              // Queue candidate until setRemoteDescription completes
              pendingRemoteCandidatesRef.current.push(candidate);
            }
          })
          .on("broadcast", { event: "scratchpad-update" }, (msg: any) => {
            if (msg.payload?.senderId !== currentUserId) {
              setSharedNotes(msg.payload?.content || "");
            }
          })
          .on("broadcast", { event: "peer-left" }, (msg: any) => {
            if (msg.payload?.senderId !== currentUserId) {
              setRemotePeerActive(false);
              setCallStatus("Peer left the room");
            }
          })
          .subscribe((status: string) => {
            if (status === "SUBSCRIBED") {
              isChannelSubscribedRef.current = true;
              setCallStatus("Channel ready. Waiting for peer...");

              // Announce presence
              channel.send({
                type: "broadcast",
                event: "user-joined",
                payload: { senderId: currentUserId },
              });

              // Flush any queued local messages
              const queued = [...pendingLocalCandidatesRef.current];
              pendingLocalCandidatesRef.current = [];
              for (const item of queued) {
                channel.send({
                  type: "broadcast",
                  event: item.event,
                  payload: { ...item.payload, senderId: currentUserId },
                });
              }
            }
          });
      } catch (err: any) {
        console.error("WebRTC initialization error:", err);
        setCallStatus(`Media initialization note: ${err.message}`);
      }
    }

    setupWebRTC();

    // 7. Speech Recognition for Closed Captions & Transcript Distillation
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let interim = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const piece = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              fullTranscriptRef.current += " " + piece;
            } else {
              interim += piece;
            }
          }
          setCurrentCaption(interim || "Listening...");
        };

        recognition.onerror = (e: any) => {
          if (e.error !== "no-speech") {
            console.warn("Speech recognition warning:", e.error);
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        console.warn("Speech recognition could not be started:", err);
      }
    }

    // Comprehensive Unmount & Teardown
    return () => {
      isMounted = false;

      // Broadcast departure
      if (channelRef.current && isChannelSubscribedRef.current) {
        try {
          channelRef.current.send({
            type: "broadcast",
            event: "peer-left",
            payload: { senderId: currentUserId },
          });
        } catch {
          // ignore
        }
      }

      // Stop all tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      // Close PeerConnection
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
      // Cleanup Realtime channel
      if (channel) {
        supabase.removeChannel(channel);
      }
      // Stop Speech recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, [sessionId, currentUserId, supabase, flushRemoteCandidates, sendBroadcast]);

  // Handle Scratchpad note sync
  const handleNotesChange = (val: string) => {
    setSharedNotes(val);
    sendBroadcast("scratchpad-update", { content: val });
  };

  // Toggle Microphone
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // Toggle Camera
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  // Toggle Screen Share with track replacement
  const toggleScreenShare = async () => {
    if (!pcRef.current || !localStreamRef.current) return;

    if (!isSharingScreen) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        screenStreamRef.current = screenStream;

        const screenTrack = screenStream.getVideoTracks()[0];
        const videoSender = pcRef.current
          .getSenders()
          .find((s) => s.track?.kind === "video");

        if (videoSender) {
          await videoSender.replaceTrack(screenTrack);
        }

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        screenTrack.onended = () => {
          stopScreenShare();
        };

        setIsSharingScreen(true);
      } catch (err) {
        console.warn("Screen share request cancelled or error:", err);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = async () => {
    if (!pcRef.current || !localStreamRef.current) return;

    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }

    const originalVideoTrack = localStreamRef.current.getVideoTracks()[0];
    const videoSender = pcRef.current
      .getSenders()
      .find((s) => s.track?.kind === "video");

    if (videoSender && originalVideoTrack) {
      await videoSender.replaceTrack(originalVideoTrack);
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }

    setIsSharingScreen(false);
  };

  // End Call and Trigger AI Summary Tasks
  const handleEndCall = async () => {
    setIsEnding(true);
    setCallStatus("Processing session summary...");

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }

    const tasks: Promise<any>[] = [];

    if (sharedNotes.trim().length > 30) {
      tasks.push(
        fetch("/api/sessions/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, scratchpadContent: sharedNotes }),
        })
      );
    }

    if (fullTranscriptRef.current.trim().length > 20) {
      tasks.push(
        fetch("/api/sessions/transcript", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            transcript: fullTranscriptRef.current,
          }),
        })
      );
    }

    try {
      await Promise.allSettled(tasks);
    } catch (e) {
      console.error("End call sync error:", e);
    }

    if (onComplete) {
      onComplete();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-950/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 select-none animate-in fade-in duration-200">
      {/* Top Session Bar */}
      <div className="w-full max-w-6xl flex items-center justify-between pb-3 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <Badge className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 text-xs font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Native WebRTC P2P</span>
          </Badge>

          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                connectionState === "connected"
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-amber-400"
              }`}
            />
            <span className="text-xs text-gray-300 font-mono truncate max-w-xs sm:max-w-md">
              {callStatus}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="destructive"
            size="sm"
            disabled={isEnding}
            onClick={handleEndCall}
            className="text-xs font-semibold px-4 py-2"
          >
            {isEnding ? "Processing Recap..." : "End Call"}
          </Button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            title="Minimize View"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Video & Collaborative Stage */}
      <div
        className={`w-full max-w-6xl grid gap-4 my-auto relative ${
          activeTool !== "NONE" ? "md:grid-cols-3" : "md:grid-cols-2"
        }`}
      >
        {/* Remote Video Stream */}
        <div className="relative aspect-video bg-gray-900 rounded-3xl overflow-hidden border border-gray-800 flex items-center justify-center shadow-2xl">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          {!remotePeerActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 text-gray-400 p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-gray-800 text-indigo-400 flex items-center justify-center mb-3">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
              <h4 className="text-sm font-semibold text-white">
                Waiting for peer to connect...
              </h4>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">
                Once your peer joins, encrypted P2P media streaming will start automatically.
              </p>
            </div>
          )}
          <div className="absolute bottom-3 left-3 bg-gray-950/80 backdrop-blur-md px-3 py-1 rounded-xl text-xs text-white flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                remotePeerActive ? "bg-emerald-500" : "bg-gray-500"
              }`}
            />
            <span>Peer Stream</span>
          </div>
        </div>

        {/* Local Video Stream */}
        <div className="relative aspect-video bg-gray-900 rounded-3xl overflow-hidden border border-gray-800 flex items-center justify-center shadow-2xl">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${
              isSharingScreen ? "" : "-scale-x-100"
            }`}
          />
          {isVideoOff && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-gray-400">
              <VideoOff className="w-10 h-10 text-gray-600 mb-2" />
              <span className="text-xs">Camera is turned off</span>
            </div>
          )}
          <div className="absolute bottom-3 left-3 bg-gray-950/80 backdrop-blur-md px-3 py-1 rounded-xl text-xs text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{isSharingScreen ? "You (Sharing Screen)" : "You (Local Camera)"}</span>
          </div>
        </div>

        {/* Tool Drawer: Live Collaborative Scratchpad */}
        {activeTool === "SCRATCHPAD" && (
          <div className="aspect-video md:aspect-auto bg-gray-900 rounded-3xl border border-gray-800 flex flex-col overflow-hidden p-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-800">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-emerald-400" />
                <span>P2P Scratchpad & Code Sync</span>
              </span>
              <Badge
                variant="outline"
                className="text-[10px] text-emerald-400 border-emerald-800"
              >
                Broadcast Active
              </Badge>
            </div>
            <textarea
              value={sharedNotes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Paste code or type shared notes here..."
              className="w-full flex-1 mt-3 bg-gray-950 text-gray-200 font-mono text-xs p-3 rounded-2xl border border-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none leading-relaxed"
            />
          </div>
        )}

        {/* Tool Drawer: Collaborative Architecture Whiteboard */}
        {activeTool === "WHITEBOARD" && (
          <div className="aspect-video md:aspect-auto h-[380px] md:h-full bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden shadow-2xl p-2">
            <Whiteboard channel={channelRef.current} currentUserId={currentUserId} />
          </div>
        )}

        {/* Live Closed Captions Display */}
        {isTranscribing && currentCaption && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-950/85 text-white text-xs px-5 py-2.5 rounded-full border border-gray-800 backdrop-blur-md max-w-xl truncate shadow-2xl flex items-center gap-2">
            <Subtitles className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="italic">{currentCaption}</span>
          </div>
        )}
      </div>

      {/* Control Actions Bar */}
      <div className="flex items-center gap-2.5 flex-wrap justify-center pt-3 border-t border-gray-800/80 w-full">
        {/* Mic toggle */}
        <Button
          variant={isMuted ? "destructive" : "secondary"}
          onClick={toggleMute}
          size="sm"
          className="text-xs flex items-center gap-1.5 rounded-xl"
        >
          {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          <span>{isMuted ? "Unmute Mic" : "Mute Mic"}</span>
        </Button>

        {/* Camera toggle */}
        <Button
          variant={isVideoOff ? "destructive" : "secondary"}
          onClick={toggleVideo}
          size="sm"
          className="text-xs flex items-center gap-1.5 rounded-xl"
        >
          {isVideoOff ? <VideoOff className="w-3.5 h-3.5" /> : <VideoIcon className="w-3.5 h-3.5" />}
          <span>{isVideoOff ? "Camera Off" : "Camera On"}</span>
        </Button>

        {/* Screen share toggle */}
        <Button
          variant={isSharingScreen ? "default" : "secondary"}
          onClick={toggleScreenShare}
          size="sm"
          className={`text-xs flex items-center gap-1.5 rounded-xl ${
            isSharingScreen ? "bg-indigo-600 hover:bg-indigo-500 text-white" : ""
          }`}
        >
          <MonitorUp className="w-3.5 h-3.5" />
          <span>{isSharingScreen ? "Stop Screen Share" : "Share Screen"}</span>
        </Button>

        {/* Scratchpad tool toggle */}
        <Button
          variant={activeTool === "SCRATCHPAD" ? "default" : "secondary"}
          onClick={() => setActiveTool(activeTool === "SCRATCHPAD" ? "NONE" : "SCRATCHPAD")}
          size="sm"
          className={`text-xs flex items-center gap-1.5 rounded-xl ${
            activeTool === "SCRATCHPAD" ? "bg-emerald-600 hover:bg-emerald-500 text-white" : ""
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Code Notes</span>
        </Button>

        {/* Whiteboard tool toggle */}
        <Button
          variant={activeTool === "WHITEBOARD" ? "default" : "secondary"}
          onClick={() => setActiveTool(activeTool === "WHITEBOARD" ? "NONE" : "WHITEBOARD")}
          size="sm"
          className={`text-xs flex items-center gap-1.5 rounded-xl ${
            activeTool === "WHITEBOARD" ? "bg-indigo-600 hover:bg-indigo-500 text-white" : ""
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Whiteboard</span>
        </Button>

        {/* Captions toggle */}
        <Button
          variant={isTranscribing ? "default" : "secondary"}
          onClick={() => setIsTranscribing(!isTranscribing)}
          size="sm"
          className={`text-xs flex items-center gap-1.5 rounded-xl ${
            isTranscribing ? "bg-purple-600 hover:bg-purple-500 text-white" : ""
          }`}
        >
          <Subtitles className="w-3.5 h-3.5" />
          <span>{isTranscribing ? "Captions On" : "Captions Off"}</span>
        </Button>
      </div>
    </div>
  );
}