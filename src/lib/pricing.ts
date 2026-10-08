import type { QuoteBreakdown, OfferType } from '../types';

export const PLATFORM_FEE_PERCENT = 10; // 10%
export const DEFAULT_SWAP_FACTOR = 0.30; // 30%
export const MIN_SWAP_CHARGE_TOKENS = 10; // 10 tokens minimum per leg

export function calculateListPrice(hourlyRate: number, durationMinutes: number): number {
  return Math.round((hourlyRate * durationMinutes) / 60);
}

export function calculatePlatformFee(chargedTokens: number): {
  platformFeeTokens: number;
  teacherPayoutTokens: number;
} {
  const chargedPaise = chargedTokens * 100;
  // Round half-up on fee
  const feePaise = Math.round((chargedPaise * PLATFORM_FEE_PERCENT) / 100);
  const payoutPaise = chargedPaise - feePaise;

  return {
    platformFeeTokens: feePaise / 100,
    teacherPayoutTokens: payoutPaise / 100,
  };
}

export interface PricingInput {
  type: OfferType;
  swapFactor?: number;
  // Proposer receives learning in Leg A
  proposerLeg: {
    skillId: string;
    skillName: string;
    teacherId: string;
    learnerId: string;
    hourlyRate: number;
    durationMinutes: number;
  };
  // In a swap, Recipient receives learning in Leg B
  recipientLeg?: {
    skillId: string;
    skillName: string;
    teacherId: string;
    learnerId: string;
    hourlyRate: number;
    durationMinutes: number;
  };
}

export function generateQuoteBreakdown(input: PricingInput): QuoteBreakdown {
  const swapFactor = input.swapFactor ?? DEFAULT_SWAP_FACTOR;
  const listPriceA = calculateListPrice(
    input.proposerLeg.hourlyRate,
    input.proposerLeg.durationMinutes
  );

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min locked quote

  if (input.type === 'DIRECT' || !input.recipientLeg) {
    const { platformFeeTokens, teacherPayoutTokens } = calculatePlatformFee(listPriceA);

    return {
      type: 'DIRECT',
      swapFactor,
      proposerLeg: {
        ...input.proposerLeg,
        listPriceTokens: listPriceA,
        chargedTokens: listPriceA,
        platformFeeTokens,
        teacherPayoutTokens,
      },
      inKindExchangedValue: 0,
      proposerSavingsPct: 0,
      expiresAt,
    };
  }

  // SWAP PRICING LOGIC (§7.6A)
  const listPriceB = calculateListPrice(
    input.recipientLeg.hourlyRate,
    input.recipientLeg.durationMinutes
  );

  // M = smaller of the two legs' list prices (value exchanged in kind)
  const M = Math.min(listPriceA, listPriceB);

  // Charged per leg = (list price - M) + swap_factor * M
  // bounded by [MIN_SWAP_CHARGE_TOKENS, listPrice]
  const rawChargedA = Math.round((listPriceA - M) + (swapFactor * M));
  const chargedA = Math.max(MIN_SWAP_CHARGE_TOKENS, Math.min(listPriceA, rawChargedA));

  const rawChargedB = Math.round((listPriceB - M) + (swapFactor * M));
  const chargedB = Math.max(MIN_SWAP_CHARGE_TOKENS, Math.min(listPriceB, rawChargedB));

  const feeA = calculatePlatformFee(chargedA);
  const feeB = calculatePlatformFee(chargedB);

  const proposerSavingsPct = Math.round(((listPriceA - chargedA) / listPriceA) * 100);

  return {
    type: 'SWAP',
    swapFactor,
    proposerLeg: {
      ...input.proposerLeg,
      listPriceTokens: listPriceA,
      chargedTokens: chargedA,
      platformFeeTokens: feeA.platformFeeTokens,
      teacherPayoutTokens: feeA.teacherPayoutTokens,
    },
    recipientLeg: {
      ...input.recipientLeg,
      listPriceTokens: listPriceB,
      chargedTokens: chargedB,
      platformFeeTokens: feeB.platformFeeTokens,
      teacherPayoutTokens: feeB.teacherPayoutTokens,
    },
    inKindExchangedValue: M,
    proposerSavingsPct,
    expiresAt,
  };
}
