"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Whiteboard from "@/components/Whiteboard";

interface VideoRoomProps {
  sessionId: string;
  currentUserId: string;
  onClose: () => void;
}

const DEFAULT_ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export default function VideoRoom({ sessionId, currentUserId, onClose }: VideoRoomProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const channelRef = useRef<any>(null);

  const [callStatus, setCallStatus] = useState<string>("Connecting to room...");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  // Tools drawer state
  const [activeTool, setActiveTool] = useState<"NONE" | "SCRATCHPAD" | "WHITEBOARD">("NONE");
  const [sharedNotes, setSharedNotes] = useState<string>("// Collaborative session notes & code snippets\n");

  // Captions state
  const [isTranscribing, setIsTranscribing] = useState(true);
  const [currentCaption, setCurrentCaption] = useState<string>("");
  const fullTranscriptRef = useRef<string>("");
  const recognitionRef = useRef<any>(null);

  const supabase = createClient();

  useEffect(() => {
    let channel: any;

    async function initWebRTC() {
      try {
        let configuration = DEFAULT_ICE_SERVERS;
        try {
          const res = await fetch("/api/webrtc/ice");
          const data = await res.json();
          if (data.iceServers) {
            configuration = { iceServers: data.iceServers };
          }
        } catch (e) {
          console.warn("Using fallback STUN servers:", e);
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const pc = new RTCPeerConnection(configuration);
        pcRef.current = pc;

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        pc.ontrack = (event) => {
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
            setCallStatus("Connected");
          }
        };

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            channel.send({
              type: "broadcast",
              event: "ice-candidate",
              payload: { candidate: event.candidate, senderId: currentUserId },
            });
          }
        };

        channel = supabase.channel(`call_room_${sessionId}`, {
          config: { broadcast: { self: false } },
        });
        channelRef.current = channel;

        channel
          .on("broadcast", { event: "user-joined" }, async (payload: any) => {
            if (payload.payload.senderId !== currentUserId) {
              setCallStatus("Peer discovered, creating offer...");
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              channel.send({
                type: "broadcast",
                event: "offer",
                payload: { offer, senderId: currentUserId },
              });
            }
          })
          .on("broadcast", { event: "offer" }, async (payload: any) => {
            if (payload.payload.senderId !== currentUserId) {
              setCallStatus("Offer received, sending answer...");
              await pc.setRemoteDescription(new RTCSessionDescription(payload.payload.offer));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              channel.send({
                type: "broadcast",
                event: "answer",
                payload: { answer, senderId: currentUserId },
              });
            }
          })
          .on("broadcast", { event: "answer" }, async (payload: any) => {
            if (payload.payload.senderId !== currentUserId) {
              await pc.setRemoteDescription(new RTCSessionDescription(payload.payload.answer));
              setCallStatus("Connected");
            }
          })
          .on("broadcast", { event: "ice-candidate" }, async (payload: any) => {
            if (payload.payload.senderId !== currentUserId && payload.payload.candidate) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(payload.payload.candidate));
              } catch (e) {
                console.error("Error adding candidate", e);
              }
            }
          })
          .on("broadcast", { event: "scratchpad-update" }, (payload: any) => {
            if (payload.payload.senderId !== currentUserId) {
              setSharedNotes(payload.payload.content);
            }
          })
          .subscribe((status: string) => {
            if (status === "SUBSCRIBED") {
              setCallStatus("Waiting for peer to connect...");
              channel.send({
                type: "broadcast",
                event: "user-joined",
                payload: { senderId: currentUserId },
              });
            }
          });
      } catch (err: any) {
        setCallStatus(`Media error: ${err.message}`);
      }
    }

    initWebRTC();

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
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
        console.warn("Speech recognition warning:", e.error);
      };

      try {
        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        console.warn("Recognition start failed:", err);
      }
    }

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (pcRef.current) {
        pcRef.current.close();
      }
      if (channel) {
        supabase.removeChannel(channel);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [sessionId, currentUserId, supabase]);

  const handleNotesChange = (val: string) => {
    setSharedNotes(val);
    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "scratchpad-update",
        payload: { content: val, senderId: currentUserId },
      });
    }
  };

  const handleEndCall = async () => {
    setIsEnding(true);
    setCallStatus("Processing session summary...");

    if (recognitionRef.current) {
      recognitionRef.current.stop();
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
          body: JSON.stringify({ sessionId, transcript: fullTranscriptRef.current }),
        })
      );
    }

    try {
      await Promise.allSettled(tasks);
    } catch (e) {
      console.error("End call sync error:", e);
    }

    onClose();
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!pcRef.current || !localStreamRef.current) return;

    if (!isSharingScreen) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screenStream;

        const screenTrack = screenStream.getVideoTracks()[0];
        const videoSender = pcRef.current.getSenders().find((s) => s.track?.kind === "video");

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
        console.error("Screen share error:", err);
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
    const videoSender = pcRef.current.getSenders().find((s) => s.track?.kind === "video");

    if (videoSender && originalVideoTrack) {
      await videoSender.replaceTrack(originalVideoTrack);
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }

    setIsSharingScreen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 flex flex-col items-center justify-between p-6">
      {/* Top Header */}
      <div className="w-full max-w-6xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Badge className="bg-blue-600 text-white px-3 py-1">Native WebRTC P2P</Badge>
          <span className="text-sm text-slate-300">{callStatus}</span>
        </div>
        <Button variant="destructive" size="sm" disabled={isEnding} onClick={handleEndCall}>
          {isEnding ? "Saving Recap..." : "End Call"}
        </Button>
      </div>

      {/* Main Workspace Layout */}
      <div className={`w-full max-w-6xl grid gap-4 my-auto relative ${activeTool !== "NONE" ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
        {/* Remote Video Stream */}
        <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-lg">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 left-3 bg-black/60 px-2.5 py-1 rounded text-xs text-white">
            Peer Video / Stream
          </div>
        </div>

        {/* Local Video Stream */}
        <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${isSharingScreen ? "" : "-scale-x-100"}`}
          />
          <div className="absolute bottom-3 left-3 bg-black/60 px-2.5 py-1 rounded text-xs text-white">
            {isSharingScreen ? "You (Sharing Screen)" : "You (Local)"}
          </div>
        </div>

        {/* Dynamic Tool Drawer: Scratchpad */}
        {activeTool === "SCRATCHPAD" && (
          <div className="aspect-video md:aspect-auto bg-slate-900 rounded-xl border border-slate-700 flex flex-col overflow-hidden p-3 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                📝 Live Scratchpad & Code Sync
              </span>
              <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-800">
                P2P Synced
              </Badge>
            </div>
            <textarea
              value={sharedNotes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Paste code or type collaborative session notes here..."
              className="w-full flex-1 mt-2 bg-slate-950 text-slate-200 font-mono text-xs p-3 rounded-lg border border-slate-800 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
        )}

        {/* Dynamic Tool Drawer: Architecture Whiteboard */}
        {activeTool === "WHITEBOARD" && (
          <div className="aspect-video md:aspect-auto h-[380px] md:h-full">
            <Whiteboard channel={channelRef.current} currentUserId={currentUserId} />
          </div>
        )}

        {/* Closed Captions Overlay */}
        {isTranscribing && currentCaption && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-4 py-2 rounded-full border border-slate-700 backdrop-blur-md max-w-lg truncate shadow-lg">
            🎙️ <span className="italic">{currentCaption}</span>
          </div>
        )}
      </div>

      {/* Media & Tool Controls Bar */}
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <Button variant={isMuted ? "destructive" : "secondary"} onClick={toggleMute}>
          {isMuted ? "Unmute Mic" : "Mute Mic"}
        </Button>
        <Button variant={isVideoOff ? "destructive" : "secondary"} onClick={toggleVideo}>
          {isVideoOff ? "Turn Video On" : "Turn Video Off"}
        </Button>
        <Button variant={isSharingScreen ? "default" : "secondary"} onClick={toggleScreenShare}>
          {isSharingScreen ? "Stop Screen Share" : "🖥️ Share Screen"}
        </Button>
        <Button
          variant={activeTool === "SCRATCHPAD" ? "default" : "secondary"}
          className={activeTool === "SCRATCHPAD" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
          onClick={() => setActiveTool(activeTool === "SCRATCHPAD" ? "NONE" : "SCRATCHPAD")}
        >
          📝 Live Code
        </Button>
        <Button
          variant={activeTool === "WHITEBOARD" ? "default" : "secondary"}
          className={activeTool === "WHITEBOARD" ? "bg-indigo-600 hover:bg-indigo-700" : ""}
          onClick={() => setActiveTool(activeTool === "WHITEBOARD" ? "NONE" : "WHITEBOARD")}
        >
          🎨 Whiteboard
        </Button>
        <Button
          variant={isTranscribing ? "default" : "secondary"}
          className={isTranscribing ? "bg-purple-600 hover:bg-purple-700" : ""}
          onClick={() => setIsTranscribing(!isTranscribing)}
        >
          {isTranscribing ? "Captions On" : "Captions Off"}
        </Button>
        <Button variant="outline" className="text-white border-slate-700 hover:bg-slate-800" onClick={onClose}>
          Minimize
        </Button>
      </div>
    </div>
  );
}