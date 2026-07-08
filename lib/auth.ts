import { createHash, createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "bio_template_admin_session";
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
const MIN_SECRET_LENGTH = 32;

function getSecret() {
  const secret = process.env.SESSION_SECRET || "";
  if (secret.length >= MIN_SECRET_LENGTH) {
    return secret;
  }

  const credentialSecret = process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD || "";
  return credentialSecret ? createHash("sha256").update(`admin-session:${credentialSecret}`).digest("hex") : "";
}

function base64url(input: Buffer | string) {
  return Buffer.from(input).toString("base64url");
}

function sign(body: string) {
  return createHmac("sha256", getSecret()).update(body).digest("base64url");
}

export async function createSession(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const body = base64url(JSON.stringify({ iat: now, exp: now + MAX_AGE_SECONDS }));
  return `${body}.${sign(body)}`;
}

export async function verifySession(token?: string): Promise<boolean> {
  const secret = getSecret();
  if (!secret || !token) {
    return false;
  }

  const [body, signature] = token.split(".");
  if (!body || !signature) {
    return false;
  }

  const expected = sign(body);
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== actualBuffer.length || !timingSafeEqual(expectedBuffer, actualBuffer)) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as { exp?: number };
    return typeof payload.exp === "number" && payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export async function getCurrentSessionIsValid() {
  return verifySession((await cookies()).get(SESSION_COOKIE_NAME)?.value);
}

export async function setSessionCookie(token: string) {
  (await cookies()).set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS
  });
}

export async function clearSessionCookie() {
  (await cookies()).set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
}
