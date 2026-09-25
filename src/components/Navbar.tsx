"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSkillSwap } from "@/context/SkillSwapContext";
import ThemeToggle from "@/components/ThemeToggle";
import CoinIcon from "@/components/common/CoinIcon";
import {
  Bell,
  Sparkles,
  Compass,
  MessageSquare,
  Users,
  User,
  LogOut,
  CreditCard,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronDown,
  Home,
  Menu,
  X,
  Settings,
  ArrowRight,
} from "lucide-react";

export default function Navbar({ onOpenBuyCredits }: { onOpenBuyCredits?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    currentUser,
    isAuthenticated,
    credits,
    notifications,
    unreadNotifsCount,
    markNotificationsAsRead,
    signOut,
  } = useSkillSwap();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { name: "Explore", href: "/discover" },
    { name: "My Skills", href: "/skills" },
    { name: "Matches", href: "/matches" },
    { name: "Messages", href: "/messages" },
    { name: "Credits", href: "/credits" },
  ];

  const handleLogout = async () => {
    setShowProfileMenu(false);
    await signOut();
    router.push("/login");
  };

  return (
    <>
      {/* Desktop & Mobile Top Bar */}
      <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#1e1938]/95 backdrop-blur-md border-b border-[#ddd4f5] dark:border-[#362c5e] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Skill Swap Logo & Rule Pill */}
          <div className="flex items-center gap-4 lg:gap-6">
            <Link
              href="/"
              className="flex items-center gap-2.5 group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-2xl bg-[#7d6ce8] flex items-center justify-center text-white font-extrabold text-base shadow-sm group-hover:bg-[#6c5bd6] transition-all">
                <span className="tracking-tight">S</span>
              </div>
              <span className="text-xl font-extrabold tracking-tight text-[#241b3d] dark:text-[#f4f0ff] group-hover:text-[#7d6ce8] dark:group-hover:text-[#ac98f2] transition-colors">
                SkillSwap
              </span>
            </Link>

            {/* Economic Rule Eyebrow Pill */}
            <div className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ede8fb] dark:bg-[#282147] border border-[#ddd4f5] dark:border-[#362c5e] text-xs font-semibold text-[#7d6ce8] dark:text-[#ac98f2]">
              <CoinIcon size={12} />
              <span>1 Hour = 10 Credits</span>
            </div>

            {/* Center: Desktop Navigation Links (Pill-shaped) */}
            <nav className="hidden md:flex items-center space-x-1 ml-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      isActive
                        ? "text-[#7d6ce8] dark:text-[#ac98f2] bg-[#ede8fb] dark:bg-[#282147] border border-[#ddd4f5] dark:border-[#362c5e]"
                        : "text-[#7a719c] dark:text-[#a99ed4] hover:text-[#241b3d] dark:hover:text-[#f4f0ff] hover:bg-[#ede8fb]/50 dark:hover:bg-[#282147]/50"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Credit Balance Pill */}
            <button
              onClick={() => {
                if (onOpenBuyCredits) onOpenBuyCredits();
                else router.push("/credits");
              }}
              title="Click to view wallet"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#ede8fb] dark:bg-[#282147] border border-[#ddd4f5] dark:border-[#362c5e] text-[#241b3d] dark:text-[#f4f0ff] hover:border-[#7d6ce8] transition-all text-xs font-bold cursor-pointer group"
            >
              <CoinIcon size={16} />
              <span className="font-mono tracking-tight text-[#f5a524]">
                {credits}
              </span>
              <span className="hidden sm:inline font-semibold text-[#7a719c] dark:text-[#a99ed4]">
                Credits
              </span>
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                aria-label="Notifications"
                className="relative p-2 rounded-full text-[#7a719c] dark:text-[#a99ed4] hover:text-[#241b3d] dark:hover:text-[#f4f0ff] hover:bg-[#ede8fb] dark:hover:bg-[#282147] transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#7d6ce8] ring-2 ring-white dark:ring-[#1e1938] animate-pulse" />
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#1e1938] rounded-3xl border border-[#ddd4f5] dark:border-[#362c5e] shadow-xl py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 pb-2.5 border-b border-[#ddd4f5] dark:border-[#362c5e] flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#241b3d] dark:text-[#f4f0ff]">Notifications</h3>
                      <p className="text-xs text-[#7a719c] dark:text-[#a99ed4]">
                        {unreadNotifsCount > 0
                          ? `${unreadNotifsCount} unread update${unreadNotifsCount > 1 ? "s" : ""}`
                          : "You're all caught up"}
                      </p>
                    </div>
                    {unreadNotifsCount > 0 && (
                      <button
                        onClick={markNotificationsAsRead}
                        className="text-xs font-semibold text-[#7d6ce8] dark:text-[#ac98f2] hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-[#ddd4f5]/60 dark:divide-[#362c5e]/60">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3.5 hover:bg-[#ede8fb]/30 dark:hover:bg-[#282147]/40 transition-colors flex items-start gap-3 ${
                            !notif.read ? "bg-[#ede8fb]/20 dark:bg-[#282147]/20" : ""
                          }`}
                        >
                          <div className="mt-0.5 p-1.5 rounded-full bg-[#ede8fb] dark:bg-[#282147] text-[#7d6ce8] dark:text-[#ac98f2]">
                            <Sparkles className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 text-xs">
                            <p className="font-semibold text-[#241b3d] dark:text-[#f4f0ff]">{notif.title}</p>
                            <p className="text-[#7a719c] dark:text-[#a99ed4] mt-0.5">{notif.message}</p>
                            <span className="text-[10px] text-[#7a719c] mt-1 block">{notif.time}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-[#7a719c] dark:text-[#a99ed4]">
                        No notifications yet.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Avatar / Menu */}
            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#7d6ce8]/30 transition-all focus:outline-none"
                >
                  <img
                    src={currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                    alt={currentUser?.name || "User"}
                    className="w-8 h-8 rounded-full object-cover border border-[#ddd4f5] dark:border-[#362c5e]"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-[#7a719c] dark:text-[#a99ed4] hidden sm:block" />
                </button>

                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1e1938] rounded-3xl border border-[#ddd4f5] dark:border-[#362c5e] shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2 border-b border-[#ddd4f5] dark:border-[#362c5e]">
                      <p className="text-sm font-bold text-[#241b3d] dark:text-[#f4f0ff] truncate">
                        {currentUser?.name}
                      </p>
                      <p className="text-xs text-[#7a719c] dark:text-[#a99ed4] truncate">
                        {currentUser?.email}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/profile"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#241b3d] dark:text-[#f4f0ff] hover:bg-[#ede8fb] dark:hover:bg-[#282147] transition-colors"
                      >
                        <User className="w-4 h-4 text-[#7d6ce8]" />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        href="/credits"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#241b3d] dark:text-[#f4f0ff] hover:bg-[#ede8fb] dark:hover:bg-[#282147] transition-colors"
                      >
                        <CreditCard className="w-4 h-4 text-[#f5a524]" />
                        <span>Credits & Wallet</span>
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#241b3d] dark:text-[#f4f0ff] hover:bg-[#ede8fb] dark:hover:bg-[#282147] transition-colors"
                      >
                        <Settings className="w-4 h-4 text-[#7a719c]" />
                        <span>Settings</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-[#ddd4f5] dark:border-[#362c5e]">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#241b3d] dark:text-[#f4f0ff] hover:bg-[#ede8fb] dark:hover:bg-[#282147] transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#7d6ce8] hover:bg-[#6c5bd6] text-white transition-all shadow-sm"
                >
                  Get started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full text-[#7a719c] dark:text-[#a99ed4] hover:bg-[#ede8fb] dark:hover:bg-[#282147]"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#ddd4f5] dark:border-[#362c5e] bg-white dark:bg-[#1e1938] px-4 pt-3 pb-5 space-y-2">
            <div className="pb-2 border-b border-[#ddd4f5] dark:border-[#362c5e]">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ede8fb] dark:bg-[#282147] text-xs font-semibold text-[#7d6ce8] dark:text-[#ac98f2]">
                <CoinIcon size={12} />
                <span>1 Hour = 10 Credits</span>
              </div>
            </div>
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-[#ede8fb] dark:bg-[#282147] text-[#7d6ce8] dark:text-[#ac98f2]"
                      : "text-[#241b3d] dark:text-[#f4f0ff] hover:bg-[#ede8fb]/50 dark:hover:bg-[#282147]/50"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        )}
      </header>
    </>
  );
}
