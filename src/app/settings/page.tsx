"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useTheme } from "@/context/ThemeContext";
import { useSkillSwap } from "@/context/SkillSwapContext";
import { createClient } from "@/lib/supabase";
import {
  Sun,
  Moon,
  Monitor,
  CheckCircle2,
  Shield,
  User,
  Bell,
  Sliders,
  LogOut,
  Lock,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { currentUser, signOut, showToast } = useSkillSwap();
  const router = useRouter();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<"account" | "profile" | "security" | "notifications" | "preferences">("account");

  // Account / Profile State
  const [fullName, setFullName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio);
  const [location, setLocation] = useState(currentUser.location);
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Security State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // Notifications state
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [swapReminders, setSwapReminders] = useState(true);
  const [marketingUpdates, setMarketingUpdates] = useState(false);

  useEffect(() => {
    async function loadUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

          if (data) {
            setFullName(data.full_name || currentUser.name);
            setBio(data.bio || currentUser.bio);
            setGithubUrl(data.github_url || "");
            setLinkedinUrl(data.linkedin_url || "");
            setWebsiteUrl(data.website_url || "");
          }
        }
      } catch (err) {
        console.warn(err);
      }
    }
    loadUserData();
  }, [currentUser.bio, currentUser.name, supabase]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").update({
          full_name: fullName,
          bio,
          github_url: githubUrl,
          linkedin_url: linkedinUrl,
          website_url: websiteUrl,
        }).eq("id", user.id);
      }
      showToast("Profile Updated! 🎉", "Your profile changes have been saved.", "success");
    } catch (err: any) {
      showToast("Error", err.message || "Failed to update profile.", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast("Weak Password", "Password must be at least 6 characters.", "warning");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Password Mismatch", "Passwords do not match.", "warning");
      return;
    }

    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;

      setNewPassword("");
      setConfirmPassword("");
      showToast("Password Updated! 🔒", "Your new password is now active.", "success");
    } catch (err: any) {
      showToast("Password Update Failed", err.message || "Could not update password.", "error");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7FF] dark:bg-[#0E0C1B] text-[#18181B] dark:text-[#F4F3FA] transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#18181B] dark:text-white tracking-tight">
            Settings
          </h1>
          <p className="text-xs sm:text-sm text-[#71717A] dark:text-zinc-400 mt-1">
            Manage your account preferences, profile details, security, and interface settings.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[#E4E1F5] dark:border-[#2D264E] overflow-x-auto pb-px">
          {[
            { id: "account", label: "Account", icon: User },
            { id: "profile", label: "Profile", icon: Sliders },
            { id: "security", label: "Security", icon: Lock },
            { id: "notifications", label: "Notifications", icon: Bell },
            { id: "preferences", label: "Preferences", icon: Sun },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap flex items-center gap-2 border-b-2 transition-all ${
                  isActive
                    ? "border-[#7C3AED] text-[#7C3AED] dark:text-[#A78BFA]"
                    : "border-transparent text-[#71717A] hover:text-[#18181B] dark:hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: ACCOUNT */}
        {activeTab === "account" && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] shadow-sm space-y-6">
            <h2 className="text-base font-bold text-[#18181B] dark:text-white">Account Information</h2>
            <div className="space-y-4 max-w-lg">
              <div>
                <label className="text-xs font-semibold text-[#18181B] dark:text-zinc-200 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] bg-white dark:bg-[#0E0C1B] text-sm text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#18181B] dark:text-zinc-200 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={currentUser.email || "demo@skillswap.com"}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] bg-[#F8F7FF] dark:bg-[#0E0C1B] text-sm text-[#71717A] cursor-not-allowed"
                />
                <span className="text-[11px] text-[#71717A] mt-1 block">Account authentication email is verified</span>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900 transition-colors flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: PROFILE */}
        {activeTab === "profile" && (
          <form onSubmit={handleSaveProfile} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] shadow-sm space-y-6">
            <h2 className="text-base font-bold text-[#18181B] dark:text-white">Public Profile Details</h2>

            <div className="space-y-4 max-w-xl">
              <div>
                <label className="text-xs font-semibold text-[#18181B] dark:text-zinc-200 block mb-1">Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] bg-white dark:bg-[#0E0C1B] text-sm text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#18181B] dark:text-zinc-200 block mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] bg-white dark:bg-[#0E0C1B] text-sm text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#18181B] dark:text-zinc-200 block mb-1">GitHub URL</label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] bg-white dark:bg-[#0E0C1B] text-sm text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#18181B] dark:text-zinc-200 block mb-1">LinkedIn URL</label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] bg-white dark:bg-[#0E0C1B] text-sm text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-6 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs sm:text-sm font-semibold shadow-sm flex items-center gap-2"
              >
                {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Save Profile Changes</span>}
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: SECURITY */}
        {activeTab === "security" && (
          <form onSubmit={handleChangePassword} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-[#18181B] dark:text-white">Security & Credentials</h2>
              <p className="text-xs text-[#71717A] mt-0.5">Ensure your account uses a strong password.</p>
            </div>

            <div className="space-y-4 max-w-md">
              <div>
                <label className="text-xs font-semibold text-[#18181B] dark:text-zinc-200 block mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] bg-white dark:bg-[#0E0C1B] text-sm text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#18181B] dark:text-zinc-200 block mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] bg-white dark:bg-[#0E0C1B] text-sm text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
                  required
                />
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
              <button
                type="submit"
                disabled={savingPassword}
                className="px-6 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs sm:text-sm font-semibold shadow-sm flex items-center gap-2"
              >
                {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Update Password</span>}
              </button>
            </div>
          </form>
        )}

        {/* TAB 4: NOTIFICATIONS */}
        {activeTab === "notifications" && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] shadow-sm space-y-6">
            <h2 className="text-base font-bold text-[#18181B] dark:text-white">Notification Preferences</h2>

            <div className="space-y-4 max-w-lg">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8F7FF] dark:bg-[#0E0C1B]">
                <div>
                  <p className="text-xs font-bold text-[#18181B] dark:text-white">Email Session Reminders</p>
                  <p className="text-[11px] text-[#71717A]">Receive emails 1 hour before scheduled swap calls</p>
                </div>
                <input
                  type="checkbox"
                  checked={swapReminders}
                  onChange={(e) => setSwapReminders(e.target.checked)}
                  className="w-4 h-4 text-[#7C3AED] focus:ring-[#7C3AED] rounded"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8F7FF] dark:bg-[#0E0C1B]">
                <div>
                  <p className="text-xs font-bold text-[#18181B] dark:text-white">Swap Request Alerts</p>
                  <p className="text-[11px] text-[#71717A]">Notify when another member proposes a skill swap</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 text-[#7C3AED] focus:ring-[#7C3AED] rounded"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8F7FF] dark:bg-[#0E0C1B]">
                <div>
                  <p className="text-xs font-bold text-[#18181B] dark:text-white">Platform Community Updates</p>
                  <p className="text-[11px] text-[#71717A]">Weekly digest of trending skills and community swaps</p>
                </div>
                <input
                  type="checkbox"
                  checked={marketingUpdates}
                  onChange={(e) => setMarketingUpdates(e.target.checked)}
                  className="w-4 h-4 text-[#7C3AED] focus:ring-[#7C3AED] rounded"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PREFERENCES / THEME */}
        {activeTab === "preferences" && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] shadow-sm space-y-6">
            <h2 className="text-base font-bold text-[#18181B] dark:text-white">Interface & Theme</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  theme === "light"
                    ? "border-[#7C3AED] bg-[#EDE9FE] dark:bg-[#231C3D] text-[#7C3AED]"
                    : "border-[#E4E1F5] dark:border-[#2D264E] hover:border-[#A78BFA]"
                }`}
              >
                <Sun className="w-6 h-6 mx-auto mb-2" />
                <span className="text-xs font-bold block">Light Theme</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  theme === "dark"
                    ? "border-[#7C3AED] bg-[#EDE9FE] dark:bg-[#231C3D] text-[#7C3AED]"
                    : "border-[#E4E1F5] dark:border-[#2D264E] hover:border-[#A78BFA]"
                }`}
              >
                <Moon className="w-6 h-6 mx-auto mb-2" />
                <span className="text-xs font-bold block">Dark Theme</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme("system")}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  theme === "system"
                    ? "border-[#7C3AED] bg-[#EDE9FE] dark:bg-[#231C3D] text-[#7C3AED]"
                    : "border-[#E4E1F5] dark:border-[#2D264E] hover:border-[#A78BFA]"
                }`}
              >
                <Monitor className="w-6 h-6 mx-auto mb-2" />
                <span className="text-xs font-bold block">System Auto</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}