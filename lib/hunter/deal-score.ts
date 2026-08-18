import type { HunterDeal } from "./sources/deal-types";

const TRUSTED_STORES = [
  "amazon",
  "walmart",
  "best buy",
  "target",
  "ebay",
  "newegg",
  "steam",
  "microsoft",
  "apple",
  "google",
  "flipkart",
  "croma",
  "reliance digital",
  "myntra",
  "ajio",
];

export function calculateSmartDealScore(
  deal: HunterDeal
): number {
  let score = 30;

  const title = deal.title.toLowerCase();
  const description =
    deal.description?.toLowerCase() ?? "";

  const text = `${title} ${description}`;

  // =========================================
  // DISCOUNT
  // =========================================

  if (deal.discount !== undefined) {
    if (deal.discount >= 80) {
      score += 45;
    } else if (deal.discount >= 70) {
      score += 40;
    } else if (deal.discount >= 50) {
      score += 30;
    } else if (deal.discount >= 40) {
      score += 25;
    } else if (deal.discount >= 30) {
      score += 20;
    } else if (deal.discount >= 20) {
      score += 15;
    } else if (deal.discount >= 10) {
      score += 8;
    }
  }

  // =========================================
  // PRICE INFORMATION
  // =========================================

  if (
    deal.dealPrice !== undefined &&
    deal.dealPrice > 0
  ) {
    score += 10;
  }

  if (
    deal.originalPrice !== undefined &&
    deal.dealPrice !== undefined &&
    deal.originalPrice > deal.dealPrice
  ) {
    score += 5;
  }

  // =========================================
  // FREE DEAL
  // =========================================

  if (
    text.includes("free") ||
    text.includes("$0") ||
    text.includes("₹0") ||
    text.includes("rs 0") ||
    text.includes("inr 0")
  ) {
    score += 15;
  }

  // =========================================
  // COUPON / PROMO
  // =========================================

  if (
    text.includes("coupon") ||
    text.includes("promo code") ||
    text.includes("coupon code") ||
    text.includes("discount code")
  ) {
    score += 8;
  }

  // =========================================
  // URGENCY
  // =========================================

  if (
    text.includes("limited time") ||
    text.includes("today only") ||
    text.includes("ends soon") ||
    text.includes("last chance") ||
    text.includes("while supplies last")
  ) {
    score += 5;
  }

  // =========================================
  // TRUSTED STORE
  // =========================================

  for (const store of TRUSTED_STORES) {
    if (text.includes(store)) {
      score += 5;
      break;
    }
  }

  // =========================================
  // POSITIVE DEAL SIGNALS
  // =========================================

  if (
    text.includes("sale") ||
    text.includes("deal") ||
    text.includes("offer") ||
    text.includes("clearance")
  ) {
    score += 3;
  }

  // =========================================
  // BAD / LOW QUALITY SIGNALS
  // =========================================

  if (
    text.includes("expired") ||
    text.includes("scam") ||
    text.includes("fake") ||
    text.includes("rumor")
  ) {
    score -= 20;
  }

  // =========================================
  // FINAL SCORE
  // =========================================

  return Math.max(
    0,
    Math.min(score, 100)
  );
}