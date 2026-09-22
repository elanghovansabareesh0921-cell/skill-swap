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

interface SkillSwapContextType {
  currentUser: {
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
  };
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
  loginWithDemo: () => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string; requiresConfig?: boolean }>;
  loginWithGoogleEmail: (email: string, name?: string, avatar?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogleCredential: (credentialToken: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;

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
  buyCredits: (amount: number, priceLabel: string) => void;
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

const INITIAL_SKILLS: SkillListing[] = [
  {
    id: "skill-1",
    title: "Python Programming & Data Structures",
    category: "Programming",
    description: "Hands-on coding, algorithms, OOP patterns, and clean Pythonic architecture for beginners to intermediate learners.",
    level: "Beginner",
    creditsPerSession: 10,
    durationMinutes: 60,
    rating: 4.9,
    reviewCount: 48,
    availability: "Available today",
    mode: "Online",
    teacher: {
      id: "arun-kumar",
      name: "Arun Kumar",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      role: "Senior Full-Stack Engineer",
      location: "San Francisco, CA • Remote",
      bio: "Full-stack developer helping beginners and career switchers build real-world software projects.",
      rating: 4.9,
      sessionsTaught: 127,
      creditsEarned: 340,
      verified: true,
    },
  },
  {
    id: "skill-2",
    title: "UI/UX Design Systems in Figma",
    category: "Design",
    description: "Learn token systems, auto-layout 5.0, responsive components, and scalable handoff workflows for high-growth startups.",
    level: "Intermediate",
    creditsPerSession: 12,
    durationMinutes: 60,
    rating: 5.0,
    reviewCount: 39,
    availability: "Available today",
    mode: "Online",
    teacher: {
      id: "elena-rostova",
      name: "Elena Rostova",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      role: "Lead Product Designer at Scale",
      location: "Berlin, Germany • Remote",
      bio: "Design lead obsessed with typography, micro-interactions, and systematic Figma architectures.",
      rating: 5.0,
      sessionsTaught: 84,
      creditsEarned: 260,
      verified: true,
    },
  },
  {
    id: "skill-3",
    title: "Machine Learning & LLM Fine-tuning",
    category: "AI & ML",
    description: "Practical generative AI: fine-tuning small open-source models, RAG pipelines, and deploying with FastAPI.",
    level: "Advanced",
    creditsPerSession: 15,
    durationMinutes: 60,
    rating: 4.8,
    reviewCount: 27,
    availability: "Available this week",
    mode: "Online",
    teacher: {
      id: "arun-kumar",
      name: "Arun Kumar",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      role: "Senior Full-Stack Engineer",
      location: "San Francisco, CA • Remote",
      bio: "Full-stack developer helping beginners and career switchers build real-world software projects.",
      rating: 4.9,
      sessionsTaught: 127,
      creditsEarned: 340,
      verified: true,
    },
  },
  {
    id: "skill-4",
    title: "Conversational Spanish & Fluency Practice",
    category: "Languages",
    description: "High-yield natural dialogue, accent softening, idioms, and confidence-building conversation practice.",
    level: "Beginner",
    creditsPerSession: 8,
    durationMinutes: 45,
    rating: 4.9,
    reviewCount: 62,
    availability: "Available today",
    mode: "Online",
    teacher: {
      id: "sophia-rivera",
      name: "Sophia Rivera",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      role: "Bilingual Educator & Translator",
      location: "Barcelona, Spain • Remote",
      bio: "Passionate polyglot teaching practical conversational Spanish tailored for travelers and remote professionals.",
      rating: 4.9,
      sessionsTaught: 145,
      creditsEarned: 410,
      verified: true,
    },
  },
  {
    id: "skill-5",
    title: "Product Strategy & Zero-to-One Launching",
    category: "Business",
    description: "Discovery frameworks, user interviews, validating MVPs without code, and tracking key north-star metrics.",
    level: "Intermediate",
    creditsPerSession: 14,
    durationMinutes: 60,
    rating: 4.9,
    reviewCount: 31,
    availability: "Available this week",
    mode: "Online",
    teacher: {
      id: "marcus-vance",
      name: "Marcus Vance",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      role: "Ex-Stripe Product Manager",
      location: "New York, NY • Remote",
      bio: "Angel investor and PM helping early founders find product-market fit and execute ruthlessly.",
      rating: 4.9,
      sessionsTaught: 92,
      creditsEarned: 310,
      verified: true,
    },
  },
  {
    id: "skill-6",
    title: "Video Editing & Storytelling in Premiere",
    category: "Video Editing",
    description: "Pacing, dynamic cuts, color grading, sound design, and creating viral social video narratives.",
    level: "Intermediate",
    creditsPerSession: 10,
    durationMinutes: 60,
    rating: 4.8,
    reviewCount: 22,
    availability: "Available today",
    mode: "Online",
    teacher: {
      id: "kenji-tanaka",
      name: "Kenji Tanaka",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      role: "Content Creator & Video Producer",
      location: "Tokyo, Japan • Remote",
      bio: "Producer with 10M+ views sharing real editing techniques and workflows.",
      rating: 4.8,
      sessionsTaught: 58,
      creditsEarned: 180,
      verified: true,
    },
  },
  {
    id: "skill-7",
    title: "Portrait & Street Photography Composition",
    category: "Photography",
    description: "Mastering natural lighting, manual camera settings, framing geometry, and Lightroom grading.",
    level: "Beginner",
    creditsPerSession: 10,
    durationMinutes: 60,
    rating: 4.9,
    reviewCount: 19,
    availability: "Available this week",
    mode: "Both",
    teacher: {
      id: "chloe-bennett",
      name: "Chloe Bennett",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      role: "Visual Storyteller & Editorial Shooter",
      location: "Austin, TX • Hybrid",
      bio: "Editorial photographer sharing composition principles that make everyday scenes cinematic.",
      rating: 4.9,
      sessionsTaught: 41,
      creditsEarned: 140,
      verified: true,
    },
  },
  {
    id: "skill-8",
    title: "Modern Web Development with Next.js & React",
    category: "Web Development",
    description: "Modern SSR, server actions, Tailwind CSS architecture, and deployment pipelines for startups.",
    level: "Intermediate",
    creditsPerSession: 10,
    durationMinutes: 60,
    rating: 5.0,
    reviewCount: 35,
    availability: "Available today",
    mode: "Online",
    teacher: {
      id: "james-oconnor",
      name: "James O'Connor",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
      role: "Staff Frontend Architect",
      location: "Toronto, Canada • Remote",
      bio: "Specializing in clean component architectures and high performance web apps.",
      rating: 5.0,
      sessionsTaught: 76,
      creditsEarned: 220,
      verified: true,
    },
  },
  {
    id: "skill-9",
    title: "C++ Systems Programming & Memory Safety",
    category: "Programming",
    description: "Low-level algorithms, smart pointers, RAII idioms, and memory management for performance engineering.",
    level: "Advanced",
    creditsPerSession: 15,
    durationMinutes: 60,
    rating: 4.9,
    reviewCount: 18,
    availability: "Available this week",
    mode: "Online",
    teacher: {
      id: "arun-kumar",
      name: "Arun Kumar",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      role: "Senior Full-Stack Engineer",
      location: "San Francisco, CA • Remote",
      bio: "Low-level enthusiast helping developers write blazing fast code.",
      rating: 4.9,
      sessionsTaught: 127,
      creditsEarned: 340,
      verified: true,
    },
  },
  {
    id: "skill-10",
    title: "Public Speaking & Confident Presentations",
    category: "Personal Development",
    description: "Stage presence, vocal projection, slide deck storytelling, and eliminating filler words for impactful talks.",
    level: "All Levels",
    creditsPerSession: 10,
    durationMinutes: 45,
    rating: 4.9,
    reviewCount: 24,
    availability: "Available today",
    mode: "Online",
    teacher: {
      id: "sophia-rivera",
      name: "Sophia Rivera",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      role: "Keynote Speaker & Communications Coach",
      location: "Barcelona, Spain • Remote",
      bio: "Helping founders, engineers, and students speak with conviction.",
      rating: 4.9,
      sessionsTaught: 145,
      creditsEarned: 410,
      verified: true,
    },
  },
];

const INITIAL_SESSIONS: SessionItem[] = [
  {
    id: "session-python-arun",
    skillTitle: "Python Programming & Data Structures",
    teacherName: "Arun Kumar",
    teacherAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    teacherId: "arun-kumar",
    date: "Today, Sep 22",
    time: "6:00 PM – 7:00 PM",
    duration: "60 mins",
    credits: 10,
    status: "upcoming",
    roomUrl: "/learn/session-python-arun",
    agenda: [
      "Review dictionary comprehension and memory profiling",
      "Live coding: implementing a LRU Cache with doubly-linked lists",
      "Q&A and real-world micro-optimizations",
    ],
    notes: "Please have Python 3.11+ installed with pytest.",
  },
  {
    id: "session-figma-elena",
    skillTitle: "UI/UX Design Systems in Figma",
    teacherName: "Elena Rostova",
    teacherAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    teacherId: "elena-rostova",
    date: "Tomorrow, Sep 23",
    time: "4:30 PM – 5:30 PM",
    duration: "60 mins",
    credits: 12,
    status: "upcoming",
    roomUrl: "/learn/session-figma-elena",
    agenda: [
      "Audit of your existing Figma file tokens",
      "Setting up mode-aware typography and surface scales",
      "Component nesting and variant properties best practices",
    ],
  },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1",
    type: "PURCHASED",
    amount: 50,
    title: "Welcome Bonus",
    detail: "Initial registration balance credited to your wallet",
    date: "Sep 22, 2026",
    category: "purchase",
  },
  {
    id: "tx-2",
    type: "EARNED",
    amount: 10,
    title: "React Component Architecture Session",
    detail: "Completed 1-on-1 teaching session with Maya Patel",
    date: "Sep 20, 2026",
    category: "teaching",
  },
  {
    id: "tx-3",
    type: "SPENT",
    amount: -10,
    title: "Python Concurrency Fundamentals",
    detail: "Escrowed for session with Arun Kumar",
    date: "Sep 19, 2026",
    category: "learning",
  },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Skill Swap Request Received",
    message: "Alex requested to learn Python in exchange for UI/UX Design.",
    time: "10 mins ago",
    read: false,
    type: "swap",
    link: "/matches",
  },
  {
    id: "notif-2",
    title: "Session Scheduled ⏰",
    message: "Your upcoming session with Arun Kumar starts at 6:00 PM.",
    time: "2h ago",
    read: false,
    type: "session",
    link: "/learn/session-python-arun",
  },
  {
    id: "notif-3",
    title: "Credits Received 🪙",
    message: "You earned 10 credits from completing your React session.",
    time: "Yesterday",
    read: true,
    type: "credits",
    link: "/credits",
  },
];

