"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function MatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadMatches() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          setErrorMessage("No active session found. Please log in first.");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/matches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        });

        const data = await res.json();
        
        if (data.error) {
          setErrorMessage(data.error);
        } else {
          setMatches(data.matches || []);
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to load matches.");
      } finally {
        setLoading(false);
      }
    }

    loadMatches();
  }, [supabase]);

  const handleRequestSession = async (match: any) => {
    setBookingId(match.userId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requesterId: user.id,
          receiverId: match.userId,
          skillName: match.teaches,
        }),
      });

      const result = await res.json();
      if (result.error) {
        alert(`Booking failed: ${result.error}`);
      } else {
        alert(`Session requested with ${match.name}! 10 credits held.`);
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setBookingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <span className="text-xl font-bold tracking-tight">SkillSwap</span>
            <nav className="flex space-x-4 text-sm font-medium text-slate-600">
              <Link href="/dashboard" className="hover:text-slate-900">Dashboard</Link>
              <Link href="/matches" className="text-blue-600">Browse Matches</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI-Powered Skill Matches</h1>
            <p className="text-slate-500">Reciprocal swaps analyzed and scored with Google Gemini.</p>
          </div>
          <Badge variant="secondary" className="px-3 py-1">Gemini 2.5 Flash</Badge>
        </div>

        {loading && (
          <p className="text-slate-500">Finding reciprocal matches with Gemini...</p>
        )}

        {errorMessage && (
          <Card className="p-4 border-red-200 bg-red-50 text-red-600 text-sm">
            <strong>Error:</strong> {errorMessage}
          </Card>
        )}

        {!loading && !errorMessage && matches.length === 0 && (
          <Card className="p-8 text-center text-slate-500">
            No peer matches found yet.
          </Card>
        )}

        {!loading && matches.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6">
            {matches.map((match) => (
              <Card key={match.userId} className="shadow-sm">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{match.name}</CardTitle>
                      <CardDescription>
                        Teaches: <strong>{match.teaches}</strong> • Wants: <strong>{match.wants}</strong>
                      </CardDescription>
                    </div>
                    <Badge className="bg-blue-600">{match.compatibilityScore}% Match</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-600">{match.matchReason}</p>
                  <div className="flex justify-end">
                    <Button 
                      size="sm" 
                      disabled={bookingId === match.userId}
                      onClick={() => handleRequestSession(match)}
                    >
                      {bookingId === match.userId ? "Requesting..." : "Request Session"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
