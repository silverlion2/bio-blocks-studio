import { readConfigFromBlob } from "@/lib/blob-config";
import { defaultSiteConfig } from "@/lib/default-site-config";
import type { SiteConfig } from "@/types/site-config";

export async function getSiteConfig() {
  const blobConfig = await readConfigFromBlob();
  return normalizeSiteConfig(blobConfig ?? defaultSiteConfig);
}

function normalizeSiteConfig(config: SiteConfig): SiteConfig {
  return {
    ...config,
    settings: {
      ...defaultSiteConfig.settings,
      ...config.settings
    }
  };
}
