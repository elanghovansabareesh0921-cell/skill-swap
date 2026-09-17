"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [teachSkill, setTeachSkill] = useState("");
  const [teachLevel, setTeachLevel] = useState("Intermediate");
  const [learnSkill, setLearnSkill] = useState("");
  const [learnLevel, setLearnLevel] = useState("Beginner");
  const [availability, setAvailability] = useState("");
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const router = useRouter();
  const supabase = createClient();

  const handleFinish = async () => {
    setLoading(true);
    setErrorMsg("");

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      setErrorMsg("Session missing. Please sign up or log in first.");
      setLoading(false);
      return;
    }

    try {
      // Helper function to resolve or insert skill into the catalog
      const getOrCreateSkill = async (name: string) => {
        const cleanName = name.trim();
        const { data: existing } = await supabase
          .from("skills")
          .select("id")
          .ilike("name", cleanName)
          .maybeSingle();

        if (existing) return existing.id;

        const { data: created, error } = await supabase
          .from("skills")
          .insert({ name: cleanName })
          .select("id")
          .single();

        if (error) throw error;
        return created.id;
      };

      const teachSkillId = await getOrCreateSkill(teachSkill || "Python");
      const learnSkillId = await getOrCreateSkill(learnSkill || "UI Design");

      // Insert both teaching and learning skill records
      const { error: insertError } = await supabase.from("user_skills").insert([
        {
          user_id: user.id,
          skill_id: teachSkillId,
          skill_type: "TEACH",
          level: teachLevel,
          goal: availability,
        },
        {
          user_id: user.id,
          skill_id: learnSkillId,
          skill_type: "LEARN",
          level: learnLevel,
          goal: goal,
        },
      ]);

      if (insertError) throw insertError;

      router.push("/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save profile skills.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10">
      <Card className="w-full max-w-lg shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline">Step {step} of 3</Badge>
            <span className="text-xs text-slate-400">Profile Setup</span>
          </div>
          <CardTitle className="text-2xl pt-2">
            {step === 1 && "What skills can you teach?"}
            {step === 2 && "What do you want to learn?"}
            {step === 3 && "Availability & Goals"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Enter the topic and your current mastery."}
            {step === 2 && "Tell us what topic you are looking to learn."}
            {step === 3 && "Specify your preferred timings and primary goal."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {errorMsg && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {errorMsg}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teach-skill">Primary Skill to Teach</Label>
                <Input
                  id="teach-skill"
                  value={teachSkill}
                  onChange={(e) => setTeachSkill(e.target.value)}
                  placeholder="e.g., Python, C++, Data Structures"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teach-level">Experience Level</Label>
                <Input
                  id="teach-level"
                  value={teachLevel}
                  onChange={(e) => setTeachLevel(e.target.value)}
                  placeholder="e.g., Intermediate, Advanced"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="learn-skill">Skill You Want to Learn</Label>
                <Input
                  id="learn-skill"
                  value={learnSkill}
                  onChange={(e) => setLearnSkill(e.target.value)}
                  placeholder="e.g., Fullstack Web Dev, Figma"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="learn-target">Current Level</Label>
                <Input
                  id="learn-target"
                  value={learnLevel}
                  onChange={(e) => setLearnLevel(e.target.value)}
                  placeholder="e.g., Complete Beginner"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="availability">Weekly Availability</Label>
                <Input
                  id="availability"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  placeholder="e.g., Weekends, Evenings"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primary-goal">Primary Learning Goal</Label>
                <Input
                  id="primary-goal"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g., Build fullstack side-projects"
                />
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-4">
          {step > 1 ? (
            <Button variant="ghost" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)}>Continue</Button>
          ) : (
            <Button onClick={handleFinish} disabled={loading}>
              {loading ? "Saving Profile..." : "Save & Go to Dashboard"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}