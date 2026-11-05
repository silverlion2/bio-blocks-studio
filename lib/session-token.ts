import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
const MAX_TOKEN_LENGTH = 4096;

function signature(body: string, secret: string) {
  return createHmac("sha256", secret).update(body).digest("base64url");
}

export function createSessionToken(secret: string, now = Math.floor(Date.now() / 1000)): string {
  if (!secret) throw new Error("Admin session secret is not configured");
  const body = Buffer.from(JSON.stringify({ iat: now, exp: now + SESSION_MAX_AGE_SECONDS })).toString("base64url");
  return `${body}.${signature(body, secret)}`;
}

export function verifySessionToken(token: unknown, secret: string, now = Math.floor(Date.now() / 1000)): boolean {
  if (!secret || typeof token !== "string" || !token || token.length > MAX_TOKEN_LENGTH) return false;
  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return false;
  const [body, suppliedSignature] = parts;
  const expected = Buffer.from(signature(body, secret));
  const actual = Buffer.from(suppliedSignature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return false;
  try {
    const payload: unknown = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!payload || typeof payload !== "object" || !("exp" in payload)) return false;
    return typeof payload.exp === "number" && Number.isSafeInteger(payload.exp) && payload.exp > now;
  } catch {
    return false;
  }
}
