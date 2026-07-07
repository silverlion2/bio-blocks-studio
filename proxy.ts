import { NextResponse, type NextRequest } from "next/server";
import { publicVariantCookieName, publicVariantRemainingCookieName } from "@/lib/public-variant-cookies";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname !== "/") {
    return NextResponse.next();
  }

  if (request.nextUrl.searchParams.has("reset")) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.search = "";
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.delete(publicVariantCookieName);
    response.cookies.delete(publicVariantRemainingCookieName);
    return response;
  }

  const variantId = request.cookies.get(publicVariantCookieName)?.value;
  const remaining = Number(request.cookies.get(publicVariantRemainingCookieName)?.value ?? "0");
  const response = NextResponse.next();

  if (!variantId) {
    return response;
  }

  if (!Number.isFinite(remaining) || remaining <= 1) {
    response.cookies.delete(publicVariantCookieName);
    response.cookies.delete(publicVariantRemainingCookieName);
    return response;
  }

  response.cookies.set(publicVariantRemainingCookieName, String(remaining - 1), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });

  return response;
}

export const config = {
  matcher: "/"
};
