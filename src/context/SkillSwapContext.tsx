"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

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
  type: "session" | "booking" | "credits" | "system";
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

interface SkillSwapContextType {
  currentUser: {
    id: string;
    name: string;
    avatar: string;
    role: string;
    location: string;
    bio: string;
    credits: number;
    learningCount: number;
    teachingCount: number;
    skillsCount: number;
  };
  credits: number;
  transactions: Transaction[];
  skills: SkillListing[];
  sessions: SessionItem[];
  userTaughtSkills: string[];
  savedSkillIds: string[];
  notifications: NotificationItem[];
  communityPosts: CommunityPost[];
  toasts: ToastMessage[];
  unreadNotifsCount: number;

  // Actions
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
    title: "Music Production & Sound Design in Ableton",
    category: "Music",
    description: "From blank project to finished master: synthesis, drum layering, mix compression, and vocal chains.",
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
      role: "Electronic Producer & Audio Engineer",
      location: "Tokyo, Japan • Remote",
      bio: "Producer with 10M+ streams sharing mixing techniques and creative audio workflows.",
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
    title: "Functional Mobility & Bodyweight Strength",
    category: "Fitness",
    description: "Desk posture correction, shoulder & hip mobility routines, and progressive calisthenics training.",
    level: "All Levels",
    creditsPerSession: 8,
    durationMinutes: 45,
    rating: 5.0,
    reviewCount: 35,
    availability: "Available today",
    mode: "Online",
    teacher: {
      id: "james-oconnor",
      name: "James O'Connor",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
      role: "Certified Physical Trainer & Kinesiologist",
      location: "Toronto, Canada • Remote",
      bio: "Specializing in longevity-focused mobility for software engineers and desk workers.",
      rating: 5.0,
      sessionsTaught: 76,
      creditsEarned: 220,
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
    date: "Today, Sep 17",
    time: "6:00 PM – 7:00 PM",
    duration: "60 mins",
    credits: 10,
    status: "upcoming",
    roomUrl: "/learn/session-python-arun",
    agenda: [
      "Review list comprehensions vs generator expressions",
      "Building a custom Iterator pattern",
      "Live refactoring exercise on asynchronous I/O",
      "Q&A and next steps roadmap",
    ],
    notes: "Please have Python 3.12+ and VS Code installed beforehand. We will code together on the interactive scratchpad.",
  },
  {
    id: "session-figma-elena",
    skillTitle: "UI/UX Design Systems in Figma",
    teacherName: "Elena Rostova",
    teacherAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    teacherId: "elena-rostova",
    date: "Tomorrow, Sep 18",
    time: "4:00 PM – 5:00 PM",
    duration: "60 mins",
    credits: 12,
    status: "upcoming",
    roomUrl: "/learn/session-figma-elena",
    agenda: [
      "Auditing component consistency",
      "Creating primitive vs semantic color tokens",
      "Handling responsive component variants",
    ],
  },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1",
    type: "EARNED",
    amount: 10,
    title: "Teaching session",
    detail: "React Performance Mentorship with Maya Patel",
    date: "Today, 2:30 PM",
    category: "teaching",
  },
  {
    id: "tx-2",
    type: "SPENT",
    amount: -10,
    title: "Python session",
    detail: "Data Structures & Generators with Arun Kumar",
    date: "Yesterday",
    category: "learning",
  },
  {
    id: "tx-3",
    type: "EARNED",
    amount: 20,
    title: "Teaching session",
    detail: "Next.js App Architecture with Liam Chang",
    date: "Sep 14, 2026",
    category: "teaching",
  },
  {
    id: "tx-4",
    type: "PURCHASED",
    amount: 50,
    title: "Starter Credit Package",
    detail: "Account top-up via card",
    date: "Sep 10, 2026",
    category: "purchase",
  },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Session starting soon",
    message: "Your Python session with Arun Kumar starts in 30 minutes.",
    time: "20m ago",
    read: false,
    type: "session",
    link: "/learn/session-python-arun",
  },
  {
    id: "notif-2",
    title: "Session Request Accepted",
    message: "Elena Rostova confirmed your UI/UX Design System booking for tomorrow.",
    time: "2h ago",
    read: false,
    type: "booking",
    link: "/dashboard",
  },
  {
    id: "notif-3",
    title: "Credits Received",
    message: "You earned 10 credits from your React Mentorship with Maya Patel.",
    time: "4h ago",
    read: false,
    type: "credits",
    link: "/credits",
  },
  {
    id: "notif-4",
    title: "New Student Request",
    message: "David requested to learn TypeScript Fundamentals from you.",
    time: "Yesterday",
    read: true,
    type: "booking",
    link: "/dashboard",
  },
];

