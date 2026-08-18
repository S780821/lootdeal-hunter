import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const token =
    request.cookies.get("lootdeal_admin")?.value;

  const secret = process.env.ADMIN_SECRET;

  if (!token || !secret) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  const expectedToken = crypto
    .createHmac("sha256", secret)
    .update("lootdeal-admin")
    .digest("hex");

  if (token !== expectedToken) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};