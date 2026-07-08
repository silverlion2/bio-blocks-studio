import { z } from "zod";
import type { SiteConfig } from "@/types/site-config";
import { blockActionTypes } from "@/constants/block-types";
import { blockSizes } from "@/constants/block-sizes";
import { profileModules } from "@/constants/profile-modules";
import { topLevelBlockSectionId } from "@/lib/utils";

const profileModuleSchema = z.enum(profileModules as [string, ...string[]]);
const safeUrlSchema = z.string().refine((value) => value === "" || isSafeUrl(value), {
  message: "URL must use http, https, mailto, tel, or a relative path"
});

function isSafeUrl(value: string) {
  if (value.startsWith("/")) return true;

  try {
    const url = new URL(value);
    return ["http:", "https:", "mailto:", "tel:"].includes(url.protocol);
  } catch {
    return false;
  }
}

const socialLinkSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  icon: z.string().optional(),
  href: safeUrlSchema.refine((value) => value.length > 0, { message: "Required" }),
  actionType: z.enum(["link", "copy"]).optional(),
  copyText: z.string().optional(),
  openInNewTab: z.boolean().optional(),
  isVisible: z.boolean(),
  sortOrder: z.number().int().nonnegative()
});

const profileSchema = z.object({
  avatarUrl: z.string(),
  displayName: z.string().min(1),
  username: z.string().optional(),
  headline: z.string(),
  bio: z.string(),
  location: z.string().optional(),
  tags: z.array(z.string()),
  email: z.string().optional(),
  socialLinks: z.array(socialLinkSchema),
  moduleOrder: z.array(profileModuleSchema),
  visibleModules: z.record(profileModuleSchema, z.boolean())
});

const sectionSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  emoji: z.string().optional(),
  description: z.string().optional(),
  titleAlign: z.enum(["left", "center", "right"]),
  titleSize: z.enum(["sm", "md", "lg"]),
  layout: z.enum(["grid", "list"]),
  gap: z.enum(["sm", "md", "lg"]),
  sortOrder: z.number().int().nonnegative(),
  isVisible: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string()
});

const blockSchema = z.object({
  id: z.string().min(1),
  sectionId: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  size: z.enum(blockSizes as [string, ...string[]]),
  responsiveSizes: z
    .object({
      desktop: z.enum(blockSizes as [string, ...string[]]).optional(),
      mobile: z.enum(blockSizes as [string, ...string[]]).optional()
    })
    .optional(),
  placements: z
    .object({
      desktop: z
        .object({
          columnStart: z.number().int().min(1).max(12).optional(),
          rowStart: z.number().int().min(1).max(240).optional()
        })
        .optional(),
      mobile: z
        .object({
          columnStart: z.number().int().min(1).max(12).optional(),
          rowStart: z.number().int().min(1).max(240).optional()
        })
        .optional()
    })
    .optional(),
  coverImage: z.string().optional(),
  icon: z.string().optional(),
  badge: z.string().optional(),
  href: safeUrlSchema.optional(),
  actionType: z.enum(blockActionTypes as [string, ...string[]]),
  openInNewTab: z.boolean().optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  isVisible: z.boolean(),
  isFeatured: z.boolean(),
  sortOrder: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string()
});

const themeSchema = z.object({
  primaryColor: z.string(),
  backgroundColor: z.string(),
  cardBackground: z.string(),
  textColor: z.string(),
  mutedTextColor: z.string(),
  borderColor: z.string(),
  cardRadius: z.enum(["md", "lg", "xl", "2xl"]),
  cardShadow: z.enum(["none", "soft", "medium"]),
  fontFamily: z.enum(["system", "rounded", "mono"])
});

const languageSettingsSchema = z
  .object({
    isEnabled: z.boolean().default(false),
    mainLocale: z.string().min(1).default("zh-CN"),
    languages: z
      .array(
        z.object({
          code: z.string().min(1),
          label: z.string().min(1),
          isEnabled: z.boolean(),
          sortOrder: z.number().int().nonnegative()
        })
      )
      .default([{ code: "zh-CN", label: "中文", isEnabled: true, sortOrder: 1 }])
  })
  .default({
    isEnabled: false,
    mainLocale: "zh-CN",
    languages: [{ code: "zh-CN", label: "中文", isEnabled: true, sortOrder: 1 }]
  });

const variantSettingsSchema = z
  .object({
    isEnabled: z.boolean().default(false),
    mainVariantId: z.string().min(1).default("main"),
    variants: z
      .array(
        z.object({
          id: z.string().min(1),
          name: z.string().min(1),
          accessCode: z.string(),
          isEnabled: z.boolean(),
          allowSeoIndex: z.boolean().optional(),
          sortOrder: z.number().int().nonnegative(),
          mainLocale: z.string().min(1).optional(),
          languages: z
            .array(
              z.object({
                code: z.string().min(1),
                label: z.string().min(1),
                isEnabled: z.boolean(),
                sortOrder: z.number().int().nonnegative()
              })
            )
            .optional(),
          languageSettings: z.record(z.object({ isEnabled: z.boolean() })).optional()
        })
      )
      .default([{ id: "main", name: "主版本", accessCode: "", isEnabled: true, sortOrder: 1 }])
  })
  .default({
    isEnabled: false,
    mainVariantId: "main",
    variants: [{ id: "main", name: "主版本", accessCode: "", isEnabled: true, sortOrder: 1 }]
  });

