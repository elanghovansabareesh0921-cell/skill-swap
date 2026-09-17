"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import BookingModal from "@/components/BookingModal";

export default function MentorsDirectoryPage() {
  const [mentors, setMentors] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userCredits, setUserCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [activeBookingMentor, setActiveBookingMentor] = useState<any>(null);

  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUser(user);
          const { data: profile } = await supabase
            .from("profiles")
            .select("credits")
            .eq("id", user.id)
            .single();
          if (profile) setUserCredits(profile.credits ?? 0);
        }

        const res = await fetch("/api/mentors");
        const data = await res.json();
        if (data.mentors) {
          setMentors(data.mentors);
        }
      } catch (err) {
        console.error("Failed to load mentors directory data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [supabase]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    mentors.forEach((m) => {
      m.teachSkills.forEach((s: any) => {
        if (s.category) set.add(s.category);
      });
    });
    return ["ALL", ...Array.from(set)];
  }, [mentors]);

  const filteredMentors = useMemo(() => {
    return mentors.filter((m) => {
      const isSelf = currentUser && m.id === currentUser.id;
      if (isSelf) return false;

      const matchesQuery =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.bio && m.bio.toLowerCase().includes(searchQuery.toLowerCase())) ||
        m.teachSkills.some((s: any) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === "ALL" ||
        m.teachSkills.some((s: any) => s.category === selectedCategory);

      return matchesQuery && matchesCategory;
    });
  }, [mentors, searchQuery, selectedCategory, currentUser]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {activeBookingMentor && currentUser && (
        <BookingModal
          mentor={activeBookingMentor}
          currentUserCredits={userCredits}
          currentUserId={currentUser.id}
          onClose={() => setActiveBookingMentor(null)}
          onSuccess={() => setUserCredits((prev) => Math.max(0, prev - 10))}
        />
      )}

      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <span className="text-xl font-bold tracking-tight">SkillSwap</span>
            <nav className="flex space-x-4 text-sm font-medium text-slate-600">
              <Link href="/dashboard" className="hover:text-slate-900">Dashboard</Link>
              <Link href="/matches" className="hover:text-slate-900">Browse Matches</Link>
              <Link href="/mentors" className="text-blue-600">Mentor Directory</Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-full text-sm font-medium">
              <span>🪙 Credits:</span>
              <span className="font-bold text-blue-600">{userCredits}</span>
            </div>
            <Link href="/dashboard">
              <Button size="sm" variant="outline">My Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Community Mentor Directory</h1>
          <p className="text-slate-500">Discover peer mentors ready to share practical skills and insights.</p>
        </div>

        {/* Search & Category Filter */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-1/2">
            <Input
              placeholder="Search by mentor name, topic, or language..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-50 text-sm"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
            {categories.map((cat) => (
              <Button
                key={cat}
                size="sm"
                variant={selectedCategory === cat ? "default" : "outline"}
                className="text-xs shrink-0"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-slate-500 font-medium">Loading active mentors...</p>
        ) : filteredMentors.length === 0 ? (
          <Card className="p-8 text-center text-slate-500">
            No mentors found matching your query.
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <Card key={mentor.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        <Link href={`/profile/${mentor.id}`} className="hover:underline hover:text-blue-600">
                          {mentor.name}
                        </Link>
                      </CardTitle>
                      <CardDescription>
                        {mentor.completedSwaps} verified swaps • {mentor.avgRating ? `★ ${mentor.avgRating}` : "New Mentor"}
                      </CardDescription>
                    </div>
                    {mentor.avgRating && mentor.avgRating >= 4.5 && (
                      <Badge className="bg-amber-500 text-white text-[10px]">Top Rated</Badge>
                    )}
                  </div>
                  {mentor.bio && (
                    <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                      {mentor.bio}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-700 block mb-1.5">Teaches:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {mentor.teachSkills.map((s: any, idx: number) => (
                        <Badge key={idx} variant="secondary" className="text-[11px] bg-emerald-50 text-emerald-800 border-emerald-200">
                          {s.name} ({s.level})
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <Link href={`/profile/${mentor.id}`}>
                      <Button size="sm" variant="ghost" className="text-xs text-slate-600">
                        View Profile
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => setActiveBookingMentor(mentor)}
                    >
                      Book Session
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