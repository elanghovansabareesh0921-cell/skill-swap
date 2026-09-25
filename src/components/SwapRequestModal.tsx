"use client";

import React, { useState } from "react";
import { useSkillSwap } from "@/context/SkillSwapContext";
import CoinIcon from "@/components/common/CoinIcon";
import {
  X,
  Repeat,
  CheckCircle2,
  ArrowRight,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg border-2 border-black bg-[#181B22] shadow-[8px_8px_0px_0px_#FFE600] p-6 sm:p-8 relative text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 border border-black bg-[#12141C] text-zinc-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {sentSuccess ? (
          <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 border-2 border-black bg-[#A3E635] text-black flex items-center justify-center mx-auto shadow-[3px_3px_0px_0px_#000000]">
              <CheckCircle2 className="w-8 h-8 stroke-[3]" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase text-white">
                Swap request sent
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-sm mx-auto font-medium">
                We notified {targetUser.name}. Once they accept, you can start your direct 1-hour swap with zero credits required.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => {
                  setSentSuccess(false);
                  onClose();
                }}
                className="px-6 py-2.5 border-2 border-black bg-[#FFE600] text-black text-xs font-black uppercase shadow-[3px_3px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 border-2 border-black bg-[#12141C] text-[#38BDF8] text-xs font-black uppercase shadow-[2px_2px_0px_0px_#38BDF8] mb-2">
                <Repeat className="w-3.5 h-3.5" />
                <span>Direct Swap · No Credits Move</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
                Request a skill swap
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5 font-medium">
                Propose a mutual 1-hour exchange with {targetUser.name}.
              </p>
            </div>

            {/* Target Skill Summary */}
            <div className="p-4 border-2 border-black bg-[#12141C] flex items-center gap-3.5 shadow-[2px_2px_0px_0px_#000000]">
              {targetUser.avatar ? (
                <img
                  src={targetUser.avatar}
                  alt={targetUser.name}
                  className="w-12 h-12 object-cover border-2 border-black"
                />
              ) : (
                <div className="w-12 h-12 border-2 border-black bg-[#FFE600] text-black flex items-center justify-center font-black text-base">
                  {targetUser.name.charAt(0)}
                </div>
              )}
              <div>
                <span className="text-[10px] font-black text-[#38BDF8] uppercase tracking-wider block">
                  You want to learn
                </span>
                <p className="text-sm sm:text-base font-black uppercase text-white font-mono">
                  {targetUser.skillToTeach}
                </p>
                <p className="text-xs text-zinc-400 font-mono">
                  Taught by {targetUser.name}
                </p>
              </div>
            </div>

            {/* What can you offer in exchange? */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-300 block">
                What can you offer in exchange?
              </label>

              {userTaughtSkills.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs text-zinc-400 block font-mono">
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
                        className={`p-3 border-2 border-black text-left text-xs font-black uppercase transition-all cursor-pointer ${
                          !useCredits && selectedOffer === skill
                            ? "bg-[#FFE600] text-black shadow-[3px_3px_0px_0px_#000000]"
                            : "bg-[#12141C] text-white hover:border-[#FFE600]"
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
                className={`p-3.5 border-2 border-black cursor-pointer transition-all flex items-center justify-between ${
                  useCredits
                    ? "bg-[#FFE600] text-black shadow-[3px_3px_0px_0px_#000000]"
                    : "bg-[#12141C] text-white hover:border-[#FFE600]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CoinIcon size={18} />
                  <div>
                    <p className={`text-xs font-black uppercase ${useCredits ? "text-black" : "text-white"}`}>
                      Pay 10 credits instead
                    </p>
                    <p className={`text-[11px] font-mono ${useCredits ? "text-black" : "text-zinc-400"}`}>
                      Locked in escrow until 1-hour session complete
                    </p>
                  </div>
                </div>
                <span className={`font-mono text-xs font-black ${useCredits ? "text-black" : "text-[#FFE600]"}`}>10 c</span>
              </div>
            </div>

            {/* Optional Personal Note */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-zinc-300 block">
                Short note to {targetUser.name} (optional)
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Excited to swap with you! I can teach Next.js architecture in return."
                className="w-full px-4 py-2.5 border-2 border-black bg-[#12141C] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FFE600]"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border-2 border-black bg-[#12141C] text-xs font-black uppercase text-zinc-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 border-2 border-black bg-[#FFE600] hover:bg-[#FACC15] text-black font-black uppercase text-xs shadow-[3px_3px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1.5 cursor-pointer"
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
