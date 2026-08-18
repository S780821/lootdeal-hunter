import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const password = body.password;

    if (!password) {
      return NextResponse.json(
        {
          error: "Password is required",
        },
        {
          status: 400,
        }
      );
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminSecret = process.env.ADMIN_SECRET;

    if (!adminPassword || !adminSecret) {
      return NextResponse.json(
        {
          error: "Admin authentication is not configured",
        },
        {
          status: 500,
        }
      );
    }

    if (password !== adminPassword) {
      return NextResponse.json(
        {
          error: "Invalid password",
        },
        {
          status: 401,
        }
      );
    }

    const token = crypto
      .createHmac("sha256", adminSecret)
      .update("lootdeal-admin")
      .digest("hex");

    const response = NextResponse.json({
      success: true,
    });

    response.cookies.set("lootdeal_admin", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch {
    return NextResponse.json(
      {
        error: "Invalid request",
      },
      {
        status: 400,
      }
    );
  }
}