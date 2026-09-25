"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSkillSwap } from "@/context/SkillSwapContext";
import CoinIcon from "@/components/common/CoinIcon";
import {
  Bell,
  Sparkles,
  LogOut,
  CreditCard,
  User,
  Settings,
  ChevronDown,
  CheckCheck,
  Repeat2,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const publicNavLinks = [
  { name: "How it works", href: "/#how-it-works" },
  { name: "Features", href: "/#features" },
  { name: "Community", href: "/discover" },
];

const authedNavLinks = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Discover", href: "/discover" },
  { name: "Matches", href: "/matches" },
  { name: "Messages", href: "/messages" },
  { name: "Sessions", href: "/learn" },
];

export default function Navbar({
  onOpenBuyCredits,
}: {
  onOpenBuyCredits?: () => void;
}) {
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
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Scroll-aware opacity
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setShowProfileMenu(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    setShowProfileMenu(false);
    await signOut();
    router.push("/login");
  };

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  const navLinks = isAuthenticated ? authedNavLinks : publicNavLinks;

  const dropdownVariants = {
    hidden: { opacity: 0, scale: 0.96, y: -4 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] as const },
    },
    exit: {
      opacity: 0,
      scale: 0.96,
      y: -4,
      transition: { duration: 0.1 },
    },
  };

  const notifTypeIcon = (title: string) => {
    if (title.toLowerCase().includes("match")) return "⚡";
    if (title.toLowerCase().includes("session")) return "📅";
    if (title.toLowerCase().includes("message")) return "💬";
    if (title.toLowerCase().includes("credit")) return "💰";
    return "✨";
  };

  return (
    <header
      className="sticky top-0 z-40 w-full transition-all duration-300"
      style={{
        background: scrolled
          ? "rgba(8,9,13,0.88)"
          : "rgba(8,9,13,0.60)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: scrolled
          ? "1px solid rgba(255,255,255,0.07)"
          : "1px solid rgba(255,255,255,0.04)",
        boxShadow: scrolled
          ? "0 4px 24px rgba(0,0,0,0.35)"
          : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Logo */}
        <Link
          href={isAuthenticated ? "/dashboard" : "/"}
          className="flex items-center gap-2.5 group focus:outline-none shrink-0"
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #7C6CF6 0%, #06B6D4 100%)",
              boxShadow: "0 4px 14px rgba(124,108,246,0.35)",
            }}
          >
            <Repeat2 className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-base font-extrabold tracking-tight text-white/90 hidden sm:block">
            SkillSwap
          </span>
        </Link>

        {/* Center: Desktop Nav links (hidden on mobile, hidden when sidebar handles nav) */}
        <nav className="hidden md:flex items-center gap-0.5 lg:hidden">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C6CF6]/50 ${
                  active
                    ? "text-white"
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                {active && (
                  <span
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(124,108,246,0.18) 0%, rgba(6,182,212,0.08) 100%)",
                    }}
                  />
                )}
                <span className="relative">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {/* Credits pill */}
              <button
                onClick={() =>
                  onOpenBuyCredits ? onOpenBuyCredits() : router.push("/credits")
                }
                title="View wallet"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-150 hover:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C6CF6]/50"
                style={{
                  background: "rgba(245,165,36,0.1)",
                  border: "1px solid rgba(245,165,36,0.2)",
                }}
              >
                <CoinIcon size={14} />
                <span className="font-mono text-[#f5a524] text-xs">{credits}</span>
                <span className="text-white/40 text-xs font-medium">cr</span>
              </button>

              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => {
                    setShowNotifications((v) => !v);
                    setShowProfileMenu(false);
                  }}
                  aria-label="Notifications"
                  className="relative p-2 rounded-full text-white/50 hover:text-white/80 hover:bg-white/[0.06] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C6CF6]/50"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifsCount > 0 && (
                    <span
                      className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full ring-2 ring-[#08090D] animate-pulse"
                      style={{
                        background:
                          "linear-gradient(135deg, #7C6CF6, #06B6D4)",
                      }}
                    />
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      key="notif-dropdown"
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl overflow-hidden"
                      style={{
                        background: "rgba(13,15,23,0.97)",
                        backdropFilter: "blur(24px)",
                        WebkitBackdropFilter: "blur(24px)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
                      }}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07]">
                        <div>
                          <h3 className="text-sm font-bold text-white">
                            Notifications
                          </h3>
                          <p className="text-xs text-white/40 mt-0.5">
                            {unreadNotifsCount > 0
                              ? `${unreadNotifsCount} unread`
                              : "You're all caught up"}
                          </p>
                        </div>
                        {unreadNotifsCount > 0 && (
                          <button
                            onClick={markNotificationsAsRead}
                            className="flex items-center gap-1.5 text-xs font-semibold text-[#7C6CF6] hover:text-[#9b8ef8] transition-colors"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            Mark all read
                          </button>
                        )}
                      </div>

                      {/* Items */}
                      <div className="max-h-72 overflow-y-auto divide-y divide-white/[0.05]">
                        {notifications.length > 0 ? (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-white/[0.03] ${
                                !notif.read ? "bg-white/[0.02]" : ""
                              }`}
                            >
                              <span className="text-base shrink-0 mt-0.5">
                                {notifTypeIcon(notif.title)}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-xs font-semibold text-white/90 leading-snug">
                                    {notif.title}
                                  </p>
                                  {!notif.read && (
                                    <span
                                      className="w-1.5 h-1.5 rounded-full shrink-0 mt-1"
                                      style={{
                                        background:
                                          "linear-gradient(135deg, #7C6CF6, #06B6D4)",
                                      }}
                                    />
                                  )}
                                </div>
                                <p className="text-xs text-white/45 mt-0.5 leading-snug">
                                  {notif.message}
                                </p>
                                <span className="text-[10px] text-white/30 mt-1 block">
                                  {notif.time}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-8 text-center">
                            <Sparkles className="w-8 h-8 text-white/20 mx-auto mb-2" />
                            <p className="text-sm text-white/40 font-medium">
                              No notifications yet
                            </p>
                            <p className="text-xs text-white/25 mt-1">
                              We'll let you know when something happens
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Avatar + Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => {
                    setShowProfileMenu((v) => !v);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-white/[0.06] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C6CF6]/50"
                  style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <img
                    src={
                      currentUser?.avatar ||
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                    }
                    alt={currentUser?.name || "User"}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10"
                  />
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-white/40 transition-transform duration-200 hidden sm:block ${
                      showProfileMenu ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      key="profile-dropdown"
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="absolute right-0 mt-2 w-56 rounded-2xl overflow-hidden"
                      style={{
                        background: "rgba(13,15,23,0.97)",
                        backdropFilter: "blur(24px)",
                        WebkitBackdropFilter: "blur(24px)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
                      }}
                    >
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-white/[0.07]">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={
                              currentUser?.avatar ||
                              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
                            }
                            alt={currentUser?.name || "User"}
                            className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white/90 truncate leading-none">
                              {currentUser?.name || "User"}
                            </p>
                            <p className="text-xs text-white/40 truncate mt-0.5">
                              {currentUser?.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu items */}
                      <div className="py-1.5">
                        {[
                          { href: "/profile", icon: User, label: "My Profile" },
                          { href: "/credits", icon: CreditCard, label: "Credits & Wallet" },
                          { href: "/settings", icon: Settings, label: "Settings" },
                        ].map(({ href, icon: Icon, label }) => (
                          <Link
                            key={href}
                            href={href}
                            onClick={() => setShowProfileMenu(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/60 hover:text-white/90 hover:bg-white/[0.04] transition-all duration-150"
                          >
                            <Icon className="w-4 h-4 shrink-0 text-white/35" />
                            {label}
                          </Link>
                        ))}
                      </div>

                      <div className="border-t border-white/[0.07] py-1.5">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/[0.06] transition-all duration-150"
                        >
                          <LogOut className="w-4 h-4 shrink-0" />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            /* Logged out state */
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-1.5 rounded-full text-sm font-medium text-white/60 hover:text-white/90 hover:bg-white/[0.06] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C6CF6]/50"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold text-white transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C6CF6]/50 hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #7C6CF6 0%, #06B6D4 100%)",
                  boxShadow: "0 4px 14px rgba(124,108,246,0.3)",
                }}
              >
                Get started
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
