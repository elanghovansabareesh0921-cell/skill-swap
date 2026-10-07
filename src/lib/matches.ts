import { Profile, PeerMatch, UserTeachSkill, UserLearnSkill } from '@/types';
import { generateQuoteBreakdown } from './pricing';

export function computePeerMatches(learner: Profile, teachers: Profile[]): PeerMatch[] {
  const matches: PeerMatch[] = [];

  for (const teacher of teachers) {
    if (
      teacher.id === learner.id ||
      (teacher.email && learner.email && teacher.email.toLowerCase() === learner.email.toLowerCase()) ||
      !teacher.isAcceptingRequests ||
      !teacher.teachSkills ||
      teacher.teachSkills.length === 0
    ) {
      continue;
    }

    // 1. Language intersection check (Hard filter: >= 1 common language)
    const commonLanguages = learner.languages.filter(lang =>
      teacher.languages.includes(lang)
    );
    if (commonLanguages.length === 0) {
      continue;
    }

    // 2. Forward fit: Does teacher offer a skill learner wants to learn?
    let matchedTeachSkill: UserTeachSkill | null = null;
    let matchedLearnSkill: UserLearnSkill | null = null;

    for (const wantToLearn of learner.learnSkills) {
      const offered = teacher.teachSkills.find(t => 
        t.skillId === wantToLearn.skillId || 
        t.skillName.toLowerCase().trim() === wantToLearn.skillName.toLowerCase().trim()
      );
      if (offered) {
        matchedTeachSkill = offered;
        matchedLearnSkill = wantToLearn;
        break;
      }
    }

    if (!matchedTeachSkill) {
      // If no direct skill match, pick their top primary skill for exploratory discovery
      matchedTeachSkill = teacher.teachSkills[0];
    }

    if (!matchedTeachSkill) {
      continue;
    }

    // 3. Reverse fit: Does teacher want to learn something learner can teach? (SWAP POTENTIAL)
    let isSwapMatch = false;
    let reverseTeacherWant: UserLearnSkill | null = null;
    let reverseLearnerCanTeach: UserTeachSkill | null = null;

    for (const teacherWants of teacher.learnSkills) {
      const learnerCan = learner.teachSkills.find(l => 
        l.skillId === teacherWants.skillId || 
        l.skillName.toLowerCase().trim() === teacherWants.skillName.toLowerCase().trim()
      );
      if (learnerCan) {
        isSwapMatch = true;
        reverseTeacherWant = teacherWants;
        reverseLearnerCanTeach = learnerCan;
        break;
      }
    }

    // 4. Availability overlap
    const learnerDays = Object.keys(learner.availability);
    const teacherDays = Object.keys(teacher.availability);
    const overlappingDays = learnerDays.filter(day => teacherDays.includes(day));

    // 5. Composite Score Calculation
    let score = 50; // base score
    const reasons: string[] = [];

    if (matchedLearnSkill) {
      score += 25;
      reasons.push(`Teaches ${matchedTeachSkill.skillName} (${matchedTeachSkill.level})`);
    }

    if (isSwapMatch && reverseLearnerCanTeach) {
      score += 20;
      reasons.push(`Mutual Swap: Wants to learn your ${reverseLearnerCanTeach.skillName}`);
    }

    if (overlappingDays.length > 0) {
      score += 10;
      reasons.push(`Availability overlap on ${overlappingDays.join(', ')}`);
    }

    if (teacher.reputationScore >= 4.9) {
      score += 5;
      reasons.push(`Highly rated (${teacher.reputationScore.toFixed(2)} ★ with ${teacher.completedSessionsCount} sessions)`);
    }

    if (commonLanguages.length > 0) {
      reasons.push(`Speaks ${commonLanguages.join(', ')}`);
    }

    score = Math.min(99, score);

    // 6. Pricing comparison
    const defaultDuration = matchedTeachSkill.allowedDurations?.[0] || 60;
    const directPrice = Math.round(((matchedTeachSkill.hourlyRate || 50) * defaultDuration) / 60);

    let swapPriceTokens: number | undefined = undefined;
    let swapSavingsPct: number | undefined = undefined;

    if (isSwapMatch && reverseLearnerCanTeach) {
      const quote = generateQuoteBreakdown({
        type: 'SWAP',
        proposerLeg: {
          skillId: matchedTeachSkill.skillId,
          skillName: matchedTeachSkill.skillName,
          teacherId: teacher.id,
          learnerId: learner.id,
          hourlyRate: matchedTeachSkill.hourlyRate,
          durationMinutes: defaultDuration,
        },
        recipientLeg: {
          skillId: reverseLearnerCanTeach.skillId,
          skillName: reverseLearnerCanTeach.skillName,
          teacherId: learner.id,
          learnerId: teacher.id,
          hourlyRate: reverseLearnerCanTeach.hourlyRate,
          durationMinutes: defaultDuration,
        },
      });

      swapPriceTokens = quote.proposerLeg.chargedTokens;
      swapSavingsPct = quote.proposerSavingsPct;
    }

    matches.push({
      teacher,
      matchScore: score,
      isSwapMatch,
      reasons: reasons.slice(0, 3),
      directPriceTokens: directPrice,
      swapPriceTokens,
      swapSavingsPct,
      teacherOfferingSkill: matchedTeachSkill,
      matchingLearnSkill: matchedLearnSkill || undefined,
    });
  }

  // Sort: Swap matches first, then highest compatibility score
  return matches.sort((a, b) => {
    if (a.isSwapMatch && !b.isSwapMatch) return -1;
    if (!a.isSwapMatch && b.isSwapMatch) return 1;
    return b.matchScore - a.matchScore;
  });
}
