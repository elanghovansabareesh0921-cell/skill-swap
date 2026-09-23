import { GoogleGenAI } from "@google/genai";

export interface MatchResult {
  matchUserId: string;
  fullName: string;
  avatarUrl: string;
  overallScore: number; // e.g., 94%
  synergyHighlights: string[]; // e.g., ["Direct Swap: React for UI Design", "Complementary Time Slots"]
  offeredSkill: string;
  requestedSkill: string;
  sessionRateCredits?: number;
  aiExplanation: string; // "High mutual synergy! Person B is an expert in Figma looking to learn Next.js, which matches your exact profile."
  factorBreakdown?: {
    synergy: number;      // 40% weight
    proficiency: number;  // 25% weight
    availability: number; // 20% weight
    vibe: number;         // 15% weight
  };
}

export interface CandidateUser {
  userId: string;
  fullName: string;
  avatarUrl: string;
  bio?: string;
  isVerified?: boolean;
  teaches: {
    skillName: string;
    proficiency: "beginner" | "intermediate" | "advanced";
    yearsExperience?: number;
  }[];
  learns: {
    skillName: string;
    proficiencyTarget?: "beginner" | "intermediate" | "advanced";
    learningGoal?: string;
  }[];
  availability?: string[]; // e.g. ["Weekday Evenings", "Weekend Mornings"]
  learningStyle?: "hands-on" | "theoretical" | "project-based" | "casual";
  sessionRateCredits?: number;
}

export interface CurrentUserContext {
  userId: string;
  fullName: string;
  bio?: string;
  teaches: {
    skillName: string;
    proficiency: "beginner" | "intermediate" | "advanced";
    yearsExperience?: number;
  }[];
  learns: {
    skillName: string;
    proficiencyTarget?: "beginner" | "intermediate" | "advanced";
    learningGoal?: string;
  }[];
  availability?: string[];
  learningStyle?: "hands-on" | "theoretical" | "project-based" | "casual";
}

const PROFICIENCY_RANK: Record<string, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

// Built-in high synergy peer candidates for network discovery & fallback
export const DEFAULT_CANDIDATE_POOL: CandidateUser[] = [
  {
    userId: "arun-kumar",
    fullName: "Arun Kumar",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    bio: "Senior AI Engineer specializing in PyTorch, LLMs, and Python data pipelines. Seeking frontend master to level up React & Next.js UI systems.",
    isVerified: true,
    sessionRateCredits: 35,
    teaches: [
      { skillName: "Python & Machine Learning", proficiency: "advanced", yearsExperience: 6 },
      { skillName: "FastAPI & Microservices", proficiency: "advanced", yearsExperience: 5 }
    ],
    learns: [
      { skillName: "React & Next.js", proficiencyTarget: "advanced", learningGoal: "Ship production-grade SaaS interfaces" },
      { skillName: "Tailwind CSS & UI Systems", proficiencyTarget: "intermediate" }
    ],
    availability: ["Weekday Evenings (EST)", "Saturday Afternoons"],
    learningStyle: "hands-on"
  },
  {
    userId: "elena-rostova",
    fullName: "Elena Rostova",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
    bio: "Principal Product Designer passionate about design tokens, auto-layout, and interactive micro-animations. Looking to build fullstack apps with TypeScript.",
    isVerified: true,
    sessionRateCredits: 40,
    teaches: [
      { skillName: "UI/UX Design Systems in Figma", proficiency: "advanced", yearsExperience: 7 },
      { skillName: "Interaction & Motion Design", proficiency: "advanced", yearsExperience: 4 }
    ],
    learns: [
      { skillName: "TypeScript & Web Architecture", proficiencyTarget: "intermediate", learningGoal: "Understand type safety and component state" },
      { skillName: "React Fundamentals", proficiencyTarget: "intermediate" }
    ],
    availability: ["Weekday Evenings (UTC)", "Sunday Mornings"],
    learningStyle: "project-based"
  },
  {
    userId: "marcus-chen",
    fullName: "Marcus Chen",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    bio: "Cloud Architect and DevOps specialist. Enthusiastic about container orchestration, CI/CD pipelines, and Kubernetes. Wants design feedback on dashboard UX.",
    isVerified: true,
    sessionRateCredits: 30,
    teaches: [
      { skillName: "Docker & Kubernetes Architecture", proficiency: "advanced", yearsExperience: 5 },
      { skillName: "AWS Cloud Infrastructure", proficiency: "advanced", yearsExperience: 6 }
    ],
    learns: [
      { skillName: "UI/UX Design in Figma", proficiencyTarget: "beginner", learningGoal: "Create clean developer dashboard wireframes" },
      { skillName: "Frontend Prototyping", proficiencyTarget: "beginner" }
    ],
    availability: ["Weekend Mornings (PST)", "Thursday Evenings"],
    learningStyle: "hands-on"
  },
  {
    userId: "sophia-rivera",
    fullName: "Sophia Rivera",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
    bio: "Bilingual educator & native Spanish speaker. I love immersive conversational exchanges and cultural nuances. Eager to master web basics.",
    isVerified: false,
    sessionRateCredits: 25,
    teaches: [
      { skillName: "Conversational Spanish & Business Terms", proficiency: "advanced", yearsExperience: 4 }
    ],
    learns: [
      { skillName: "Web Development & Frontend Basics", proficiencyTarget: "beginner", learningGoal: "Build a personal portfolio website" }
    ],
    availability: ["Weekday Evenings", "Weekend Flexible"],
    learningStyle: "casual"
  }
];

