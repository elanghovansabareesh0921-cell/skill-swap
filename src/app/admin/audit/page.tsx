import React from 'react';
import Link from 'next/link';
import { FileText, ShieldCheck, Download, ArrowLeft } from 'lucide-react';

const mockAuditLogs = [
  {
    id: 'AUDIT-8921',
    timestamp: 'Today, 14:15:22 IST',
    event: 'ESCROW_HOLD',
    actor: 'System Automated Engine',
    details: 'Locked 18 SP in escrow for Session #ses-402 (Python Async)',
    status: 'VERIFIED',
  },
  {
    id: 'AUDIT-8920',
    timestamp: 'Yesterday, 19:30:10 IST',
    event: 'TOKEN_PURCHASE',
    actor: 'Razorpay Gateway Hook',
    details: 'Credited 200 SP (₹200.00) via Razorpay UPI pay-rzp-001',
    status: 'VERIFIED',
  },
  {
    id: 'AUDIT-8919',
    timestamp: '28 Sep 2026, 11:00:45 IST',
    event: 'ESCROW_RELEASE',
    actor: 'Dual Confirmation Engine',
    details: 'Released 45 SP to teacher, 5 SP fee retained on #ses-398',
    status: 'SETTLED',
  },
  {
    id: 'AUDIT-8918',
    timestamp: '27 Sep 2026, 16:20:00 IST',
    event: 'ROLE_UPDATE',
    actor: 'Admin Sabareesh',
    details: 'Granted verified teacher badge to Priya Patel',
    status: 'AUDITED',
  },
];

export default function AdminAuditPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-ink tracking-tight">Audit Ledger Logs</h1>
          <p className="text-sm text-ink/60 mt-1">Immutable double-entry escrow logs and administrator security telemetry.</p>
        </div>
        <a
          href="/api/wallet/statement"
          download="skillswap_audit_ledger.csv"
          className="flex items-center gap-2 rounded-full bg-lagoon px-5 py-2 text-xs font-semibold text-white hover:bg-lagoon-dark transition-all shadow-xs"
        >
          <Download className="h-4 w-4" />
          <span>Export Audit CSV</span>
        </a>
      </div>

      <div className="bg-mist-pure rounded-3xl border border-ink/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-mist border-b border-ink/10 text-xs font-bold text-ink/60 uppercase tracking-wider">
                <th className="px-6 py-4 font-mono">Log ID</th>
                <th className="px-6 py-4 font-mono">Timestamp</th>
                <th className="px-6 py-4 font-mono">Event Type</th>
                <th className="px-6 py-4 font-mono">Actor</th>
                <th className="px-6 py-4 font-mono">Details</th>
                <th className="px-6 py-4 font-mono text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5 text-xs">
              {mockAuditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-mist/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-ink">{log.id}</td>
                  <td className="px-6 py-4 font-mono text-ink/60">{log.timestamp}</td>
                  <td className="px-6 py-4 font-mono">
                    <span className="rounded-md bg-lagoon/10 border border-lagoon/20 px-2 py-0.5 font-bold text-lagoon">
                      {log.event}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-ink font-medium">{log.actor}</td>
                  <td className="px-6 py-4 text-ink/80">{log.details}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-700 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                      <ShieldCheck className="h-3 w-3" />
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
