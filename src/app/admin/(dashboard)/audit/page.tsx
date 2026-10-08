import React from 'react';
import { ShieldCheck, Download } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

interface AuditLogItem {
  id: string;
  timestamp: string;
  event: string;
  actor: string;
  details: string;
  status: string;
  amountPaise: number;
}

interface LedgerTxRow {
  id: string;
  created_at?: string;
  transaction_type?: string;
  reference_id?: string;
  metadata?: { description?: string };
  amount_paise?: number;
}

/**
 * AdminAuditPage
 * 
 * Server Component that renders the Audit Ledger Logs dashboard.
 * Fetches real ledger_transactions data from Supabase.
 */
export default async function AdminAuditPage() {
  let auditLogs: AuditLogItem[] = [];
  let fetchError: string | null = null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('ledger_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      fetchError = error.message;
    } else {
      const rows = (data || []) as LedgerTxRow[];
      auditLogs = rows.map((tx) => ({
        id: tx.id,
        timestamp: tx.created_at
          ? new Date(tx.created_at).toLocaleString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              timeZoneName: 'short',
            })
          : 'Unknown',
        event: tx.transaction_type || 'UNKNOWN',
        actor: tx.transaction_type === 'PURCHASE'
          ? 'Razorpay Gateway Hook'
          : tx.transaction_type === 'HOLD'
          ? 'System Automated Engine'
          : tx.transaction_type === 'RELEASE'
          ? 'Dual Confirmation Engine'
          : tx.transaction_type === 'FEE'
          ? 'Platform Fee Engine'
          : 'System',
        details: tx.metadata?.description || `Transaction ${tx.reference_id || tx.id}`,
        status: tx.transaction_type === 'PURCHASE' || tx.transaction_type === 'HOLD' ? 'VERIFIED' : 'SETTLED',
        amountPaise: tx.amount_paise || 0,
      }));
    }
  } catch (e: unknown) {
    fetchError = e instanceof Error ? e.message : 'Failed to connect to database';
  }

  // Fallback to sample data if no records exist yet (fresh deployment)
  if (auditLogs.length === 0 && !fetchError) {
    auditLogs = [
      {
        id: 'AUDIT-SAMPLE-1',
        timestamp: 'No live data yet',
        event: 'INFO',
        actor: 'System',
        details: 'No ledger transactions recorded. They will appear here once users purchase tokens or complete sessions.',
        status: 'INFO',
        amountPaise: 0,
      },
    ];
  }

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

      {/* Error Banner */}
      {fetchError && (
        <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 px-6 py-4 text-xs text-rose-800 dark:text-rose-300">
          <strong>Database Error:</strong> {fetchError}. Displaying empty table.
        </div>
      )}

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
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-mist/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-ink">
                    {typeof log.id === 'string' && log.id.length > 12 ? log.id.substring(0, 12) + '…' : log.id}
                  </td>
                  <td className="px-6 py-4 font-mono text-ink/60">{log.timestamp}</td>
                  <td className="px-6 py-4 font-mono">
                    <span className="rounded-md bg-lagoon/10 border border-lagoon/20 px-2 py-0.5 font-bold text-lagoon">
                      {log.event}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-ink font-medium">{log.actor}</td>
                  <td className="px-6 py-4 text-ink/80 max-w-xs truncate">{log.details}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center gap-1 font-mono font-bold px-2.5 py-1 rounded-full ${
                      log.status === 'INFO' 
                        ? 'text-blue-700 bg-blue-500/10' 
                        : 'text-emerald-700 bg-emerald-500/10'
                    }`}>
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