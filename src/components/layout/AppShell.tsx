"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import { useSkillSwap } from "@/context/SkillSwapContext";

// Routes that should NOT have the sidebar (full-screen / marketing / auth)
const NO_SHELL_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/onboarding",
  "/design-preview",
];

// Routes that use shell but without sidebar (wide content routes)
const NO_SIDEBAR_ROUTES: string[] = [];

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { isAuthenticated } = useSkillSwap();

  const isNoShell = NO_SHELL_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "?")
  );

  // If on a no-shell route or not authenticated, just render children directly
  if (isNoShell || !isAuthenticated) {
    return <>{children}</>;
  }

  const hideSidebar = NO_SIDEBAR_ROUTES.some((r) => pathname.startsWith(r));

  return (
    <div className="flex min-h-dvh">
      {/* Sidebar — desktop only */}
      {!hideSidebar && <Sidebar />}

      {/* Main content area */}
      <main className="flex-1 min-w-0 flex flex-col">
        {children}
      </main>

      {/* Mobile bottom navigation */}
      <MobileNav />
    </div>
  );
}
