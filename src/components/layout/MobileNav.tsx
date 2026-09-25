"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  Zap,
  MessageSquare,
  User,
  BookOpen,
} from "lucide-react";

const mobileNavItems = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Discover", href: "/discover", icon: Compass },
  { name: "Matches", href: "/matches", icon: Zap },
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Sessions", href: "/learn", icon: BookOpen },
  { name: "Profile", href: "/profile", icon: User },
];

export default function MobileNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe"
      style={{
        background: "rgba(8,9,13,0.92)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {mobileNavItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C6CF6]/60 min-w-[48px]"
              style={
                active
                  ? {
                      background:
                        "rgba(124,108,246,0.12)",
                    }
                  : {}
              }
            >
              <Icon
                className={`w-5 h-5 transition-colors ${
                  active ? "text-[#7C6CF6]" : "text-white/40"
                }`}
              />
              <span
                className={`text-[10px] font-medium transition-colors leading-none ${
                  active ? "text-[#7C6CF6]" : "text-white/35"
                }`}
              >
                {item.name}
              </span>
              {active && (
                <span
                  className="absolute bottom-1 w-1 h-1 rounded-full"
                  style={{
                    background: "linear-gradient(135deg, #7C6CF6, #06B6D4)",
                    boxShadow: "0 0 5px rgba(124,108,246,0.8)",
                  }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
