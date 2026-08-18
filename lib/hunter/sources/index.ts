import type { HunterDeal } from "./deal-types";
import { getOfficialDeals } from "./official";
import { collectDeals } from "./deal-sources";

export async function collectAllDeals(): Promise<HunterDeal[]> {
  const deals: HunterDeal[] = [];

  // Collect official deals
  try {
    const officialDeals = await getOfficialDeals();

    console.log(
      `🏆 Official collector: ${officialDeals.length} deals`
    );

    deals.push(...officialDeals);
  } catch (error) {
    console.error("❌ Official deals collector failed");
    console.error(error);
  }

  // Collect RSS deals
  try {
    const rssDeals = await collectDeals();

    console.log(
      `📡 RSS collector: ${rssDeals.length} deals`
    );

    deals.push(...rssDeals);
  } catch (error) {
    console.error("❌ RSS collector failed");
    console.error(error);
  }

  console.log(
    `🎯 Total deals collected: ${deals.length}`
  );

  return deals;
}