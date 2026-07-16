import { head, put } from "@vercel/blob";
import type { SiteConfig } from "@/types/site-config";
import { validateSiteConfig } from "@/lib/validators";

const CONFIG_PATH = "config/site-config.json";

export class BlobTokenMissingError extends Error {
  constructor() {
    super("Blob token is missing. Local preview works, but remote saving is disabled.");
    this.name = "BlobTokenMissingError";
  }
}

function hasBlobToken() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function readConfigFromBlob(): Promise<SiteConfig | null> {
  if (!hasBlobToken()) {
    return null;
  }

  try {
    const meta = await head(CONFIG_PATH);
    const configUrl = new URL(meta.url);
    configUrl.searchParams.set("v", String(meta.uploadedAt.getTime()));
    const response = await fetch(configUrl, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }

    const parsed = await response.json();
    const result = validateSiteConfig(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export async function writeConfigToBlob(config: SiteConfig): Promise<void> {
  if (!hasBlobToken()) {
    throw new BlobTokenMissingError();
  }

  await put(CONFIG_PATH, JSON.stringify(config, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true
  });
}
