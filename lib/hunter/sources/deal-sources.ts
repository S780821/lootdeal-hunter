import type {
  DealSource,
  HunterDeal,
} from "./deal-types";

import { normalizeDeal } from "./normalize-deal";
import { parseDealRSS } from "../rss/parser";
import { isQualityDeal } from "../deal-quality";

const sources: DealSource[] = [
  // =========================
  // Reddit sources
  // Disabled because Reddit
  // is currently returning 429
  // =========================

  {
    name: "Reddit Deals",
    type: "RSS",
    url: "https://www.reddit.com/r/deals/.rss",
    category: "Shopping",
    enabled: false,
  },

  {
    name: "Reddit Amazon Deals",
    type: "RSS",
    url: "https://www.reddit.com/r/amazondeals/.rss",
    category: "Shopping",
    enabled: false,
  },

  {
    name: "Reddit Freebies",
    type: "RSS",
    url: "https://www.reddit.com/r/freebies/.rss",
    category: "Freebies",
    enabled: false,
  },

  {
    name: "Reddit Software Deals",
    type: "RSS",
    url: "https://www.reddit.com/r/softwaredeals/.rss",
    category: "Software",
    enabled: false,
  },

  {
    name: "Reddit Game Deals",
    type: "RSS",
    url: "https://www.reddit.com/r/GameDeals/.rss",
    category: "Gaming",
    enabled: false,
  },

  {
    name: "Reddit Hardware Deals",
    type: "RSS",
    url: "https://www.reddit.com/r/buildapcsales/.rss",
    category: "Electronics",
    enabled: false,
  },

  // =========================
  // Google News sources
  // =========================

  {
    name: "Google News Shopping Deals",
    type: "RSS",
    url: "https://news.google.com/rss/search?q=best+deals+discount+sale&hl=en-US&gl=US&ceid=US:en",
    category: "Shopping",
    enabled: true,
  },

  {
    name: "Google News Amazon Deals",
    type: "RSS",
    url: "https://news.google.com/rss/search?q=Amazon+deals+discount&hl=en-US&gl=US&ceid=US:en",
    category: "Shopping",
    enabled: true,
  },

  {
    name: "Google News Tech Deals",
    type: "RSS",
    url: "https://news.google.com/rss/search?q=technology+deals+discount&hl=en-US&gl=US&ceid=US:en",
    category: "Electronics",
    enabled: true,
  },
];

// =========================
// Create unique deal key
// =========================

function getDealKey(deal: HunterDeal): string {
  if (deal.dealUrl) {
    return deal.dealUrl.trim().toLowerCase();
  }

  return deal.title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

// =========================
// Remove duplicate deals
// =========================

function deduplicateDeals(
  deals: HunterDeal[]
): HunterDeal[] {
  const map = new Map<string, HunterDeal>();

  for (const deal of deals) {
    const key = getDealKey(deal);

    const existing = map.get(key);

    if (!existing) {
      map.set(key, deal);
      continue;
    }

    // Keep the deal with the higher score.
    const existingScore = existing.dealScore ?? 0;
    const currentScore = deal.dealScore ?? 0;

    if (currentScore > existingScore) {
      map.set(key, deal);
    }
  }

  return Array.from(map.values());
}

// =========================
// Main deal collector
// =========================

export async function collectDeals(): Promise<HunterDeal[]> {
  const deals: HunterDeal[] = [];

  for (const source of sources) {
    if (!source.enabled) {
      console.log(
        `⏭️ Skipping disabled source: ${source.name}`
      );
      continue;
    }

    try {
      console.log(
        `🔎 Checking source: ${source.name}`
      );

      if (source.type === "RSS") {
        const rssDeals = await parseDealRSS(
          source.name,
          source.url,
          source.category
        );

        console.log(
          `✅ ${source.name}: ${rssDeals.length} deals`
        );

        deals.push(...rssDeals);
      }
    } catch (error) {
      console.error(
        `⚠️ Source unavailable: ${source.name}`
      );

      console.error(error);
    }
  }

  console.log(
    `📦 Collected before normalization: ${deals.length}`
  );

  // Normalize all deals.
  const normalized = deals.map(normalizeDeal);

const unique = deduplicateDeals(normalized);

console.log(
  `🧹 After duplicate removal: ${unique.length}`
);

const qualityDeals = unique.filter(isQualityDeal);

console.log(
  `🎯 After quality filter: ${qualityDeals.length}`
);

console.log(
  `🗑️ Removed low-quality deals: ${
    unique.length - qualityDeals.length
  }`
);

return qualityDeals;
}