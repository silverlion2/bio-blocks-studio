import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getCurrentSessionIsValid } from "@/lib/auth";
import { allowedImageTypes, getFileExtensionForType, isUploadFolder, maxUploadSize } from "@/lib/upload";

export async function POST(request: Request) {
  if (!(await getCurrentSessionIsValid())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Blob token is missing. Local preview works, but remote saving is disabled." },
      { status: 400 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const folder = String(formData.get("folder") ?? "");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  if (!isUploadFolder(folder)) {
    return NextResponse.json({ error: "Invalid upload folder" }, { status: 400 });
  }

  if (!allowedImageTypes.includes(file.type)) {
    return NextResponse.json({ error: "Only jpg, png, webp, and gif images are allowed" }, { status: 400 });
  }

  if (file.size > maxUploadSize) {
    return NextResponse.json({ error: "Image must be 5MB or smaller" }, { status: 400 });
  }

  const extension = getFileExtensionForType(file.type);
  const pathname = `images/${folder}/${crypto.randomUUID()}.${extension}`;
  const blob = await put(pathname, file, { access: "public" });

  return NextResponse.json({ url: blob.url });
}
