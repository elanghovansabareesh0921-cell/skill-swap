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
  User,
  LogOut,
  CreditCard,
  ChevronDown,
  Menu,
  X,
  Settings,
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
      <header className="sticky top-0 z-40 w-full bg-[#0B0C10] border-b-2 border-black transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Skill Swap Logo & Rule Pill */}
          <div className="flex items-center gap-4 lg:gap-6">
            <Link
              href="/"
              className="flex items-center gap-2.5 group focus:outline-none"
            >
              <div className="w-9 h-9 border-2 border-black bg-[#FFE600] flex items-center justify-center text-black font-black text-lg shadow-[2px_2px_0px_0px_#000000] group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:shadow-none transition-all">
                <span>S</span>
              </div>
              <span className="text-xl font-black uppercase tracking-tight text-white group-hover:text-[#FFE600] transition-colors">
                SkillSwap
              </span>
            </Link>

            {/* Economic Rule Eyebrow Pill */}
            <div className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 border-2 border-black bg-[#181B22] text-xs font-black uppercase text-[#FFE600] shadow-[2px_2px_0px_0px_#FFE600]">
              <CoinIcon size={14} />
              <span>1 Hour = 10 Credits</span>
            </div>

            {/* Center: Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1.5 ml-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-3.5 py-1.5 text-xs font-black uppercase tracking-wider transition-all ${
                      isActive
                        ? "border-2 border-black bg-[#FFE600] text-black shadow-[2px_2px_0px_0px_#000000]"
                        : "text-zinc-300 hover:text-white border-2 border-transparent hover:border-black hover:bg-[#181B22] hover:shadow-[2px_2px_0px_0px_#FFE600]"
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
            {/* Credit Balance Box */}
            <button
              onClick={() => {
                if (onOpenBuyCredits) onOpenBuyCredits();
                else router.push("/credits");
              }}
              title="Click to view wallet"
              className="flex items-center gap-2 px-3 py-1.5 border-2 border-black bg-[#181B22] hover:bg-[#1F2430] text-white shadow-[3px_3px_0px_0px_#FFE600] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-xs font-black cursor-pointer group"
            >
              <CoinIcon size={16} />
              <span className="font-mono font-black tracking-tight text-[#FFE600]">
                {credits}
              </span>
              <span className="hidden sm:inline font-black uppercase text-zinc-300">
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
                className="relative p-2 border-2 border-black bg-[#181B22] text-zinc-200 hover:text-white shadow-[2px_2px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#FF5E7E] border border-black animate-pulse" />
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#181B22] border-2 border-black shadow-[6px_6px_0px_0px_#FFE600] py-3 z-50">
                  <div className="px-4 pb-2.5 border-b-2 border-black flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-white">Notifications</h3>
                      <p className="text-[11px] text-zinc-400">
                        {unreadNotifsCount > 0
                          ? `${unreadNotifsCount} unread update${unreadNotifsCount > 1 ? "s" : ""}`
                          : "You're all caught up"}
                      </p>
                    </div>
                    {unreadNotifsCount > 0 && (
                      <button
                        onClick={markNotificationsAsRead}
                        className="text-[10px] font-black uppercase text-[#FFE600] hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y-2 divide-black">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3.5 hover:bg-[#1F2430] transition-colors flex items-start gap-3 ${
                            !notif.read ? "bg-[#12141C]" : ""
                          }`}
                        >
                          <div className="mt-0.5 p-1.5 border border-black bg-[#FFE600] text-black">
                            <Sparkles className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 text-xs">
                            <p className="font-black text-white">{notif.title}</p>
                            <p className="text-zinc-300 mt-0.5">{notif.message}</p>
                            <span className="text-[10px] text-zinc-500 font-mono mt-1 block">{notif.time}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-zinc-400 font-mono uppercase">
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
                  className="flex items-center gap-1.5 p-1 border-2 border-black bg-[#181B22] shadow-[2px_2px_0px_0px_#38BDF8] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all focus:outline-none cursor-pointer"
                >
                  <img
                    src={currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                    alt={currentUser?.name || "User"}
                    className="w-7 h-7 object-cover border border-black"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400 hidden sm:block" />
                </button>

                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#181B22] border-2 border-black shadow-[6px_6px_0px_0px_#38BDF8] py-2 z-50">
                    <div className="px-4 py-2 border-b-2 border-black">
                      <p className="text-xs font-black uppercase text-white truncate">
                        {currentUser?.name}
                      </p>
                      <p className="text-[11px] text-zinc-400 font-mono truncate">
                        {currentUser?.email}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/profile"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-black uppercase text-zinc-200 hover:text-black hover:bg-[#FFE600] transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        href="/credits"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-black uppercase text-zinc-200 hover:text-black hover:bg-[#FFE600] transition-colors"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Credits & Wallet</span>
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-black uppercase text-zinc-200 hover:text-black hover:bg-[#FFE600] transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t-2 border-black">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-black uppercase text-[#FF5E7E] hover:bg-[#FF5E7E] hover:text-black transition-colors"
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
                  className="px-3.5 py-1.5 border-2 border-black bg-[#181B22] text-white text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-1.5 border-2 border-black bg-[#FFE600] hover:bg-[#FACC15] text-black text-xs font-black uppercase shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                >
                  Get started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 border-2 border-black bg-[#181B22] text-zinc-200 hover:text-white"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t-2 border-black bg-[#181B22] px-4 pt-3 pb-5 space-y-2">
            <div className="pb-2 border-b-2 border-black">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 border-2 border-black bg-[#0B0C10] text-xs font-black uppercase text-[#FFE600]">
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
                  className={`block px-4 py-2 border-2 border-black text-xs font-black uppercase tracking-wider transition-colors ${
                    isActive
                      ? "bg-[#FFE600] text-black shadow-[3px_3px_0px_0px_#000000]"
                      : "bg-[#0B0C10] text-white hover:bg-[#1F2430]"
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
