import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Block } from "@/types/block";
import type { Section } from "@/types/section";
import type { SiteConfig, SiteContentSnapshot, SiteLanguage, SiteVariant } from "@/types/site-config";

export const topLevelBlockSectionId = "__top_level__";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeSortOrder<T extends { sortOrder: number }>(items: T[]): T[] {
  return items.map((item, index) => ({ ...item, sortOrder: index + 1 }));
}

export function bySortOrder<T extends { sortOrder: number }>(a: T, b: T) {
  return a.sortOrder - b.sortOrder;
}

export type ContentOrderItem =
  | { id: string; type: "top-level-blocks"; blocks: Block[]; sortOrder: number }
  | { id: string; type: "text-block"; block: Block; sortOrder: number };

type ContentFlowNode = {
  type: "block";
  block: Block;
  sortOrder: number;
  tieOrder: number;
  itemOrder: number;
};

export function getNextContentSortOrder(config: SiteConfig) {
  return Math.max(0, ...config.sections.map((section) => section.sortOrder), ...config.blocks.map((block) => block.sortOrder)) + 1;
}

export function isSectionTextBlock(block: Block) {
  return block.size === "section-text";
}

export function normalizeContentFlowConfig(config: SiteConfig): SiteConfig {
  const sectionById = new Map(config.sections.map((section) => [section.id, section]));
  const existingBlockIds = new Set(config.blocks.map((block) => block.id));
  const existingSectionSourceIds = new Set(
    config.blocks
      .filter(isSectionTextBlock)
      .map((block) => (typeof block.metadata?.sourceSectionId === "string" ? block.metadata.sourceSectionId : block.id))
  );
  const contentNodes: ContentFlowNode[] = [
    ...config.sections
      .filter((section) => !existingSectionSourceIds.has(section.id))
      .map((section, index) => ({
        type: "block" as const,
        block: sectionToTextBlock(section, getSectionTextBlockId(section.id, existingBlockIds)),
        sortOrder: section.sortOrder,
        tieOrder: 1,
        itemOrder: index
      })),
    ...config.blocks.map((block, index) => {
      const parentSection = sectionById.get(block.sectionId);
      const isLegacySectionBlock = block.sectionId !== topLevelBlockSectionId && parentSection;

      return {
        type: "block" as const,
        block,
        sortOrder: isLegacySectionBlock ? parentSection.sortOrder : block.sortOrder,
        tieOrder: isLegacySectionBlock ? 2 : 0,
        itemOrder: isLegacySectionBlock ? block.sortOrder : index
      };
    })
  ].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    if (a.tieOrder !== b.tieOrder) return a.tieOrder - b.tieOrder;
    return a.itemOrder - b.itemOrder;
  });

  return {
    ...config,
    sections: [],
    blocks: contentNodes.map((item, index) => normalizeContentBlock(item.block, index + 1)),
    settings: {
      ...normalizeVariantLanguageSettings(config),
      topLevelBlocksSortOrder: undefined
    },
    contentVariants: normalizeContentVariants(config.contentVariants ?? {})
  };
}

export function getContentVariantKey(variantId: string, locale: string) {
  return `${variantId}:${locale}`;
}

export function getMainVariantId(config: SiteConfig) {
  return config.settings.variants.mainVariantId || "main";
}

export function getMainLocale(config: SiteConfig) {
  return config.settings.languages.mainLocale || "zh-CN";
}

export function getVariantMainLocale(config: SiteConfig, variantId: string) {
  const variant = config.settings.variants.variants.find((item) => item.id === variantId);
  return variant?.mainLocale || getMainLocale(config);
}

export function getVariantLanguages(config: SiteConfig, variantId: string): SiteLanguage[] {
  const variant = config.settings.variants.variants.find((item) => item.id === variantId);
  if (variant?.languages?.length) return [...variant.languages].sort(bySortOrder);
  const mainLocale = getVariantMainLocale(config, variantId);
  const legacyLanguages = config.settings.languages.languages.length
    ? config.settings.languages.languages
    : [{ code: mainLocale, label: mainLocale, isEnabled: true, sortOrder: 1 }];
  return [...legacyLanguages].sort(bySortOrder);
}

export function getEnabledLanguages(config: SiteConfig): SiteLanguage[] {
  const languages = config.settings.languages.languages.length
    ? config.settings.languages.languages
    : [{ code: getMainLocale(config), label: getMainLocale(config), isEnabled: true, sortOrder: 1 }];
  const enabled = languages.filter((language) => language.isEnabled).sort(bySortOrder);
  return enabled.length ? enabled : languages.slice(0, 1);
}

