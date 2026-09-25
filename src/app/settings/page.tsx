"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useTheme } from "@/context/ThemeContext";
import { useSkillSwap, CredentialItem, normalizeCredential } from "@/context/SkillSwapContext";
import CertificateModal from "@/components/CertificateModal";
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
  FileText,
  ExternalLink,
  Eye,
  Trash2,
  Paperclip,
  Building2,
  Calendar,
  Sparkles,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [activeTab, setActiveTab] = useState<
    "account" | "profile" | "security" | "notifications" | "preferences"
  >(
    ["account", "profile", "security", "notifications", "preferences"].includes(
      initialTab
    )
      ? initialTab
      : "profile"
  );

  // Account / Profile State
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [fullName, setFullName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio);
  const [location, setLocation] = useState(currentUser.location || "");
  const [currentActivity, setCurrentActivity] = useState(
    currentUser.currentActivity || ""
  );
  const [school, setSchool] = useState(currentUser.school || "");
  const [degree, setDegree] = useState(currentUser.degree || "");
  const [graduationYear, setGraduationYear] = useState(
    currentUser.graduationYear || ""
  );
  const [gender, setGender] = useState(
    currentUser.gender || "Prefer not to say"
  );
  const [credentials, setCredentials] = useState<
    (string | CredentialItem)[]
  >(currentUser.credentials || []);
  const [newCred, setNewCred] = useState("");

  // Rich Certificate Attachment State
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [newCredTitle, setNewCredTitle] = useState("");
  const [newCredIssuer, setNewCredIssuer] = useState("");
  const [newCredYear, setNewCredYear] = useState("");
  const [newCredVerifyUrl, setNewCredVerifyUrl] = useState("");
  const [newCredDocUrl, setNewCredDocUrl] = useState<string | null>(null);
  const [newCredDocName, setNewCredDocName] = useState<string>("");
  const [selectedPreviewCred, setSelectedPreviewCred] =
    useState<CredentialItem | null>(null);

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
    async function loadSocials() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from("profiles")
            .select("github_url, linkedin_url, website_url")
            .eq("id", user.id)
            .single();

          if (data) {
            setGithubUrl(data.github_url || "");
            setLinkedinUrl(data.linkedin_url || "");
            setWebsiteUrl(data.website_url || "");
          }
        }
      } catch (err) {
        // Fallback silently
      }
    }
    loadSocials();
  }, [supabase]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast(
          "File Too Large",
          "Avatar image must be under 5MB.",
          "warning"
        );
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatar(event.target.result as string);
          showToast(
            "Photo Ready",
            "Photo selected. Click Save to persist.",
            "info"
          );
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCertDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        showToast(
          "File Too Large",
          "Certificate file must be under 8MB.",
          "warning"
        );
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setNewCredDocUrl(event.target.result as string);
          setNewCredDocName(file.name);
          showToast(
            "Document Attached",
            `Attached "${file.name}".`,
            "success"
          );
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCredential = (titleToAdd?: string) => {
    const title = titleToAdd || newCred.trim();
    if (!title) return;
    const exists = credentials.some(
      (c) => normalizeCredential(c).title.toLowerCase() === title.toLowerCase()
    );
    if (exists) {
      showToast(
        "Already Added",
        `"${title}" is already in your credentials.`,
        "warning"
      );
      return;
    }
    setCredentials((prev) => [...prev, title]);
    if (!titleToAdd) setNewCred("");
    showToast("Credential Added", `Added "${title}".`, "success");
  };

  const handleAddRichCredential = () => {
    const title = newCredTitle.trim();
    if (!title) {
      showToast(
        "Title Required",
        "Please provide a certification title.",
        "warning"
      );
      return;
    }

    const richItem: CredentialItem = {
      id: `cred-${Date.now()}`,
      title,
      issuer: newCredIssuer.trim() || undefined,
      issueDate: newCredYear.trim() || undefined,
      verificationUrl: newCredVerifyUrl.trim() || undefined,
      documentUrl: newCredDocUrl || undefined,
    };

    setCredentials((prev) => [...prev, richItem]);
    setShowAddDocModal(false);

    // Reset modal form
    setNewCredTitle("");
    setNewCredIssuer("");
    setNewCredYear("");
    setNewCredVerifyUrl("");
    setNewCredDocUrl(null);
    setNewCredDocName("");

    showToast(
      "Certificate Saved",
      `"${title}" has been attached with proof documents.`,
      "success"
    );
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
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from("profiles")
            .update({
              github_url: githubUrl,
              linkedin_url: linkedinUrl,
              website_url: websiteUrl,
            })
            .eq("id", user.id);
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
      showToast(
        "Weak Password",
        "Password must be at least 6 characters.",
        "warning"
      );
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
      showToast(
        "Password Updated! 🔒",
        "Your new password is now active.",
        "success"
      );
    } catch (err: any) {
      showToast(
        "Password Update Failed",
        err.message || "Could not update password.",
        "error"
      );
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col ambient-bg text-white pb-20 lg:pb-0">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Settings &amp; <span className="text-gradient">Preferences</span>
          </h1>
          <p className="text-xs sm:text-sm text-white/50 mt-1">
            Manage your account preferences, profile details, security, and interface settings.
          </p>
        </div>

        {/* ── TAB NAVIGATION ── */}
        <div className="flex items-center gap-2 border-b border-white/8 overflow-x-auto pb-px">
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
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? "border-violet-400 text-violet-300 font-bold"
                    : "border-transparent text-white/50 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── TAB 1: ACCOUNT ── */}
        {activeTab === "account" && (
          <div className="p-6 sm:p-8 rounded-3xl glass border-white/10 shadow-xl space-y-6">
            <h2 className="text-base font-bold text-white">Account Information</h2>
            <div className="space-y-4 max-w-lg">
              <div>
                <label className="text-xs font-semibold text-white/70 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-sm text-white focus:outline-none focus:border-violet-500/50"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-white/70 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={currentUser.email || "demo@skillswap.com"}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-sm text-white/40 cursor-not-allowed"
                />
                <span className="text-[11px] text-cyan-300/80 mt-1 block">
                  Account authentication email is verified
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/8 flex items-center justify-between">
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}

        {/* ── TAB 2: PROFILE ── */}
        {activeTab === "profile" && (
          <form
            onSubmit={handleSaveProfile}
            className="p-6 sm:p-8 rounded-3xl glass border-white/10 shadow-xl space-y-8"
          >
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Public Profile Details
              </h2>
              <p className="text-xs text-white/50 mt-0.5">
                Customize how other members see you across Skill Swap, search results, and mentor listings.
              </p>
            </div>

            {/* 1. PROFILE PICTURE / AVATAR */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/8 space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-violet-400 block">
                Profile Picture
              </label>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="relative group">
                  <img
                    src={avatar}
                    alt={fullName}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-white/15 ring-2 ring-violet-500/20 shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-semibold cursor-pointer"
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
                      className="px-3.5 py-1.5 rounded-xl text-white text-xs font-semibold shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                      style={{
                        background:
                          "linear-gradient(135deg, #7C6CF6 0%, #06B6D4 100%)",
                      }}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setAvatar(
                          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                        )
                      }
                      className="px-3 py-1.5 rounded-xl glass hover:bg-white/10 text-white/70 text-xs font-semibold transition-colors border-white/10 cursor-pointer"
                    >
                      Reset Default
                    </button>
                  </div>
                  <p className="text-[11px] text-white/40">
                    JPG, PNG or WebP up to 5MB. Or pick a modern avatar preset below:
                  </p>

                  {/* Preset Avatars */}
                  <div className="flex items-center gap-2 pt-1">
                    {AVATAR_PRESETS.map((presetUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatar(presetUrl)}
                        className={`rounded-xl p-0.5 transition-all cursor-pointer ${
                          avatar === presetUrl
                            ? "ring-2 ring-violet-400 scale-105"
                            : "opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={presetUrl}
                          alt={`Preset ${idx + 1}`}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl object-cover border border-white/10"
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
                <label className="text-xs font-semibold text-white/70 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Sabareesh Elanghovan"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-sm text-white focus:outline-none focus:border-violet-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-white/70 block mb-1 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-violet-400" />
                  <span>Current Activity / Headline</span>
                </label>
                <input
                  type="text"
                  value={currentActivity}
                  onChange={(e) => setCurrentActivity(e.target.value)}
                  placeholder="e.g. Full-Stack Engineer @ Stripe • Learning AI"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-sm text-white focus:outline-none focus:border-violet-500/50"
                />
              </div>
            </div>

            {/* 3. EDUCATION & STUDIES */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/8 space-y-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-violet-400" />
                <label className="text-xs font-bold uppercase tracking-wider text-violet-400">
                  Studies &amp; Education
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="text-[11px] font-semibold text-white/50 block mb-1">
                    School / University
                  </label>
                  <input
                    type="text"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="e.g. Stanford, MIT"
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/[0.04] text-xs text-white focus:outline-none focus:border-violet-500/50"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="text-[11px] font-semibold text-white/50 block mb-1">
                    Degree / Field of Study
                  </label>
                  <input
                    type="text"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    placeholder="e.g. B.S. Computer Science"
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/[0.04] text-xs text-white focus:outline-none focus:border-violet-500/50"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="text-[11px] font-semibold text-white/50 block mb-1">
                    Graduation Year / Status
                  </label>
                  <input
                    type="text"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    placeholder="e.g. 2025 or In Progress"
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/[0.04] text-xs text-white focus:outline-none focus:border-violet-500/50"
                  />
                </div>
              </div>
            </div>

            {/* 4. CREDENTIALS & CERTIFICATIONS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white/70 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Credentials &amp; Certifications</span>
                </label>
                <span className="text-[11px] text-white/40">
                  Attach certificates to build credibility
                </span>
              </div>

              {/* Active Credentials & Certificates Cards */}
              <div className="space-y-2.5">
                {credentials.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {credentials.map((cred, idx) => {
                      const item = normalizeCredential(cred, idx);
                      const hasDoc = Boolean(item.documentUrl);
                      const hasLink = Boolean(item.verificationUrl);

                      return (
                        <div
                          key={item.id || idx}
                          className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/8 flex items-start justify-between gap-3 hover:border-violet-500/30 transition-colors"
                        >
                          <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                              <Award className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h5 className="text-xs font-bold text-white truncate">
                                {item.title}
                              </h5>
                              <p className="text-[11px] text-white/40 flex items-center gap-1 mt-0.5">
                                <span>{item.issuer || "Verified Credential"}</span>
                                {item.issueDate && <span>• {item.issueDate}</span>}
                              </p>

                              {/* Badges / Document indicator */}
                              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                {hasDoc && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20 text-[10px] font-semibold text-violet-300">
                                    <FileText className="w-3 h-3" />
                                    <span>Doc Attached</span>
                                  </span>
                                )}
                                {hasLink && (
                                  <a
                                    href={item.verificationUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-semibold text-cyan-300 hover:underline"
                                  >
                                    <ExternalLink className="w-2.5 h-2.5" />
                                    <span>Verify URL</span>
                                  </a>
                                )}
                                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Active</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setSelectedPreviewCred(item)}
                              className="p-1.5 rounded-lg text-violet-400 hover:bg-white/10 transition-colors cursor-pointer"
                              title="View Certificate / Document"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveCredential(idx)}
                              className="p-1.5 rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Remove Credential"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-white/40 italic py-2">
                    No credentials or certificates added yet. Attach one below to build trust with swap partners!
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDocModal(true)}
                  className="px-4 py-2.5 rounded-xl text-white text-xs font-semibold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer hover:opacity-95"
                  style={{
                    background:
                      "linear-gradient(135deg, #7C6CF6 0%, #06B6D4 100%)",
                  }}
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>+ Attach Certificate / Document</span>
                </button>

                <div className="flex-1 flex gap-2">
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
                    placeholder="Quick add credential (e.g. AWS Solutions Architect)"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-white/10 bg-white/[0.04] text-xs text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCredential()}
                    disabled={!newCred.trim()}
                    className="px-3.5 py-2 rounded-xl glass hover:bg-white/10 text-white text-xs font-semibold disabled:opacity-40 transition-colors border-white/10 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Quick Suggestions */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-white/40">Quick add:</span>
                {[
                  "AWS Certified",
                  "Google Cloud Pro",
                  "Meta React Certified",
                  "Certified ScrumMaster",
                  "PMP",
                ].map((suggest) => (
                  <button
                    key={suggest}
                    type="button"
                    onClick={() => {
                      const exists = credentials.some(
                        (c) => normalizeCredential(c).title === suggest
                      );
                      if (!exists) {
                        setCredentials((prev) => [...prev, suggest]);
                        showToast(
                          "Credential Added",
                          `Added "${suggest}".`,
                          "success"
                        );
                      }
                    }}
                    className="text-[11px] px-2.5 py-0.5 rounded-lg border border-white/10 hover:border-violet-400 text-white/60 hover:text-white glass-subtle transition-colors cursor-pointer"
                  >
                    + {suggest}
                  </button>
                ))}
              </div>

              {/* MODAL: ATTACH CERTIFICATE / DOCUMENT */}
              <AnimatePresence>
                {showAddDocModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="w-full max-w-lg glass-elevated rounded-3xl border-white/15 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto"
                    >
                      <button
                        type="button"
                        onClick={() => setShowAddDocModal(false)}
                        className="absolute top-5 right-5 text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>

                      <div className="flex items-center gap-2.5 mb-4">
                        <div className="w-9 h-9 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center">
                          <Award className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-white">
                            Attach Certificate Document
                          </h4>
                          <p className="text-xs text-white/50">
                            Upload certificate file or paste verification link to prove legibility.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* Title */}
                        <div>
                          <label className="text-xs font-semibold text-white/70 block mb-1">
                            Certification / Credential Title *
                          </label>
                          <input
                            type="text"
                            value={newCredTitle}
                            onChange={(e) => setNewCredTitle(e.target.value)}
                            placeholder="e.g. AWS Certified Solutions Architect"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-xs text-white focus:outline-none focus:border-violet-500/50"
                          />
                        </div>

                        {/* Issuer & Year */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-white/70 block mb-1">
                              Issuing Body / Institution
                            </label>
                            <input
                              type="text"
                              value={newCredIssuer}
                              onChange={(e) => setNewCredIssuer(e.target.value)}
                              placeholder="e.g. Amazon Web Services, Coursera"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-xs text-white focus:outline-none focus:border-violet-500/50"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-white/70 block mb-1">
                              Issue Year / Date
                            </label>
                            <input
                              type="text"
                              value={newCredYear}
                              onChange={(e) => setNewCredYear(e.target.value)}
                              placeholder="e.g. 2024, May 2023"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-xs text-white focus:outline-none focus:border-violet-500/50"
                            />
                          </div>
                        </div>

                        {/* File Upload for Document / Certificate */}
                        <div>
                          <label className="text-xs font-semibold text-white/70 block mb-1">
                            Certificate File / Document (PNG, JPG, WebP, or PDF)
                          </label>
                          <div className="border-2 border-dashed border-white/15 rounded-2xl p-4 text-center bg-white/[0.02] space-y-2 relative hover:bg-white/[0.04] transition-colors">
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={handleCertDocUpload}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                            {newCredDocUrl ? (
                              <div className="flex items-center justify-between px-3 py-2 rounded-xl glass border-emerald-500/30 text-xs">
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                  <span className="font-semibold text-white truncate max-w-xs">
                                    {newCredDocName || "Document Attached"}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setNewCredDocUrl(null);
                                    setNewCredDocName("");
                                  }}
                                  className="text-rose-400 hover:text-rose-300 text-xs font-semibold"
                                >
                                  Remove
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <Upload className="w-6 h-6 mx-auto text-violet-400" />
                                <p className="text-xs font-semibold text-white">
                                  Drag &amp; drop or click to upload certificate document
                                </p>
                                <p className="text-[11px] text-white/40">
                                  Max file size: 8MB. Shows in your public profile to prove authenticity.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* External Verification URL */}
                        <div>
                          <label className="text-xs font-semibold text-white/70 block mb-1">
                            Certificate Verification Link / URL (Optional)
                          </label>
                          <input
                            type="url"
                            value={newCredVerifyUrl}
                            onChange={(e) => setNewCredVerifyUrl(e.target.value)}
                            placeholder="https://credly.com/badges/... or https://coursera.org/verify/..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-xs text-white focus:outline-none focus:border-violet-500/50"
                          />
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-end gap-2.5">
                        <button
                          type="button"
                          onClick={() => setShowAddDocModal(false)}
                          className="px-4 py-2 rounded-xl glass hover:bg-white/10 text-xs font-semibold text-white/60 hover:text-white transition-colors border-white/10"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleAddRichCredential}
                          disabled={!newCredTitle.trim()}
                          className="px-5 py-2 rounded-xl text-white text-xs font-semibold disabled:opacity-40 transition-colors shadow-lg cursor-pointer"
                          style={{
                            background:
                              "linear-gradient(135deg, #7C6CF6 0%, #06B6D4 100%)",
                          }}
                        >
                          Save Credential &amp; Document
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* Certificate Preview Modal */}
              <CertificateModal
                isOpen={Boolean(selectedPreviewCred)}
                onClose={() => setSelectedPreviewCred(null)}
                credential={selectedPreviewCred}
                recipientName={fullName || currentUser.name}
              />
            </div>

            {/* 5. LOCATION & GENDER */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-white/70 block mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-violet-400" />
                    <span>Location</span>
                  </span>
                  <span className="text-[11px] text-white/40 font-normal">
                    Optional
                  </span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA or Remote"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-sm text-white focus:outline-none focus:border-violet-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-white/70 block mb-1">
                  Gender Identity
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-sm text-white focus:outline-none focus:border-violet-500/50 [&>option]:bg-[#0d0f17] [&>option]:text-white"
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
              <label className="text-xs font-semibold text-white/70 block mb-1">
                Bio &amp; About Me
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell peers what you love teaching, your current tech stack, and what you're excited to learn..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-sm text-white focus:outline-none focus:border-violet-500/50 leading-relaxed"
              />
            </div>

            {/* 7. SOCIAL LINKS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-white/70 block mb-1">
                  GitHub Profile URL
                </label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/your-username"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-sm text-white focus:outline-none focus:border-violet-500/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-white/70 block mb-1">
                  LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/your-profile"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-sm text-white focus:outline-none focus:border-violet-500/50"
                />
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-4 border-t border-white/8 flex items-center justify-between">
              <span className="text-xs text-white/40">
                Changes are synchronized with your profile and database.
              </span>
              <button
                type="submit"
                disabled={savingProfile}
                className="px-6 py-2.5 rounded-xl text-white text-xs sm:text-sm font-semibold shadow-lg flex items-center gap-2 cursor-pointer hover:opacity-95"
                style={{
                  background:
                    "linear-gradient(135deg, #7C6CF6 0%, #06B6D4 100%)",
                }}
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

        {/* ── TAB 3: SECURITY ── */}
        {activeTab === "security" && (
          <form
            onSubmit={handleChangePassword}
            className="p-6 sm:p-8 rounded-3xl glass border-white/10 shadow-xl space-y-6"
          >
            <div>
              <h2 className="text-base font-bold text-white">
                Security &amp; Credentials
              </h2>
              <p className="text-xs text-white/50 mt-0.5">
                Ensure your account uses a strong password.
              </p>
            </div>

            <div className="space-y-4 max-w-md">
              <div>
                <label className="text-xs font-semibold text-white/70 block mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-sm text-white focus:outline-none focus:border-violet-500/50"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-white/70 block mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-sm text-white focus:outline-none focus:border-violet-500/50"
                  required
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/8 flex justify-end">
              <button
                type="submit"
                disabled={savingPassword}
                className="px-6 py-2.5 rounded-xl text-white text-xs sm:text-sm font-semibold shadow-lg flex items-center gap-2 cursor-pointer"
                style={{
                  background:
                    "linear-gradient(135deg, #7C6CF6 0%, #06B6D4 100%)",
                }}
              >
                {savingPassword ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ── TAB 4: NOTIFICATIONS ── */}
        {activeTab === "notifications" && (
          <div className="p-6 sm:p-8 rounded-3xl glass border-white/10 shadow-xl space-y-6">
            <h2 className="text-base font-bold text-white">
              Notification Preferences
            </h2>

            <div className="space-y-4 max-w-lg">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/8">
                <div>
                  <p className="text-xs font-bold text-white">
                    Email Session Reminders
                  </p>
                  <p className="text-[11px] text-white/45">
                    Receive emails 1 hour before scheduled swap calls
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={swapReminders}
                  onChange={(e) => setSwapReminders(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 text-violet-500 accent-violet-500"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/8">
                <div>
                  <p className="text-xs font-bold text-white">
                    Swap Request Alerts
                  </p>
                  <p className="text-[11px] text-white/45">
                    Notify when another member proposes a skill swap
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 text-violet-500 accent-violet-500"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/8">
                <div>
                  <p className="text-xs font-bold text-white">
                    Platform Community Updates
                  </p>
                  <p className="text-[11px] text-white/45">
                    Weekly digest of trending skills and community swaps
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={marketingUpdates}
                  onChange={(e) => setMarketingUpdates(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 text-violet-500 accent-violet-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 5: PREFERENCES / THEME ── */}
        {activeTab === "preferences" && (
          <div className="p-6 sm:p-8 rounded-3xl glass border-white/10 shadow-xl space-y-6">
            <h2 className="text-base font-bold text-white">
              Interface &amp; Theme
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg">
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className="p-5 rounded-2xl border text-center transition-all cursor-pointer glass"
                style={{
                  border: "1px solid rgba(124,108,246,0.5)",
                  background:
                    "linear-gradient(135deg, rgba(124,108,246,0.15) 0%, rgba(6,182,212,0.15) 100%)",
                  boxShadow: "0 0 16px rgba(124,108,246,0.2)",
                }}
              >
                <Moon className="w-6 h-6 mx-auto mb-2 text-violet-400" />
                <span className="text-xs font-bold text-white block">
                  Dark Glass
                </span>
                <span className="text-[10px] text-cyan-300 mt-1 block">
                  Active (Default)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTheme("system")}
                className="p-5 rounded-2xl border border-white/10 glass-subtle text-center transition-all cursor-pointer hover:border-white/20"
              >
                <Monitor className="w-6 h-6 mx-auto mb-2 text-white/60" />
                <span className="text-xs font-bold text-white/80 block">
                  System Auto
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTheme("light")}
                className="p-5 rounded-2xl border border-white/10 glass-subtle text-center transition-all cursor-pointer hover:border-white/20"
              >
                <Sun className="w-6 h-6 mx-auto mb-2 text-white/60" />
                <span className="text-xs font-bold text-white/80 block">
                  Light Mode
                </span>
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
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center ambient-bg">
          <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}