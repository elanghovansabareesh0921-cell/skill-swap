"use client";

import React, { useEffect } from "react";
import { CredentialItem } from "@/context/SkillSwapContext";
import {
  X,
  Award,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Building2,
  FileText,
  Download,
  CheckCircle2,
} from "lucide-react";

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  credential: CredentialItem | null;
  recipientName?: string;
}

export default function CertificateModal({
  isOpen,
  onClose,
  credential,
  recipientName = "Alex Rivera",
}: CertificateModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !credential) return null;

  const isPdf = credential.documentUrl?.startsWith("data:application/pdf") || credential.fileName?.endsWith(".pdf");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-[#161327] rounded-3xl border border-[#E4E1F5] dark:border-[#2D264E] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#E4E1F5] dark:border-[#2D264E] flex items-center justify-between bg-[#F8F7FF] dark:bg-[#1E1935]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#18181B] dark:text-white line-clamp-1">
                {credential.title}
              </h3>
              <p className="text-xs text-[#71717A] dark:text-zinc-400 flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-[#7C3AED] dark:text-[#A78BFA]" />
                <span>{credential.issuer || "Verified Issuer"}</span>
                {credential.issueDate && (
                  <>
                    <span>•</span>
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Issued {credential.issueDate}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#71717A] hover:text-[#18181B] dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Legibility & Verification Status */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                  Verified Skill Credential
                </p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  Legibility and authenticity confirmed for peer-to-peer mentoring.
                </p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 shrink-0">
              Verified
            </span>
          </div>

          {/* Document Display / Preview */}
          {credential.documentUrl ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-[#71717A]">
                <span className="font-semibold flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#7C3AED]" />
                  <span>Attached Certificate Document</span>
                </span>
                <a
                  href={credential.documentUrl}
                  download={credential.fileName || `${credential.title.toLowerCase().replace(/\s+/g, "_")}_certificate`}
                  className="text-[#7C3AED] dark:text-[#A78BFA] hover:underline flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Document</span>
                </a>
              </div>

              <div className="rounded-2xl border border-[#E4E1F5] dark:border-[#2D264E] bg-zinc-50 dark:bg-[#0E0C1B] overflow-hidden flex items-center justify-center p-3 max-h-[400px]">
                {isPdf ? (
                  <div className="w-full py-12 text-center space-y-3">
                    <FileText className="w-12 h-12 mx-auto text-[#7C3AED]" />
                    <p className="text-xs font-medium text-[#18181B] dark:text-zinc-200">
                      PDF Document: {credential.fileName || "Certificate.pdf"}
                    </p>
                    <a
                      href={credential.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7C3AED] text-white text-xs font-semibold hover:bg-[#6D28D9] transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open PDF in New Window</span>
                    </a>
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={credential.documentUrl}
                    alt={credential.title}
                    className="max-h-[380px] w-auto max-w-full object-contain rounded-lg shadow-sm"
                  />
                )}
              </div>
            </div>
          ) : (
            /* Digital Certificate Presentation Card */
            <div className="p-8 rounded-2xl border-2 border-dashed border-[#DDD6FE] dark:border-[#3B2D66] bg-gradient-to-br from-[#EDE9FE]/20 via-white to-[#EDE9FE]/10 dark:from-[#231C3D]/30 dark:via-[#161327] dark:to-[#231C3D]/20 text-center space-y-4 shadow-sm relative overflow-hidden">
              <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/60 border-2 border-amber-400 mx-auto flex items-center justify-center text-amber-600 shadow-md">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-extrabold text-[#7C3AED] dark:text-[#A78BFA]">
                  Certificate of Competence &amp; Merit
                </p>
                <h4 className="text-xl font-extrabold text-[#18181B] dark:text-white mt-1">
                  {credential.title}
                </h4>
                <p className="text-xs text-[#71717A] dark:text-zinc-400 mt-2">
                  Awarded to <span className="font-semibold text-[#18181B] dark:text-white">{recipientName}</span>
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-around text-xs text-[#71717A]">
                <div>
                  <span className="block text-[10px] text-zinc-400">Issuer</span>
                  <span className="font-semibold text-[#18181B] dark:text-white">
                    {credential.issuer || "Accredited Body"}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-zinc-400">Issued</span>
                  <span className="font-semibold text-[#18181B] dark:text-white">
                    {credential.issueDate || "Active"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Verification Link */}
          {credential.verificationUrl && (
            <div className="p-4 rounded-2xl border border-[#E4E1F5] dark:border-[#2D264E] bg-[#F8F7FF] dark:bg-[#0E0C1B] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-[#18181B] dark:text-white block">
                  Public Verification Link
                </span>
                <span className="text-[11px] text-[#71717A] dark:text-zinc-400 truncate max-w-sm block">
                  {credential.verificationUrl}
                </span>
              </div>
              <a
                href={credential.verificationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0 justify-center"
              >
                <span>Verify Online</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#E4E1F5] dark:border-[#2D264E] bg-[#F8F7FF] dark:bg-[#1E1935] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-[#18181B] dark:text-zinc-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
