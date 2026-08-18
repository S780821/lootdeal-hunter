import { NextResponse } from "next/server";
import { collectAllDeals } from "@/lib/hunter/sources";
import { saveDeal } from "@/lib/hunter/save-deal";

export async function GET() {
  try {
    console.log("🚀 Hunter database run started");

    const deals = await collectAllDeals();

    console.log(
      `🎯 Collected ${deals.length} deals`
    );

    let created = 0;
    let duplicates = 0;
    let rejected = 0;

    for (const deal of deals) {
      try {
        const result = await saveDeal(deal);

        if (result.created) {
          created++;

          console.log(
            `✅ Saved: ${deal.title}`
          );
        } else if (result.deal) {
          duplicates++;

          console.log(
            `♻️ Duplicate: ${deal.title}`
          );
        } else {
          rejected++;

          console.log(
            `⚠️ Rejected: ${deal.title}`
          );
        }
      } catch (error) {
        rejected++;

        console.error(
          `❌ Failed to save: ${deal.title}`
        );

        console.error(error);
      }
    }

    console.log(
      `🏁 Hunter database run completed`
    );

    return NextResponse.json({
      success: true,
      collected: deals.length,
      created,
      duplicates,
      rejected,
    });
  } catch (error) {
    console.error(
      "❌ Hunter database run failed"
    );

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Hunter database run failed",
      },
      {
        status: 500,
      }
    );
  }
}