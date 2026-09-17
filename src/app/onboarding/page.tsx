"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);

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
            {step === 1 && "List the areas where you can mentor other members to earn credits."}
            {step === 2 && "Pick subjects and target proficiencies to help find matching peers."}
            {step === 3 && "Tell us your schedule and primary target for swapping skills."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teach-skill">Primary Skill to Teach</Label>
                <Input id="teach-skill" placeholder="e.g., Python, UI Design, C++" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teach-level">Your Experience Level</Label>
                <Input id="teach-level" placeholder="e.g., Intermediate, Advanced" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="learn-skill">Skill You Want to Learn</Label>
                <Input id="learn-skill" placeholder="e.g., Fullstack Web Dev, Data Science" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="learn-target">Current Level</Label>
                <Input id="learn-target" placeholder="e.g., Complete Beginner" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="availability">Weekly Availability</Label>
                <Input id="availability" placeholder="e.g., Weekends, 5-8 PM Weekdays" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primary-goal">Primary Learning Goal</Label>
                <Input id="primary-goal" placeholder="e.g., Build real-world portfolio projects" />
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
            <Link href="/dashboard">
              <Button>Complete Setup & Go to Dashboard</Button>
            </Link>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}