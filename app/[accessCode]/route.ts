import { NextResponse } from "next/server";
import { getSiteConfig } from "@/lib/site-config";
import {
  publicLocaleCookieName,
  publicVariantCookieName,
  publicVariantRemainingCookieName,
  publicVariantViewLimit
} from "@/lib/public-variant-cookies";
import {
  findAvailableLocaleForVariant,
  findVariantByAccessCode,
  getMainVariantId,
  getVariantMainLocale
} from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET(request: Request, context: { params: Promise<{ accessCode: string }> }) {
  const { accessCode } = await context.params;
  if (accessCode.trim().toLowerCase() === "reset") {
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete(publicLocaleCookieName);
    response.cookies.delete(publicVariantCookieName);
    response.cookies.delete(publicVariantRemainingCookieName);
    return response;
  }

  const config = await getSiteConfig();
  const mainVariantId = getMainVariantId(config);
  const mainVariantLocale = findAvailableLocaleForVariant(config, mainVariantId, accessCode);

  if (mainVariantLocale) {
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete(publicVariantCookieName);
    response.cookies.delete(publicVariantRemainingCookieName);
    setLocaleCookie(response, mainVariantLocale);
    return response;
  }

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
  setLocaleCookie(response, getVariantMainLocale(config, variant.id));

  return response;
}

function setLocaleCookie(response: NextResponse, locale: string) {
  response.cookies.set(publicLocaleCookieName, locale, {
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365
  });
}
