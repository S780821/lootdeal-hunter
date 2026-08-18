import Parser from "rss-parser";
import type { HunterDeal } from "../sources/deal-types";
import { extractDealData } from "./extract-deal";
import { calculateSmartDealScore } from "../deal-score";

const parser = new Parser({
  timeout: 15000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36",
    Accept:
      "application/rss+xml, application/xml, text/xml, */*",
  },
});

const MAX_DEAL_AGE_DAYS = 30;

function cleanGoogleNewsUrl(url: string): string {
  try {
    const parsed = new URL(url);

    if (parsed.hostname === "news.google.com") {
      const originalUrl =
        parsed.searchParams.get("url");

      if (originalUrl) {
        return decodeURIComponent(originalUrl);
      }
    }

    return url;
  } catch {
    return url;
  }
}

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
}

function isFreshDeal(
  dateValue?: string | Date
): boolean {
  if (!dateValue) {
    return true;
  }

  const publishedDate =
    new Date(dateValue);

  if (Number.isNaN(publishedDate.getTime())) {
    return true;
  }

  const now = Date.now();

  const ageMs =
    now - publishedDate.getTime();

  const maxAgeMs =
    MAX_DEAL_AGE_DAYS *
    24 *
    60 *
    60 *
    1000;

  return ageMs <= maxAgeMs;
}

function hasObviousOldYear(
  title: string,
  description: string
): boolean {
  const text =
    `${title} ${description}`.toLowerCase();

  const currentYear =
    new Date().getFullYear();

  const years = text.match(
    /\b20\d{2}\b/g
  );

  if (!years) {
    return false;
  }

  for (const yearText of years) {
    const year = Number(yearText);

    if (year < currentYear) {
      return true;
    }
  }

  return false;
}

export async function parseDealRSS(
  sourceName: string,
  url: string,
  defaultCategory: string
): Promise<HunterDeal[]> {
  try {
    console.log(
      `📡 Reading RSS: ${sourceName}`
    );

    const feed =
      await parser.parseURL(url);

    const deals: HunterDeal[] = [];

    let staleCount = 0;
    let oldYearCount = 0;

    for (const item of feed.items ?? []) {
      if (!item.title || !item.link) {
        continue;
      }

      const title =
        item.title.trim();

      const description =
        item.contentSnippet ??
        item.content ??
        item.summary ??
        "";

      /*
       * RSS publication date.
       *
       * rss-parser normally provides
       * pubDate when available.
       */
      const publishedDate =
        item.pubDate ??
        item.isoDate;

      /*
       * Reject old RSS items.
       */
      if (!isFreshDeal(publishedDate)) {
        staleCount++;

        console.log(
          `⏭️ Skipping stale deal: ${title}`
        );

        continue;
      }

      /*
       * Reject obvious previous-year
       * articles such as:
       *
       * Black Friday Deals 2025
       * Best Tech Deals 2024
       */
      if (
        hasObviousOldYear(
          title,
          description
        )
      ) {
        oldYearCount++;

        console.log(
          `⏭️ Skipping old-year deal: ${title}`
        );

        continue;
      }

      const dealUrl =
        cleanGoogleNewsUrl(
          item.link
        );

      console.log(
        `🔗 Checking URL: ${dealUrl}`
      );

      const extracted =
        extractDealData(
          title,
          description
        );

      const slug =
        createSlug(title);

      const category =
        extracted.category ??
        defaultCategory;

      const currency =
        extracted.currency ??
        "UNKNOWN";

      const deal: HunterDeal = {
        title,

        description,

        dealUrl,

        store: sourceName,

        category,

        currency,

        originalPrice:
          extracted.originalPrice,

        dealPrice:
          extracted.dealPrice,

        discount:
          extracted.discount,

        status: "PENDING",

        verified: false,

        slug,

        dealScore:
          calculateSmartDealScore({
            title,

            description,

            dealUrl,

            store: sourceName,

            category,

            currency,

            originalPrice:
              extracted.originalPrice,

            dealPrice:
              extracted.dealPrice,

            discount:
              extracted.discount,

            status: "PENDING",

            verified: false,

            slug,
          }),
      };

      deals.push(deal);
    }

    console.log(
      `   ✓ Found ${deals.length} fresh possible deals`
    );

    console.log(
      `   ⏭️ Stale skipped: ${staleCount}`
    );

    console.log(
      `   📅 Old-year skipped: ${oldYearCount}`
    );

    return deals;
  } catch (error) {
    console.error(
      `❌ RSS failed: ${sourceName}`
    );

    if (
      error instanceof Error &&
      error.message.includes("429")
    ) {
      console.error(
        `⏳ ${sourceName} is rate limited (429). Skipping this source.`
      );
    } else {
      console.error(error);
    }

    return [];
  }
}