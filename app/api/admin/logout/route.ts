import { NextResponse } from "next/server";
import { clearSessionCookie, getCurrentSessionIsValid } from "@/lib/auth";

export async function POST() {
  if (!(await getCurrentSessionIsValid())) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  await clearSessionCookie();
  return NextResponse.json({ success: true });
}
