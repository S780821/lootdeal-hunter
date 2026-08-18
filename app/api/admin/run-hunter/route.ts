import { NextResponse } from "next/server";
import { collectDeals } from "@/lib/hunter/sources/deal-sources";
import { saveDeal } from "@/lib/hunter/save-deal";

export async function POST() {
  try {
    console.log("🔥 Admin started Hunter");

    const deals = await collectDeals();

    let added = 0;
    let skipped = 0;

    for (const deal of deals) {
      const result = await saveDeal(deal);

      if (result.created) {
        added++;
      } else {
        skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      found: deals.length,
      added,
      skipped,
    });
  } catch (error) {
    console.error("Hunter API failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Hunter failed",
      },
      {
        status: 500,
      }
    );
  }
}