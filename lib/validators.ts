import { z } from "zod";
import type { SiteConfig } from "@/types/site-config";
import { blockActionTypes, blockTypes } from "@/constants/block-types";
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
  type: z.enum(blockTypes as [string, ...string[]]),
  size: z.enum(blockSizes as [string, ...string[]]),
  responsiveSizes: z
    .object({
      desktop: z.enum(blockSizes as [string, ...string[]]).optional(),
      mobile: z.enum(blockSizes as [string, ...string[]]).optional()
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

const settingsSchema = z.object({
  siteTitle: z.string(),
  siteDescription: z.string(),
  enableImagePreview: z.boolean(),
  enableAnimation: z.boolean(),
  enablePublicShare: z.boolean(),
  topLevelBlocksSortOrder: z.number().int().nonnegative().optional()
});

export const siteConfigSchema = z
  .object({
    version: z.number().int().positive(),
    profile: profileSchema,
    sections: z.array(sectionSchema),
    blocks: z.array(blockSchema),
    theme: themeSchema,
    settings: settingsSchema,
    updatedAt: z.string()
  })
  .superRefine((config, ctx) => {
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
