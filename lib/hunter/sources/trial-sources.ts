import type { HunterTrial } from "../trial-types";

type TrialSource = {
  name: string;
  url: string;
  category: string;
};

const sources: TrialSource[] = [
  // We will add verified public sources here.
];

export async function collectTrialSources(): Promise<HunterTrial[]> {
  const trials: HunterTrial[] = [];

  for (const source of sources) {
    try {
      console.log(`🎁 Checking ${source.name}...`);

      const response = await fetch(source.url, {
        headers: {
          "User-Agent":
            "LootDealHunter/1.0",
        },
      });

      if (!response.ok) {
        console.log(
          `⚠️ ${source.name} returned ${response.status}`
        );

        continue;
      }

      const html = await response.text();

      console.log(
        `📄 ${source.name}: ${html.length} characters`
      );

      /*
       * Parsing will be added source-by-source.
       *
       * We don't want to blindly extract random
       * text from websites and publish it as a trial.
       */
    } catch (error) {
      console.error(
        `❌ Failed to check ${source.name}`
      );

      console.error(error);
    }
  }

  return trials;
}