/**
 * Calculates rule-based 4-factor multi-dimensional compatibility score:
 * 1. Mutual Skill Exchange Synergy (40%)
 * 2. Proficiency & Pace Gap (25%)
 * 3. Availability & Schedule Overlap (20%)
 * 4. Vibe & Style Match (15%)
 */
export function calculateRuleBasedScore(
  user: CurrentUserContext,
  candidate: CandidateUser
): {
  overallScore: number;
  breakdown: { synergy: number; proficiency: number; availability: number; vibe: number };
  highlights: string[];
  bestOffered: string;
  bestRequested: string;
} {
  const userTeaches = user.teaches.map((t) => ({ ...t, norm: t.skillName.toLowerCase() }));
  const userLearns = user.learns.map((l) => ({ ...l, norm: l.skillName.toLowerCase() }));
  const candTeaches = candidate.teaches.map((t) => ({ ...t, norm: t.skillName.toLowerCase() }));
  const candLearns = candidate.learns.map((l) => ({ ...l, norm: l.skillName.toLowerCase() }));

  // --- Factor 1: Mutual Skill Exchange Synergy (40%) ---
  // Direct reciprocal swap: User A teaches X & wants Y; User B teaches Y & wants X
  const directTeachesToCand = userTeaches.filter((ut) =>
    candLearns.some((cl) => cl.norm.includes(ut.norm) || ut.norm.includes(cl.norm))
  );
  const directLearnsFromCand = candTeaches.filter((ct) =>
    userLearns.some((ul) => ul.norm.includes(ct.norm) || ct.norm.includes(ul.norm))
  );

  const isReciprocal = directTeachesToCand.length > 0 && directLearnsFromCand.length > 0;
  const isOneWayLearn = directLearnsFromCand.length > 0;
  const isOneWayTeach = directTeachesToCand.length > 0;

  let synergyScore = 60;
  const highlights: string[] = [];

  let bestOffered = candTeaches[0]?.skillName || "Skill Mentorship";
  let bestRequested = candLearns[0]?.skillName || "Skill Exchange";

  if (isReciprocal) {
    synergyScore = 96;
    bestOffered = directLearnsFromCand[0].skillName;
    bestRequested = directTeachesToCand[0].skillName;
    highlights.push(`Direct Reciprocal Swap: ${bestOffered} for ${bestRequested}`);
  } else if (isOneWayLearn) {
    synergyScore = 82;
    bestOffered = directLearnsFromCand[0].skillName;
    highlights.push(`One-Way Learning Match: ${bestOffered} (Escrow Credit Exchange)`);
  } else if (isOneWayTeach) {
    synergyScore = 78;
    bestRequested = directTeachesToCand[0].skillName;
    highlights.push(`One-Way Mentoring Match: Learn ${bestRequested}`);
  } else {
    synergyScore = 70;
    highlights.push("Cross-Discipline Skill Growth");
  }

  // --- Factor 2: Proficiency & Pace Gap (25%) ---
  let proficiencyScore = 75;
  if (isOneWayLearn || isReciprocal) {
    const candSkill = directLearnsFromCand[0] || candTeaches[0];
    const userTarget = userLearns.find((ul) => ul.norm.includes(candSkill?.norm || ""))?.proficiencyTarget || "intermediate";
    const candProfRank = PROFICIENCY_RANK[candSkill?.proficiency || "intermediate"] || 2;
    const userTargetRank = PROFICIENCY_RANK[userTarget] || 2;

    if (candProfRank >= userTargetRank) {
      proficiencyScore = 95;
      highlights.push(`Aligned Pace: ${candSkill.proficiency.toUpperCase()} Mentor`);
    } else {
      proficiencyScore = 80;
      highlights.push("Peer-Level Study Partner");
    }
  } else {
    proficiencyScore = 85;
  }

  // --- Factor 3: Availability & Schedule Overlap (20%) ---
  let availabilityScore = 75;
  const userAvail = user.availability || ["Weekday Evenings", "Weekend Flexible"];
  const candAvail = candidate.availability || ["Weekday Evenings", "Weekend Flexible"];
  const overlappingSlots = userAvail.filter((ua) =>
    candAvail.some((ca) => ca.toLowerCase().includes(ua.toLowerCase()) || ua.toLowerCase().includes(ca.toLowerCase()))
  );

  if (overlappingSlots.length > 0) {
    availabilityScore = 92;
    highlights.push(`Overlapping Time Slots: ${overlappingSlots[0]}`);
  } else {
    availabilityScore = 80;
    highlights.push("Flexible Remote Scheduling");
  }

  // --- Factor 4: Vibe & Style Match (15%) ---
  let vibeScore = 80;
  if (user.learningStyle && candidate.learningStyle) {
    if (user.learningStyle === candidate.learningStyle) {
      vibeScore = 95;
      highlights.push(`Shared Vibe: ${user.learningStyle.replace("-", " ").toUpperCase()} Learning`);
    } else {
      vibeScore = 85;
      highlights.push("Complementary Learning Dynamics");
    }
  } else {
    vibeScore = 88;
  }

  // Weighted calculation:
  // 40% Synergy + 25% Proficiency + 20% Availability + 15% Vibe
  const overallScore = Math.min(
    99,
    Math.max(
      65,
      Math.round(
        synergyScore * 0.40 +
        proficiencyScore * 0.25 +
        availabilityScore * 0.20 +
        vibeScore * 0.15
      )
    )
  );

  return {
    overallScore,
    breakdown: {
      synergy: synergyScore,
      proficiency: proficiencyScore,
      availability: availabilityScore,
      vibe: vibeScore,
    },
    highlights: highlights.slice(0, 3),
    bestOffered,
    bestRequested,
  };
}

