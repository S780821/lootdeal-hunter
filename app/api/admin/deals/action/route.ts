import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { id, action } = body;

    // Validate ID
    if (!id || typeof id !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Valid deal id is required",
        },
        {
          status: 400,
        }
      );
    }

    // Validate action
    if (
      action !== "APPROVE" &&
      action !== "REJECT"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Action must be APPROVE or REJECT",
        },
        {
          status: 400,
        }
      );
    }

    // Check that deal exists
    const existingDeal = await prisma.deal.findUnique({
      where: {
        id,
      },
    });

    if (!existingDeal) {
      return NextResponse.json(
        {
          success: false,
          error: "Deal not found",
        },
        {
          status: 404,
        }
      );
    }

    // Update deal
    const deal = await prisma.deal.update({
      where: {
        id,
      },
      data:
        action === "APPROVE"
          ? {
              status: "ACTIVE",
              verified: true,
            }
          : {
              status: "REJECTED",
              verified: false,
            },
    });

    return NextResponse.json({
      success: true,
      action,
      deal,
    });
  } catch (error) {
    console.error(
      "Deal admin action failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Unable to update deal",
      },
      {
        status: 500,
      }
    );
  }
}