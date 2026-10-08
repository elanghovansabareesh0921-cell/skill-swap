'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import {
  Search,
  Filter,
  RefreshCw,
  ChevronDown,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  ArrowRightLeft,
  Zap,
  Shield,
} from 'lucide-react';
import type { SkillSwap, SwapStatus } from '@/lib/admin/swapTypes';

const STATUS_CONFIG: Record<
  SwapStatus,
  { label: string; color: string; bg: string; border: string; icon: React.ReactNode }
> = {
  Pending: {
    label: 'Pending',
    color: 'text-amber-700 dark:text-amber-300',
    bg: 'bg-amber-500/12',
    border: 'border-amber-500/25',
    icon: <Clock className="h-3 w-3" />,
  },
  Accepted: {
    label: 'Accepted',
    color: 'text-sky-700 dark:text-sky-300',
    bg: 'bg-sky-500/12',
    border: 'border-sky-500/25',
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  Completed: {
    label: 'Completed',
    color: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-500/12',
    border: 'border-emerald-500/25',
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  Cancelled: {
    label: 'Cancelled',
    color: 'text-ink/50 dark:text-white/40',
    bg: 'bg-ink/5 dark:bg-white/5',
    border: 'border-ink/10 dark:border-white/10',
    icon: <XCircle className="h-3 w-3" />,
  },
  Disputed: {
    label: 'Disputed',
    color: 'text-rose-700 dark:text-rose-400',
    bg: 'bg-rose-500/12',
    border: 'border-rose-500/25',
    icon: <AlertTriangle className="h-3 w-3" />,
  },
};

const FILTER_TABS: (SwapStatus | 'All')[] = [
  'All',
  'Pending',
  'Accepted',
  'Completed',
  'Disputed',
  'Cancelled',
];

/**
 * Action options for each status.
 * Defines which status transitions are available from the current status.
 */
const ACTIONS_FOR_STATUS: Record<SwapStatus, { label: string; newStatus: SwapStatus; icon: React.ReactNode }[]> = {
  Pending: [
    { label: 'Force Accept', newStatus: 'Accepted', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
    { label: 'Cancel Swap', newStatus: 'Cancelled', icon: <XCircle className="h-3.5 w-3.5" /> },
  ],
  Accepted: [
    { label: 'Force Complete', newStatus: 'Completed', icon: <Zap className="h-3.5 w-3.5" /> },
    { label: 'Cancel Swap', newStatus: 'Cancelled', icon: <XCircle className="h-3.5 w-3.5" /> },
  ],
  Completed: [],
  Cancelled: [
    { label: 'Reopen as Pending', newStatus: 'Pending', icon: <RefreshCw className="h-3.5 w-3.5" /> },
  ],
  Disputed: [
    { label: 'Resolve – Complete', newStatus: 'Completed', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
    { label: 'Resolve – Cancel', newStatus: 'Cancelled', icon: <XCircle className="h-3.5 w-3.5" /> },
    { label: 'Revert to Accepted', newStatus: 'Accepted', icon: <RefreshCw className="h-3.5 w-3.5" /> },
  ],
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function SwapsDashboard() {
  const [swaps, setSwaps] = useState<SkillSwap[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<SwapStatus | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [allTotal, setAllTotal] = useState(0);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchSwaps = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);

    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'All') params.set('status', statusFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/admin/swaps?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch swaps');

      const data = await res.json();
      setSwaps(data.swaps);
      setTotalCount(data.total);
      setAllTotal(data.allTotal);
    } catch (err) {
      console.error('Error fetching swaps:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const params = new URLSearchParams();
        if (statusFilter !== 'All') params.set('status', statusFilter);
        if (searchQuery.trim()) params.set('search', searchQuery.trim());

        const res = await fetch(`/api/admin/swaps?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch swaps');

        const data = await res.json();
        if (!ignore) {
          setSwaps(data.swaps);
          setTotalCount(data.total);
          setAllTotal(data.allTotal);
        }
      } catch (err) {
        if (!ignore) console.error('Error fetching swaps:', err);
      } finally {
        if (!ignore) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [statusFilter, searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toastMessage]);

  const handleStatusUpdate = async (id: string, newStatus: SwapStatus) => {
    setUpdatingId(id);
    setOpenDropdownId(null);
    try {
      const res = await fetch('/api/admin/swaps', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (!res.ok) throw new Error('Update failed');

      const data = await res.json();
      setToastMessage(`✓ ${data.message}`);
      await fetchSwaps();
    } catch (err) {
      console.error('Error updating swap:', err);
      setToastMessage('✕ Failed to update swap status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Debounced search
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchSwaps();
    }, 350);
  };

  // Status counts for filter badges
  const statusCounts: Record<SwapStatus | 'All', number> = {
    All: allTotal,
    Pending: swaps.filter((s) => s.status === 'Pending').length,
    Accepted: swaps.filter((s) => s.status === 'Accepted').length,
    Completed: swaps.filter((s) => s.status === 'Completed').length,
    Cancelled: swaps.filter((s) => s.status === 'Cancelled').length,
    Disputed: swaps.filter((s) => s.status === 'Disputed').length,
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className="fixed top-6 right-6 z-50 animate-slide-in"
          style={{
            animation: 'slideIn 0.3s ease-out',
          }}
        >
          <div className={`rounded-2xl px-5 py-3 text-sm font-semibold shadow-xl border backdrop-blur-md ${
            toastMessage.startsWith('✓')
              ? 'bg-emerald-500/90 text-white border-emerald-400/40'
              : 'bg-rose-500/90 text-white border-rose-400/40'
          }`}>
            {toastMessage}
          </div>
        </div>
      )}

      {/* Page Header with Gradient Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-accent/8 via-surface to-surface-2 border border-border p-7 sm:p-8 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent pointer-events-none" />
        <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 border border-accent/20 px-3 py-1 text-[10px] font-mono font-bold text-accent uppercase tracking-wider">
              <ArrowRightLeft className="h-3 w-3" />
              <span>Skill Swap Monitoring</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
              Swap Operations Dashboard
            </h1>
            <p className="text-xs text-text-muted max-w-lg leading-relaxed">
              Monitor, filter, and manage all skill swaps across the platform. Resolve disputes, override statuses, and maintain platform integrity.
            </p>
          </div>

          <button
            onClick={() => fetchSwaps(true)}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-full bg-accent text-white px-5 py-2.5 text-xs font-bold hover:opacity-90 transition-all shadow-lg shadow-accent/20 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing…' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {(['Pending', 'Accepted', 'Completed', 'Disputed', 'Cancelled'] as SwapStatus[]).map((st) => {
          const cfg = STATUS_CONFIG[st];
          return (
            <button
              key={st}
              onClick={() => setStatusFilter(st === statusFilter ? 'All' : st)}
              className={`rounded-2xl p-4 border transition-all cursor-pointer text-left group ${
                statusFilter === st
                  ? `${cfg.bg} ${cfg.border} ring-2 ring-offset-1 ring-offset-bg ${cfg.border.replace('border-', 'ring-')}`
                  : 'bg-surface border-border hover:border-text/15'
              }`}
            >
              <div className={`text-[10px] font-mono uppercase tracking-wider ${cfg.color} flex items-center gap-1.5`}>
                {cfg.icon}
                {cfg.label}
              </div>
              <div className="mt-1 text-xl font-black text-text font-mono">
                {statusFilter === 'All'
                  ? swaps.filter((s) => s.status === st).length
                  : st === statusFilter
                  ? totalCount
                  : '–'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-surface rounded-2xl border border-border p-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 flex-shrink-0">
          <Filter className="h-4 w-4 text-text-muted mr-1 flex-shrink-0" />
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`whitespace-nowrap rounded-xl px-3 py-1.5 text-[11px] font-bold transition-all cursor-pointer ${
                statusFilter === tab
                  ? 'bg-chip-active-bg text-chip-active-text shadow-sm'
                  : 'text-text-muted hover:text-text hover:bg-surface-2'
              }`}
            >
              {tab}
              <span className="ml-1 text-[9px] opacity-60">
                ({tab === 'All' ? allTotal : statusCounts[tab]})
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 w-full sm:w-auto sm:ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            id="swap-search-input"
            type="text"
            placeholder="Search by name, email, or skill…"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full rounded-xl border border-border bg-bg pl-9 pr-4 py-2 text-xs text-text placeholder:text-text-muted/60 focus:border-accent focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-16">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="h-6 w-6 text-accent animate-spin" />
              <span className="text-xs text-text-muted font-medium">Loading swaps…</span>
            </div>
          </div>
        ) : swaps.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
              <ArrowRightLeft className="h-7 w-7 text-accent" />
            </div>
            <h3 className="font-display font-bold text-text text-lg">No Swaps Found</h3>
            <p className="text-xs text-text-muted mt-1 max-w-xs">
              {searchQuery
                ? 'Try adjusting your search query or clearing filters.'
                : 'No swaps match the selected filter.'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" id="swaps-table">
                <thead>
                  <tr className="bg-bg border-b border-border text-[10px] font-bold text-text-muted uppercase tracking-wider">
                    <th className="px-5 py-3.5 font-mono">Swap ID</th>
                    <th className="px-5 py-3.5 font-mono">Requester</th>
                    <th className="px-5 py-3.5 font-mono">Skill Offered</th>
                    <th className="px-5 py-3.5 font-mono">Provider</th>
                    <th className="px-5 py-3.5 font-mono">Skill Requested</th>
                    <th className="px-5 py-3.5 font-mono">Status</th>
                    <th className="px-5 py-3.5 font-mono">Created</th>
                    <th className="px-5 py-3.5 font-mono">Scheduled</th>
                    <th className="px-5 py-3.5 font-mono text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-border/50">
                  {swaps.map((swap) => {
                    const statusCfg = STATUS_CONFIG[swap.status];
                    const actions = ACTIONS_FOR_STATUS[swap.status];
                    const isUpdating = updatingId === swap.id;

                    return (
                      <tr
                        key={swap.id}
                        className={`hover:bg-bg/60 transition-colors group ${
                          isUpdating ? 'opacity-50 pointer-events-none' : ''
                        }`}
                      >
                        {/* Swap ID */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="font-mono text-[11px] font-bold text-text/80">{swap.id}</span>
                        </td>

                        {/* Requester */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-accent/10 border border-border flex items-center justify-center text-[10px] font-bold text-accent overflow-hidden flex-shrink-0">
                              {swap.requester.avatar ? (
                                <Image
                                  src={swap.requester.avatar}
                                  alt=""
                                  width={32}
                                  height={32}
                                  unoptimized
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                swap.requester.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-text text-xs truncate max-w-[140px]">
                                {swap.requester.name}
                              </div>
                              <div className="text-[10px] text-text-muted truncate max-w-[140px]">
                                {swap.requester.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Skill Offered */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 rounded-lg bg-accent/8 border border-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent">
                            {swap.skillOffered}
                          </span>
                        </td>

                        {/* Provider */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-emerald-500/10 border border-border flex items-center justify-center text-[10px] font-bold text-emerald-700 dark:text-emerald-400 overflow-hidden flex-shrink-0">
                              {swap.provider.avatar ? (
                                <Image
                                  src={swap.provider.avatar}
                                  alt=""
                                  width={32}
                                  height={32}
                                  unoptimized
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                swap.provider.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-text text-xs truncate max-w-[140px]">
                                {swap.provider.name}
                              </div>
                              <div className="text-[10px] text-text-muted truncate max-w-[140px]">
                                {swap.provider.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Skill Requested */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/8 border border-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                            {swap.skillRequested}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border} border`}
                          >
                            {statusCfg.icon}
                            {statusCfg.label}
                          </span>
                        </td>

                        {/* Created */}
                        <td className="px-5 py-4 whitespace-nowrap text-xs text-text-muted font-medium font-mono">
                          {formatDate(swap.createdAt)}
                        </td>

                        {/* Scheduled */}
                        <td className="px-5 py-4 whitespace-nowrap text-xs font-medium font-mono">
                          {swap.scheduledAt ? (
                            <span className="text-text/80">{formatDateTime(swap.scheduledAt)}</span>
                          ) : (
                            <span className="text-text-muted/50 italic">Not scheduled</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 whitespace-nowrap text-right relative">
                          {actions.length > 0 ? (
                            <div className="relative inline-block" ref={openDropdownId === swap.id ? dropdownRef : null}>
                              <button
                                id={`action-btn-${swap.id}`}
                                onClick={() =>
                                  setOpenDropdownId(openDropdownId === swap.id ? null : swap.id)
                                }
                                className="inline-flex items-center gap-1.5 rounded-xl bg-bg border border-border px-3 py-1.5 text-[11px] font-semibold text-text hover:bg-surface-2 transition-all cursor-pointer group-hover:opacity-100 opacity-70"
                              >
                                <Shield className="h-3 w-3 text-accent" />
                                Actions
                                <ChevronDown className={`h-3 w-3 text-text-muted transition-transform ${openDropdownId === swap.id ? 'rotate-180' : ''}`} />
                              </button>

                              {openDropdownId === swap.id && (
                                <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-surface border border-border shadow-2xl shadow-black/10 z-50 overflow-hidden animate-dropdown">
                                  <div className="p-1.5">
                                    {actions.map((action) => (
                                      <button
                                        key={action.newStatus}
                                        onClick={() => handleStatusUpdate(swap.id, action.newStatus)}
                                        className="flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 text-xs font-semibold text-text hover:bg-bg transition-colors cursor-pointer text-left"
                                      >
                                        <span className={STATUS_CONFIG[action.newStatus].color}>
                                          {action.icon}
                                        </span>
                                        {action.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] text-text-muted/40 italic font-medium">
                              No actions
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="px-5 py-3.5 border-t border-border bg-bg flex items-center justify-between">
              <span className="text-[11px] text-text-muted font-medium">
                Showing <strong className="text-text">{totalCount}</strong> of{' '}
                <strong className="text-text">{allTotal}</strong> swaps
              </span>
              <div className="flex items-center gap-2 text-[10px] text-text-muted">
                <ArrowRightLeft className="h-3 w-3" />
                <span>
                  {statusFilter === 'All' ? 'All statuses' : `Filtered: ${statusFilter}`}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Inline CSS for animations */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-dropdown {
          animation: dropdownIn 0.15s ease-out;
        }
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-4px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