export function getAvailableLanguagesForVariant(config: SiteConfig, variantId: string): SiteLanguage[] {
  const languages = getVariantLanguages(config, variantId);
  const mainLocale = getVariantMainLocale(config, variantId);
  const mainLanguage =
    languages.find((language) => language.code === mainLocale) ??
    getVariantLanguages(config, getMainVariantId(config)).find((language) => language.code === mainLocale) ?? {
      code: mainLocale,
      label: mainLocale,
      isEnabled: true,
      sortOrder: 0
    };
  const availableCodes = new Set<string>([mainLocale]);

  for (const language of languages) {
    if (language.code === mainLocale) continue;
    if (getVariantLanguageIsEnabled(config, variantId, language.code)) {
      availableCodes.add(language.code);
    }
  }

  const availableLanguages = languages.filter((language) => availableCodes.has(language.code));
  return availableLanguages.some((language) => language.code === mainLocale)
    ? availableLanguages
    : [mainLanguage, ...availableLanguages].sort(bySortOrder);
}

export function findAvailableLocaleForVariant(config: SiteConfig, variantId: string, locale: string) {
  const normalizedLocale = locale.trim().toLowerCase();
  if (!normalizedLocale) return null;
  return getAvailableLanguagesForVariant(config, variantId).find(
    (language) => language.code.toLowerCase() === normalizedLocale
  )?.code ?? null;
}

export function getEnabledVariants(config: SiteConfig): SiteVariant[] {
  const variants = config.settings.variants.variants.length
    ? config.settings.variants.variants
    : [{ id: getMainVariantId(config), name: "主版本", accessCode: "", isEnabled: true, sortOrder: 1 }];
  const enabled = variants.filter((variant) => variant.isEnabled).sort(bySortOrder);
  return enabled.length ? enabled : variants.slice(0, 1);
}

export function getVariantAllowSeoIndex(config: SiteConfig, variantId: string) {
  const mainVariantId = getMainVariantId(config);
  const variant = config.settings.variants.variants.find((item) => item.id === variantId);
  return variant?.allowSeoIndex ?? variantId === mainVariantId;
}

export function getSiteContentSnapshot(config: SiteConfig): SiteContentSnapshot {
  return {
    profile: config.profile,
    sections: config.sections,
    blocks: config.blocks,
    theme: config.theme,
    siteTitle: config.settings.siteTitle,
    siteDescription: config.settings.siteDescription,
    seoTitle: config.settings.seoTitle,
    seoDescription: config.settings.seoDescription,
    seoCanonicalUrl: config.settings.seoCanonicalUrl,
    seoOgImage: config.settings.seoOgImage
  };
}

export function materializeSiteConfig(config: SiteConfig, variantId = getMainVariantId(config), locale = getMainLocale(config)): SiteConfig {
  const mainVariantId = getMainVariantId(config);
  const mainLocale = getMainLocale(config);
  const snapshot = getResolvedContentSnapshot(config, variantId, locale);

  return normalizeContentFlowConfig({
    ...config,
    profile: snapshot.profile,
    sections: snapshot.sections,
    blocks: snapshot.blocks,
    theme: snapshot.theme,
    settings: {
      ...config.settings,
      siteTitle: snapshot.siteTitle ?? config.settings.siteTitle,
      siteDescription: snapshot.siteDescription ?? config.settings.siteDescription,
      seoTitle: snapshot.seoTitle ?? config.settings.seoTitle,
      seoDescription: snapshot.seoDescription ?? config.settings.seoDescription,
      seoCanonicalUrl: snapshot.seoCanonicalUrl ?? config.settings.seoCanonicalUrl,
      seoOgImage: snapshot.seoOgImage ?? config.settings.seoOgImage
    },
    contentVariants: variantId === mainVariantId && locale === mainLocale ? config.contentVariants : {}
  });
}

