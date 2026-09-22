"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";

export interface SkillListing {
  id: string;
  title: string;
  category: string;
  description: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
  creditsPerSession: number;
  durationMinutes: number;
  rating: number;
  reviewCount: number;
  availability: "Available today" | "Available this week" | "Flexible";
  mode: "Online" | "Offline" | "Both";
  teacher: {
    id: string;
    name: string;
    avatar: string;
    role: string;
    location: string;
    bio: string;
    rating: number;
    sessionsTaught: number;
    creditsEarned: number;
    verified: boolean;
  };
}

export interface SessionItem {
  id: string;
  skillTitle: string;
  teacherName: string;
  teacherAvatar: string;
  teacherId: string;
  date: string;
  time: string;
  duration: string;
  credits: number;
  status: "upcoming" | "in_progress" | "completed";
  roomUrl?: string;
  agenda?: string[];
  notes?: string;
}

export interface Transaction {
  id: string;
  type: "EARNED" | "SPENT" | "PURCHASED";
  amount: number;
  title: string;
  detail: string;
  date: string;
  category: "teaching" | "learning" | "purchase";
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "session" | "booking" | "credits" | "system" | "swap";
  link?: string;
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  title: string;
  content: string;
  tag: "Question" | "Project" | "Collaboration" | "Achievement" | "Discussion";
  upvotes: number;
  replyCount: number;
  timeAgo: string;
  hasUpvoted?: boolean;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: "success" | "info" | "warning" | "error";
}

export interface SwapRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: string;
  toUserId: string;
  toUserName: string;
  toUserAvatar?: string;
  skillToLearn: string;
  skillOffered: string;
  status: "Pending" | "Accepted" | "Declined" | "Completed";
  date: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface ChatConversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  participantRole: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  online: boolean;
}

export interface UserSkillItem {
  id: string;
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  category?: string;
  goal?: string;
}

export interface CredentialItem {
  id: string;
  title: string;
  issuer?: string;
  issueDate?: string;
  documentUrl?: string; // Data URL or storage link
  verificationUrl?: string; // External verification URL (Credly, Coursera, etc.)
  fileName?: string;
}

