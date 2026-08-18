import type { HunterDeal } from "../deal-types";

export type OfficialSourceConfig = {
  name: string;
  url: string;
  category: string;
};

export async function runOfficialSource(
  source: OfficialSourceConfig
): Promise<HunterDeal[]> {
  /*
   * Official store integrations will be added
   * provider-by-provider.
   *
   * We intentionally do not scrape arbitrary
   * websites here.
   */

  console.log(
    `ℹ️ Official source configured: ${source.name}`
  );

  return [];
}