import type { HunterDeal } from "../deal-types";

export type APISourceConfig = {
  name: string;
  url: string;
  category: string;
  headers?: Record<string, string>;
};

export async function runAPISource(
  source: APISourceConfig
): Promise<HunterDeal[]> {
  try {
    const response = await fetch(source.url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "LootDealHunter/1.0",
        ...(source.headers ?? {}),
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        `❌ API failed: ${source.name} (${response.status})`
      );

      return [];
    }

    const data = await response.json();

    /*
     * API providers will be mapped individually.
     * Do not assume every provider has the same response shape.
     */

    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .filter(
        (item) =>
          item &&
          typeof item.title === "string" &&
          typeof item.dealUrl === "string"
      )
      .map(
        (item): HunterDeal => ({
          title: item.title,
          description:
            typeof item.description === "string"
              ? item.description
              : "",

          dealUrl: item.dealUrl,

          store:
            typeof item.store === "string"
              ? item.store
              : source.name,

          category:
            typeof item.category === "string"
              ? item.category
              : source.category,

          currency:
            typeof item.currency === "string"
              ? item.currency
              : "UNKNOWN",

          originalPrice:
            typeof item.originalPrice === "number"
              ? item.originalPrice
              : undefined,

          dealPrice:
            typeof item.dealPrice === "number"
              ? item.dealPrice
              : undefined,

          discount:
            typeof item.discount === "number"
              ? item.discount
              : undefined,

          status: "PENDING",

          verified: false,

          slug: createSlug(item.title),

          dealScore:
            typeof item.dealScore === "number"
              ? item.dealScore
              : 30,
        })
      );
  } catch (error) {
    console.error(
      `❌ API source error: ${source.name}`
    );

    console.error(error);

    return [];
  }
}

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
}