import { prisma } from "@/lib/db";
import { verifyUrl } from "@/lib/hunter/verify-url";

async function main() {
  console.log("");
  console.log("🧹 LOOTDEAL CLEANUP");
  console.log("==================");
  console.log("");

  const activeDeals =
    await prisma.deal.findMany({
      where: {
        status: "ACTIVE",
      },
    });

  console.log(
    `🔎 Checking ${activeDeals.length} active deals...`
  );

  let expired = 0;
  let stillActive = 0;

  for (const deal of activeDeals) {
    let shouldExpire = false;

    // Check expiration date
    if (
      deal.expiresAt &&
      deal.expiresAt < new Date()
    ) {
      console.log(
        `⏰ Expired: ${deal.title}`
      );

      shouldExpire = true;
    }

    // Check URL if not already expired
    if (!shouldExpire) {
      console.log(
        `🔗 Checking: ${deal.title}`
      );

      const valid =
        await verifyUrl(deal.dealUrl);

      if (!valid) {
        console.log(
          `❌ Dead URL: ${deal.title}`
        );

        shouldExpire = true;
      }
    }

    if (shouldExpire) {
      await prisma.deal.update({
        where: {
          id: deal.id,
        },
        data: {
          status: "EXPIRED",
        },
      });

      expired++;
    } else {
      stillActive++;
    }
  }

  console.log("");
  console.log("==================");
  console.log(`🟢 Still active: ${stillActive}`);
  console.log(`⏰ Expired: ${expired}`);
  console.log("==================");
  console.log("");

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error("");
  console.error("❌ Cleanup failed:");
  console.error(error);

  await prisma.$disconnect();

  process.exit(1);
});