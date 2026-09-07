import type { SiteConfig } from "../types/site-config.ts";

export const adminDraftStorageKey = "bio-blocks-studio:admin-draft:v1";
export const adminDraftVersion = 1;

export type AdminDraftEnvelope = {
  version: typeof adminDraftVersion;
  savedAt: string;
  accessCodesRedacted: true;
  config: SiteConfig;
};

export type AdminDraftParseResult =
  | { status: "empty" }
  | { status: "invalid"; reason: "malformed" | "unsupported-version" | "invalid-shape" | "invalid-config"; detail?: string }
  | { status: "ready"; draft: AdminDraftEnvelope };

type SiteConfigValidationResult =
  | { success: true; data: SiteConfig }
  | { success: false; error: string };

export function serializeAdminDraft(config: SiteConfig, savedAt = new Date().toISOString()) {
  return JSON.stringify({
    version: adminDraftVersion,
    savedAt,
    accessCodesRedacted: true,
    config: redactAccessCodes(config)
  } satisfies AdminDraftEnvelope);
}

export function restoreAdminDraftConfig(draftConfig: SiteConfig, currentConfig: SiteConfig): SiteConfig {
  const currentAccessCodes = new Map(
    currentConfig.settings.variants.variants.map((variant) => [variant.id, variant.accessCode])
  );

  return {
    ...draftConfig,
    settings: {
      ...draftConfig.settings,
      variants: {
        ...draftConfig.settings.variants,
        variants: draftConfig.settings.variants.variants.map((variant) => ({
          ...variant,
          accessCode: currentAccessCodes.get(variant.id) ?? ""
        }))
      }
    }
  };
}

export function parseAdminDraft(
  raw: string | null | undefined,
  validate: (data: unknown) => SiteConfigValidationResult
): AdminDraftParseResult {
  if (!raw) return { status: "empty" };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { status: "invalid", reason: "malformed" };
  }

  if (!parsed || typeof parsed !== "object") {
    return { status: "invalid", reason: "invalid-shape" };
  }

  const record = parsed as Record<string, unknown>;
  if (record.version !== adminDraftVersion) {
    return { status: "invalid", reason: "unsupported-version" };
  }

  if (
    typeof record.savedAt !== "string" ||
    !Number.isFinite(Date.parse(record.savedAt)) ||
    record.accessCodesRedacted !== true ||
    !("config" in record)
  ) {
    return { status: "invalid", reason: "invalid-shape" };
  }

  const result = validate(record.config);
  if (!result.success) {
    return { status: "invalid", reason: "invalid-config", detail: result.error };
  }

  return {
    status: "ready",
    draft: {
      version: adminDraftVersion,
      savedAt: record.savedAt,
      accessCodesRedacted: true,
      config: result.data
    }
  };
}

function redactAccessCodes(config: SiteConfig): SiteConfig {
  return {
    ...config,
    settings: {
      ...config.settings,
      variants: {
        ...config.settings.variants,
        variants: config.settings.variants.variants.map((variant) => ({ ...variant, accessCode: "" }))
      }
    }
  };
}
