import { NextResponse } from "next/server";
import { sendDealToTelegram } from "@/lib/telegram/send-deal";

export async function GET() {
  try {
    const result = await sendDealToTelegram({
      title: "🔥 LootDeal Hunter Telegram Test",
      description:
        "This is a local test message from LootDeal Hunter.",
      dealUrl: "https://example.com",
      store: "Test Store",
      category: "Software",
      currency: "USD",
      originalPrice: 100,
      dealPrice: 49,
      discount: 51,
      dealScore: 85,
      status: "PENDING",
      verified: false,
      slug: "telegram-test",
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Telegram test failed:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Telegram test failed",
      },
      {
        status: 500,
      }
    );
  }
}