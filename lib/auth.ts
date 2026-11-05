import { createHash } from "crypto";
import { cookies } from "next/headers";
import { createSessionToken, verifySessionToken, SESSION_MAX_AGE_SECONDS } from "./session-token";

export const SESSION_COOKIE_NAME = "bio_template_admin_session";
const MIN_SECRET_LENGTH = 32;

function getSecret() {
  const secret = process.env.SESSION_SECRET || "";
  if (secret.length >= MIN_SECRET_LENGTH) {
    return secret;
  }

  const credentialSecret = process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD || "";
  return credentialSecret ? createHash("sha256").update(`admin-session:${credentialSecret}`).digest("hex") : "";
}

export async function createSession(): Promise<string> {
  return createSessionToken(getSecret());
}

export async function verifySession(token?: string): Promise<boolean> {
  return verifySessionToken(token, getSecret());
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
    maxAge: SESSION_MAX_AGE_SECONDS
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
