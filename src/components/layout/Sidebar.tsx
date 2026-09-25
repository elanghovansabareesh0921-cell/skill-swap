"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSkillSwap } from "@/context/SkillSwapContext";
import CoinIcon from "@/components/common/CoinIcon";
import {
  LayoutDashboard,
  Compass,
  Zap,
  MessageSquare,
  CalendarDays,
  TrendingUp,
  User,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Repeat2,
} from "lucide-react";

interface NavSection {
  label: string;
  items: {
    name: string;
    href: string;
    icon: React.ElementType;
  }[];
}

const navSections: NavSection[] = [
  {
    label: "HOME",
    items: [{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "CONNECT",
    items: [
      { name: "Discover", href: "/discover", icon: Compass },
      { name: "Matches", href: "/matches", icon: Zap },
      { name: "Messages", href: "/messages", icon: MessageSquare },
    ],
  },
  {
    label: "LEARN",
    items: [
      { name: "Sessions", href: "/learn", icon: BookOpen },
      { name: "Calendar", href: "/learn?tab=calendar", icon: CalendarDays },
      { name: "Progress", href: "/skills", icon: TrendingUp },
    ],
  },
  {
    label: "ACCOUNT",
    items: [
      { name: "Profile", href: "/profile", icon: User },
      { name: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { currentUser, credits, isAuthenticated } = useSkillSwap();
  const [collapsed, setCollapsed] = useState(false);

  if (!isAuthenticated) return null;

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href.split("?")[0]));

  return (
    <aside
      className={`hidden lg:flex flex-col shrink-0 h-full sticky top-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Glass sidebar panel */}
      <div
        className="flex flex-col h-full"
        style={{
          background: "rgba(11,13,20,0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* Logo row */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-white/6 shrink-0">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 group focus:outline-none min-w-0"
          >
            {/* Logo mark */}
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shrink-0 transition-transform duration-200 group-hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #7C6CF6 0%, #06B6D4 100%)",
                boxShadow: "0 4px 14px rgba(124,108,246,0.35)",
              }}
            >
              <Repeat2 className="w-4 h-4" strokeWidth={2.5} />
            </div>
            {!collapsed && (
              <span className="text-base font-extrabold tracking-tight text-white/90 truncate">
                SkillSwap
              </span>
            )}
          </Link>
        </div>

        {/* Nav sections */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-5 px-2">
          {navSections.map((section) => (
            <div key={section.label}>
              {!collapsed && (
                <p className="px-3 mb-1.5 text-[10px] font-semibold tracking-widest text-white/30 uppercase">
                  {section.label}
                </p>
              )}
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        title={collapsed ? item.name : undefined}
                        className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/60 ${
                          active
                            ? "text-white"
                            : "text-white/50 hover:text-white/80"
                        } ${collapsed ? "justify-center" : ""}`}
                        style={
                          active
                            ? {
                                background:
                                  "linear-gradient(90deg, rgba(124,108,246,0.18) 0%, rgba(6,182,212,0.08) 100%)",
                                borderLeft: "2px solid #7C6CF6",
                              }
                            : {}
                        }
                      >
                        {/* Hover bg */}
                        {!active && (
                          <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-white/4" />
                        )}
                        <Icon
                          className={`shrink-0 w-4 h-4 transition-colors ${
                            active
                              ? "text-brand-accent"
                              : "text-white/40 group-hover:text-white/60"
                          }`}
                        />
                        {!collapsed && (
                          <span className="truncate">{item.name}</span>
                        )}
                        {/* Active glow dot */}
                        {active && !collapsed && (
                          <span
                            className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
                            style={{
                              background:
                                "linear-gradient(135deg, #7C6CF6, #06B6D4)",
                              boxShadow: "0 0 6px rgba(124,108,246,0.8)",
                            }}
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Bottom: credits + user */}
        <div className="shrink-0 border-t border-white/6 p-3 space-y-2">
          {/* Credits pill */}
          <Link
            href="/credits"
            title={collapsed ? `${credits} Credits` : undefined}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <CoinIcon size={18} className="shrink-0" />
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-xs font-bold text-brand-gold leading-none">
                  {credits}
                </p>
                <p className="text-[10px] text-white/40 mt-0.5">Credits</p>
              </div>
            )}
          </Link>

          {/* Help */}
          <button
            title={collapsed ? "Help" : undefined}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-white/40 hover:text-white/60 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <HelpCircle className="w-4 h-4 shrink-0" />
            {!collapsed && (
              <span className="text-sm font-medium">Help</span>
            )}
          </button>

          {/* User avatar */}
          <Link
            href="/profile"
            title={collapsed ? currentUser?.name || "Profile" : undefined}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <img
              src={
                currentUser?.avatar ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
              }
              alt={currentUser?.name || "Profile"}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10 shrink-0"
            />
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white/80 truncate leading-none">
                  {currentUser?.name || "User"}
                </p>
                <p className="text-[10px] text-white/40 mt-0.5 truncate">
                  View profile
                </p>
              </div>
            )}
          </Link>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-20 z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/60"
          style={{
            background: "#0D0F17",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
          }}
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3 text-white/60" />
          ) : (
            <ChevronLeft className="w-3 h-3 text-white/60" />
          )}
        </button>
      </div>
    </aside>
  );
}
