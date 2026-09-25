"use client";

import React, { useState } from "react";
import { useSkillSwap } from "@/context/SkillSwapContext";
import CoinIcon from "@/components/common/CoinIcon";
import {
  X,
  Repeat,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
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
  const { userTaughtSkills, sendSwapRequest } = useSkillSwap();

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white dark:bg-[#1e1938] rounded-3xl border border-[#ddd4f5] dark:border-[#362c5e] shadow-2xl p-6 sm:p-8 relative text-[#241b3d] dark:text-[#f4f0ff]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-[#7a719c] hover:text-[#241b3d] dark:hover:text-white hover:bg-[#ede8fb] dark:hover:bg-[#282147] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {sentSuccess ? (
          <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-[#241b3d] dark:text-[#f4f0ff]">
                Swap request sent
              </h3>
              <p className="text-xs sm:text-sm text-[#7a719c] dark:text-[#a99ed4] mt-1 max-w-sm mx-auto">
                We notified {targetUser.name}. Once they accept, you can start your direct 1-hour swap with zero credits required.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => {
                  setSentSuccess(false);
                  onClose();
                }}
                className="px-6 py-2.5 rounded-full bg-[#7d6ce8] hover:bg-[#6c5bd6] text-white text-xs font-bold shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ede8fb] dark:bg-[#282147] text-[#7d6ce8] dark:text-[#ac98f2] border border-[#ddd4f5] dark:border-[#362c5e] text-xs font-semibold mb-2">
                <Repeat className="w-3.5 h-3.5" />
                <span>Direct Swap · No Credits Move</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#241b3d] dark:text-[#f4f0ff]">
                Request a skill swap
              </h3>
              <p className="text-xs sm:text-sm text-[#7a719c] dark:text-[#a99ed4] mt-0.5">
                Propose a mutual 1-hour exchange with {targetUser.name}.
              </p>
            </div>

            {/* Target Skill Summary */}
            <div className="p-4 rounded-2xl bg-[#f5f2fc] dark:bg-[#130f26] border border-[#ddd4f5] dark:border-[#362c5e] flex items-center gap-3.5">
              {targetUser.avatar ? (
                <img
                  src={targetUser.avatar}
                  alt={targetUser.name}
                  className="w-12 h-12 rounded-full object-cover border border-[#ddd4f5] dark:border-[#362c5e]"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#ede8fb] text-[#7d6ce8] flex items-center justify-center font-bold text-base">
                  {targetUser.name.charAt(0)}
                </div>
              )}
              <div>
                <span className="text-[11px] font-semibold text-[#7d6ce8] dark:text-[#ac98f2] uppercase tracking-wider block">
                  You want to learn
                </span>
                <p className="text-sm sm:text-base font-extrabold text-[#241b3d] dark:text-[#f4f0ff]">
                  {targetUser.skillToTeach}
                </p>
                <p className="text-xs text-[#7a719c] dark:text-[#a99ed4]">
                  Taught by {targetUser.name}
                </p>
              </div>
            </div>

            {/* What can you offer in exchange? */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-[#7a719c] dark:text-[#a99ed4] block">
                What can you offer in exchange?
              </label>

              {userTaughtSkills.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs text-[#7a719c] dark:text-[#a99ed4] block">
                    Choose from your teaching skills (Direct swap):
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
                        className={`p-3 rounded-2xl border text-left text-xs font-semibold transition-all ${
                          !useCredits && selectedOffer === skill
                            ? "border-[#7d6ce8] bg-[#ede8fb] dark:bg-[#282147] text-[#7d6ce8] dark:text-[#ac98f2] shadow-sm"
                            : "border-[#ddd4f5] dark:border-[#362c5e] bg-white dark:bg-[#1e1938] text-[#241b3d] dark:text-[#f4f0ff] hover:border-[#7d6ce8]"
                        }`}
                      >
                        <span className="block truncate">{skill}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Or pay 10 credits instead */}
              <div
                onClick={() => setUseCredits(true)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  useCredits
                    ? "border-[#7d6ce8] bg-[#ede8fb] dark:bg-[#282147] text-[#7d6ce8] dark:text-[#ac98f2] shadow-sm"
                    : "border-[#ddd4f5] dark:border-[#362c5e] bg-white dark:bg-[#1e1938] text-[#7a719c] hover:border-[#7d6ce8]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CoinIcon size={18} />
                  <div>
                    <p className="text-xs font-bold text-[#241b3d] dark:text-[#f4f0ff]">
                      Pay 10 credits instead
                    </p>
                    <p className="text-[11px] text-[#7a719c] dark:text-[#a99ed4]">
                      Locked in escrow until 1-hour session is marked complete
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs font-extrabold text-[#f5a524]">10 c</span>
              </div>
            </div>

            {/* Optional Personal Note */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#7a719c] dark:text-[#a99ed4] block">
                Short note to {targetUser.name} (optional)
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Excited to swap with you! I can teach Next.js architecture in return."
                className="w-full px-4 py-2.5 rounded-2xl border border-[#ddd4f5] dark:border-[#362c5e] bg-white dark:bg-[#130f26] text-xs text-[#241b3d] dark:text-[#f4f0ff] placeholder-[#7a719c] focus:outline-none focus:ring-2 focus:ring-[#7d6ce8]/40"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-full border border-[#ddd4f5] dark:border-[#362c5e] text-xs font-semibold text-[#7a719c] hover:bg-[#ede8fb] dark:hover:bg-[#282147] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-full bg-[#7d6ce8] hover:bg-[#6c5bd6] text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
              >
                <span>Send swap request</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