const settingsSchema = z.object({
  projectName: z.string().min(1).default("Bio Template Editor"),
  siteTitle: z.string(),
  siteDescription: z.string(),
  siteUrl: z.string().default(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  seoTitle: z.string().optional().default(""),
  seoDescription: z.string().optional().default(""),
  seoCanonicalUrl: z.string().optional().default(""),
  seoOgImage: z.string().optional().default(""),
  enableImagePreview: z.boolean(),
  enableAnimation: z.boolean(),
  enablePublicShare: z.boolean(),
  topLevelBlocksSortOrder: z.number().int().nonnegative().optional(),
  languages: languageSettingsSchema,
  variants: variantSettingsSchema
});

const contentSnapshotSchema = z.object({
  profile: profileSchema,
  sections: z.array(sectionSchema),
  blocks: z.array(blockSchema),
  theme: themeSchema,
  siteTitle: z.string().optional(),
  siteDescription: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoCanonicalUrl: z.string().optional(),
  seoOgImage: z.string().optional()
});

export const siteConfigSchema = z
  .object({
    version: z.number().int().positive(),
    profile: profileSchema,
    sections: z.array(sectionSchema),
    blocks: z.array(blockSchema),
    theme: themeSchema,
    settings: settingsSchema,
    contentVariants: z.record(contentSnapshotSchema).optional().default({}),
    updatedAt: z.string()
  })
  .superRefine((config, ctx) => {
    const languageCodes = new Set<string>();
    for (const language of config.settings.languages.languages) {
      if (languageCodes.has(language.code)) {
        ctx.addIssue({ code: "custom", path: ["settings", "languages"], message: `Duplicate language code: ${language.code}` });
      }
      languageCodes.add(language.code);
    }
    if (!languageCodes.has(config.settings.languages.mainLocale)) {
      ctx.addIssue({ code: "custom", path: ["settings", "languages", "mainLocale"], message: "Main language must exist in languages" });
    }
    if (!config.settings.languages.languages.some((language) => language.code === config.settings.languages.mainLocale && language.isEnabled)) {
      ctx.addIssue({ code: "custom", path: ["settings", "languages", "mainLocale"], message: "Main language must be enabled" });
    }

    const variantIds = new Set<string>();
    const accessCodes = new Set<string>();
    for (const variant of config.settings.variants.variants) {
      const accessCode = variant.accessCode.trim().toLowerCase();
      if (variantIds.has(variant.id)) {
        ctx.addIssue({ code: "custom", path: ["settings", "variants"], message: `Duplicate variant id: ${variant.id}` });
      }
      variantIds.add(variant.id);
      const variantLanguageCodes = new Set<string>();
      for (const language of variant.languages ?? []) {
        if (variantLanguageCodes.has(language.code)) {
          ctx.addIssue({ code: "custom", path: ["settings", "variants", variant.id, "languages"], message: `Duplicate variant language code: ${language.code}` });
        }
        variantLanguageCodes.add(language.code);
      }
      if (variant.mainLocale && variant.languages?.length && !variantLanguageCodes.has(variant.mainLocale)) {
        ctx.addIssue({ code: "custom", path: ["settings", "variants", variant.id, "mainLocale"], message: "Variant main language must exist in that variant's languages" });
      }

      if (accessCode) {
        if (!/^[a-z0-9-]+$/.test(accessCode)) {
          ctx.addIssue({ code: "custom", path: ["settings", "variants", variant.id], message: "Access code can only use lowercase letters, numbers, and hyphens" });
        }
        if (reservedAccessCodes.has(accessCode)) {
          ctx.addIssue({ code: "custom", path: ["settings", "variants", variant.id], message: `Access code is reserved: ${accessCode}` });
        }
        if (accessCodes.has(accessCode)) {
          ctx.addIssue({ code: "custom", path: ["settings", "variants"], message: `Duplicate access code: ${accessCode}` });
        }
        accessCodes.add(accessCode);
      }
    }
    if (!variantIds.has(config.settings.variants.mainVariantId)) {
      ctx.addIssue({ code: "custom", path: ["settings", "variants", "mainVariantId"], message: "Main version must exist in variants" });
    }
    if (!config.settings.variants.variants.some((variant) => variant.id === config.settings.variants.mainVariantId && variant.isEnabled)) {
      ctx.addIssue({ code: "custom", path: ["settings", "variants", "mainVariantId"], message: "Main version must be enabled" });
    }

    const sectionIds = new Set<string>();
    const blockIds = new Set<string>();
    const moduleIds = new Set<string>();

    for (const section of config.sections) {
      if (sectionIds.has(section.id)) {
        ctx.addIssue({ code: "custom", path: ["sections"], message: `Duplicate section id: ${section.id}` });
      }
      sectionIds.add(section.id);
    }

    for (const block of config.blocks) {
      if (blockIds.has(block.id)) {
        ctx.addIssue({ code: "custom", path: ["blocks"], message: `Duplicate block id: ${block.id}` });
      }
      blockIds.add(block.id);

      if (block.sectionId !== topLevelBlockSectionId && !sectionIds.has(block.sectionId)) {
        ctx.addIssue({ code: "custom", path: ["blocks", block.id], message: `Unknown sectionId: ${block.sectionId}` });
      }
    }

    for (const profileModule of config.profile.moduleOrder) {
      if (moduleIds.has(profileModule)) {
        ctx.addIssue({ code: "custom", path: ["profile", "moduleOrder"], message: `Duplicate module: ${profileModule}` });
      }
      moduleIds.add(profileModule);
    }
  }) as z.ZodType<SiteConfig>;

const reservedAccessCodes = new Set(["admin", "api", "icon", "_next", "favicon.ico", "reset"]);

export function validateSiteConfig(data: unknown):
  | { success: true; data: SiteConfig }
  | { success: false; error: string } {
  const result = siteConfigSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    error: result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("\n")
  };
}
