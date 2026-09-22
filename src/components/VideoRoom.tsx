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
  Copy,
  Check,
  Users,
  Wifi,
  Clock,
  Play,
  Share2,
} from "lucide-react";

interface VideoRoomProps {
  sessionId: string;
  currentUserId: string;
  peerName?: string;
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



export default function VideoRoom({
  sessionId,
  currentUserId,
  peerName = "Peer",
  onClose,
  onComplete,
}: VideoRoomProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const channelRef = useRef<any>(null);
  const localBcRef = useRef<BroadcastChannel | null>(null);

  // Queues to solve ICE candidate race conditions
  const pendingRemoteCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const pendingLocalCandidatesRef = useRef<any[]>([]);
  const isChannelSubscribedRef = useRef<boolean>(false);

  // Glare / collision management
  const isMakingOfferRef = useRef<boolean>(false);
  const isSettingRemoteAnswerPendingRef = useRef<boolean>(false);

  // Call States
  const [callStatus, setCallStatus] = useState<string>("Initializing WebRTC...");
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>("new");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [remotePeerActive, setRemotePeerActive] = useState(false);

  const [copiedLink, setCopiedLink] = useState(false);

  // Timer
  const [callSeconds, setCallSeconds] = useState(0);

  // Dynamic drawer tool
  const [activeTool, setActiveTool] = useState<"NONE" | "SCRATCHPAD" | "WHITEBOARD">("NONE");
  const [sharedNotes, setSharedNotes] = useState<string>(
    `// Collaborative Code & Session Notes\n// Session Room: ${sessionId}\n// Synced live between peers via WebRTC Data & Broadcast\n\nfunction swapSkills(mentor, learner) {\n  return {\n    knowledgeShared: true,\n    creditsExchanged: 10,\n    status: "Mastered"\n  };\n}\n`
  );

  // Live Speech Recognition & Closed Captions
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [currentCaption, setCurrentCaption] = useState<string>("");
  const fullTranscriptRef = useRef<string>("");
  const recognitionRef = useRef<any>(null);

  const supabase = createClient();

  // Call timer counter
  useEffect(() => {
    const timer = setInterval(() => {
      setCallSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

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

  // Dual Signaling Broadcast: Supabase Realtime + Local BroadcastChannel
  const sendBroadcast = useCallback(
    (event: string, payload: any) => {
      const fullPayload = { ...payload, senderId: currentUserId };

      // 1. Supabase Realtime Channel
      if (channelRef.current && isChannelSubscribedRef.current) {
        channelRef.current.send({
          type: "broadcast",
          event,
          payload: fullPayload,
        });
      } else {
        pendingLocalCandidatesRef.current.push({ event, payload });
      }

      // 2. Browser BroadcastChannel (for instant cross-tab local testing)
      if (localBcRef.current) {
        try {
          localBcRef.current.postMessage({ event, payload: fullPayload });
        } catch (err) {
          console.warn("BroadcastChannel send error:", err);
        }
      }
    },
    [currentUserId]
  );

  // Main WebRTC Initialization
  useEffect(() => {
    let channel: any;
    let isMounted = true;

    async function setupWebRTC() {
      try {
        setCallStatus("Fetching ICE configuration...");

        let rtcConfig = DEFAULT_ICE_SERVERS;
        try {
          const res = await fetch("/api/webrtc/ice");
          const data = await res.json();
          if (data.iceServers && data.iceServers.length > 0) {
            rtcConfig = { ...DEFAULT_ICE_SERVERS, iceServers: data.iceServers };
          }
        } catch (e) {
          console.warn("Using public STUN servers:", e);
        }

        if (!isMounted) return;

        // 1. Acquire Local Media Stream
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
            console.warn("No hardware accessible:", audioError);
            throw new Error("No camera or microphone found.");
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

        // Add local tracks
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        // 3. Handle remote inbound tracks
        pc.ontrack = (event) => {
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
            setRemotePeerActive(true);
            setRemotePeerActive(true);
            setCallStatus("Connected (P2P Stream Active)");
            remoteVideoRef.current.play().catch((err) => {
              console.warn("Remote video auto-play note:", err);
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
            setCallStatus("Connection retrying...");
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

        // 6. Incoming message router
        const handleIncomingEvent = async (event: string, payload: any) => {
          const senderId = payload?.senderId;
          if (!senderId || senderId === currentUserId) return;

          if (event === "user-joined") {
            setCallStatus("Peer joined, sending offer...");
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
          } else if (event === "offer") {
            const offer = payload?.offer;
            if (!offer) return;

            const isCollision = isMakingOfferRef.current || pc.signalingState !== "stable";
            const isPolite = currentUserId > senderId;

            if (isCollision) {
              if (!isPolite) return;
              await pc.setLocalDescription({ type: "rollback" } as any);
            }

            try {
              setCallStatus("Offer received, responding...");
              await pc.setRemoteDescription(new RTCSessionDescription(offer));
              await flushRemoteCandidates(pc);

              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              sendBroadcast("answer", { answer, targetId: senderId });
            } catch (err) {
              console.error("Error handling offer:", err);
            }
          } else if (event === "answer") {
            const answer = payload?.answer;
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
          } else if (event === "ice-candidate") {
            const candidate = payload?.candidate;
            if (!candidate) return;

            if (pc.remoteDescription && pc.remoteDescription.type) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
              } catch (err) {
                console.warn("addIceCandidate error:", err);
              }
            } else {
              pendingRemoteCandidatesRef.current.push(candidate);
            }
          } else if (event === "scratchpad-update") {
            setSharedNotes(payload?.content || "");
          } else if (event === "peer-left") {
            setRemotePeerActive(false);
            setCallStatus("Peer left the room");
          }
        };

        // 7. Supabase Realtime Channel
        channel = supabase.channel(`call_room_${sessionId}`, {
          config: { broadcast: { self: false } },
        });
        channelRef.current = channel;

        channel
          .on("broadcast", { event: "user-joined" }, (msg: any) =>
            handleIncomingEvent("user-joined", msg.payload)
          )
          .on("broadcast", { event: "offer" }, (msg: any) =>
            handleIncomingEvent("offer", msg.payload)
          )
          .on("broadcast", { event: "answer" }, (msg: any) =>
            handleIncomingEvent("answer", msg.payload)
          )
          .on("broadcast", { event: "ice-candidate" }, (msg: any) =>
            handleIncomingEvent("ice-candidate", msg.payload)
          )
          .on("broadcast", { event: "scratchpad-update" }, (msg: any) =>
            handleIncomingEvent("scratchpad-update", msg.payload)
          )
          .on("broadcast", { event: "peer-left" }, (msg: any) =>
            handleIncomingEvent("peer-left", msg.payload)
          )
          .subscribe((status: string) => {
            if (status === "SUBSCRIBED") {
              isChannelSubscribedRef.current = true;
              setCallStatus("Ready. Waiting for peer...");

              sendBroadcast("user-joined", {});

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

        // 8. Local BroadcastChannel for Cross-Tab Testing on Same Machine
        if (typeof window !== "undefined" && "BroadcastChannel" in window) {
          try {
            const bc = new BroadcastChannel(`call_room_${sessionId}`);
            localBcRef.current = bc;
            bc.onmessage = (event) => {
              if (event.data && event.data.event && event.data.payload) {
                handleIncomingEvent(event.data.event, event.data.payload);
              }
            };
            bc.postMessage({
              event: "user-joined",
              payload: { senderId: currentUserId },
            });
          } catch (bcErr) {
            console.warn("BroadcastChannel error:", bcErr);
          }
        }
      } catch (err: any) {
        console.error("WebRTC initialization error:", err);
        setCallStatus(`Media initialization note: ${err.message}`);
      }
    }

    setupWebRTC();

    // 9. Speech Recognition for Closed Captions
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = "en-US";

          recognition.onresult = (event: any) => {
            let interimTranscript = "";
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                fullTranscriptRef.current += " " + event.results[i][0].transcript;
                setCurrentCaption(event.results[i][0].transcript);
              } else {
                interimTranscript += event.results[i][0].transcript;
              }
            }
            if (interimTranscript) {
              setCurrentCaption(interimTranscript);
            }
          };

          recognition.onerror = () => {
            // Ignore minor speech errors
          };

          recognitionRef.current = recognition;
        } catch {
          // ignore
        }
      }
    }

    // Cleanup on unmount
    return () => {
      isMounted = false;
      sendBroadcast("peer-left", {});

      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (localBcRef.current) {
        localBcRef.current.close();
      }
      if (pcRef.current) {
        pcRef.current.close();
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, [sessionId, currentUserId, sendBroadcast, supabase, flushRemoteCandidates]);



  // Toggle Mute
  const toggleMute = () => {
    if (!localStreamRef.current) return;
    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(!audioTrack.enabled);
    }
  };

  // Toggle Video
  const toggleVideo = () => {
    if (!localStreamRef.current) return;
    const videoTrack = localStreamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOff(!videoTrack.enabled);
    }
  };

  // Synchronized Scratchpad Notes
  const handleNotesChange = (val: string) => {
    setSharedNotes(val);
    sendBroadcast("scratchpad-update", { content: val });
  };

  // Screen Sharing
  const toggleScreenShare = async () => {
    if (!pcRef.current) return;

    if (!isSharingScreen) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
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
        console.warn("Screen share cancelled:", err);
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

  // End Call & Trigger AI Session Notes
  const handleEndCall = async () => {
    setIsEnding(true);
    setCallStatus("Wrapping up session...");

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

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0E0C1B]/95 backdrop-blur-xl flex flex-col items-center justify-between p-4 sm:p-6 select-none animate-in fade-in duration-200 text-[#F4F3FA]">
      {/* Top Session Header Bar */}
      <div className="w-full max-w-6xl flex items-center justify-between pb-3.5 border-b border-[#2D264E]">
        <div className="flex items-center gap-3">
          <Badge className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-3 py-1 text-xs font-semibold flex items-center gap-1.5 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Native WebRTC P2P</span>
          </Badge>

          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                remotePeerActive
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-amber-400 animate-ping"
              }`}
            />
            <span className="text-xs text-zinc-300 font-mono truncate max-w-xs sm:max-w-md">
              {callStatus}
            </span>
          </div>
        </div>

        {/* Status Pills & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Call Timer */}
          <div className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-full bg-[#161327] border border-[#2D264E] text-xs font-mono text-zinc-300">
            <Clock className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span>{formatDuration(callSeconds)}</span>
          </div>



          {/* Copy Link Button */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-[#2D264E] bg-[#161327] text-zinc-300 hover:bg-[#231C3D] transition-colors flex items-center gap-1.5"
            title="Copy room link to open in second tab or send to friend"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedLink ? "Copied!" : "Copy Link"}</span>
          </button>

          {/* End Call Button */}
          <Button
            variant="destructive"
            size="sm"
            disabled={isEnding}
            onClick={handleEndCall}
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-xs"
          >
            <PhoneOff className="w-3.5 h-3.5 mr-1" />
            <span>{isEnding ? "Saving..." : "End Call"}</span>
          </Button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-[#161327] transition-colors"
            title="Minimize View"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Video Stage & Side Drawers */}
      <div
        className={`w-full max-w-6xl grid gap-4 my-auto relative ${
          activeTool !== "NONE" ? "md:grid-cols-3" : "md:grid-cols-2"
        }`}
      >
        {/* Remote Peer Video Stream */}
        <div className="relative aspect-video bg-[#161327] rounded-3xl overflow-hidden border border-[#2D264E] flex items-center justify-center shadow-2xl">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />

          {!remotePeerActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#161327]/95 text-zinc-400 p-6 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-[#231C3D] text-[#A78BFA] border border-[#3B2D66] flex items-center justify-center">
                <RefreshCw className="w-7 h-7 animate-spin" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  Waiting for {peerName} to connect...
                </h4>
                <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                  Open this link in another tab to test live peer-to-peer streaming, or click below:
                </p>
              </div>
              <button
                type="button"
                onClick={toggleVirtualPeerSimulation}
                className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Simulate Peer Stream (Solo Test)</span>
              </button>
            </div>
          )}

          <div className="absolute bottom-3 left-3 bg-[#0E0C1B]/80 backdrop-blur-md px-3 py-1 rounded-xl text-xs text-white flex items-center gap-2 border border-[#2D264E]">
            <span
              className={`w-2 h-2 rounded-full ${
                remotePeerActive ? "bg-emerald-500" : "bg-gray-500"
              }`}
            />
            <span className="font-semibold">
              {peerName} {isSimulatedPeer ? "(Simulated 720p)" : "(Peer Stream)"}
            </span>
          </div>
        </div>

        {/* Local Camera Stream */}
        <div className="relative aspect-video bg-[#161327] rounded-3xl overflow-hidden border border-[#2D264E] flex items-center justify-center shadow-2xl">
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
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#161327] text-zinc-400 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-red-950/40 border border-red-800/60 flex items-center justify-center text-red-400">
                <VideoOff className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold">Your camera is turned off</span>
            </div>
          )}

          <div className="absolute bottom-3 left-3 bg-[#0E0C1B]/80 backdrop-blur-md px-3 py-1 rounded-xl text-xs text-white flex items-center gap-2 border border-[#2D264E]">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold">
              {isSharingScreen ? "You (Sharing Screen)" : "You (Local Stream)"}
            </span>
          </div>
        </div>

        {/* Tool Drawer: Live Collaborative Scratchpad */}
        {activeTool === "SCRATCHPAD" && (
          <div className="aspect-video md:aspect-auto bg-[#161327] rounded-3xl border border-[#2D264E] flex flex-col overflow-hidden p-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#2D264E]">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-emerald-400" />
                <span>P2P Live Scratchpad & Code Sync</span>
              </span>
              <Badge
                variant="outline"
                className="text-[10px] text-emerald-400 border-emerald-800"
              >
                Live Synced
              </Badge>
            </div>
            <textarea
              value={sharedNotes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Paste code or type shared notes here..."
              className="w-full flex-1 mt-3 bg-[#0E0C1B] text-zinc-200 font-mono text-xs p-3.5 rounded-2xl border border-[#2D264E] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/50 resize-none leading-relaxed"
            />
          </div>
        )}

        {/* Tool Drawer: Collaborative Whiteboard */}
        {activeTool === "WHITEBOARD" && (
          <div className="aspect-video md:aspect-auto h-[380px] md:h-full bg-[#161327] rounded-3xl border border-[#2D264E] overflow-hidden shadow-2xl p-2">
            <Whiteboard channel={channelRef.current} currentUserId={currentUserId} />
          </div>
        )}

        {/* Live Closed Captions Display */}
        {isTranscribing && currentCaption && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#0E0C1B]/90 text-white text-xs px-5 py-2.5 rounded-full border border-[#2D264E] backdrop-blur-md max-w-xl truncate shadow-2xl flex items-center gap-2">
            <Subtitles className="w-4 h-4 text-[#A78BFA] shrink-0" />
            <span className="italic">{currentCaption}</span>
          </div>
        )}
      </div>

      {/* Control Actions Bar */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center pt-3 border-t border-[#2D264E] w-full">
        {/* Mic Toggle */}
        <Button
          variant={isMuted ? "destructive" : "secondary"}
          onClick={toggleMute}
          size="sm"
          className={`text-xs flex items-center gap-1.5 rounded-xl transition-all ${
            isMuted
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-[#161327] hover:bg-[#231C3D] text-white border border-[#2D264E]"
          }`}
        >
          {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
          <span>{isMuted ? "Unmute Mic" : "Mute Mic"}</span>
        </Button>

        {/* Camera Toggle */}
        <Button
          variant={isVideoOff ? "destructive" : "secondary"}
          onClick={toggleVideo}
          size="sm"
          className={`text-xs flex items-center gap-1.5 rounded-xl transition-all ${
            isVideoOff
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-[#161327] hover:bg-[#231C3D] text-white border border-[#2D264E]"
          }`}
        >
          {isVideoOff ? <VideoOff className="w-3.5 h-3.5" /> : <VideoIcon className="w-3.5 h-3.5 text-indigo-400" />}
          <span>{isVideoOff ? "Camera Off" : "Camera On"}</span>
        </Button>

        {/* Screen Share Toggle */}
        <Button
          variant={isSharingScreen ? "default" : "secondary"}
          onClick={toggleScreenShare}
          size="sm"
          className={`text-xs flex items-center gap-1.5 rounded-xl transition-all ${
            isSharingScreen
              ? "bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-xs"
              : "bg-[#161327] hover:bg-[#231C3D] text-white border border-[#2D264E]"
          }`}
        >
          <MonitorUp className="w-3.5 h-3.5 text-amber-400" />
          <span>{isSharingScreen ? "Stop Screen Share" : "Share Screen"}</span>
        </Button>

        {/* Scratchpad Tool Toggle */}
        <Button
          variant={activeTool === "SCRATCHPAD" ? "default" : "secondary"}
          onClick={() => setActiveTool(activeTool === "SCRATCHPAD" ? "NONE" : "SCRATCHPAD")}
          size="sm"
          className={`text-xs flex items-center gap-1.5 rounded-xl transition-all ${
            activeTool === "SCRATCHPAD"
              ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              : "bg-[#161327] hover:bg-[#231C3D] text-white border border-[#2D264E]"
          }`}
        >
          <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Code Notes</span>
        </Button>

        {/* Whiteboard Tool Toggle */}
        <Button
          variant={activeTool === "WHITEBOARD" ? "default" : "secondary"}
          onClick={() => setActiveTool(activeTool === "WHITEBOARD" ? "NONE" : "WHITEBOARD")}
          size="sm"
          className={`text-xs flex items-center gap-1.5 rounded-xl transition-all ${
            activeTool === "WHITEBOARD"
              ? "bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-xs"
              : "bg-[#161327] hover:bg-[#231C3D] text-white border border-[#2D264E]"
          }`}
        >
          <Palette className="w-3.5 h-3.5 text-[#A78BFA]" />
          <span>Whiteboard</span>
        </Button>

        {/* Captions Toggle */}
        <Button
          variant={isTranscribing ? "default" : "secondary"}
          onClick={() => {
            if (!isTranscribing && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch {}
            } else if (recognitionRef.current) {
              try {
                recognitionRef.current.stop();
              } catch {}
            }
            setIsTranscribing(!isTranscribing);
          }}
          size="sm"
          className={`text-xs flex items-center gap-1.5 rounded-xl transition-all ${
            isTranscribing
              ? "bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
              : "bg-[#161327] hover:bg-[#231C3D] text-white border border-[#2D264E]"
          }`}
        >
          <Subtitles className="w-3.5 h-3.5 text-purple-400" />
          <span>{isTranscribing ? "Captions On" : "Captions Off"}</span>
        </Button>
      </div>
    </div>
  );
}