import type { HunterDeal } from "./types";

export function calculateLootScore(
  deal: HunterDeal
): number {
  let score = 40;

  // Discount
  if (deal.discount) {
    if (deal.discount >= 80) {
      score += 30;
    } else if (deal.discount >= 60) {
      score += 25;
    } else if (deal.discount >= 40) {
      score += 18;
    } else if (deal.discount >= 20) {
      score += 10;
    }
  }

  // Price drop
  if (
    deal.originalPrice &&
    deal.dealPrice &&
    deal.originalPrice > deal.dealPrice
  ) {
    const calculatedDiscount =
      ((deal.originalPrice - deal.dealPrice) /
        deal.originalPrice) *
      100;

    if (calculatedDiscount >= 70) {
      score += 10;
    }
  }

  // Source reliability
  const trustedSources = [
    "official",
    "amazon",
    "flipkart",
    "microsoft",
    "google",
    "adobe",
  ];

  if (
    deal.source &&
    trustedSources.some((source) =>
      deal.source.toLowerCase().includes(source)
    )
  ) {
    score += 10;
  }

  return Math.min(score, 100);
}