export function writeSiteContentSnapshot(config: SiteConfig, variantId: string, locale: string, nextConfig: SiteConfig): SiteConfig {
  const mainVariantId = getMainVariantId(config);
  const mainLocale = getMainLocale(config);
  const snapshot = getSiteContentSnapshot(nextConfig);

  if (variantId === mainVariantId && locale === mainLocale) {
    const nextContentVariants = { ...(config.contentVariants ?? {}) };
    delete nextContentVariants[getContentVariantKey(mainVariantId, mainLocale)];
    return normalizeContentFlowConfig({
      ...config,
      profile: snapshot.profile,
      sections: snapshot.sections,
      blocks: snapshot.blocks,
      theme: snapshot.theme,
      settings: {
        ...config.settings,
        siteTitle: snapshot.siteTitle ?? config.settings.siteTitle,
        siteDescription: snapshot.siteDescription ?? config.settings.siteDescription,
        seoTitle: snapshot.seoTitle ?? config.settings.seoTitle,
        seoDescription: snapshot.seoDescription ?? config.settings.seoDescription,
        seoCanonicalUrl: snapshot.seoCanonicalUrl ?? config.settings.seoCanonicalUrl,
        seoOgImage: snapshot.seoOgImage ?? config.settings.seoOgImage
      },
      contentVariants: nextContentVariants
    });
  }

  return normalizeContentFlowConfig({
    ...config,
    contentVariants: {
      ...(config.contentVariants ?? {}),
      [getContentVariantKey(variantId, locale)]: normalizeContentSnapshot(snapshot)
    }
  });
}

export function findVariantByAccessCode(config: SiteConfig, accessCode: string) {
  if (!config.settings.variants.isEnabled) return null;
  const normalizedAccessCode = accessCode.trim().toLowerCase();
  if (!normalizedAccessCode || reservedAccessCodes.has(normalizedAccessCode)) return null;
  return getEnabledVariants(config).find((variant) => variant.accessCode.trim().toLowerCase() === normalizedAccessCode) ?? null;
}

export function resolveLocaleFromAcceptLanguage(config: SiteConfig, acceptLanguage: string | null, variantId = getMainVariantId(config)) {
  const enabledLanguages = getAvailableLanguagesForVariant(config, variantId);
  const mainLocale = getVariantMainLocale(config, variantId);
  if (enabledLanguages.length <= 1 || !acceptLanguage) return mainLocale;

  const languageCodes = enabledLanguages.map((language) => language.code);
  const requested = acceptLanguage
    .split(",")
    .map((item) => item.trim().split(";")[0]?.toLowerCase())
    .filter(Boolean);

  for (const requestedCode of requested) {
    const exact = languageCodes.find((code) => code.toLowerCase() === requestedCode);
    if (exact) return exact;
    const family = languageCodes.find((code) => code.toLowerCase().split("-")[0] === requestedCode.split("-")[0]);
    if (family) return family;
  }

  return mainLocale;
}

export function resolvePublicLocale(config: SiteConfig, cookieLocale: string | undefined, acceptLanguage: string | null, variantId = getMainVariantId(config)) {
  const enabledLanguages = getAvailableLanguagesForVariant(config, variantId);
  const mainLocale = getVariantMainLocale(config, variantId);
  const normalizedCookieLocale = cookieLocale?.trim().toLowerCase();

  if (normalizedCookieLocale) {
    const matchedCookieLocale = enabledLanguages.find((language) => language.code.toLowerCase() === normalizedCookieLocale);
    if (matchedCookieLocale) return matchedCookieLocale.code;
  }

  return resolveLocaleFromAcceptLanguage(config, acceptLanguage, variantId) || mainLocale;
}

function getVariantLanguageIsEnabled(config: SiteConfig, variantId: string, locale: string) {
  const variant = config.settings.variants.variants.find((item) => item.id === variantId);
  const languageSettings = variant?.languageSettings;
  const state = languageSettings?.[locale];
  if (state) return state.isEnabled;
  if (languageSettings) return false;
  return Boolean(config.contentVariants?.[getContentVariantKey(variantId, locale)]);
}

export function resolvePublicVariantId(config: SiteConfig, cookieVariantId?: string) {
  const mainVariantId = getMainVariantId(config);
  if (!config.settings.variants.isEnabled || !cookieVariantId) return mainVariantId;
  return getEnabledVariants(config).some((variant) => variant.id === cookieVariantId) ? cookieVariantId : mainVariantId;
}

