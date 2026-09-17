"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function MatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search, Filter & Sort State
  const [searchQuery, setSearchQuery] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("ALL");

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

  // Filter and sort matches based on search query, category, and minimum score
  const filteredMatches = useMemo(() => {
    return matches
      .filter((m) => {
        const matchesQuery =
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.teaches.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.wants.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesScore = (m.compatibilityScore || 0) >= minScore;
        return matchesQuery && matchesScore;
      })
      .sort((a, b) => (b.compatibilityScore || 0) - (a.compatibilityScore || 0));
  }, [matches, searchQuery, minScore]);

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI-Powered Skill Matches</h1>
            <p className="text-slate-500">Reciprocal swaps scored and analyzed by Gemini 2.5 Flash.</p>
          </div>
          <Badge variant="secondary" className="px-3 py-1 self-start sm:self-center">
            ✦ Gemini 2.5 Flash Scoring
          </Badge>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-1/2">
            <Input
              placeholder="Search peers by name, skill taught, or skill wanted..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-50 text-sm"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
              Min Match: {minScore}%
            </span>
            <input
              type="range"
              min="0"
              max="90"
              step="10"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-32 accent-blue-600"
            />
            {minScore > 0 && (
              <Button size="sm" variant="ghost" className="text-xs" onClick={() => setMinScore(0)}>
                Reset
              </Button>
            )}
          </div>
        </div>

        {loading && (
          <p className="text-slate-500">Finding reciprocal matches with Gemini...</p>
        )}

        {errorMessage && (
          <Card className="p-4 border-red-200 bg-red-50 text-red-600 text-sm">
            <strong>Error:</strong> {errorMessage}
          </Card>
        )}

        {!loading && !errorMessage && filteredMatches.length === 0 && (
          <Card className="p-8 text-center text-slate-500">
            No peer matches meet your filter criteria. Try lowering the minimum match threshold or clearing search terms.
          </Card>
        )}

        {!loading && filteredMatches.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredMatches.map((match) => (
              <Card key={match.userId} className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        <Link href={`/profile/${match.userId}`} className="hover:underline hover:text-blue-600">
                          {match.name}
                        </Link>
                      </CardTitle>
                      <CardDescription>
                        Teaches: <strong className="text-emerald-700">{match.teaches}</strong> • Wants: <strong className="text-blue-700">{match.wants}</strong>
                      </CardDescription>
                    </div>
                    <Badge className={match.compatibilityScore >= 70 ? "bg-emerald-600 text-white" : "bg-blue-600 text-white"}>
                      {match.compatibilityScore}% Match
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {match.matchReason}
                  </p>
                  <div className="flex justify-between items-center pt-2">
                    <Link href={`/profile/${match.userId}`} className="text-sm font-medium text-blue-600 hover:underline">
                      View Profile & Reviews →
                    </Link>
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