"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface SkillItem {
  id: string;
  skill_type: "TEACH" | "LEARN";
  level: string;
  skills: { name: string };
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [teachSkills, setTeachSkills] = useState<SkillItem[]>([]);
  const [learnSkills, setLearnSkills] = useState<SkillItem[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Skill Form State
  const [addingType, setAddingType] = useState<"TEACH" | "LEARN" | null>(null);
  const [skillNameInput, setSkillNameInput] = useState("");
  const [skillLevelInput, setSkillLevelInput] = useState("Intermediate");

  // Review & Chat state
  const [activeReviewSession, setActiveReviewSession] = useState<any>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");

  const [activeChatSession, setActiveChatSession] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");

  const router = useRouter();
  const supabase = createClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadUserData() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      const { data: skillsData } = await supabase
        .from("user_skills")
        .select("id, skill_type, level, skills(name)")
        .eq("user_id", user.id);

      const res = await fetch(`/api/sessions/manage?userId=${user.id}`);
      const sessionData = await res.json();

      if (profileData) setProfile(profileData);

      if (skillsData) {
        const typed = skillsData as unknown as SkillItem[];
        setTeachSkills(typed.filter((s) => s.skill_type === "TEACH"));
        setLearnSkills(typed.filter((s) => s.skill_type === "LEARN"));
      }

      if (sessionData.sessions) {
        setSessions(sessionData.sessions);
      }

      setLoading(false);
    }

    loadUserData();
  }, [router, supabase]);

  // Realtime subscription for active chat session
  useEffect(() => {
    if (!activeChatSession) return;

    const channel = supabase
      .channel(`session_chat_${activeChatSession.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `session_id=eq.${activeChatSession.id}`,
        },
        async (payload) => {
          const { data: senderData } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", payload.new.sender_id)
            .single();

          const incoming: any = {
            ...payload.new,
            sender: { full_name: senderData?.full_name || "User" },
          };

          setChatMessages((prev) => {
            if (prev.some((m) => m.id === incoming.id)) return prev;
            return [...prev, incoming];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChatSession, supabase]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleAddSkill = async () => {
    if (!skillNameInput.trim() || !addingType || !profile) return;

    const res = await fetch("/api/user-skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: profile.id,
        skillName: skillNameInput,
        skillType: addingType,
        level: skillLevelInput,
      }),
    });

    const data = await res.json();
    if (data.userSkill) {
      if (addingType === "TEACH") {
        setTeachSkills((prev) => [...prev, data.userSkill]);
      } else {
        setLearnSkills((prev) => [...prev, data.userSkill]);
      }
      setSkillNameInput("");
      setAddingType(null);
    } else {
      alert(data.error || "Failed to add skill");
    }
  };

  const handleDeleteSkill = async (id: string, type: "TEACH" | "LEARN") => {
    await fetch("/api/user-skills", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userSkillId: id }),
    });

    if (type === "TEACH") {
      setTeachSkills((prev) => prev.filter((s) => s.id !== id));
    } else {
      setLearnSkills((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const updateStatus = async (sessionId: string, newStatus: string) => {
    await fetch("/api/sessions/manage", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, status: newStatus }),
    });

    if (newStatus === "COMPLETED") {
      fetch("/api/sessions/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      }).then(async (r) => {
        const res = await r.json();
        if (res.summary) {
          setSessions((prev) =>
            prev.map((s) => (s.id === sessionId ? { ...s, status: newStatus, ai_summary: res.summary } : s))
          );
        }
      });
    }

    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: newStatus } : s))
    );
  };

  const openChat = async (session: any) => {
    setActiveChatSession(session);
    const res = await fetch(`/api/messages?sessionId=${session.id}`);
    const data = await res.json();
    setChatMessages(data.messages || []);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChatSession) return;

    const messageText = newMessage;
    setNewMessage("");

    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: activeChatSession.id,
        senderId: profile.id,
        content: messageText,
      }),
    });
  };

  const submitReview = async () => {
    if (!activeReviewSession) return;

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: activeReviewSession.id,
        reviewerId: profile.id,
        revieweeId: activeReviewSession.receiver_id === profile.id 
          ? activeReviewSession.requester_id 
          : activeReviewSession.receiver_id,
        rating,
        comment,
      }),
    });

    const result = await res.json();
    if (result.error) {
      alert(`Review error: ${result.error}`);
    } else {
      alert("Feedback submitted successfully!");
      setActiveReviewSession(null);
      setComment("");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500 font-medium">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <span className="text-xl font-bold tracking-tight">SkillSwap</span>
            <nav className="flex space-x-4 text-sm font-medium text-slate-600">
              <Link href="/dashboard" className="text-blue-600">Dashboard</Link>
              <Link href="/matches" className="hover:text-slate-900">Browse Matches</Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-full text-sm font-medium">
              <span>🪙 Credits:</span>
              <span className="font-bold text-blue-600">{profile?.credits ?? 0}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>Log out</Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {profile?.full_name || "Member"}!</h1>
          <p className="text-slate-500">Manage skills, track credit balance, chat in real-time, and manage sessions.</p>
        </div>

        {addingType && (
          <Card className="border-blue-300 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Add Skill to {addingType === "TEACH" ? "Teach" : "Learn"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Next.js, Rust, Figma..."
                  value={skillNameInput}
                  onChange={(e) => setSkillNameInput(e.target.value)}
                  className="bg-slate-50"
                />
                <select
                  value={skillLevelInput}
                  onChange={(e) => setSkillLevelInput(e.target.value)}
                  className="border rounded-md px-3 text-sm bg-slate-50"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={() => setAddingType(null)}>Cancel</Button>
                <Button size="sm" onClick={handleAddSkill}>Save Skill</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeChatSession && (
          <Card className="border-blue-400 bg-white shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
              <div className="flex items-center space-x-2">
                <CardTitle className="text-lg">Chat: {activeChatSession.skill_name}</CardTitle>
                <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-300">Live</Badge>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setActiveChatSession(null)}>Close</Button>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="h-48 overflow-y-auto border p-3 rounded-md bg-slate-50 space-y-2 text-sm flex flex-col">
                {chatMessages.length === 0 ? (
                  <p className="text-slate-400 text-center py-4 m-auto">No messages yet. Send a greeting!</p>
                ) : (
                  chatMessages.map((m) => (
                    <div
                      key={m.id}
                      className={`p-2.5 rounded-lg max-w-[75%] ${
                        m.sender_id === profile.id
                          ? "ml-auto bg-blue-600 text-white rounded-br-none"
                          : "mr-auto bg-slate-200 text-slate-800 rounded-bl-none"
                      }`}
                    >
                      <p className="text-[10px] opacity-75 font-semibold mb-0.5">{m.sender?.full_name || "User"}</p>
                      <p>{m.content}</p>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message or share a meeting link..."
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <Button onClick={sendMessage}>Send</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeReviewSession && (
          <Card className="border-blue-300 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="text-lg">Leave Peer Feedback for {activeReviewSession.skill_name}</CardTitle>
              <CardDescription>Rate your swap partner on clarity and communication.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Rating (1-5 Stars)</label>
                <div className="flex gap-2 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Button
                      key={star}
                      size="sm"
                      variant={rating === star ? "default" : "outline"}
                      onClick={() => setRating(star)}
                    >
                      ★ {star}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Notes / Endorsement</label>
                <Input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Great mentor! Explained everything clearly."
                  className="bg-white"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={() => setActiveReviewSession(null)}>Cancel</Button>
                <Button size="sm" onClick={submitReview}>Submit Feedback</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Skills You Teach</CardTitle>
                <CardDescription>Earn credits by teaching these</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => setAddingType("TEACH")}>+ Add</Button>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {teachSkills.length > 0 ? (
                teachSkills.map((item) => (
                  <Badge key={item.id} className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1.5 py-1">
                    <span>{item.skills?.name} ({item.level})</span>
                    <button 
                      onClick={() => handleDeleteSkill(item.id, "TEACH")}
                      className="text-emerald-200 hover:text-white font-bold ml-1"
                    >
                      ×
                    </button>
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-slate-400">No teaching skills added yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Skills You Are Learning</CardTitle>
                <CardDescription>Spend credits to learn from peers</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => setAddingType("LEARN")}>+ Add</Button>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {learnSkills.length > 0 ? (
                learnSkills.map((item) => (
                  <Badge key={item.id} variant="outline" className="border-blue-500 text-blue-700 flex items-center gap-1.5 py-1">
                    <span>{item.skills?.name} ({item.level})</span>
                    <button 
                      onClick={() => handleDeleteSkill(item.id, "LEARN")}
                      className="text-blue-400 hover:text-blue-700 font-bold ml-1"
                    >
                      ×
                    </button>
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-slate-400">No learning skills added yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Your Session Swaps</CardTitle>
            <CardDescription>Manage active bookings, chat, and view Gemini summaries</CardDescription>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <p className="text-sm text-slate-400">No sessions requested yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {sessions.map((s) => (
                  <div key={s.id} className="py-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{s.skill_name}</p>
                        <p className="text-xs text-slate-500">
                          Requester: {s.requester?.full_name || "You"} • Partner: {s.receiver?.full_name || "Peer"}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="secondary" onClick={() => openChat(s)}>
                          💬 Chat
                        </Button>
                        <Badge variant={s.status === "COMPLETED" ? "secondary" : "default"}>
                          {s.status}
                        </Badge>
                        {s.status === "PENDING" && (
                          <Button size="sm" variant="outline" onClick={() => updateStatus(s.id, "CONFIRMED")}>
                            Confirm
                          </Button>
                        )}
                        {s.status === "CONFIRMED" && (
                          <Button size="sm" variant="outline" onClick={() => updateStatus(s.id, "COMPLETED")}>
                            Complete
                          </Button>
                        )}
                        {s.status === "COMPLETED" && (
                          <Button size="sm" variant="outline" onClick={() => setActiveReviewSession(s)}>
                            Leave Review
                          </Button>
                        )}
                      </div>
                    </div>
                    {s.ai_summary && (
                      <div className="bg-slate-100/70 border border-slate-200 rounded-md p-2.5 text-xs text-slate-700">
                        <span className="font-semibold text-blue-600">✦ Gemini Growth Note: </span>
                        {s.ai_summary}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}