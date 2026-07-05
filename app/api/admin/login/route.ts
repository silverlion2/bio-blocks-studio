import { NextResponse } from "next/server";
import { createSession, setSessionCookie } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { password?: string } | null;
  const ok = await verifyPassword(body?.password ?? "");

  if (!ok) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const token = await createSession();
  await setSessionCookie(token);
  return NextResponse.json({ success: true });
}
