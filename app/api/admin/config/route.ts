import { NextResponse } from "next/server";
import { BlobTokenMissingError, writeConfigToBlob } from "@/lib/blob-config";
import { getCurrentSessionIsValid } from "@/lib/auth";
import { getSiteConfig } from "@/lib/site-config";
import { validateSiteConfig } from "@/lib/validators";

export async function GET() {
  if (!(await getCurrentSessionIsValid())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(await getSiteConfig());
}

export async function PUT(request: Request) {
  if (!(await getCurrentSessionIsValid())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const result = validateSiteConfig(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const updatedConfig = { ...result.data, updatedAt: new Date().toISOString() };

  try {
    await writeConfigToBlob(updatedConfig);
    return NextResponse.json({ success: true, updatedAt: updatedConfig.updatedAt });
  } catch (error) {
    if (error instanceof BlobTokenMissingError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Save failed" }, { status: 400 });
  }
}
