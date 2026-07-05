import type { Metadata } from "next";
import { getSiteConfig } from "@/lib/site-config";
import { buildRenderModel } from "@/lib/utils";
import { SiteLayout } from "@/components/site/SiteLayout";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  const siteUrl = config.settings.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const metadataBase = getMetadataBase(siteUrl);

  return {
    metadataBase,
    title: config.settings.siteTitle,
    description: config.settings.siteDescription,
    openGraph: {
      title: config.settings.siteTitle,
      description: config.settings.siteDescription,
      url: siteUrl,
      type: "website"
    }
  };
}

export default async function HomePage() {
  const config = await getSiteConfig();
  const model = buildRenderModel(config);
  return <SiteLayout config={config} renderModel={model} />;
}

function getMetadataBase(siteUrl: string) {
  try {
    return new URL(siteUrl);
  } catch {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
  }
}
