import type { Block } from "@/types/block";
import type { Profile } from "@/types/profile";
import type { Section } from "@/types/section";
import type { ThemeConfig } from "@/types/theme";

export type SiteLanguage = {
  code: string;
  label: string;
  isEnabled: boolean;
  sortOrder: number;
};

export type SiteLanguageSettings = {
  isEnabled: boolean;
  mainLocale: string;
  languages: SiteLanguage[];
};

export type SiteVariant = {
  id: string;
  name: string;
  accessCode: string;
  isEnabled: boolean;
  sortOrder: number;
  mainLocale?: string;
  languageSettings?: Record<string, { isEnabled: boolean }>;
};

export type SiteVariantSettings = {
  isEnabled: boolean;
  mainVariantId: string;
  variants: SiteVariant[];
};

export type SiteSettings = {
  projectName: string;
  siteTitle: string;
  siteDescription: string;
  siteUrl: string;
  seoTitle?: string;
  seoDescription?: string;
  seoCanonicalUrl?: string;
  seoOgImage?: string;
  enableImagePreview: boolean;
  enableAnimation: boolean;
  enablePublicShare: boolean;
  topLevelBlocksSortOrder?: number;
  languages: SiteLanguageSettings;
  variants: SiteVariantSettings;
};

export type SiteContentSnapshot = {
  profile: Profile;
  sections: Section[];
  blocks: Block[];
  theme: ThemeConfig;
  siteTitle?: string;
  siteDescription?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoCanonicalUrl?: string;
  seoOgImage?: string;
};

export type SiteConfig = {
  version: number;
  profile: Profile;
  sections: Section[];
  blocks: Block[];
  theme: ThemeConfig;
  settings: SiteSettings;
  contentVariants?: Record<string, SiteContentSnapshot>;
  updatedAt: string;
};
