'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Zap, 
  Wallet, 
  Sparkles, 
  Sliders, 
  Calendar, 
  MessageSquare, 
  ShieldAlert, 
  LogOut, 
  ArrowRightLeft, 
  ShieldCheck, 
  Lock,
  Moon,
  Sun
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Profile, Wallet as WalletType } from '@/types';

interface NavbarProps {
  currentUser: Profile;
  wallet: WalletType;
  activeTab: 'radar' | 'sessions' | 'chat' | 'admin';
  setActiveTab: (tab: 'radar' | 'sessions' | 'chat' | 'admin') => void;
  onOpenWallet: () => void;
  onOpenOnboarding: () => void;
  onOpenEditSkills: () => void;
  onSignOut?: () => void;
  pendingOffersCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  wallet,
  activeTab,
  setActiveTab,
  onOpenWallet,
  onOpenOnboarding,
  onOpenEditSkills,
  onSignOut,
  pendingOffersCount,
}) => {
  const { theme, setTheme } = useTheme();
  const availableTokens = Math.floor(wallet.availablePaise / 100);
  const heldTokens = Math.floor(wallet.heldPaise / 100);

  return (
    <header className="sticky top-4 z-40 mx-auto max-w-7xl px-4 sm:px-6 transition-all duration-300">
      <div className="spatial-dock rounded-2xl sm:rounded-full px-4 py-2.5 sm:px-5 sm:py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md">
        {/* Brand & System Invariant Tag */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-white group-hover:bg-lagoon transition-all shadow-sm">
              <ArrowRightLeft className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display text-base font-extrabold tracking-tight text-ink">
                  SkillSwap
                </span>
                <span className="hidden lg:inline-block rounded-full bg-lagoon/10 border border-lagoon/20 px-2 py-0.5 text-[9px] font-mono font-bold text-lagoon">
                  ESCROW v0.2
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Central Spatial Segmented Dock */}
        <nav className="flex items-center gap-1 p-1 bg-ink/[0.04] border border-ink/[0.06] rounded-full order-3 md:order-2 w-full md:w-auto justify-center overflow-x-auto">
          <button
            onClick={() => setActiveTab('radar')}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'radar'
                ? 'bg-ink text-white shadow-sm'
                : 'text-ink/70 hover:text-ink hover:bg-mist-pure/80'
            }`}
          >
            <Sparkles className={`h-3.5 w-3.5 ${activeTab === 'radar' ? 'text-saffron' : 'text-ink/50'}`} />
            <span>AI Radar</span>
            <span className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[9px] font-mono font-bold ${
              activeTab === 'radar' ? 'bg-mist-pure/20 text-white' : 'bg-emerald-500/15 text-emerald-700'
            }`}>
              LIVE
            </span>
          </button>

          <button
            onClick={() => setActiveTab('sessions')}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'sessions'
                ? 'bg-ink text-white shadow-sm'
                : 'text-ink/70 hover:text-ink hover:bg-mist-pure/80'
            }`}
          >
            <Calendar className={`h-3.5 w-3.5 ${activeTab === 'sessions' ? 'text-saffron' : 'text-ink/50'}`} />
            <span>Sessions</span>
            {pendingOffersCount > 0 && (
              <span className="rounded-full bg-saffron text-ink px-1.5 text-[9px] font-extrabold shadow-xs">
                {pendingOffersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'chat'
                ? 'bg-ink text-white shadow-sm'
                : 'text-ink/70 hover:text-ink hover:bg-mist-pure/80'
            }`}
          >
            <MessageSquare className={`h-3.5 w-3.5 ${activeTab === 'chat' ? 'text-saffron' : 'text-ink/50'}`} />
            <span>Chat</span>
          </button>

          {currentUser.email === 'elanghovansabareesh0921@gmail.com' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'admin'
                  ? 'bg-ink text-white shadow-sm'
                  : 'text-ink/70 hover:text-ink hover:bg-mist-pure/80'
              }`}
            >
              <ShieldAlert className={`h-3.5 w-3.5 ${activeTab === 'admin' ? 'text-rose-400' : 'text-ink/50'}`} />
              <span>Escrow Admin</span>
            </button>
          )}
        </nav>

        {/* Right Floating Controls: Wallet Pill & User Avatar */}
        <div className="flex items-center gap-2.5 order-2 md:order-3 ml-auto md:ml-0">
          {/* Quick Skill Modifier */}
          <button
            onClick={onOpenEditSkills}
            title="Update teach and learn skills"
            className="hidden lg:flex items-center gap-1.5 rounded-full border border-ink/10 bg-mist-pure/70 px-3 py-1.5 text-xs font-medium text-ink/75 hover:bg-mist-pure hover:text-ink hover:border-ink/20 transition-all cursor-pointer shadow-xs"
          >
            <Sliders className="h-3 w-3 text-lagoon" />
            <span>Edit Skills</span>
          </button>

          {/* Theme Toggle Pill */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Toggle theme"
            className="flex items-center justify-center h-8 w-8 rounded-full border border-ink/10 bg-mist-pure/70 hover:bg-mist-pure hover:border-ink/20 transition-all cursor-pointer shadow-xs text-ink/75 hover:text-lagoon"
          >
            <Sun className="h-4 w-4 hidden dark:block" />
            <Moon className="h-4 w-4 block dark:hidden" />
          </button>

          {/* Spatial Wallet Widget Pill */}
          <button
            onClick={onOpenWallet}
            title="Open Wallet & Escrow Ledger"
            className="flex items-center gap-2.5 rounded-full border border-ink/10 bg-mist-pure/90 pl-3 pr-2 py-1 hover:border-lagoon/40 hover:shadow-md transition-all group cursor-pointer shadow-xs"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-lagoon/10 text-lagoon group-hover:bg-lagoon group-hover:text-white transition-colors">
              <Wallet className="h-3.5 w-3.5" />
            </div>
            <div className="text-left leading-tight">
              <div className="flex items-center gap-1 font-mono text-xs font-bold text-ink">
                <span>{availableTokens}</span>
                <span className="text-[10px] text-lagoon font-sans font-semibold">T</span>
              </div>
              {heldTokens > 0 && (
                <div className="text-[9px] text-ink/50 font-mono">
                  {heldTokens} locked
                </div>
              )}
            </div>
            <span className="rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold text-white group-hover:bg-lagoon transition-colors">
              + Top up
            </span>
          </button>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 rounded-full border border-ink/10 bg-mist-pure/70 pl-1.5 pr-2 py-1 shadow-xs">
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={currentUser.fullName}
              className="h-6 w-6 rounded-full object-cover border border-ink/10"
            />
            <span className="hidden sm:inline-block max-w-[90px] truncate text-xs font-medium text-ink">
              {currentUser.fullName.split(' ')[0]}
            </span>

            <button
              onClick={onOpenOnboarding}
              title="Edit Profile"
              className="hidden sm:inline-block text-[10px] uppercase font-bold text-ink/40 hover:text-ink transition-colors ml-1 cursor-pointer"
            >
              Edit Profile
            </button>

            {onSignOut && (
              <button
                onClick={onSignOut}
                title="Log out"
                className="rounded-full p-1 text-ink/40 hover:bg-ink/5 hover:text-ink transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
