import bcrypt from "bcryptjs";
import { createHash, timingSafeEqual } from "crypto";

function safeCompare(left: string, right: string) {
  const leftHash = createHash("sha256").update(left).digest();
  const rightHash = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

export async function verifyPassword(password: string): Promise<boolean> {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  const plainPassword = process.env.ADMIN_PASSWORD;

  if (!password) {
    return false;
  }

  if (hash) {
    return bcrypt.compare(password, hash);
  }

  if (plainPassword) {
    return safeCompare(password, plainPassword);
  }

  return false;
}
