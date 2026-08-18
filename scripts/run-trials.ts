import { getTestTrials } from "@/lib/hunter/test-trials";
import { saveTrial } from "@/lib/hunter/save-trial";
import { collectTrialSources } from "@/lib/hunter/sources/trial-sources";

async function main() {
  console.log("");
  console.log("🎁 LOOTDEAL TRIAL HUNTER");
  console.log("========================");
  console.log("");

  console.log("🌐 Checking real sources...");

  const realTrials = await collectTrialSources();

  console.log(
    `📡 Real sources returned ${realTrials.length} trials`
  );

  console.log("");

  /*
   * Test data is kept during development.
   * Remove this later when real sources are working.
   */
  const testTrials = getTestTrials();

  const trials = [
    ...realTrials,
    ...testTrials,
  ];

  console.log(
    `📦 Total trials to process: ${trials.length}`
  );

  console.log("");

  let added = 0;
  let skipped = 0;

  for (const trial of trials) {
    const result = await saveTrial(trial);

    if (result.created) {
      added++;

      console.log(
        `✅ Added: ${trial.title}`
      );
    } else {
      skipped++;

      console.log(
        `⏭️ Already exists: ${trial.title}`
      );
    }
  }

  console.log("");
  console.log("========================");
  console.log(`✅ Added: ${added}`);
  console.log(`⏭️ Skipped: ${skipped}`);
  console.log("========================");
  console.log("");
  console.log("Trial Hunter finished.");
}

main()
  .catch((error) => {
    console.error("");
    console.error("❌ Trial Hunter failed:");
    console.error(error);

    process.exit(1);
  });