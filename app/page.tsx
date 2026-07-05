import { getSiteConfig } from "@/lib/site-config";
import { buildRenderModel } from "@/lib/utils";
import { SiteLayout } from "@/components/site/SiteLayout";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function HomePage() {
  const config = await getSiteConfig();
  const model = buildRenderModel(config);
  return <SiteLayout config={config} renderModel={model} />;
}
