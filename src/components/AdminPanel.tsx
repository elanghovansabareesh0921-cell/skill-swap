'use client';

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  Check, 
  Scale, 
  DollarSign, 
  UserCheck, 
  FileText 
} from 'lucide-react';
import { SessionLeg } from '@/types';

interface AdminPanelProps {
  sessions: SessionLeg[];
  onResolveDispute: (sessionId: string, resolution: 'REFUND' | 'RELEASE' | 'SPLIT') => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ sessions, onResolveDispute }) => {
  const [makerAmount, setMakerAmount] = useState<string>('50');
  const [makerReason, setMakerReason] = useState<string>('');
  const [makerSubmitted, setMakerSubmitted] = useState<boolean>(false);
  const [pendingApproval, setPendingApproval] = useState<boolean>(false);

  const disputedSessions = sessions.filter(s => s.status === 'DISPUTED');

  const handleProposeAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!makerReason.trim() || !makerAmount) return;
    setPendingApproval(true);
    setMakerSubmitted(true);
  };

  const handleCheckerApprove = () => {
    setPendingApproval(false);
    setMakerSubmitted(false);
    setMakerReason('');
    alert('Maker-Checker Approved: Wallet balance successfully updated with immutable audit log entry.');
  };

  return (
    <div className="space-y-8">
      {/* Spatial Header Banner */}
      <div className="rounded-3xl glass-panel-dark p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden spatial-card">
        {/* Specular Edge */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-mist-pure/30 to-transparent pointer-events-none" />

        <div className="flex items-center justify-between flex-wrap gap-4 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/15 border border-rose-500/30 px-3 py-1 text-xs font-mono font-bold text-rose-300">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>ADMIN OPERATIONS & ESCROW GOVERNANCE</span>
            </div>
            <h1 className="font-display text-3xl font-extrabold text-white">Platform Ledger & Trust Oversight</h1>
            <p className="text-xs text-white/70 max-w-xl font-normal leading-relaxed">
              Dual-control maker-checker adjustments, dispute arbitration, and 10% platform fee ledger reconciliations.
            </p>
          </div>
          <div className="rounded-full bg-mist-pure/10 border border-mist-pure/15 px-4 py-1.5 font-mono text-xs text-white/80">
            SESSION: <strong className="text-emerald-400">AUDIT VERIFIED</strong>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-panel rounded-3xl p-5 border border-ink/8 spatial-card">
          <div className="text-[11px] font-mono text-ink/60 uppercase">Total Token GMV</div>
          <div className="mt-1 text-2xl font-black text-ink font-mono">₹84,250</div>
          <div className="text-[10px] text-emerald-700 mt-0.5 font-medium">+14% this week</div>
        </div>

        <div className="glass-panel rounded-3xl p-5 border border-ink/8 spatial-card">
          <div className="text-[11px] font-mono text-ink/60 uppercase">Platform Fees Retained</div>
          <div className="mt-1 text-2xl font-black text-lagoon font-mono">₹8,425</div>
          <div className="text-[10px] text-ink/50 mt-0.5">10% statutory retention</div>
        </div>

        <div className="glass-panel rounded-3xl p-5 border border-ink/8 spatial-card">
          <div className="text-[11px] font-mono text-ink/60 uppercase">Escrow in Transit</div>
          <div className="mt-1 text-2xl font-black text-amber-700 font-mono">₹3,240</div>
          <div className="text-[10px] text-ink/50 mt-0.5">Locked across active legs</div>
        </div>

        <div className="glass-panel rounded-3xl p-5 border border-ink/8 spatial-card">
          <div className="text-[11px] font-mono text-ink/60 uppercase">Open Disputes</div>
          <div className="mt-1 text-2xl font-black text-rose-600 font-mono">{disputedSessions.length}</div>
          <div className="text-[10px] text-ink/50 mt-0.5">Awaiting arbitration</div>
        </div>
      </div>

      {/* Dispute Arbitration Queue */}
      <div className="space-y-4">
        <h2 className="font-display text-xl font-bold text-ink flex items-center gap-2">
          <Scale className="h-5 w-5 text-lagoon" />
          <span>Dispute Arbitration Queue</span>
        </h2>

        {disputedSessions.length === 0 ? (
          <div className="rounded-3xl glass-panel p-8 text-center text-xs text-ink/60 font-mono border border-ink/6">
            ✓ Zero active disputes in escrow. All exchange legs operating normally.
          </div>
        ) : (
          <div className="space-y-3">
            {disputedSessions.map(session => (
              <div
                key={session.id}
                className="rounded-3xl glass-panel p-6 border border-rose-500/20 bg-rose-500/[0.02] spatial-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-rose-500/15 text-rose-800 px-2.5 py-0.5 text-[10px] font-mono font-bold">
                      DISPUTED
                    </span>
                    <span className="text-xs font-mono text-ink/60">ID: {session.id}</span>
                  </div>
                  <h3 className="font-display font-bold text-ink text-base mt-1">
                    {session.skillName} ({session.chargedTokens} Tokens in Escrow)
                  </h3>
                  <p className="text-xs text-ink/70 mt-1">
                    Dispute reason: <em>Partner was absent for scheduled slot after 15 minutes.</em>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onResolveDispute(session.id, 'REFUND')}
                    className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white hover:bg-black transition-all cursor-pointer shadow-xs"
                  >
                    Refund Learner
                  </button>
                  <button
                    onClick={() => onResolveDispute(session.id, 'RELEASE')}
                    className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-all cursor-pointer shadow-xs"
                  >
                    Release to Teacher
                  </button>
                  <button
                    onClick={() => onResolveDispute(session.id, 'SPLIT')}
                    className="rounded-full border border-ink/20 bg-mist-pure px-3 py-2 text-xs font-semibold text-ink hover:bg-ink/5 transition-all cursor-pointer"
                  >
                    50/50 Split
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dual Control Maker-Checker Panel */}
      <div className="rounded-3xl glass-panel p-7 border border-ink/8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-white">
            <UserCheck className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-display font-bold text-ink text-base">
              Dual-Control Balance Adjustment (Maker-Checker Rule)
            </h3>
            <p className="text-xs text-ink/60">
              No single administrator can credit or debit tokens without peer approval (PRD §8.2).
            </p>
          </div>
        </div>

        <form onSubmit={handleProposeAdjustment} className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          <div className="sm:col-span-3">
            <label className="text-[11px] font-mono text-ink/60 uppercase block mb-1">Adjustment (Tokens)</label>
            <input
              type="number"
              value={makerAmount}
              onChange={e => setMakerAmount(e.target.value)}
              className="w-full rounded-2xl border border-ink/15 bg-mist-pure px-3 py-2.5 text-xs text-ink focus:border-lagoon focus:outline-none"
            />
          </div>

          <div className="sm:col-span-6">
            <label className="text-[11px] font-mono text-ink/60 uppercase block mb-1">Audit Justification</label>
            <input
              type="text"
              placeholder="e.g. Compensatory credit for verified platform outage #401"
              value={makerReason}
              onChange={e => setMakerReason(e.target.value)}
              className="w-full rounded-2xl border border-ink/15 bg-mist-pure px-3 py-2.5 text-xs text-ink focus:border-lagoon focus:outline-none"
            />
          </div>

          <div className="sm:col-span-3 flex items-end">
            <button
              type="submit"
              disabled={pendingApproval}
              className={`w-full rounded-full py-2.5 text-xs font-semibold text-white shadow-xs transition-all cursor-pointer ${
                pendingApproval ? 'bg-ink/40 cursor-not-allowed' : 'bg-lagoon hover:bg-lagoon-dark'
              }`}
            >
              1. Propose (Maker)
            </button>
          </div>
        </form>

        {pendingApproval && (
          <div className="mt-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 flex items-center justify-between text-xs text-amber-900">
            <div>
              <strong className="block font-bold">Pending Peer Checker Approval:</strong>
              <span>
                Proposal to adjust {makerAmount} Tokens for: &ldquo;{makerReason}&rdquo;
              </span>
            </div>
            <button
              type="button"
              onClick={handleCheckerApprove}
              className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white hover:bg-black cursor-pointer shadow-xs"
            >
              2. Approve as Checker
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
