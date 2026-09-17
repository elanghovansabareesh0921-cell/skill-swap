export interface MentorReputation {
  completedSessionsCount: number;
  totalTeachingMinutes: number;
  averageRating: number;
  reviewCount: number;
  badges: string[];
}

export function calculateReputation(
  sessionsAsReceiver: any[],
  reviews: any[]
): MentorReputation {
  const completed = sessionsAsReceiver.filter((s) => s.status === "COMPLETED");
  const totalMinutes = completed.reduce((acc, s) => acc + (s.duration_minutes || 45), 0);

  const reviewCount = reviews.length;
  const averageRating =
    reviewCount > 0
      ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1))
      : 0;

  const badges: string[] = [];

  if (completed.length >= 1) badges.push("Verified Mentor");
  if (completed.length >= 5) badges.push("Active Swapper");
  if (totalMinutes >= 300) badges.push("5+ Hours Taught");
  if (reviewCount >= 3 && averageRating >= 4.5) badges.push("Top Rated ★");

  return {
    completedSessionsCount: completed.length,
    totalTeachingMinutes: totalMinutes,
    averageRating,
    reviewCount,
    badges,
  };
}