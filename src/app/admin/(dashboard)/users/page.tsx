import React from 'react';
import Image from 'next/image';
import { MoreVertical, ShieldAlert, Trash2, Search, Filter, ShieldCheck, UserX } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

interface AdminUserItem {
  id: string;
  email: string;
  fullName: string;
  role: 'Admin' | 'User';
  status: 'Active' | 'Suspended' | 'Pending';
  joinedDate: string;
  avatar: string;
  reputationScore: number;
}

interface ProfileRow {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  is_onboarded?: boolean;
  created_at?: string;
  strikes_count?: number;
  reputation_score?: number;
  is_admin?: boolean;
}

/**
 * AdminUsersPage
 * 
 * Server Component that renders the User Management dashboard.
 * Fetches real user data from Supabase profiles table.
 */
export default async function AdminUsersPage() {
  let users: AdminUserItem[] = [];
  let fetchError: string | null = null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, avatar_url, is_onboarded, created_at, strikes_count, reputation_score, is_admin')
      .order('created_at', { ascending: false });

    if (error) {
      fetchError = error.message;
    } else {
      const rows = (data || []) as ProfileRow[];
      users = rows.map((p) => ({
        id: p.id,
        email: p.email || 'N/A',
        fullName: p.full_name || 'Anonymous',
        role: p.is_admin === true ? 'Admin' : 'User',
        status: (p.strikes_count || 0) >= 3 ? 'Suspended' : (p.is_onboarded ? 'Active' : 'Pending'),
        joinedDate: p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Unknown',
        avatar: p.avatar_url || '/avatars/avatar_3.jpg',
        reputationScore: Number(p.reputation_score) || 5.0,
      }));
    }
  } catch (e: unknown) {
    fetchError = e instanceof Error ? e.message : 'Failed to connect to database';
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-display font-extrabold text-ink tracking-tight">User Management</h1>
          <p className="text-sm text-ink/60 mt-1">Manage platform users, roles, and account statuses.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="flex items-center gap-2 rounded-full border border-ink/15 bg-mist-pure px-4 py-2 text-xs font-semibold text-ink hover:bg-ink/5 transition-colors shadow-xs">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40" />
            <input 
              type="text" 
              placeholder="Search users..." 
              className="w-full rounded-full border border-ink/15 bg-mist-pure pl-9 pr-4 py-2 text-xs text-ink placeholder:text-ink-muted/50 focus:border-lagoon focus:outline-none shadow-xs dark:bg-mist-subtle dark:border-white/15 dark:placeholder:text-ink-muted/40"
            />
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {fetchError && (
        <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 px-6 py-4 text-xs text-rose-800 dark:text-rose-300">
          <strong>Database Error:</strong> {fetchError}. Showing empty table.
        </div>
      )}

      {/* Data Table */}
      <div className="bg-mist-pure rounded-3xl border border-ink/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-mist border-b border-ink/10 text-xs font-bold text-ink/60 uppercase tracking-wider">
                <th className="px-6 py-4 font-mono">User</th>
                <th className="px-6 py-4 font-mono">Role</th>
                <th className="px-6 py-4 font-mono">Status</th>
                <th className="px-6 py-4 font-mono">Reputation</th>
                <th className="px-6 py-4 font-mono">Joined Date</th>
                <th className="px-6 py-4 font-mono text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {users.length === 0 && !fetchError && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-ink/50">
                    No users found in the database.
                  </td>
                </tr>
              )}
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-mist/50 transition-colors group">
                  {/* User Info Column */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Image 
                        src={user.avatar} 
                        alt="" 
                        width={40}
                        height={40}
                        unoptimized
                        className="h-10 w-10 rounded-full object-cover border border-ink/10"
                      />
                      <div>
                        <div className="font-semibold text-ink text-sm">{user.fullName}</div>
                        <div className="text-xs text-ink/50">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  
                  {/* Role Column */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                      user.role === 'Admin' 
                        ? 'bg-saffron/20 text-amber-800 dark:text-amber-300 border border-saffron/30' 
                        : 'bg-ink/5 text-ink/70 border border-ink/10'
                    }`}>
                      {user.role === 'Admin' ? <ShieldCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                      {user.role}
                    </span>
                  </td>

                  {/* Status Column */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                      user.status === 'Active'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                        : user.status === 'Suspended'
                        ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                        : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        user.status === 'Active' ? 'bg-emerald-500' 
                        : user.status === 'Suspended' ? 'bg-rose-500' 
                        : 'bg-amber-500'
                      }`}></span>
                      {user.status}
                    </span>
                  </td>

                  {/* Reputation Column */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-ink/70">
                    {user.reputationScore.toFixed(1)} ★
                  </td>

                  {/* Joined Date Column */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-ink/70 font-medium">
                    {user.joinedDate}
                  </td>

                  {/* Actions Column */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Suspend Action */}
                      <button 
                        title="Suspend User"
                        className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-200 cursor-pointer"
                      >
                        <ShieldAlert className="h-4 w-4" />
                      </button>
                      
                      {/* Delete Action */}
                      <button 
                        title="Delete Account"
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {/* Fallback for touch devices or without hover */}
                    <button className="lg:hidden p-1.5 text-ink/40 hover:text-ink">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Table Footer / Pagination */}
        <div className="px-6 py-4 border-t border-ink/10 bg-mist flex items-center justify-between">
          <span className="text-xs text-ink/50 font-medium">Showing {users.length} user{users.length !== 1 ? 's' : ''}</span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-xs font-semibold text-ink/40 cursor-not-allowed border border-ink/10 rounded-lg bg-mist-pure">Previous</button>
            <button className="px-3 py-1.5 text-xs font-semibold text-ink/40 cursor-not-allowed border border-ink/10 rounded-lg bg-mist-pure">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
