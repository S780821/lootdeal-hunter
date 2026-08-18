import { NextResponse } from "next/server";
import { collectDeals } from "@/lib/hunter/sources/deal-sources";
import { saveDeal } from "@/lib/hunter/save-deal";
import { sendDealToTelegram } from "@/lib/telegram/send-deal";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    console.log("");
    console.log("🔥 AUTOMATIC LOOTDEAL HUNTER");
    console.log("============================");

    const deals = await collectDeals();

    let added = 0;
    let skipped = 0;

    let duplicateSlug = 0;
    let duplicateUrl = 0;
    let invalidUrl = 0;
    let otherSkipped = 0;

    let telegramSent = 0;
    let telegramFailed = 0;

    for (const deal of deals) {
      const result = await saveDeal(deal);

      // --------------------------------
      // SKIPPED DEAL
      // --------------------------------

      if (!result.created) {
        skipped++;

        if (result.reason === "duplicate-slug") {
          duplicateSlug++;
        } else if (result.reason === "duplicate-url") {
          duplicateUrl++;
        } else if (result.reason === "invalid-url") {
          invalidUrl++;
        } else {
          otherSkipped++;
        }

        continue;
      }

      // --------------------------------
      // NEW DEAL CREATED
      // --------------------------------

      if (!result.deal) {
        console.error(
          `❌ Deal was created but no deal data was returned: ${deal.title}`
        );

        continue;
      }

      added++;

      const savedDeal = result.deal;

      // --------------------------------
      // SEND TELEGRAM
      // --------------------------------

      try {
        const telegramResult = await sendDealToTelegram({
          title: savedDeal.title,

          description:
            savedDeal.description ?? undefined,

          originalPrice:
            savedDeal.originalPrice ?? undefined,

          dealPrice:
            savedDeal.dealPrice ?? undefined,

          currency:
            savedDeal.currency ?? undefined,

          discount:
            savedDeal.discount ?? undefined,

          store:
            savedDeal.store ?? undefined,

          category:
            savedDeal.category ?? undefined,

          dealUrl:
            savedDeal.dealUrl,

          image:
            savedDeal.image ?? undefined,

          dealScore:
            savedDeal.dealScore,

          status:
            savedDeal.status as
              | "PENDING"
              | "ACTIVE"
              | "REJECTED",

          verified:
            savedDeal.verified,

          slug:
            savedDeal.slug,

          expiresAt:
            savedDeal.expiresAt ?? undefined,
        });

        if (telegramResult.success) {
          telegramSent++;

          console.log(
            `📨 Telegram sent: ${savedDeal.title}`
          );
        }
      } catch (telegramError) {
        telegramFailed++;

        console.error(
          `❌ Telegram failed: ${savedDeal.title}`
        );

        console.error(telegramError);
      }
    }

    // --------------------------------
    // FINAL SUMMARY
    // --------------------------------

    console.log("");
    console.log(`🔎 Found: ${deals.length}`);
    console.log(`✅ Added: ${added}`);
    console.log(`⏭️ Skipped: ${skipped}`);
    console.log(`📨 Telegram sent: ${telegramSent}`);
    console.log(`❌ Telegram failed: ${telegramFailed}`);

    console.log("");
    console.log("📊 SKIP REASONS");
    console.log("================");
    console.log(`Duplicate slug: ${duplicateSlug}`);
    console.log(`Duplicate URL: ${duplicateUrl}`);
    console.log(`Invalid URL: ${invalidUrl}`);
    console.log(`Other: ${otherSkipped}`);

    return NextResponse.json({
      success: true,

      found: deals.length,

      added,

      skipped,

      telegramSent,

      telegramFailed,

      reasons: {
        duplicateSlug,
        duplicateUrl,
        invalidUrl,
        otherSkipped,
      },
    });
  } catch (error) {
    console.error("❌ Automatic Hunter failed:");
    console.error(error);

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