export function normalizeCredential(cred: string | CredentialItem, index: number = 0): CredentialItem {
  if (typeof cred === "string") {
    return {
      id: `cred-${index}-${cred.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
      title: cred,
      issuer: "Verified Credential",
    };
  }
  return cred;
}

export interface CurrentUser {
  id: string;
  name: string;
  email?: string;
  avatar: string;
  role: string;
  location: string;
  bio: string;
  credits: number;
  learningCount: number;
  teachingCount: number;
  skillsCount: number;
  currentActivity?: string; // what they are doing right now (occupation / focus)
  school?: string; // school / university / college
  degree?: string; // field of study / degree
  graduationYear?: string; // graduation year or status
  gender?: string; // gender identity
  credentials?: (string | CredentialItem)[]; // certifications / credentials / degrees with document support
}

interface SkillSwapContextType {
  currentUser: CurrentUser;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  credits: number;
  transactions: Transaction[];
  skills: SkillListing[];
  sessions: SessionItem[];
  userTaughtSkills: string[];
  userTaughtSkillsList: UserSkillItem[];
  userLearningSkillsList: UserSkillItem[];
  savedSkillIds: string[];
  notifications: NotificationItem[];
  communityPosts: CommunityPost[];
  toasts: ToastMessage[];
  unreadNotifsCount: number;
  swapRequests: SwapRequest[];
  conversations: ChatConversation[];
  messages: ChatMessage[];

  // Auth actions

  loginWithGoogle: () => Promise<{ success: boolean; error?: string; requiresConfig?: boolean }>;
  loginWithGoogleEmail: (email: string, name?: string, avatar?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogleCredential: (credentialToken: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  updateUserProfile: (updates: Partial<CurrentUser>) => Promise<{ success: boolean; error?: string }>;

  // Swap Requests
  sendSwapRequest: (data: {
    toUserId: string;
    toUserName: string;
    toUserAvatar?: string;
    skillToLearn: string;
    skillOffered: string;
  }) => { success: boolean; error?: string };
  respondToSwapRequest: (requestId: string, action: "accept" | "decline") => void;

  // Messaging
  sendMessage: (receiverId: string, content: string) => void;

  // My Skills actions
  addTeachingSkill: (skill: { name: string; level: "Beginner" | "Intermediate" | "Advanced" | "Expert"; category?: string }) => void;
  removeTeachingSkill: (skillIdOrName: string) => void;
  addLearningSkill: (skill: { name: string; level: "Beginner" | "Intermediate" | "Advanced" | "Expert"; goal?: string }) => void;
  removeLearningSkill: (skillIdOrName: string) => void;

  // Existing Actions
  bookSession: (data: {
    skill: SkillListing;
    date: string;
    time: string;
  }) => { success: boolean; session?: SessionItem; error?: string };
  completeSession: (sessionId: string, review?: { rating: number; comment: string }) => void;
  buyCredits: (amount: number, priceLabel: string, paymentMethod?: string) => void;
  publishSkill: (skillData: {
    title: string;
    category: string;
    level: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
    credits: number;
    format: string;
    description?: string;
    availability: string;
  }) => void;
  toggleFavorite: (skillId: string) => void;
  markNotificationsAsRead: () => void;
  showToast: (title: string, description?: string, type?: "success" | "info" | "warning" | "error") => void;
  removeToast: (id: string) => void;
  upvotePost: (postId: string) => void;
  createPost: (post: Omit<CommunityPost, "id" | "upvotes" | "replyCount" | "timeAgo" | "hasUpvoted">) => void;
}

const INITIAL_SKILLS: SkillListing[] = [];

const INITIAL_SESSIONS: SessionItem[] = [];

const INITIAL_TRANSACTIONS: Transaction[] = [];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

const INITIAL_SWAP_REQUESTS: SwapRequest[] = [];

const INITIAL_CONVERSATIONS: ChatConversation[] = [];

const INITIAL_MESSAGES: ChatMessage[] = [];

const DEFAULT_USER: CurrentUser = {
  id: "",
  name: "",
  email: "",
  avatar: "",
  role: "",
  location: "",
  bio: "",
  credits: 0,
  learningCount: 0,
  teachingCount: 0,
  skillsCount: 0,
};

const SkillSwapContext = createContext<SkillSwapContextType | undefined>(undefined);

export function SkillSwapProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  const [currentUser, setCurrentUser] = useState(DEFAULT_USER);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(false);

  const [credits, setCredits] = useState<number>(50);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [skills, setSkills] = useState<SkillListing[]>(INITIAL_SKILLS);
  const [sessions, setSessions] = useState<SessionItem[]>(INITIAL_SESSIONS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [savedSkillIds, setSavedSkillIds] = useState<string[]>(["skill-1", "skill-2"]);

  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>(INITIAL_SWAP_REQUESTS);
  const [conversations, setConversations] = useState<ChatConversation[]>(INITIAL_CONVERSATIONS);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);

  const [userTaughtSkillsList, setUserTaughtSkillsList] = useState<UserSkillItem[]>([]);

  const [userLearningSkillsList, setUserLearningSkillsList] = useState<UserSkillItem[]>([]);

  const userTaughtSkills = userTaughtSkillsList.map((s) => s.name);

  // Sync Supabase Auth & Profile
  const refreshUserProfile = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsAuthenticated(true);
        const userMeta = session.user.user_metadata || {};
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profile) {
          setCurrentUser((prev) => ({
            ...prev,
            id: profile.id,
            name: profile.full_name || userMeta.full_name || session.user.user_metadata?.full_name || "User",
            email: profile.email || session.user.email || "",
            credits: profile.credits ?? prev.credits,
            bio: profile.bio || prev.bio,
            avatar: userMeta.avatar_url || userMeta.avatar || prev.avatar,
            location: userMeta.location ?? prev.location,
            currentActivity: userMeta.current_activity ?? prev.currentActivity,
            school: userMeta.school ?? prev.school,
            degree: userMeta.degree ?? prev.degree,
            graduationYear: userMeta.graduation_year ?? prev.graduationYear,
            gender: userMeta.gender ?? prev.gender,
            credentials: userMeta.credentials ?? prev.credentials,
          }));
          if (profile.credits !== undefined && profile.credits !== null) {
            setCredits(profile.credits);
          }
        } else {
          setCurrentUser((prev) => ({
            ...prev,
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "User",
            email: session.user.email || "",
            avatar: userMeta.avatar_url || userMeta.avatar || prev.avatar,
            location: userMeta.location ?? prev.location,
            currentActivity: userMeta.current_activity ?? prev.currentActivity,
            school: userMeta.school ?? prev.school,
            degree: userMeta.degree ?? prev.degree,
            graduationYear: userMeta.graduation_year ?? prev.graduationYear,
            gender: userMeta.gender ?? prev.gender,
            credentials: userMeta.credentials ?? prev.credentials,
          }));
        }
      }
    } catch (err) {
      console.warn("Auth sync check:", err);
    }
  }, [supabase]);

  useEffect(() => {
    refreshUserProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        await refreshUserProfile();
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [refreshUserProfile, supabase]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedUserStr = localStorage.getItem("skillswap_user");
      if (savedUserStr) {
        const parsed = JSON.parse(savedUserStr);
        if (parsed?.id) {
          setCurrentUser(parsed);
          setIsAuthenticated(true);
        }
      }

      const savedCredits = localStorage.getItem("skillswap_credits");
      if (savedCredits) setCredits(Number(savedCredits));

      const savedTx = localStorage.getItem("skillswap_txs");
      if (savedTx) setTransactions(JSON.parse(savedTx));

      const savedRequests = localStorage.getItem("skillswap_requests");
      if (savedRequests) setSwapRequests(JSON.parse(savedRequests));

      const savedTaught = localStorage.getItem("skillswap_taught_skills");
      if (savedTaught) setUserTaughtSkillsList(JSON.parse(savedTaught));

      const savedLearns = localStorage.getItem("skillswap_learn_skills");
      if (savedLearns) setUserLearningSkillsList(JSON.parse(savedLearns));
    } catch {
      // Ignore
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("skillswap_credits", String(credits));
      localStorage.setItem("skillswap_txs", JSON.stringify(transactions));
      localStorage.setItem("skillswap_requests", JSON.stringify(swapRequests));
      localStorage.setItem("skillswap_taught_skills", JSON.stringify(userTaughtSkillsList));
      localStorage.setItem("skillswap_learn_skills", JSON.stringify(userLearningSkillsList));
    } catch {
      // Ignore
    }
  }, [credits, transactions, swapRequests, userTaughtSkillsList, userLearningSkillsList]);

  // Toast Helper
  const showToast = (title: string, description?: string, type: "success" | "info" | "warning" | "error" = "success") => {
    const id = "toast-" + Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth Operations

  const loginWithGoogle = async () => {
    try {
      const redirectOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${redirectOrigin}/dashboard`,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        return { success: false, error: error.message, requiresConfig: true };
      }

      if (data?.url) {
        // Preflight check the URL before redirecting to prevent user from being stranded on 400 screen
        try {
          const preflight = await fetch(data.url, { redirect: "manual" });
          if (preflight.status === 400) {
            const body = await preflight.text();
            if (body.includes("provider is not enabled") || body.includes("validation_failed")) {
              return {
                success: false,
                error: "Google Provider is not enabled in your Supabase Dashboard yet.",
                requiresConfig: true,
              };
            }
          }
        } catch {
          // If preflight has CORS restriction, proceed to redirect
        }

        if (typeof window !== "undefined") {
          window.location.assign(data.url);
        }
        return { success: true };
      }

      return { success: false, error: "Unable to generate OAuth URL.", requiresConfig: true };
    } catch (err: any) {
      return { success: false, error: err.message, requiresConfig: true };
    }
  };

  const loginWithGoogleEmail = async (email: string, name?: string, avatar?: string) => {
    setIsLoadingAuth(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      // 1. Look up profile in Supabase
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .ilike("email", cleanEmail)
        .maybeSingle();

      let resolvedUser;
      if (profile) {
        resolvedUser = {
          id: profile.id,
          name: profile.full_name || name || cleanEmail.split("@")[0],
          email: profile.email,
          avatar: avatar || (profile as any).avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
          role: "Skill Swap Member",
          location: "Remote",
          bio: profile.bio || "Active peer learner and mentor on Skill Swap.",
          credits: profile.credits ?? 50,
          learningCount: 3,
          teachingCount: 2,
          skillsCount: 4,
        };
      } else {
        const newId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "user-" + Date.now();
        resolvedUser = {
          id: newId,
          name: name || cleanEmail.split("@")[0],
          email: cleanEmail,
          avatar: avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
          role: "New Member",
          location: "Remote",
          bio: "Excited to exchange skills with peers worldwide.",
          credits: 50,
          learningCount: 2,
          teachingCount: 1,
          skillsCount: 2,
        };
        try {
          await supabase.from("profiles").insert([{
            id: newId,
            full_name: resolvedUser.name,
            email: resolvedUser.email,
            credits: 50,
            bio: resolvedUser.bio,
          }]);
        } catch (dbErr) {
          console.warn("Could not insert profile:", dbErr);
        }
      }

      setCurrentUser(resolvedUser);
      setCredits(resolvedUser.credits);
      setIsAuthenticated(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("skillswap_user", JSON.stringify(resolvedUser));
        localStorage.setItem("skillswap_credits", String(resolvedUser.credits));
      }
      showToast("Welcome back! 👋", `Logged in with Google as ${resolvedUser.name}`, "success");
      return { success: true };
    } catch (err: any) {
      showToast("Login Failed", err.message || "Failed to log in with Google account.", "error");
      return { success: false, error: err.message };
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const loginWithGoogleCredential = async (credentialToken: string) => {
    try {
      const base64Url = credentialToken.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const gUser = JSON.parse(jsonPayload);
      return await loginWithGoogleEmail(gUser.email, gUser.name, gUser.picture);
    } catch (err: any) {
      return { success: false, error: "Invalid Google credential format." };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn(err);
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("skillswap_user");
    }
    setIsAuthenticated(false);
    showToast("Signed Out", "You have successfully logged out.", "info");
  };

  const updateUserProfile = async (updates: Partial<CurrentUser>) => {
    setIsLoadingAuth(true);
    try {
      const updatedUser: CurrentUser = {
        ...currentUser,
        ...updates,
      };

      setCurrentUser(updatedUser);

      // Save to localStorage for instant state persistence across page loads
      if (typeof window !== "undefined") {
        localStorage.setItem("skillswap_user", JSON.stringify(updatedUser));
      }

      // Sync to Supabase
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Update user metadata in Supabase Auth (supports all custom fields without schema restrictions)
          await supabase.auth.updateUser({
            data: {
              full_name: updatedUser.name,
              avatar_url: updatedUser.avatar,
              location: updatedUser.location,
              current_activity: updatedUser.currentActivity,
              school: updatedUser.school,
              degree: updatedUser.degree,
              graduation_year: updatedUser.graduationYear,
              gender: updatedUser.gender,
              credentials: updatedUser.credentials,
            },
          });

          // Also update profiles table (safe existing columns only)
          await supabase
            .from("profiles")
            .update({
              full_name: updatedUser.name,
              bio: updatedUser.bio,
            })
            .eq("id", user.id);
        } else if (currentUser.id) {
          await supabase
            .from("profiles")
            .update({
              full_name: updatedUser.name,
              bio: updatedUser.bio,
            })
            .eq("id", currentUser.id);
        }
      } catch (dbErr) {
        console.warn("Supabase profile sync warning:", dbErr);
      }

      showToast("Profile Updated! 🎉", "Your profile changes have been saved.", "success");
      return { success: true };
    } catch (err: any) {
      showToast("Update Failed", err.message || "Failed to update profile.", "error");
      return { success: false, error: err.message };
    } finally {
      setIsLoadingAuth(false);
    }
  };

  // Swap Request Management
  const sendSwapRequest = ({
    toUserId,
    toUserName,
    toUserAvatar,
    skillToLearn,
    skillOffered,
  }: {
    toUserId: string;
    toUserName: string;
    toUserAvatar?: string;
    skillToLearn: string;
    skillOffered: string;
  }) => {
    const newRequest: SwapRequest = {
      id: `swap-${Date.now()}`,
      fromUserId: currentUser.id,
      fromUserName: currentUser.name,
      fromUserAvatar: currentUser.avatar,
      toUserId,
      toUserName,
      toUserAvatar,
      skillToLearn,
      skillOffered,
      status: "Pending",
      date: "Just now",
    };

    setSwapRequests((prev) => [newRequest, ...prev]);

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: "Swap Request Sent 🤝",
      message: `You offered to swap "${skillOffered}" for "${skillToLearn}" with ${toUserName}.`,
      time: "Just now",
      read: false,
      type: "swap",
      link: "/matches",
    };
    setNotifications((prev) => [notif, ...prev]);

    showToast(
      "Swap Request Sent! 🚀",
      `Offered "${skillOffered}" in exchange for "${skillToLearn}".`,
      "success"
    );

    return { success: true };
  };

  const respondToSwapRequest = (requestId: string, action: "accept" | "decline") => {
    const request = swapRequests.find((r) => r.id === requestId);
    if (!request) return;

    const newStatus = action === "accept" ? ("Accepted" as const) : ("Declined" as const);
    setSwapRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r))
    );

    if (action === "accept") {
      // Create a session and conversation
      const newSession: SessionItem = {
        id: `session-${Date.now()}`,
        skillTitle: `${request.skillToLearn} ↔ ${request.skillOffered}`,
        teacherName: request.fromUserName,
        teacherAvatar: request.fromUserAvatar,
        teacherId: request.fromUserId,
        date: "Scheduled Soon",
        time: "TBD",
        duration: "60 mins",
        credits: 10,
        status: "upcoming",
        roomUrl: `/learn/session-${Date.now()}`,
        agenda: ["Skill exchange introduction", "Reciprocal 30-min hands-on sessions", "Next milestone planning"],
      };
      setSessions((prev) => [newSession, ...prev]);

      // Add conversation
      const newConv: ChatConversation = {
        id: `conv-${Date.now()}`,
        participantId: request.fromUserId,
        participantName: request.fromUserName,
        participantAvatar: request.fromUserAvatar,
        participantRole: "Swap Partner",
        lastMessage: `Swap accepted! Let's arrange a time for ${request.skillToLearn}.`,
        lastMessageTime: "Just now",
        unreadCount: 0,
        online: true,
      };
      setConversations((prev) => [newConv, ...prev]);

      showToast(
        "Swap Accepted! 🎉",
        `You connected with ${request.fromUserName}. A chat has been opened.`,
        "success"
      );
    } else {
      showToast("Swap Request Declined", `You declined the request from ${request.fromUserName}.`, "info");
    }
  };

  // Messaging System
  const sendMessage = (receiverId: string, content: string) => {
    if (!content.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      receiverId,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      content: content.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: true,
    };

    setMessages((prev) => [...prev, newMsg]);

    // Update conversation last message
    setConversations((prev) =>
      prev.map((c) =>
        c.participantId === receiverId
          ? {
              ...c,
              lastMessage: content.trim(),
              lastMessageTime: "Just now",
            }
          : c
      )
    );
  };

  // My Skills Management
  const addTeachingSkill = (skill: { name: string; level: "Beginner" | "Intermediate" | "Advanced" | "Expert"; category?: string }) => {
    const newItem: UserSkillItem = {
      id: `ts-${Date.now()}`,
      name: skill.name.trim(),
      level: skill.level,
      category: skill.category || "General",
    };
    setUserTaughtSkillsList((prev) => [...prev, newItem]);
    showToast("Skill Added to Teaching", `You can now offer "${skill.name}" in skill swaps.`, "success");
  };

  const removeTeachingSkill = (skillIdOrName: string) => {
    setUserTaughtSkillsList((prev) => prev.filter((s) => s.id !== skillIdOrName && s.name !== skillIdOrName));
    showToast("Skill Removed", "Teaching skill removed from your profile.", "info");
  };

  const addLearningSkill = (skill: { name: string; level: "Beginner" | "Intermediate" | "Advanced" | "Expert"; goal?: string }) => {
    const newItem: UserSkillItem = {
      id: `ls-${Date.now()}`,
      name: skill.name.trim(),
      level: skill.level,
      goal: skill.goal,
    };
    setUserLearningSkillsList((prev) => [...prev, newItem]);
    showToast("Goal Added to Learning", `"${skill.name}" added to your target skills.`, "success");
  };

  const removeLearningSkill = (skillIdOrName: string) => {
    setUserLearningSkillsList((prev) => prev.filter((s) => s.id !== skillIdOrName && s.name !== skillIdOrName));
    showToast("Goal Removed", "Learning goal removed.", "info");
  };

  // Booking & Credits
  const bookSession = ({
    skill,
    date,
    time,
  }: {
    skill: SkillListing;
    date: string;
    time: string;
  }) => {
    if (credits < skill.creditsPerSession) {
      showToast(
        "Insufficient credits",
        `You need ${skill.creditsPerSession} credits to book this session. Your balance is ${credits}.`,
        "error"
      );
      return { success: false, error: "Insufficient credits" };
    }

    const newCredits = credits - skill.creditsPerSession;
    setCredits(newCredits);

    const newSession: SessionItem = {
      id: `session-${Date.now()}`,
      skillTitle: skill.title,
      teacherName: skill.teacher.name,
      teacherAvatar: skill.teacher.avatar,
      teacherId: skill.teacher.id,
      date,
      time,
      duration: `${skill.durationMinutes} mins`,
      credits: skill.creditsPerSession,
      status: "upcoming",
      roomUrl: `/learn/session-${Date.now()}`,
      agenda: [
        `Intro and baseline assessment for ${skill.title}`,
        "Core hands-on practical exercise",
        "Targeted feedback & resource roadmap",
      ],
    };

    setSessions((prev) => [newSession, ...prev]);

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: "SPENT",
      amount: -skill.creditsPerSession,
      title: `${skill.title.split(" ")[0]} session`,
      detail: `${skill.title} with ${skill.teacher.name} (Escrowed)`,
      date: "Just now",
      category: "learning",
    };
    setTransactions((prev) => [newTx, ...prev]);

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: "Session Booked 🎉",
      message: `You booked ${skill.title} with ${skill.teacher.name} for ${date}, ${time}.`,
      time: "Just now",
      read: false,
      type: "booking",
      link: `/learn/${newSession.id}`,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    showToast("Session Booked 🎉", `${skill.title} confirmed for ${date}!`, "success");

    return { success: true, session: newSession };
  };

  const completeSession = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: "completed" as const } : s))
    );

    const rewardCredits = 10;
    setCredits((prev) => prev + rewardCredits);

    const completionTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: "EARNED",
      amount: rewardCredits,
      title: "Teaching session",
      detail: `Completed session for ${session.skillTitle}`,
      date: "Just now",
      category: "teaching",
    };
    setTransactions((prev) => [completionTx, ...prev]);

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: "Session Completed & Credits Transferred! 🪙",
      message: `You earned +${rewardCredits} credits for completing ${session.skillTitle}.`,
      time: "Just now",
      read: false,
      type: "credits",
      link: "/credits",
    };
    setNotifications((prev) => [notif, ...prev]);

    showToast(
      "Session Marked Complete! 🎉",
      `+${rewardCredits} Credits released and transferred safely!`,
      "success"
    );
  };

  const buyCredits = (amount: number, priceLabel: string, paymentMethod: string = "Razorpay") => {
    setCredits((prev) => prev + amount);

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: "PURCHASED",
      amount: amount,
      title: "Credit Top-up",
      detail: `Purchased ${amount} credits (${priceLabel} via ${paymentMethod})`,
      date: "Just now",
      category: "purchase",
    };
    setTransactions((prev) => [newTx, ...prev]);

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: "Credits Added 🪙",
      message: `+${amount} Credits have been successfully added to your wallet (${paymentMethod}).`,
      time: "Just now",
      read: false,
      type: "credits",
      link: "/credits",
    };
    setNotifications((prev) => [notif, ...prev]);

    showToast("Payment Successful!", `+${amount} Credits added to your account via ${paymentMethod}.`, "success");
  };

  const publishSkill = (skillData: {
    title: string;
    category: string;
    level: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
    credits: number;
    format: string;
    description?: string;
    availability: string;
  }) => {
    const newSkill: SkillListing = {
      id: `skill-${Date.now()}`,
      title: skillData.title,
      category: skillData.category,
      description:
        skillData.description ||
        `Comprehensive 1-on-1 mentorship in ${skillData.title}. Practical, structured, and customized to your goals.`,
      level: skillData.level,
      creditsPerSession: skillData.credits,
      durationMinutes: 60,
      rating: 5.0,
      reviewCount: 1,
      availability: (skillData.availability as any) || "Available today",
      mode: "Online",
      teacher: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
        role: "Community Mentor",
        location: currentUser.location,
        bio: currentUser.bio,
        rating: 5.0,
        sessionsTaught: currentUser.teachingCount,
        creditsEarned: 120,
        verified: true,
      },
    };

    setSkills((prev) => [newSkill, ...prev]);
    addTeachingSkill({
      name: skillData.title,
      level: skillData.level === "All Levels" ? "Intermediate" : skillData.level,
      category: skillData.category,
    });

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: "Skill Published! 🚀",
      message: `"${skillData.title}" is now active on the Discover marketplace.`,
      time: "Just now",
      read: false,
      type: "system",
      link: "/discover",
    };
    setNotifications((prev) => [notif, ...prev]);

    showToast("Skill Published! 🚀", `Your skill "${skillData.title}" is now live.`, "success");
  };

  const toggleFavorite = (skillId: string) => {
    setSavedSkillIds((prev) => {
      const exists = prev.includes(skillId);
      if (exists) {
        showToast("Removed from wishlist", "", "info");
        return prev.filter((id) => id !== skillId);
      } else {
        showToast("Saved to wishlist", "Skill added to your saved favorites", "success");
        return [...prev, skillId];
      }
    });
  };

  const markNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const upvotePost = (postId: string) => {
    setCommunityPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const hasUpvoted = p.hasUpvoted;
          return {
            ...p,
            upvotes: hasUpvoted ? p.upvotes - 1 : p.upvotes + 1,
            hasUpvoted: !hasUpvoted,
          };
        }
        return p;
      })
    );
  };

  const createPost = (postData: Omit<CommunityPost, "id" | "upvotes" | "replyCount" | "timeAgo" | "hasUpvoted">) => {
    const newPost: CommunityPost = {
      ...postData,
      id: `post-${Date.now()}`,
      upvotes: 1,
      replyCount: 0,
      timeAgo: "Just now",
      hasUpvoted: true,
    };
    setCommunityPosts((prev) => [newPost, ...prev]);
    showToast("Discussion Posted!", "Your post is now visible to the community.", "success");
  };

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  return (
    <SkillSwapContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isLoadingAuth,
        credits,
        transactions,
        skills,
        sessions,
        userTaughtSkills,
        userTaughtSkillsList,
        userLearningSkillsList,
        savedSkillIds,
        notifications,
        communityPosts,
        toasts,
        unreadNotifsCount,
        swapRequests,
        conversations,
        messages,

        loginWithGoogle,
        loginWithGoogleEmail,
        loginWithGoogleCredential,
        signOut,
        refreshUserProfile,
        updateUserProfile,
        sendSwapRequest,
        respondToSwapRequest,
        sendMessage,
        addTeachingSkill,
        removeTeachingSkill,
        addLearningSkill,
        removeLearningSkill,
        bookSession,
        completeSession,
        buyCredits,
        publishSkill,
        toggleFavorite,
        markNotificationsAsRead,
        showToast,
        removeToast,
        upvotePost,
        createPost,
      }}
    >
      {children}
    </SkillSwapContext.Provider>
  );
}

export function useSkillSwap() {
  const context = useContext(SkillSwapContext);
  if (!context) {
    throw new Error("useSkillSwap must be used within a SkillSwapProvider");
  }
  return context;
}
