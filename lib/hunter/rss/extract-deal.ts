import type { HunterDeal } from "../sources/deal-types";
import { extractPrices } from "./extract-prices";

function extractDiscount(text: string): number | undefined {
  const match = text.match(
    /(\d{1,3})\s*%\s*(?:off|discount)/i
  );

  if (!match) {
    return undefined;
  }

  const value = Number(match[1]);

  if (value < 1 || value > 100) {
    return undefined;
  }

  return value;
}

function detectCurrency(text: string): string {
  if (/₹|rs\.?|inr|rupees?|indian rupees?/i.test(text)) {
    return "INR";
  }

  if (/\$|usd|us dollars?|dollars?/i.test(text)) {
    return "USD";
  }

  if (/€|eur|euros?/i.test(text)) {
    return "EUR";
  }

  if (/£|gbp|pounds?|british pounds?/i.test(text)) {
    return "GBP";
  }

  if (/¥|jpy|yen/i.test(text)) {
    return "JPY";
  }

  return "UNKNOWN";
}

/**
 * Detect product category.
 *
 * Regexes are kept on one line to avoid
 * Turbopack "Unterminated regexp literal" errors.
 */
function detectCategory(text: string): string {
  const value = text.toLowerCase();

  // Electronics
  if (
    /\b(iphone|ipad|macbook|smartphone|phone|laptop|computer|headphones|headphone|earbuds|airpods|speaker|tablet|monitor|keyboard|mouse|webcam|camera|television|tv|smartwatch|smart watch|apple watch|charger|charging|power bank|bluetooth|playstation|xbox|nintendo|gaming|gpu|graphics card|ssd|hard drive|router|ring floodlight|ring spotlight)\b/i.test(
      value
    )
  ) {
    return "Electronics";
  }

  // Beauty
  if (
    /\b(shampoo|conditioner|skincare|skin care|serum|moisturizer|sunscreen|makeup|lipstick|mascara|foundation|perfume|fragrance|hair dryer|hair straightener|hair curler|toothbrush|toothbrushes|electric toothbrush|pimple|acne|hydrocolloid|razor|shaver|trimmer)\b/i.test(
      value
    )
  ) {
    return "Beauty";
  }

  // Home & Kitchen
  if (
    /\b(vacuum|robot vacuum|roomba|air fryer|pressure cooker|instant pot|rice cooker|blender|mixer|microwave|refrigerator|fridge|dishwasher|ice maker|ice machine|water filter|water purifier|reverse osmosis|ro system|cookware|kitchen|coffee maker|espresso|toaster|oven|furniture|pillow|mattress|bed|sofa|chair|table|shoe rack|storage|fan|cooling system)\b/i.test(
      value
    )
  ) {
    return "Home & Kitchen";
  }

  // Fashion
  if (
    /\b(dress|shirt|t-shirt|jeans|jacket|shoes|sneakers|handbag|purse|crossbody|wallet|backpack|clothing|apparel|boots|sandals|jewelry|watch)\b/i.test(
      value
    )
  ) {
    return "Fashion";
  }

  // Baby
  if (
    /\b(baby|infant|toddler|stroller|diaper|diapers|baby swing|crib|feeding bottle|breast pump|baby monitor|nursery)\b/i.test(
      value
    )
  ) {
    return "Baby";
  }

  // Pets
  if (
    /\b(dog|dogs|puppy|cat|cats|pet|pets|dog seat cover|pet food|pet bed|pet toy|leash|collar)\b/i.test(
      value
    )
  ) {
    return "Pets";
  }

  // Sports & Outdoors
  if (
    /\b(golf|golf rangefinder|basketball|football|soccer|tennis|cricket|fitness|gym|workout|running|camping|hiking|outdoor|bicycle|bike|cycling|exercise|sports|rangefinder)\b/i.test(
      value
    )
  ) {
    return "Sports & Outdoors";
  }

  // Software
  if (
    /\b(software|saas|ai tool|ai tools|artificial intelligence|code editor|developer tool|hosting|vpn|antivirus|subscription|app|cursor|chatgpt|notion|canva|adobe|microsoft 365|office 365)\b/i.test(
      value
    )
  ) {
    return "Software";
  }

  // Automotive
  if (
    /\b(car|cars|automotive|automobile|motorcycle|tire|tyre|dash cam|car seat|car accessories|car cover|engine oil|jump starter)\b/i.test(
      value
    )
  ) {
    return "Automotive";
  }

  // Travel
  if (
    /\b(hotel|flight|airline|travel|vacation|resort|luggage|suitcase|booking|tour)\b/i.test(
      value
    )
  ) {
    return "Travel";
  }

  return "Shopping";
}

export function extractDealData(
  title: string,
  description?: string
): Partial<HunterDeal> {
  const text = `${title} ${description ?? ""}`;

  const discount = extractDiscount(text);

  const prices = extractPrices(text);

  const currency = detectCurrency(text);

  const category = detectCategory(text);

  return {
    ...prices,
    discount,
    currency,
    category,
  };
}