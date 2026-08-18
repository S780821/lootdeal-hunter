import type { HunterDeal } from "./deal-types";

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function calculateDiscount(
  originalPrice?: number,
  dealPrice?: number
) {
  if (
    originalPrice === undefined ||
    dealPrice === undefined ||
    originalPrice <= 0 ||
    dealPrice >= originalPrice
  ) {
    return undefined;
  }

  return Math.round(
    ((originalPrice - dealPrice) /
      originalPrice) *
      100
  );
}

function calculateDealScore({
  discount,
  dealPrice,
  verified,
  hasPrice,
  hasStore,
}: {
  discount?: number;
  dealPrice?: number;
  verified?: boolean;
  hasPrice: boolean;
  hasStore: boolean;
}) {
  let score = 20;

  if (discount !== undefined) {
    if (discount >= 80) {
      score += 40;
    } else if (discount >= 60) {
      score += 30;
    } else if (discount >= 40) {
      score += 20;
    } else if (discount >= 20) {
      score += 10;
    }
  }

  if (hasPrice) {
    score += 15;
  }

  if (
    dealPrice !== undefined &&
    dealPrice <= 999
  ) {
    score += 5;
  }

  if (hasStore) {
    score += 10;
  }

  if (verified) {
    score += 10;
  }

  return Math.min(score, 100);
}

export function normalizeDeal(
  deal: HunterDeal
): HunterDeal {
  const discount =
    deal.discount ??
    calculateDiscount(
      deal.originalPrice,
      deal.dealPrice
    );

  const score =
    deal.dealScore ??
    calculateDealScore({
      discount,
      dealPrice: deal.dealPrice,
      verified: deal.verified,
      hasPrice:
        deal.dealPrice !== undefined ||
        deal.originalPrice !== undefined,
      hasStore: !!deal.store,
    });

  return {
    ...deal,

    slug:
      deal.slug ??
      slugify(deal.title),

    currency:
      deal.currency ?? "UNKNOWN",

    discount,

    dealScore: score,

    status:
      deal.status ?? "PENDING",

    verified:
      deal.verified ?? false,
  };
}