const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: "post-1",
    authorName: "Maya Patel",
    authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    authorRole: "Frontend Developer",
    title: "Swapped React knowledge for Spanish — here is what surprised me most",
    content: "Last week I completed 3 sessions teaching React Hooks to a Spanish teacher from Madrid. In exchange, he gave me 3 conversational Spanish sessions. The credit exchange felt so much more human than paying ₹2,500/hr on commercial tutoring sites. Both of us were genuinely invested in each other's growth!",
    tag: "Discussion",
    upvotes: 42,
    replyCount: 14,
    timeAgo: "3h ago",
  },
  {
    id: "post-2",
    authorName: "Liam Chang",
    authorAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    authorRole: "Full Stack Engineer",
    title: "Looking for an AI / LLM mentor to pair on building an agentic pipeline",
    content: "I have 6 years in Go and Kubernetes, willing to teach distributed backend architecture or spend 30 credits for someone with production LangGraph / Gemini tool-calling experience.",
    tag: "Collaboration",
    upvotes: 28,
    replyCount: 9,
    timeAgo: "6h ago",
  },
  {
    id: "post-3",
    authorName: "Elena Rostova",
    authorAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    authorRole: "Lead Product Designer",
    title: "Figma Variables 101: A cheat sheet for engineers who want to understand tokens",
    content: "I synthesized the core principles from 40+ SkillSwap sessions into a 1-page Figma token cheat sheet. You can use it before our design system session!",
    tag: "Project",
    upvotes: 89,
    replyCount: 23,
    timeAgo: "1d ago",
  },
];

const SkillSwapContext = createContext<SkillSwapContextType | undefined>(undefined);

export function SkillSwapProvider({ children }: { children: React.ReactNode }) {
  const [currentUser] = useState({
    id: "user-sabareesh",
    name: "Sabareesh",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    role: "Learner & Teacher",
    location: "San Francisco, CA",
    bio: "Software developer exploring AI systems and generative UI. Teaching Next.js & TypeScript, learning Machine Learning & Spanish.",
    credits: 120,
    learningCount: 8,
    teachingCount: 12,
    skillsCount: 5,
  });

  const [credits, setCredits] = useState<number>(120);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [skills, setSkills] = useState<SkillListing[]>(INITIAL_SKILLS);
  const [sessions, setSessions] = useState<SessionItem[]>(INITIAL_SESSIONS);
  const [userTaughtSkills, setUserTaughtSkills] = useState<string[]>([
    "Modern React & Next.js",
    "TypeScript Fundamentals",
    "Tailwind CSS Architecture",
  ]);
  const [savedSkillIds, setSavedSkillIds] = useState<string[]>(["skill-1", "skill-3"]);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(INITIAL_COMMUNITY_POSTS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCredits = localStorage.getItem("skillswap_credits");
      if (savedCredits) setCredits(Number(savedCredits));

      const savedTx = localStorage.getItem("skillswap_txs");
      if (savedTx) setTransactions(JSON.parse(savedTx));

      const savedSkills = localStorage.getItem("skillswap_skills");
      if (savedSkills) setSkills(JSON.parse(savedSkills));

      const savedSess = localStorage.getItem("skillswap_sessions");
      if (savedSess) setSessions(JSON.parse(savedSess));

      const savedFavs = localStorage.getItem("skillswap_saved");
      if (savedFavs) setSavedSkillIds(JSON.parse(savedFavs));
    } catch {
      // ignore storage errors
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("skillswap_credits", String(credits));
      localStorage.setItem("skillswap_txs", JSON.stringify(transactions));
      localStorage.setItem("skillswap_skills", JSON.stringify(skills));
      localStorage.setItem("skillswap_sessions", JSON.stringify(sessions));
      localStorage.setItem("skillswap_saved", JSON.stringify(savedSkillIds));
    } catch {
      // ignore
    }
  }, [credits, transactions, skills, sessions, savedSkillIds]);

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

  const completeSession = (sessionId: string, review?: { rating: number; comment: string }) => {
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
    setUserTaughtSkills((prev) => [skillData.title, ...prev]);

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
        credits,
        transactions,
        skills,
        sessions,
        userTaughtSkills,
        savedSkillIds,
        notifications,
        communityPosts,
        toasts,
        unreadNotifsCount,
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
