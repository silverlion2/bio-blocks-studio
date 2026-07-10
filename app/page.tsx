import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { getSiteConfig } from "@/lib/site-config";
import { publicLocaleCookieName, publicVariantCookieName } from "@/lib/public-variant-cookies";
import {
  buildRenderModel,
  getAvailableLanguagesForVariant,
  getMainVariantId,
  getVariantAllowSeoIndex,
  materializeSiteConfig,
  resolvePublicLocale,
  resolvePublicVariantId
} from "@/lib/utils";
import { SiteLayout } from "@/components/site/SiteLayout";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function generateMetadata(): Promise<Metadata> {
  const { baseConfig, config, variantId } = await getPublicSiteContext();
  const siteUrl = config.settings.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const metadataBase = getMetadataBase(siteUrl);
  const title = config.settings.seoTitle || config.settings.siteTitle;
  const description = config.settings.seoDescription || config.settings.siteDescription;
  const canonicalUrl = config.settings.seoCanonicalUrl || siteUrl;
  const shouldIndex = getVariantAllowSeoIndex(baseConfig, variantId);

  return {
    metadataBase,
    title,
    description,
    robots: {
      index: shouldIndex,
      follow: shouldIndex,
      googleBot: {
        index: shouldIndex,
        follow: shouldIndex
      }
    },
    alternates: {
      canonical: canonicalUrl
    },
    openGraph: {
      title,
      description,
      url: siteUrl,
      type: "website",
      images: config.settings.seoOgImage ? [config.settings.seoOgImage] : undefined
    }
  };
}

export default async function HomePage() {
  const { baseConfig, config, variantId, locale } = await getPublicSiteContext();
  const model = buildRenderModel(config);
  return (
    <SiteLayout
      config={config}
      renderModel={model}
      languageSwitcher={{
        currentLocale: locale,
        languages: getAvailableLanguagesForVariant(baseConfig, variantId),
        accessCode:
          variantId === getMainVariantId(baseConfig)
            ? ""
            : baseConfig.settings.variants.variants.find((variant) => variant.id === variantId)?.accessCode ?? ""
      }}
    />
  );
}

async function getPublicSiteContext() {
  const config = await getSiteConfig();
  const cookieStore = await cookies();
  const requestHeaders = await headers();
  const variantId = resolvePublicVariantId(config, cookieStore.get(publicVariantCookieName)?.value);
  const locale = resolvePublicLocale(config, cookieStore.get(publicLocaleCookieName)?.value, requestHeaders.get("accept-language"), variantId);
  return { baseConfig: config, config: materializeSiteConfig(config, variantId, locale), variantId, locale };
}

function getMetadataBase(siteUrl: string) {
  try {
    return new URL(siteUrl);
  } catch {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
  }
}
