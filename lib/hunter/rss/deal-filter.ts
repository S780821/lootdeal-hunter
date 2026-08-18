const dealKeywords = [
  "deal",
  "discount",
  "sale",
  "off",
  "offer",
  "coupon",
  "promo",
  "promotion",
  "free",
  "trial",
  "price drop",
  "clearance",
  "save",
];

const nonDealKeywords = [
  "review",
  "news",
  "guide",
  "how to",
  "comparison",
  "rumor",
];

export function looksLikeDeal(
  title: string
): boolean {
  const text = title
    .toLowerCase()
    .trim();

  const hasDealKeyword =
    dealKeywords.some((keyword) =>
      text.includes(keyword)
    );

  const looksLikeNonDeal =
    nonDealKeywords.some((keyword) =>
      text.includes(keyword)
    );

  return (
    hasDealKeyword &&
    !looksLikeNonDeal
  );
}