export function buildRenderModel(config: SiteConfig): {
  profile: SiteConfig["profile"];
  orderedSections: Section[];
  topLevelBlocks: Block[];
  orderedContentItems: ContentOrderItem[];
} {
  const normalizedConfig = normalizeContentFlowConfig(config);
  const orderedVisibleBlocks = [...normalizedConfig.blocks].filter((block) => block.isVisible).sort(bySortOrder);
  const orderedContentItems: ContentOrderItem[] = [];
  let pendingTopLevelBlocks: Block[] = [];

  function flushTopLevelBlocks() {
    if (pendingTopLevelBlocks.length === 0) return;
    orderedContentItems.push({
      id: `top-level-blocks:${pendingTopLevelBlocks[0].id}`,
      type: "top-level-blocks",
      blocks: pendingTopLevelBlocks,
      sortOrder: pendingTopLevelBlocks[0].sortOrder
    });
    pendingTopLevelBlocks = [];
  }

  for (const block of orderedVisibleBlocks) {
    if (!isSectionTextBlock(block)) {
      pendingTopLevelBlocks.push(block);
      continue;
    }

    flushTopLevelBlocks();
    orderedContentItems.push({ id: block.id, type: "text-block", block, sortOrder: block.sortOrder });
  }
  flushTopLevelBlocks();

  return {
    profile: normalizedConfig.profile,
    orderedSections: [],
    topLevelBlocks: orderedVisibleBlocks,
    orderedContentItems
  };
}

function getSectionTextBlockId(sectionId: string, existingBlockIds: Set<string>) {
  const baseId = `text-${sectionId}`;
  if (!existingBlockIds.has(baseId)) return baseId;
  return `text-block-${sectionId}`;
}

function getResolvedContentSnapshot(config: SiteConfig, variantId: string, locale: string): SiteContentSnapshot {
  const mainVariantId = getMainVariantId(config);
  const mainLocale = getMainLocale(config);
  if (variantId === mainVariantId && locale === mainLocale) return getSiteContentSnapshot(config);

  const variantMainLocale = getVariantMainLocale(config, variantId);
  const snapshots = config.contentVariants ?? {};
  const keys = [
    getContentVariantKey(variantId, locale),
    getContentVariantKey(variantId, variantMainLocale),
    getContentVariantKey(mainVariantId, locale)
  ].filter((key) => key !== getContentVariantKey(mainVariantId, mainLocale));

  for (const key of keys) {
    const snapshot = snapshots[key];
    if (snapshot) return snapshot;
  }

  return getSiteContentSnapshot(config);
}

function normalizeContentVariants(contentVariants: Record<string, SiteContentSnapshot>) {
  return Object.fromEntries(
    Object.entries(contentVariants).map(([key, snapshot]) => [key, normalizeContentSnapshot(snapshot)])
  );
}

function normalizeVariantLanguageSettings(config: SiteConfig): SiteConfig["settings"] {
  const settings = config.settings;
  const legacyLanguages = settings.languages.languages.length
    ? settings.languages.languages
    : [{ code: settings.languages.mainLocale || "zh-CN", label: settings.languages.mainLocale || "zh-CN", isEnabled: true, sortOrder: 1 }];

  const variants = settings.variants.variants.map((variant) => {
    const mainLocale = variant.mainLocale || settings.languages.mainLocale || legacyLanguages[0]?.code || "zh-CN";
    const codes = new Set<string>([mainLocale]);
    for (const locale of Object.keys(variant.languageSettings ?? {})) {
      codes.add(locale);
    }
    if (!variant.languageSettings && !variant.languages?.length) {
      for (const key of Object.keys(config.contentVariants ?? {})) {
        const [snapshotVariantId, locale] = key.split(":");
        if (snapshotVariantId === variant.id && locale) codes.add(locale);
      }
    }

    const languages = (variant.languages?.length
      ? variant.languages
      : legacyLanguages.filter((language) => codes.has(language.code))
    ).map((language) => ({
      ...language,
      isEnabled: language.code === mainLocale ? true : variant.languageSettings?.[language.code]?.isEnabled ?? language.isEnabled
    }));

    for (const code of codes) {
      if (languages.some((language) => language.code === code)) continue;
      const legacyLanguage = legacyLanguages.find((language) => language.code === code);
      languages.push({
        code,
        label: legacyLanguage?.label || code,
        isEnabled: code === mainLocale ? true : variant.languageSettings?.[code]?.isEnabled ?? true,
        sortOrder: languages.length + 1
      });
    }

    if (!languages.some((language) => language.code === mainLocale)) {
      const legacyMainLanguage = legacyLanguages.find((language) => language.code === mainLocale);
      languages.unshift({
        code: mainLocale,
        label: legacyMainLanguage?.label || mainLocale,
        isEnabled: true,
        sortOrder: 0
      });
    }

    const normalizedLanguages = normalizeSortOrder(languages.sort(bySortOrder));
    const languageSettings = Object.fromEntries(
      normalizedLanguages.map((language) => [
        language.code,
        {
          isEnabled: language.code === mainLocale ? true : language.isEnabled
        }
      ])
    );
    return {
      ...variant,
      allowSeoIndex: variant.allowSeoIndex ?? variant.id === settings.variants.mainVariantId,
      mainLocale,
      languages: normalizedLanguages,
      languageSettings: {
        ...languageSettings,
        [mainLocale]: { isEnabled: true }
      }
    };
  });

  const mainVariantId = settings.variants.mainVariantId || variants[0]?.id || "main";
  const mainVariant = variants.find((variant) => variant.id === mainVariantId) ?? variants[0];
  const mainLocale = mainVariant?.mainLocale || settings.languages.mainLocale || "zh-CN";

  return {
    ...settings,
    languages: {
      ...settings.languages,
      mainLocale,
      languages: mainVariant?.languages?.length ? mainVariant.languages : legacyLanguages
    },
    variants: {
      ...settings.variants,
      mainVariantId,
      variants
    }
  };
}

