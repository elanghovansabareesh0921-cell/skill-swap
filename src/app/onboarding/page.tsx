"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useSkillSwap } from "@/context/SkillSwapContext";
import OnboardingWizardModal, {
  OnboardingProfileData,
} from "@/components/onboarding/OnboardingWizardModal";

export default function OnboardingPage() {
  const router = useRouter();
  const { saveOnboardingProfile, showToast } = useSkillSwap();

  const handleComplete = async (profileData: OnboardingProfileData) => {
    try {
      await saveOnboardingProfile({
        referralSource: "Platform Onboarding",
        rolePreference: profileData.isPureLearner ? "learner" : "both",
        learnSkills: profileData.learnSkills.map((name) => ({
          name,
          level: "Beginner",
          goal: `Master ${name}`,
        })),
        teachSkills: profileData.teachSkills.map((name) => ({
          name,
          level: "Intermediate",
          years: 2,
        })),
        bio: profileData.bio,
      });

      showToast(
        "Onboarding Complete!",
        "100 Baseline Credits have been added to your escrow wallet.",
        "success"
      );

      router.push("/dashboard");
    } catch (err: any) {
      console.error("Onboarding submission error:", err);
      // Even if offline or Supabase sync encounters network, proceed gracefully
      router.push("/dashboard");
    }
  };

  return (
    <div
      className="min-h-screen bg-[#000000] text-zinc-100 flex flex-col items-center justify-center p-4 sm:p-8"
      style={{
        backgroundImage:
          "linear-gradient(to right, #1a1a1e 1px, transparent 1px), linear-gradient(to bottom, #1a1a1e 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}
    >
      <div className="w-full max-w-4xl">
        <OnboardingWizardModal
          isOpen={true}
          isModal={false}
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
}