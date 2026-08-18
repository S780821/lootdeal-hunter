import { NextResponse } from "next/server";
import { collectAllDeals } from "@/lib/hunter/sources";

export async function GET() {
  try {
    console.log("🚀 Hunter test started");

    const deals = await collectAllDeals();

    console.log(
      `🎯 Hunter test completed: ${deals.length} deals`
    );

    return NextResponse.json({
      success: true,
      count: deals.length,
      deals,
    });
  } catch (error) {
    console.error("❌ Hunter test failed");
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Hunter collection failed",
      },
      {
        status: 500,
      }
    );
  }
}