function normalizeContentSnapshot(snapshot: SiteContentSnapshot): SiteContentSnapshot {
  const normalized = normalizeContentFlowConfig({
    version: 1,
    profile: snapshot.profile,
    sections: snapshot.sections,
    blocks: snapshot.blocks,
    theme: snapshot.theme,
    settings: {
      projectName: "",
      siteTitle: snapshot.siteTitle ?? "",
      siteDescription: snapshot.siteDescription ?? "",
      siteUrl: "",
      seoTitle: snapshot.seoTitle ?? "",
      seoDescription: snapshot.seoDescription ?? "",
      seoCanonicalUrl: snapshot.seoCanonicalUrl ?? "",
      seoOgImage: snapshot.seoOgImage ?? "",
      enableImagePreview: true,
      enableAnimation: true,
      enablePublicShare: true,
      languages: {
        isEnabled: false,
        mainLocale: "zh-CN",
        languages: [{ code: "zh-CN", label: "中文", isEnabled: true, sortOrder: 1 }]
      },
      variants: {
        isEnabled: false,
        mainVariantId: "main",
        variants: [{ id: "main", name: "主版本", accessCode: "", isEnabled: true, sortOrder: 1 }]
      }
    },
    contentVariants: {},
    updatedAt: ""
  });

  return {
    profile: normalized.profile,
    sections: normalized.sections,
    blocks: normalized.blocks,
    theme: normalized.theme,
    siteTitle: snapshot.siteTitle,
    siteDescription: snapshot.siteDescription,
    seoTitle: snapshot.seoTitle,
    seoDescription: snapshot.seoDescription,
    seoCanonicalUrl: snapshot.seoCanonicalUrl,
    seoOgImage: snapshot.seoOgImage
  };
}

const reservedAccessCodes = new Set(["admin", "api", "icon", "_next", "favicon.ico", "reset"]);

function sectionToTextBlock(section: Section, id: string): Block {
  return {
    id,
    sectionId: topLevelBlockSectionId,
    title: section.title || "Untitled",
    subtitle: section.description ?? "",
    description: "",
    size: "section-text",
    responsiveSizes: {
      desktop: "section-text",
      mobile: "section-text"
    },
    coverImage: "",
    icon: section.emoji ?? "",
    badge: "",
    href: "",
    actionType: "none",
    openInNewTab: false,
    backgroundColor: "",
    textColor: "",
    metadata: {
      sourceSectionId: section.id,
      titleAlign: section.titleAlign,
      titleSize: section.titleSize
    },
    isVisible: section.isVisible,
    isFeatured: false,
    sortOrder: section.sortOrder,
    createdAt: section.createdAt,
    updatedAt: section.updatedAt
  };
}

function normalizeContentBlock(block: Block, sortOrder: number): Block {
  const isTextSection = isSectionTextBlock(block);
  return {
    ...block,
    sectionId: topLevelBlockSectionId,
    sortOrder,
    size: isTextSection ? "section-text" : block.size,
    responsiveSizes: isTextSection
      ? {
          desktop: "section-text",
          mobile: "section-text"
        }
      : block.responsiveSizes,
    actionType: isTextSection ? "none" : block.actionType,
    openInNewTab: isTextSection ? false : block.openInNewTab,
    isFeatured: isTextSection ? false : block.isFeatured
  };
}