const INITIAL_SWAP_REQUESTS: SwapRequest[] = [
  {
    id: "swap-1",
    fromUserId: "user-alex",
    fromUserName: "Alex Rivera",
    fromUserAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    toUserId: "current-user",
    toUserName: "You",
    skillToLearn: "Python",
    skillOffered: "UI/UX Design",
    status: "Pending",
    date: "Today, 10:15 AM",
  },
  {
    id: "swap-2",
    fromUserId: "current-user",
    fromUserName: "You",
    fromUserAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    toUserId: "elena-rostova",
    toUserName: "Elena Rostova",
    toUserAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    skillToLearn: "Design Systems in Figma",
    skillOffered: "Next.js & TypeScript",
    status: "Accepted",
    date: "Yesterday",
  },
];

const INITIAL_CONVERSATIONS: ChatConversation[] = [
  {
    id: "conv-1",
    participantId: "arun-kumar",
    participantName: "Arun Kumar",
    participantAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    participantRole: "Senior Full-Stack Engineer",
    lastMessage: "Looking forward to our session! Have you cloned the starter repo?",
    lastMessageTime: "5m ago",
    unreadCount: 1,
    online: true,
  },
  {
    id: "conv-2",
    participantId: "elena-rostova",
    participantName: "Elena Rostova",
    participantAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    participantRole: "Lead Product Designer",
    lastMessage: "I just accepted your swap request! Let's lock in the time.",
    lastMessageTime: "1h ago",
    unreadCount: 0,
    online: false,
  },
  {
    id: "conv-3",
    participantId: "sophia-rivera",
    participantName: "Sophia Rivera",
    participantAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    participantRole: "Bilingual Educator",
    lastMessage: "¡Excelente! Gracias por la sesión de hoy.",
    lastMessageTime: "Yesterday",
    unreadCount: 0,
    online: true,
  },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    senderId: "arun-kumar",
    receiverId: "current-user",
    senderName: "Arun Kumar",
    senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    content: "Hi! Looking forward to our Python architecture session today.",
    timestamp: "5:30 PM",
    read: true,
  },
  {
    id: "msg-2",
    senderId: "current-user",
    receiverId: "arun-kumar",
    senderName: "You",
    senderAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    content: "Hey Arun! Same here, I reviewed the agenda and have VS Code ready.",
    timestamp: "5:32 PM",
    read: true,
  },
  {
    id: "msg-3",
    senderId: "arun-kumar",
    receiverId: "current-user",
    senderName: "Arun Kumar",
    senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    content: "Looking forward to our session! Have you cloned the starter repo?",
    timestamp: "5:35 PM",
    read: false,
  },
];

