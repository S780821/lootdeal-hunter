import { prisma } from "@/lib/db";
import { collectDeals } from "@/lib/hunter/sources/deal-sources";
import { saveDeal } from "@/lib/hunter/save-deal";

function getTestDeals() {
  return [
    {
      title: "AI Productivity Tool - 50% Off",
      slug: "ai-productivity-tool-50-off",
      description:
        "Limited-time discount on an AI productivity platform.",
      originalPrice: 999,
      dealPrice: 499,
      currency: "INR",
      discount: 50,
      store: "Official",
      category: "AI Tools",
      dealUrl:
        "https://example.com/ai-deal",
      dealScore: 68,
      status: "PENDING",
      verified: false,
    },
  ];
}

async function main() {
  console.log("");
  console.log("🔥 LOOTDEAL HUNTER");
  console.log("==================");
  console.log("");

  console.log("🔎 Checking sources...");

  const realDeals =
    await collectDeals();

  console.log(
    `📡 Sources returned ${realDeals.length} deals`
  );

  const testDeals =
    process.env.NODE_ENV === "development"
      ? getTestDeals()
      : [];

  const deals = [
    ...realDeals,
    ...testDeals,
  ];

  console.log(
    `📦 Total deals to process: ${deals.length}`
  );

  let added = 0;
  let skipped = 0;

  for (const deal of deals) {
    const result =
      await saveDeal(deal);

    if (result.created) {
      added++;

      console.log(
        `✅ Added: ${deal.title}`
      );
    } else {
      skipped++;

      console.log(
        `⏭️ Skipped: ${deal.title}`
      );
    }
  }

  console.log("");
  console.log("==================");
  console.log(`✅ Added: ${added}`);
  console.log(`⏭️ Skipped: ${skipped}`);
  console.log("==================");
  console.log("");

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error("");
  console.error("❌ Hunter failed:");
  console.error(error);

  await prisma.$disconnect();

  process.exit(1);
});