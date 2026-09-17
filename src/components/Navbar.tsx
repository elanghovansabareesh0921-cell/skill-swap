"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSkillSwap } from "@/context/SkillSwapContext";
import {
  Bell,
  Sparkles,
  Compass,
  GraduationCap,
  PlusCircle,
  Users,
  User,
  LogOut,
  CreditCard,
  CheckCircle2,
  Calendar,
  ExternalLink,
  ChevronDown,
  Home,
  Menu,
  X,
} from "lucide-react";

export default function Navbar({ onOpenBuyCredits }: { onOpenBuyCredits?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    currentUser,
    credits,
    notifications,
    unreadNotifsCount,
    markNotificationsAsRead,
  } = useSkillSwap();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
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
    { name: "Discover", href: "/discover" },
    { name: "Learn", href: "/learn" },
    { name: "Teach", href: "/teach" },
    { name: "Community", href: "/community" },
  ];

  return (
    <>
      {/* Desktop & Mobile Top Bar */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-gray-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: SkillSwap Logo */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-2.5 group focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:bg-indigo-600 transition-colors">
                <span className="tracking-tight">S</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-gray-900 group-hover:text-indigo-600 transition-colors">
                SkillSwap
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
                        ? "text-gray-900 bg-gray-100 font-semibold"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Actions (Credits, Notifications, Profile) */}
          <div className="flex items-center gap-3">
            {/* Credit Balance Pill */}
            <button
              onClick={() => {
                if (onOpenBuyCredits) onOpenBuyCredits();
                else router.push("/credits");
              }}
              title="Click to view wallet or buy credits"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50/80 border border-indigo-100/90 text-indigo-950 hover:bg-indigo-100 transition-all text-xs sm:text-sm font-semibold cursor-pointer group"
            >
              <span className="text-base leading-none">🪙</span>
              <span className="font-mono tracking-tight font-bold text-indigo-900">
                {credits}
              </span>
              <span className="hidden sm:inline text-indigo-700 font-normal">Credits</span>
            </button>

            {/* Notifications Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                aria-label="Notifications"
                className="relative p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white animate-pulse" />
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-gray-200/90 shadow-xl shadow-gray-900/10 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 pb-2.5 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                      <p className="text-xs text-gray-500">
                        {unreadNotifsCount > 0
                          ? `${unreadNotifsCount} unread update${unreadNotifsCount > 1 ? "s" : ""}`
                          : "All caught up"}
                      </p>
                    </div>
                    {unreadNotifsCount > 0 && (
                      <button
                        onClick={markNotificationsAsRead}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          setShowNotifications(false);
                          if (notif.link) router.push(notif.link);
                        }}
                        className={`p-3.5 hover:bg-gray-50 cursor-pointer transition-colors flex items-start gap-3 ${
                          !notif.read ? "bg-indigo-50/30" : ""
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs ${
                            notif.type === "credits"
                              ? "bg-emerald-100 text-emerald-800"
                              : notif.type === "session"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-indigo-100 text-indigo-800"
                          }`}
                        >
                          {notif.type === "credits"
                            ? "🪙"
                            : notif.type === "session"
                            ? "⏰"
                            : "🤝"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-900 truncate">
                            {notif.title}
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5 line-clamp-2 leading-relaxed">
                            {notif.message}
                          </p>
                          <span className="text-[10px] text-gray-400 mt-1 block">
                            {notif.time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="px-4 pt-2.5 border-t border-gray-100 text-center">
                    <Link
                      href="/dashboard"
                      onClick={() => setShowNotifications(false)}
                      className="text-xs text-gray-500 hover:text-gray-900 font-medium"
                    >
                      View all in Dashboard →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar & Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-gray-200 transition-all focus:outline-none"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-gray-200"
                />
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {currentUser.name}
                </span>
                <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-gray-400" />
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-gray-200/90 shadow-xl shadow-gray-900/10 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2.5 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-900">{currentUser.name}</p>
                    <p className="text-[11px] text-gray-500 truncate">{currentUser.role}</p>
                    <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-[11px] font-mono text-gray-700">
                      🪙 {credits} credits
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      Dashboard
                    </Link>
                    <Link
                      href="/credits"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    >
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      Credits & Wallet
                    </Link>
                    <Link
                      href="/teach"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    >
                      <PlusCircle className="w-4 h-4 text-gray-400" />
                      Teach a Skill
                    </Link>
                    <Link
                      href="/learn"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    >
                      <GraduationCap className="w-4 h-4 text-gray-400" />
                      Learning Sessions
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/90 py-2 px-3 flex items-center justify-around shadow-lg">
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            pathname === "/" ? "text-indigo-600" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </Link>
        <Link
          href="/discover"
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            pathname === "/discover" ? "text-indigo-600" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>Discover</span>
        </Link>
        <Link
          href="/learn"
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            pathname.startsWith("/learn") ? "text-indigo-600" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <GraduationCap className="w-5 h-5" />
          <span>Learn</span>
        </Link>
        <Link
          href="/teach"
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            pathname === "/teach" ? "text-indigo-600" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <PlusCircle className="w-5 h-5" />
          <span>Teach</span>
        </Link>
        <Link
          href="/dashboard"
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            pathname === "/dashboard" ? "text-indigo-600" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </Link>
      </nav>
    </>
  );
}