/**
 * Main compatibility discovery engine.
 * Computes multi-factor scores and enhances results with Gemini AI when available.
 */
export async function calculateCompatibilityMatches(
  user: CurrentUserContext,
  candidatesPool: CandidateUser[] = DEFAULT_CANDIDATE_POOL
): Promise<MatchResult[]> {
  // 1. Initial rule-based scoring
  const initialMatches: MatchResult[] = candidatesPool.map((candidate) => {
    const { overallScore, breakdown, highlights, bestOffered, bestRequested } = calculateRuleBasedScore(
      user,
      candidate
    );

    const isReciprocal = breakdown.synergy >= 90;
    const defaultExplanation = isReciprocal
      ? `High mutual synergy! ${candidate.fullName} is an experienced instructor in ${bestOffered} looking to learn ${bestRequested}, which directly mirrors your profile.`
      : `${candidate.fullName} teaches ${bestOffered} with ${breakdown.proficiency}% proficiency alignment for your target goals, backed by escrow credit protection.`;

    return {
      matchUserId: candidate.userId,
      fullName: candidate.fullName,
      avatarUrl: candidate.avatarUrl,
      overallScore,
      synergyHighlights: highlights,
      offeredSkill: bestOffered,
      requestedSkill: bestRequested,
      sessionRateCredits: candidate.sessionRateCredits || 30,
      aiExplanation: defaultExplanation,
      factorBreakdown: breakdown,
    };
  });

  // Sort descending by overall compatibility score
  initialMatches.sort((a, b) => b.overallScore - a.overallScore);

  // 2. AI Enrichment layer (Gemini) if API key is present
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || initialMatches.length === 0) {
    return initialMatches;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const userSummary = `
User: ${user.fullName}
Teaches: ${user.teaches.map((t) => `${t.skillName} (${t.proficiency})`).join(", ") || "General Skills"}
Learns: ${user.learns.map((l) => `${l.skillName} (${l.proficiencyTarget || "intermediate"})`).join(", ") || "Tech & Design"}
Bio: ${user.bio || "Enthusiastic peer learner"}
`;

    const candidatesSummary = initialMatches.slice(0, 4).map((m, idx) => `
Candidate #${idx}:
ID: ${m.matchUserId}
Name: ${m.fullName}
Offered: ${m.offeredSkill}
Requested: ${m.requestedSkill}
Calculated Score: ${m.overallScore}%
`);

    const prompt = `
You are the AI Matchmaking Engine for SkillSwap, a peer-to-peer skill exchange platform.
Evaluate synergy between the active user and the top 4 candidates below.

Active User:
${userSummary}

Candidates:
${candidatesSummary.join("\n")}

Return a JSON array of 4 objects with custom, highly engaging AI synergy analysis for each candidate.
Format:
[
  {
    "matchUserId": "string matching Candidate ID",
    "aiExplanation": "One compelling, energetic sentence explaining why this match has phenomenal synergy for mutual exchange or credit mentoring.",
    "customBadge": "Short 3-5 word synergy highlight badge (e.g. 'Zero-Latency Swap Pair' or 'Perfect Knowledge Inversion')"
  }
]
IMPORTANT: Return ONLY the valid JSON array. Do not include markdown codeblocks or preamble.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let text = response.text || "";
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      parsed.forEach((item: any) => {
        const match = initialMatches.find((m) => m.matchUserId === item.matchUserId);
        if (match) {
          if (item.aiExplanation) match.aiExplanation = item.aiExplanation;
          if (item.customBadge && !match.synergyHighlights.includes(item.customBadge)) {
            match.synergyHighlights.unshift(item.customBadge);
            match.synergyHighlights = match.synergyHighlights.slice(0, 3);
          }
        }
      });
    }
  } catch (err) {
    // Graceful fallback to rule-based explanations if AI enrichment fails or times out
    console.warn("AI enrichment non-fatal fallback:", err);
  }

  return initialMatches;
}
