import { NextResponse } from "next/server";
import { getSiteConfig } from "@/lib/site-config";
import {
  publicVariantCookieName,
  publicVariantRemainingCookieName,
  publicVariantViewLimit
} from "@/lib/public-variant-cookies";
import { findVariantByAccessCode } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET(request: Request, context: { params: Promise<{ accessCode: string }> }) {
  const { accessCode } = await context.params;
  if (accessCode.trim().toLowerCase() === "reset") {
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete(publicVariantCookieName);
    response.cookies.delete(publicVariantRemainingCookieName);
    return response;
  }

  const config = await getSiteConfig();
  const variant = findVariantByAccessCode(config, accessCode);

  if (!variant) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.set(publicVariantCookieName, variant.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
  response.cookies.set(publicVariantRemainingCookieName, String(publicVariantViewLimit), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });

  return response;
}
