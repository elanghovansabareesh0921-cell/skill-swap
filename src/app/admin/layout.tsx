import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LayoutDashboard, Users, FileText, Settings, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

/**
 * AdminLayout
 * 
 * This layout wraps all /admin routes. It provides a persistent left sidebar 
 * for navigation and a top navbar for actions like logging out.
 * 
 * Uses standard Next.js Server Components.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Handle server-side logout
  const handleLogout = async () => {
    'use server';
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/');
  };

  return (
    <div className="min-h-screen bg-mist text-ink flex overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-mist-pure border-r border-ink/10 hidden md:flex flex-col shadow-sm z-20">
        <div className="h-16 flex items-center px-6 border-b border-ink/10">
          <Link href="/admin" className="font-display font-extrabold text-xl text-ink tracking-tight flex items-center gap-2">
            Admin<span className="text-lagoon bg-lagoon/10 px-2 py-0.5 rounded-md text-sm">Panel</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <Link 
            href="/admin" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-ink/70 hover:text-ink hover:bg-ink/5 transition-all group"
          >
            <LayoutDashboard className="h-4 w-4 text-lagoon group-hover:scale-110 transition-transform" />
            Dashboard
          </Link>
          <Link 
            href="/admin/users" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-lagoon/10 text-lagoon transition-all group"
          >
            <Users className="h-4 w-4 group-hover:scale-110 transition-transform" />
            Users
          </Link>
          <Link 
            href="/admin/audit" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-ink/70 hover:text-ink hover:bg-ink/5 transition-all group"
          >
            <FileText className="h-4 w-4 text-saffron group-hover:scale-110 transition-transform" />
            Audit Logs
          </Link>
          <Link 
            href="/admin/settings" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-ink/70 hover:text-ink hover:bg-ink/5 transition-all group"
          >
            <Settings className="h-4 w-4 text-ink/40 group-hover:scale-110 transition-transform" />
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-mist-pure/80 backdrop-blur-md border-b border-ink/10 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10 shadow-xs">
          <div className="flex items-center md:hidden">
            <span className="font-display font-extrabold text-lg text-ink">AdminPanel</span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-ink/70 hover:text-ink px-3 py-1.5 rounded-full border border-ink/15 hover:bg-ink/5 transition-colors mr-2"
            >
              ← Return to Dashboard
            </Link>

            <form action={handleLogout}>
              <button 
                type="submit" 
                className="flex items-center gap-2 text-sm font-bold text-rose-600 hover:text-white transition-colors bg-rose-50 hover:bg-rose-500 px-4 py-2 rounded-full cursor-pointer shadow-xs"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </form>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-mist">
          {children}
        </main>
      </div>
    </div>
  );
}
