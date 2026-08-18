import type { HunterDeal } from "../types";

type RssItem = {
  title?: string;
  description?: string;
  link?: string;
};

export async function getRssDeals(
  items: RssItem[],
  sourceName: string
): Promise<HunterDeal[]> {
  return items
    .filter((item) => item.title && item.link)
    .map((item) => ({
      title: item.title!,
      description: item.description,
      dealUrl: item.link!,
      source: sourceName,
      category: "General",
      currency: "INR",
    }));
}