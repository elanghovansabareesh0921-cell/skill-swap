"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  Camera,
  Upload,
  Award,
  GraduationCap,
  Briefcase,
  MapPin,
  X,
} from "lucide-react";

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
];

function SettingsContent() {
  const { theme, setTheme } = useTheme();
  const { currentUser, signOut, showToast, updateUserProfile } = useSkillSwap();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialTab = (searchParams.get("tab") as any) || "profile";
  const [activeTab, setActiveTab] = useState<"account" | "profile" | "security" | "notifications" | "preferences">(
    ["account", "profile", "security", "notifications", "preferences"].includes(initialTab) ? initialTab : "profile"
  );

  // Account / Profile State
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [fullName, setFullName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio);
  const [location, setLocation] = useState(currentUser.location || "");
  const [currentActivity, setCurrentActivity] = useState(currentUser.currentActivity || "");
  const [school, setSchool] = useState(currentUser.school || "");
  const [degree, setDegree] = useState(currentUser.degree || "");
  const [graduationYear, setGraduationYear] = useState(currentUser.graduationYear || "");
  const [gender, setGender] = useState(currentUser.gender || "Prefer not to say");
  const [credentials, setCredentials] = useState<string[]>(currentUser.credentials || []);
  const [newCred, setNewCred] = useState("");
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
    setAvatar(currentUser.avatar);
    setFullName(currentUser.name);
    setBio(currentUser.bio);
    setLocation(currentUser.location || "");
    setCurrentActivity(currentUser.currentActivity || "");
    setSchool(currentUser.school || "");
    setDegree(currentUser.degree || "");
    setGraduationYear(currentUser.graduationYear || "");
    setGender(currentUser.gender || "Prefer not to say");
    setCredentials(currentUser.credentials || []);
  }, [currentUser]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image Too Large", "Please choose an image under 5MB.", "warning");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatar(event.target.result as string);
        showToast("Photo Loaded", "Preview updated! Click 'Save Profile Changes' to apply.", "info");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddCredential = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newCred.trim();
    if (!trimmed) return;
    if (credentials.includes(trimmed)) {
      showToast("Already Added", "This credential is already in your profile list.", "info");
      return;
    }
    setCredentials((prev) => [...prev, trimmed]);
    setNewCred("");
  };

  const handleRemoveCredential = (indexToRemove: number) => {
    setCredentials((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      await updateUserProfile({
        name: fullName.trim() || currentUser.name,
        avatar,
        bio: bio.trim(),
        location: location.trim(),
        currentActivity: currentActivity.trim(),
        school: school.trim(),
        degree: degree.trim(),
        graduationYear: graduationYear.trim(),
        gender,
        credentials,
        role: currentActivity.trim() || currentUser.role,
      });

      // Also sync social links to Supabase if logged in
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("profiles").update({
            github_url: githubUrl,
            linkedin_url: linkedinUrl,
            website_url: websiteUrl,
          }).eq("id", user.id);
        }
      } catch (err) {
        console.warn(err);
      }
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
          <form onSubmit={handleSaveProfile} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] shadow-sm space-y-8">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#18181B] dark:text-white">Public Profile Details</h2>
              <p className="text-xs text-[#71717A] dark:text-zinc-400 mt-0.5">
                Customize how other members see you across Skill Swap, search results, and mentor listings.
              </p>
            </div>

            {/* 1. PROFILE PICTURE / AVATAR */}
            <div className="p-5 rounded-2xl bg-[#F8F7FF] dark:bg-[#131022] border border-[#E4E1F5] dark:border-[#2D264E] space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-[#7C3AED] dark:text-[#A78BFA] block">
                Profile Picture
              </label>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="relative group">
                  <img
                    src={avatar}
                    alt={fullName}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-[#7C3AED] shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-semibold"
                  >
                    <Camera className="w-5 h-5 mb-0.5" />
                    <span>Change</span>
                  </button>
                </div>

                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvatar("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80")}
                      className="px-3 py-1.5 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] bg-white dark:bg-[#161327] hover:bg-[#EDE9FE]/50 text-[#71717A] dark:text-zinc-300 text-xs font-semibold transition-colors"
                    >
                      Reset Default
                    </button>
                  </div>
                  <p className="text-[11px] text-[#71717A] dark:text-zinc-400">
                    JPG, PNG or WebP up to 5MB. Or pick a modern avatar preset below:
                  </p>

                  {/* Preset Avatars */}
                  <div className="flex items-center gap-2 pt-1">
                    {AVATAR_PRESETS.map((presetUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatar(presetUrl)}
                        className={`rounded-full p-0.5 transition-all ${
                          avatar === presetUrl ? "ring-2 ring-[#7C3AED] scale-105" : "opacity-75 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={presetUrl}
                          alt={`Preset ${idx + 1}`}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-[#E4E1F5]"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. BASIC INFO & OCCUPATION */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#18181B] dark:text-zinc-200 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Sabareesh Elanghovan"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] bg-white dark:bg-[#0E0C1B] text-sm text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#18181B] dark:text-zinc-200 block mb-1 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-[#7C3AED] dark:text-[#A78BFA]" />
                  <span>What are you doing right now? (Headline)</span>
                </label>
                <input
                  type="text"
                  value={currentActivity}
                  onChange={(e) => setCurrentActivity(e.target.value)}
                  placeholder="e.g. Full-Stack Engineer @ Stripe • Learning AI Agents"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] bg-white dark:bg-[#0E0C1B] text-sm text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
                />
              </div>
            </div>

            {/* 3. EDUCATION & STUDIES */}
            <div className="p-5 rounded-2xl bg-[#F8F7FF] dark:bg-[#131022] border border-[#E4E1F5] dark:border-[#2D264E] space-y-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#7C3AED] dark:text-[#A78BFA]" />
                <label className="text-xs font-bold uppercase tracking-wider text-[#7C3AED] dark:text-[#A78BFA]">
                  Studies &amp; Education
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="text-[11px] font-semibold text-[#71717A] dark:text-zinc-400 block mb-1">
                    School / University
                  </label>
                  <input
                    type="text"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="e.g. Stanford, MIT, Anna Univ"
                    className="w-full px-3 py-2 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] bg-white dark:bg-[#0E0C1B] text-xs text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="text-[11px] font-semibold text-[#71717A] dark:text-zinc-400 block mb-1">
                    Degree / Field of Study
                  </label>
                  <input
                    type="text"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    placeholder="e.g. B.S. Computer Science"
                    className="w-full px-3 py-2 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] bg-white dark:bg-[#0E0C1B] text-xs text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="text-[11px] font-semibold text-[#71717A] dark:text-zinc-400 block mb-1">
                    Graduation Year / Status
                  </label>
                  <input
                    type="text"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    placeholder="e.g. 2025 or In Progress"
                    className="w-full px-3 py-2 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] bg-white dark:bg-[#0E0C1B] text-xs text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
                  />
                </div>
              </div>
            </div>

            {/* 4. CREDENTIALS & CERTIFICATIONS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#18181B] dark:text-zinc-200 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#7C3AED] dark:text-[#A78BFA]" />
                  <span>Credentials &amp; Certifications</span>
                </label>
                <span className="text-[11px] text-[#71717A]">
                  Add verified badges, licenses, or honors
                </span>
              </div>

              {/* Active Badges */}
              <div className="flex flex-wrap items-center gap-2 min-h-[36px]">
                {credentials.length > 0 ? (
                  credentials.map((cred, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#EDE9FE] dark:bg-[#231C3D] border border-[#DDD6FE] dark:border-[#3B2D66] text-xs font-medium text-[#7C3AED] dark:text-[#A78BFA] shadow-xs"
                    >
                      <Award className="w-3 h-3" />
                      <span>{cred}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCredential(idx)}
                        className="hover:text-red-600 transition-colors p-0.5 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-[#71717A] italic">
                    No credentials added yet. Add one below!
                  </p>
                )}
              </div>

              {/* Add New Credential Bar */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCred}
                  onChange={(e) => setNewCred(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCredential();
                    }
                  }}
                  placeholder="e.g. AWS Certified Solutions Architect, Google UX Certificate"
                  className="flex-1 px-3.5 py-2 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] bg-white dark:bg-[#0E0C1B] text-xs text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
                />
                <button
                  type="button"
                  onClick={() => handleAddCredential()}
                  disabled={!newCred.trim()}
                  className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold disabled:opacity-50 transition-colors"
                >
                  + Add
                </button>
              </div>

              {/* Quick Suggestions */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-[#71717A]">Quick add:</span>
                {["AWS Certified", "Google Cloud Pro", "Meta React Certified", "Certified ScrumMaster", "PMP"].map((suggest) => (
                  <button
                    key={suggest}
                    type="button"
                    onClick={() => {
                      if (!credentials.includes(suggest)) {
                        setCredentials((prev) => [...prev, suggest]);
                      }
                    }}
                    className="text-[11px] px-2 py-0.5 rounded-lg border border-[#E4E1F5] dark:border-[#2D264E] hover:border-[#7C3AED] text-[#71717A] dark:text-zinc-300 hover:text-[#7C3AED] transition-colors"
                  >
                    + {suggest}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. LOCATION & GENDER */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#18181B] dark:text-zinc-200 block mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#7C3AED]" />
                    <span>Location</span>
                  </span>
                  <span className="text-[11px] text-[#71717A] font-normal">Optional</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA or Remote"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] bg-white dark:bg-[#0E0C1B] text-sm text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#18181B] dark:text-zinc-200 block mb-1">
                  Gender Identity
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] bg-white dark:bg-[#0E0C1B] text-sm text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
                >
                  <option value="Prefer not to say">Prefer not to say</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Other">Custom / Other</option>
                </select>
              </div>
            </div>

            {/* 6. BIO */}
            <div>
              <label className="text-xs font-semibold text-[#18181B] dark:text-zinc-200 block mb-1">
                Bio &amp; About Me
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell peers what you love teaching, your current tech stack, and what you're excited to learn..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] bg-white dark:bg-[#0E0C1B] text-sm text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
              />
            </div>

            {/* 7. SOCIAL LINKS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#18181B] dark:text-zinc-200 block mb-1">
                  GitHub Profile URL
                </label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/your-username"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] bg-white dark:bg-[#0E0C1B] text-sm text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#18181B] dark:text-zinc-200 block mb-1">
                  LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/your-profile"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] bg-white dark:bg-[#0E0C1B] text-sm text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
                />
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-4 border-t border-[#E4E1F5] dark:border-[#2D264E] flex items-center justify-between">
              <span className="text-xs text-[#71717A]">
                Changes are synchronized with your profile and database.
              </span>
              <button
                type="submit"
                disabled={savingProfile}
                className="px-6 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs sm:text-sm font-semibold shadow-sm flex items-center gap-2"
              >
                {savingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Profile Changes</span>
                )}
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

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F8F7FF] dark:bg-[#0E0C1B]"><Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" /></div>}>
      <SettingsContent />
    </Suspense>
  );
}