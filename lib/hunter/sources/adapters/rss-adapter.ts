import type { HunterDeal } from "../deal-types";
import { parseDealRSS } from "../../rss/parser";

export type RSSSourceConfig = {
  name: string;
  url: string;
  category: string;
};

export async function runRSSSource(
  source: RSSSourceConfig
): Promise<HunterDeal[]> {
  return parseDealRSS(
    source.name,
    source.url,
    source.category
  );
}