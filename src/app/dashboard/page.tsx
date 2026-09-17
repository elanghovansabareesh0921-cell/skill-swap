"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SkillItem {
  id: string;
  skill_type: "TEACH" | "LEARN";
  level: string;
  goal?: string;
  skills: {
    name: string;
  };
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [teachSkills, setTeachSkills] = useState<SkillItem[]>([]);
  const [learnSkills, setLearnSkills] = useState<SkillItem[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadUserData() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch user profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      // Fetch user's registered skills
      const { data: skillsData } = await supabase
        .from("user_skills")
        .select("id, skill_type, level, goal, skills(name)")
        .eq("user_id", user.id);

      if (profileData) setProfile(profileData);

      if (skillsData) {
        const typedSkills = skillsData as unknown as SkillItem[];
        setTeachSkills(typedSkills.filter((s) => s.skill_type === "TEACH"));
        setLearnSkills(typedSkills.filter((s) => s.skill_type === "LEARN"));
      }

      setLoading(false);
    }

    loadUserData();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500 font-medium">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Navbar */}
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <span className="text-xl font-bold tracking-tight">SkillSwap</span>
            <nav className="hidden md:flex space-x-4 text-sm font-medium text-slate-600">
              <Link href="/dashboard" className="text-blue-600">Dashboard</Link>
              <Link href="/dashboard" className="hover:text-slate-900">Browse Matches</Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-full text-sm font-medium">
              <span>🪙 Credits:</span>
              <span className="font-bold text-blue-600">{profile?.credits ?? 0}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Hub */}
      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome, {profile?.full_name || "Member"}!
          </h1>
          <p className="text-slate-500">Manage your skills and prepare to swap sessions.</p>
        </div>

        {/* Profile Skill Badges */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Skills You Teach</CardTitle>
              <CardDescription>Earn credits by scheduling sessions for these</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {teachSkills.length > 0 ? (
                teachSkills.map((item) => (
                  <Badge key={item.id} className="bg-emerald-600 hover:bg-emerald-700">
                    {item.skills?.name} ({item.level})
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-slate-400">No teaching skills added yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Skills You Are Learning</CardTitle>
              <CardDescription>Spend credits to learn from peers</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {learnSkills.length > 0 ? (
                learnSkills.map((item) => (
                  <Badge key={item.id} variant="outline" className="border-blue-500 text-blue-700">
                    {item.skills?.name} ({item.level})
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-slate-400">No learning skills added yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}