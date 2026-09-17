"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PeerProfilePage() {
  const params = useParams();
  const userId = params?.id as string;

  const [profile, setProfile] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function loadPeerData() {
      if (!userId) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, full_name, credits")
        .eq("id", userId)
        .single();

      const { data: skillsData } = await supabase
        .from("user_skills")
        .select("id, skill_type, level, goal, skills(name, category)")
        .eq("user_id", userId);

      const { data: reviewData } = await supabase
        .from("reviews")
        .select("id, rating, comment, created_at, reviewer:profiles!reviewer_id(full_name)")
        .eq("reviewee_id", userId)
        .order("created_at", { ascending: false });

      if (profileData) setProfile(profileData);
      if (skillsData) setSkills(skillsData);
      if (reviewData) {
        setReviews(reviewData);
        if (reviewData.length > 0) {
          const total = reviewData.reduce((acc, r) => acc + r.rating, 0);
          setAvgRating(Number((total / reviewData.length).toFixed(1)));
        }
      }

      setLoading(false);
    }

    loadPeerData();
  }, [userId, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium">
        Loading peer profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500">
        <p className="text-lg">User not found.</p>
        <Link href="/matches" className="text-blue-600 underline mt-2">Back to matches</Link>
      </div>
    );
  }

  const teachSkills = skills.filter((s) => s.skill_type === "TEACH");
  const learnSkills = skills.filter((s) => s.skill_type === "LEARN");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <span className="text-xl font-bold tracking-tight">SkillSwap</span>
            <nav className="flex space-x-4 text-sm font-medium text-slate-600">
              <Link href="/dashboard" className="hover:text-slate-900">Dashboard</Link>
              <Link href="/matches" className="hover:text-slate-900">Browse Matches</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{profile.full_name}</CardTitle>
                <CardDescription>Peer Member</CardDescription>
              </div>
              <div className="text-right">
                <Badge className="bg-amber-500 hover:bg-amber-600 text-sm px-3 py-1">
                  ★ {avgRating ? `${avgRating} / 5.0` : "New Mentor"}
                </Badge>
                <p className="text-xs text-slate-400 mt-1">{reviews.length} feedback review(s)</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Teaches</h3>
              <div className="flex flex-wrap gap-2">
                {teachSkills.map((s) => (
                  <Badge key={s.id} className="bg-emerald-600">
                    {s.skills?.name} ({s.level})
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Currently Learning</h3>
              <div className="flex flex-wrap gap-2">
                {learnSkills.map((s) => (
                  <Badge key={s.id} variant="outline" className="border-blue-500 text-blue-700">
                    {s.skills?.name} ({s.level})
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Peer Reviews & Reputation</CardTitle>
            <CardDescription>Verified endorsements from past skill exchanges</CardDescription>
          </CardHeader>
          <CardContent>
            {reviews.length === 0 ? (
              <p className="text-sm text-slate-400">No session reviews received yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {reviews.map((r) => (
                  <div key={r.id} className="py-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-sm text-slate-800">
                        {r.reviewer?.full_name || "Anonymous Member"}
                      </span>
                      <span className="text-amber-500 text-sm font-bold">
                        {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                      </span>
                    </div>
                    {r.comment && <p className="text-sm text-slate-600 italic">"{r.comment}"</p>}
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