const DEFAULT_USER = {
  id: "user-alex",
  name: "Alex Demo",
  email: "demo@skillswap.com",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  role: "Full-Stack Learner & Mentor",
  location: "San Francisco, CA",
  bio: "Software developer exploring AI systems and generative UI. Teaching Next.js & TypeScript, learning Machine Learning & Spanish.",
  credits: 50,
  learningCount: 4,
  teachingCount: 6,
  skillsCount: 4,
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

  const [userTaughtSkillsList, setUserTaughtSkillsList] = useState<UserSkillItem[]>([
    { id: "uts-1", name: "Modern React & Next.js", level: "Advanced", category: "Programming" },
    { id: "uts-2", name: "TypeScript Fundamentals", level: "Intermediate", category: "Programming" },
    { id: "uts-3", name: "UI/UX Design Systems", level: "Intermediate", category: "Design" },
  ]);

  const [userLearningSkillsList, setUserLearningSkillsList] = useState<UserSkillItem[]>([
    { id: "uls-1", name: "Python & Machine Learning", level: "Beginner", goal: "Build AI agents and fine-tune models" },
    { id: "uls-2", name: "Conversational Spanish", level: "Beginner", goal: "Travel fluency and daily conversation" },
  ]);

  const userTaughtSkills = userTaughtSkillsList.map((s) => s.name);

  // Sync Supabase Auth & Profile
  const refreshUserProfile = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsAuthenticated(true);
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profile) {
          setCurrentUser((prev) => ({
            ...prev,
            id: profile.id,
            name: profile.full_name || session.user.user_metadata?.full_name || "User",
            email: profile.email || session.user.email || "",
            credits: profile.credits ?? prev.credits,
            bio: profile.bio || prev.bio,
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
  const loginWithDemo = async () => {
    setIsLoadingAuth(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "demo@skillswap.com",
        password: "Password123!",
      });

      if (!error && data?.user) {
        setIsAuthenticated(true);
        await refreshUserProfile();
        showToast("Welcome back, Alex! 👋", "Logged in with presentation demo credentials.", "success");
        return { success: true };
      }
    } catch (e: any) {
      console.warn("Supabase demo fallback:", e);
    }

    // Local resilient demo state fallback
    setIsAuthenticated(true);
    setCurrentUser(DEFAULT_USER);
    setCredits(50);
    showToast("Welcome to Skill Swap! 👋", "Demo session active with 50 credits.", "success");
    setIsLoadingAuth(false);
    return { success: true };
  };

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

  const buyCredits = (amount: number, priceLabel: string) => {
    setCredits((prev) => prev + amount);

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: "PURCHASED",
      amount: amount,
      title: "Credit Top-up",
      detail: `Purchased ${amount} credits (${priceLabel})`,
      date: "Just now",
      category: "purchase",
    };
    setTransactions((prev) => [newTx, ...prev]);

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: "Credits Added 🪙",
      message: `+${amount} Credits have been successfully credited to your wallet.`,
      time: "Just now",
      read: false,
      type: "credits",
      link: "/credits",
    };
    setNotifications((prev) => [notif, ...prev]);

    showToast("Payment Successful!", `+${amount} Credits added to your account.`, "success");
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
        loginWithDemo,
        loginWithGoogle,
        loginWithGoogleEmail,
        loginWithGoogleCredential,
        signOut,
        refreshUserProfile,
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
