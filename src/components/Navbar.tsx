"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSkillSwap } from "@/context/SkillSwapContext";
import ThemeToggle from "@/components/ThemeToggle";
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
      <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#0E0C1B]/95 backdrop-blur-md border-b border-[#E4E1F5] dark:border-[#2D264E] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Skill Swap Logo */}
          <div className="flex items-center gap-6 lg:gap-8">
            <Link
              href="/"
              className="flex items-center gap-2.5 group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-[#7C3AED] dark:bg-[#8B5CF6] flex items-center justify-center text-white font-bold text-base shadow-sm group-hover:bg-[#6D28D9] transition-all">
                <span className="tracking-tight">S</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-[#18181B] dark:text-white group-hover:text-[#7C3AED] dark:group-hover:text-[#A78BFA] transition-colors">
                Skill Swap
              </span>
            </Link>

            {/* Center: Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "text-[#7C3AED] dark:text-[#A78BFA] bg-[#EDE9FE] dark:bg-[#231C3D] font-semibold"
                        : "text-[#71717A] dark:text-zinc-300 hover:text-[#18181B] dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
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
              title="Click to view wallet or buy credits"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EDE9FE] dark:bg-[#231C3D] border border-[#DDD6FE] dark:border-[#3B2D66] text-[#7C3AED] dark:text-[#A78BFA] hover:bg-[#DDD6FE]/70 dark:hover:bg-[#2F2454] transition-all text-xs sm:text-sm font-semibold cursor-pointer group"
            >
              <span className="text-sm sm:text-base leading-none">🪙</span>
              <span className="font-mono tracking-tight font-bold">
                {credits}
              </span>
              <span className="hidden sm:inline text-xs font-normal opacity-90">Credits</span>
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
                className="relative p-2 rounded-xl text-[#71717A] dark:text-zinc-300 hover:text-[#18181B] dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#7C3AED] ring-2 ring-white dark:ring-[#0E0C1B] animate-pulse" />
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#161327] rounded-2xl border border-[#E4E1F5] dark:border-[#2D264E] shadow-xl py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 pb-2.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-[#18181B] dark:text-white">Notifications</h3>
                      <p className="text-xs text-[#71717A] dark:text-zinc-400">
                        {unreadNotifsCount > 0
                          ? `${unreadNotifsCount} unread update${unreadNotifsCount > 1 ? "s" : ""}`
                          : "All caught up"}
                      </p>
                    </div>
                    {unreadNotifsCount > 0 && (
                      <button
                        onClick={markNotificationsAsRead}
                        className="text-xs text-[#7C3AED] dark:text-[#A78BFA] hover:underline font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="divide-y divide-zinc-50 dark:divide-zinc-800/80 max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            setShowNotifications(false);
                            if (notif.link) router.push(notif.link);
                          }}
                          className={`p-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors flex items-start gap-3 ${
                            !notif.read ? "bg-[#EDE9FE]/30 dark:bg-[#231C3D]/40" : ""
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs ${
                              notif.type === "credits"
                                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                                : notif.type === "session"
                                ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                                : "bg-[#EDE9FE] dark:bg-[#231C3D] text-[#7C3AED] dark:text-[#A78BFA]"
                            }`}
                          >
                            {notif.type === "credits"
                              ? "🪙"
                              : notif.type === "session"
                              ? "⏰"
                              : "🤝"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-[#18181B] dark:text-white truncate">
                              {notif.title}
                            </p>
                            <p className="text-xs text-[#71717A] dark:text-zinc-300 mt-0.5 line-clamp-2 leading-relaxed">
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 block">
                              {notif.time}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-[#71717A]">
                        No notifications yet.
                      </div>
                    )}
                  </div>

                  <div className="px-4 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 text-center">
                    <Link
                      href="/dashboard"
                      onClick={() => setShowNotifications(false)}
                      className="text-xs text-[#7C3AED] dark:text-[#A78BFA] hover:underline font-medium"
                    >
                      View all in Dashboard →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Authenticated User Menu vs Guest Buttons */}
            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#A78BFA]/50 transition-all focus:outline-none"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover border border-[#E4E1F5] dark:border-[#2D264E]"
                  />
                  <span className="hidden sm:block text-sm font-medium text-[#18181B] dark:text-zinc-200">
                    {currentUser.name}
                  </span>
                  <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-[#71717A]" />
                </button>

                {/* Profile Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#161327] rounded-2xl border border-[#E4E1F5] dark:border-[#2D264E] shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800">
                      <p className="text-xs font-semibold text-[#18181B] dark:text-white">{currentUser.name}</p>
                      <p className="text-[11px] text-[#71717A] dark:text-zinc-400 truncate">{currentUser.role}</p>
                      <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EDE9FE] dark:bg-[#231C3D] text-[11px] font-mono text-[#7C3AED] dark:text-[#A78BFA]">
                        🪙 {credits} credits
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/profile"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#71717A] dark:text-zinc-300 hover:bg-[#EDE9FE]/50 dark:hover:bg-[#231C3D] hover:text-[#7C3AED] dark:hover:text-[#A78BFA]"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#71717A] dark:text-zinc-300 hover:bg-[#EDE9FE]/50 dark:hover:bg-[#231C3D] hover:text-[#7C3AED] dark:hover:text-[#A78BFA]"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      <Link
                        href="/credits"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#71717A] dark:text-zinc-300 hover:bg-[#EDE9FE]/50 dark:hover:bg-[#231C3D] hover:text-[#7C3AED] dark:hover:text-[#A78BFA]"
                      >
                        <CreditCard className="w-4 h-4" />
                        Credits & Wallet
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border-t border-zinc-100 dark:border-zinc-800 mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-[#7C3AED] hover:bg-[#EDE9FE] transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-[#7C3AED] text-white hover:bg-[#6D28D9] transition-colors shadow-sm"
                >
                  Start Learning
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0E0C1B]/95 backdrop-blur-md border-t border-[#E4E1F5] dark:border-[#2D264E] py-2 px-3 flex items-center justify-around shadow-lg">
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            pathname === "/" ? "text-[#7C3AED] dark:text-[#A78BFA]" : "text-[#71717A] dark:text-zinc-400"
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </Link>
        <Link
          href="/discover"
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            pathname === "/discover" ? "text-[#7C3AED] dark:text-[#A78BFA]" : "text-[#71717A] dark:text-zinc-400"
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>Explore</span>
        </Link>
        <Link
          href="/skills"
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            pathname === "/skills" ? "text-[#7C3AED] dark:text-[#A78BFA]" : "text-[#71717A] dark:text-zinc-400"
          }`}
        >
          <Layers className="w-5 h-5" />
          <span>My Skills</span>
        </Link>
        <Link
          href="/matches"
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            pathname === "/matches" ? "text-[#7C3AED] dark:text-[#A78BFA]" : "text-[#71717A] dark:text-zinc-400"
          }`}
        >
          <Users className="w-5 h-5" />
          <span>Matches</span>
        </Link>
        <Link
          href="/messages"
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            pathname === "/messages" ? "text-[#7C3AED] dark:text-[#A78BFA]" : "text-[#71717A] dark:text-zinc-400"
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span>Messages</span>
        </Link>
        <Link
          href="/profile"
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            pathname.startsWith("/profile") ? "text-[#7C3AED] dark:text-[#A78BFA]" : "text-[#71717A] dark:text-zinc-400"
          }`}
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </Link>
      </nav>
    </>
  );
}
