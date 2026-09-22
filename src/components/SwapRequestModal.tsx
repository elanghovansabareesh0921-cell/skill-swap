"use client";

import React, { useState } from "react";
import { useSkillSwap } from "@/context/SkillSwapContext";
import {
  X,
  Repeat,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Coins,
} from "lucide-react";

interface SwapRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: {
    id: string;
    name: string;
    avatar?: string;
    skillToTeach: string;
    role?: string;
  };
  onSuccess?: () => void;
}

export default function SwapRequestModal({
  isOpen,
  onClose,
  targetUser,
  onSuccess,
}: SwapRequestModalProps) {
  const { userTaughtSkills, credits, sendSwapRequest, showToast } = useSkillSwap();

  const [selectedOffer, setSelectedOffer] = useState<string>(
    userTaughtSkills[0] || "Credits (10 Credits)"
  );
  const [useCredits, setUseCredits] = useState(false);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const offer = useCredits ? "10 Credits (Escrowed)" : selectedOffer;

    const res = sendSwapRequest({
      toUserId: targetUser.id,
      toUserName: targetUser.name,
      toUserAvatar: targetUser.avatar,
      skillToLearn: targetUser.skillToTeach,
      skillOffered: offer,
    });

    setSubmitting(false);
    if (res.success) {
      setSentSuccess(true);
      if (onSuccess) onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-[#161327] rounded-3xl border border-[#E4E1F5] dark:border-[#2D264E] shadow-2xl p-6 sm:p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-[#71717A] hover:text-[#18181B] dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {sentSuccess ? (
          <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#18181B] dark:text-white">
                Swap request sent successfully!
              </h3>
              <p className="text-xs sm:text-sm text-[#71717A] dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                We notified {targetUser.name}. Once they accept, your reciprocal learning session will be confirmed!
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => {
                  setSentSuccess(false);
                  onClose();
                }}
                className="px-6 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE9FE] dark:bg-[#231C3D] text-[#7C3AED] dark:text-[#A78BFA] text-xs font-semibold mb-2">
                <Repeat className="w-3.5 h-3.5" />
                <span>Skill Exchange Request</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#18181B] dark:text-white">
                Request a Skill Swap
              </h3>
              <p className="text-xs sm:text-sm text-[#71717A] dark:text-zinc-400 mt-0.5">
                Propose a reciprocal swap with {targetUser.name}.
              </p>
            </div>

            {/* Target Skill Summary */}
            <div className="p-4 rounded-2xl bg-[#F8F7FF] dark:bg-[#0E0C1B] border border-[#E4E1F5] dark:border-[#2D264E] flex items-center gap-3.5">
              {targetUser.avatar ? (
                <img
                  src={targetUser.avatar}
                  alt={targetUser.name}
                  className="w-12 h-12 rounded-full object-cover border border-[#E4E1F5]"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center font-bold text-base">
                  {targetUser.name.charAt(0)}
                </div>
              )}
              <div>
                <span className="text-[11px] font-semibold text-[#7C3AED] dark:text-[#A78BFA] uppercase tracking-wider block">
                  You want to learn:
                </span>
                <p className="text-base font-bold text-[#18181B] dark:text-white">
                  {targetUser.skillToTeach}
                </p>
                <p className="text-xs text-[#71717A] dark:text-zinc-400">
                  from {targetUser.name}
                </p>
              </div>
            </div>

            {/* What can you offer in exchange? */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-[#18181B] dark:text-zinc-200 block">
                What can you offer in exchange?
              </label>

              {userTaughtSkills.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs text-[#71717A] block">
                    Choose from your teaching skills:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {userTaughtSkills.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => {
                          setSelectedOffer(skill);
                          setUseCredits(false);
                        }}
                        className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                          !useCredits && selectedOffer === skill
                            ? "border-[#7C3AED] bg-[#EDE9FE]/60 dark:bg-[#231C3D] text-[#7C3AED] dark:text-[#A78BFA] shadow-sm ring-1 ring-[#7C3AED]"
                            : "border-[#E4E1F5] dark:border-[#2D264E] bg-white dark:bg-[#161327] text-[#18181B] dark:text-zinc-300 hover:border-[#A78BFA]"
                        }`}
                      >
                        <span className="block truncate">{skill}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Or use credits option */}
              <div
                onClick={() => setUseCredits(true)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  useCredits
                    ? "border-[#7C3AED] bg-[#EDE9FE]/60 dark:bg-[#231C3D] text-[#7C3AED] dark:text-[#A78BFA] shadow-sm ring-1 ring-[#7C3AED]"
                    : "border-[#E4E1F5] dark:border-[#2D264E] bg-white dark:bg-[#161327] text-[#71717A] hover:border-[#A78BFA]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Coins className="w-4 h-4 text-amber-500" />
                  <div>
                    <p className="text-xs font-bold text-[#18181B] dark:text-white">
                      Offer 10 Credits instead
                    </p>
                    <p className="text-[11px] text-[#71717A]">
                      Use credits if you don&apos;t have a matching skill to swap
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold">🪙 10</span>
              </div>
            </div>

            {/* Optional Personal Note */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#18181B] dark:text-zinc-200 block">
                Short note to {targetUser.name} (Optional)
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Excited to swap with you! I can teach React architecture in return."
                className="w-full px-3.5 py-2 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] bg-white dark:bg-[#0E0C1B] text-xs text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] text-xs font-semibold text-[#71717A] hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5"
              >
                <span>Send Swap Request</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
