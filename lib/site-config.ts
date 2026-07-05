import { readConfigFromBlob } from "@/lib/blob-config";
import { defaultSiteConfig } from "@/lib/default-site-config";

export async function getSiteConfig() {
  const blobConfig = await readConfigFromBlob();
  return blobConfig ?? defaultSiteConfig;
}
