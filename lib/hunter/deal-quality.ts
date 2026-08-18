import type { HunterDeal } from "./sources/deal-types";

export type DealQuality =
  | "EXCELLENT"
  | "VERY_GOOD"
  | "GOOD"
  | "REVIEW"
  | "LOW";

export function getDealQuality(
  score: number | undefined
): DealQuality {
  const value = score ?? 0;

  if (value >= 80) {
    return "EXCELLENT";
  }

  if (value >= 70) {
    return "VERY_GOOD";
  }

  if (value >= 60) {
    return "GOOD";
  }

  if (value >= 50) {
    return "REVIEW";
  }

  return "LOW";
}

export function getDealQualityLabel(
  score: number | undefined
): string {
  switch (getDealQuality(score)) {
    case "EXCELLENT":
      return "⭐ Excellent";

    case "VERY_GOOD":
      return "🔥 Very Good";

    case "GOOD":
      return "✅ Good";

    case "REVIEW":
      return "👀 Review";

    case "LOW":
      return "❌ Low Quality";

    default:
      return "❓ Unknown";
  }
}

/**
 * Used by:
 *
 * unique.filter(isQualityDeal)
 *
 * Therefore this function receives a HunterDeal.
 */
export function isQualityDeal(
  deal: HunterDeal
): boolean {
  const score = deal.dealScore ?? 0;

  return score >= 50;
}

/**
 * Returns true when the deal should enter
 * the normal review workflow.
 */
export function shouldReviewDeal(
  score: number | undefined
): boolean {
  return (score ?? 0) >= 50;
}

/**
 * Returns true when the deal is too weak
 * for the normal workflow.
 */
export function shouldAutoRejectDeal(
  score: number | undefined
): boolean {
  return (score ?? 0) < 50;
}