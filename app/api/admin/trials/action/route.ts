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
          error: "Valid trial id is required",
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

    // Check that trial exists
    const existingTrial = await prisma.trial.findUnique({
      where: {
        id,
      },
    });

    if (!existingTrial) {
      return NextResponse.json(
        {
          success: false,
          error: "Trial not found",
        },
        {
          status: 404,
        }
      );
    }

    // Update trial
    const trial = await prisma.trial.update({
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
      trial,
    });
  } catch (error) {
    console.error(
      "Trial admin action failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Unable to update trial",
      },
      {
        status: 500,
      }
    );
  }
}