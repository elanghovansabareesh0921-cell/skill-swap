'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ArrowRightLeft, Users, FileText, Settings } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: 'Swaps',
    href: '/admin/swaps',
    icon: ArrowRightLeft,
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    label: 'Audit Logs',
    href: '/admin/audit',
    icon: FileText,
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = item.exact
          ? pathname === item.href
          : pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all group ${
              isActive
                ? 'bg-accent/10 text-accent font-bold shadow-xs border border-accent/20'
                : 'text-ink/70 hover:text-ink hover:bg-ink/5 font-semibold'
            }`}
          >
            <Icon
              className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                isActive ? 'text-accent' : 'text-ink/40 group-hover:text-ink'
              }`}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
