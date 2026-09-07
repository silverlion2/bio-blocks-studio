import assert from "node:assert/strict";
import test from "node:test";
import {
  adminDraftVersion,
  parseAdminDraft,
  restoreAdminDraftConfig,
  serializeAdminDraft
} from "../lib/admin-draft.ts";
import type { SiteConfig } from "../types/site-config.ts";

const config = {
  version: 1,
  marker: "safe-public-content",
  settings: { variants: { variants: [{ id: "private", accessCode: "do-not-persist" }] } }
} as unknown as SiteConfig;
const acceptConfig = (data: unknown) => ({ success: true as const, data: data as SiteConfig });

test("empty browser storage has no recovery draft", () => {
  assert.deepEqual(parseAdminDraft(null, acceptConfig), { status: "empty" });
});

test("a versioned draft round-trips through validation without persisting access codes", () => {
  const savedAt = "2026-09-08T08:00:00.000Z";
  const result = parseAdminDraft(serializeAdminDraft(config, savedAt), acceptConfig);

  assert.equal(result.status, "ready");
  if (result.status !== "ready") return;
  assert.equal(result.draft.version, adminDraftVersion);
  assert.equal(result.draft.savedAt, savedAt);
  assert.equal(result.draft.accessCodesRedacted, true);
  assert.equal(result.draft.config.settings.variants.variants[0]?.accessCode, "");
  assert.doesNotMatch(serializeAdminDraft(config, savedAt), /do-not-persist/);
});

test("restoring a draft retains only access codes from the current server config", () => {
  const draftConfig = {
    ...config,
    settings: {
      ...config.settings,
      variants: {
        ...config.settings.variants,
        variants: [
          { id: "private", accessCode: "" },
          { id: "new-draft-variant", accessCode: "" }
        ]
      }
    }
  } as SiteConfig;
  const restored = restoreAdminDraftConfig(draftConfig, config);

  assert.equal(restored.settings.variants.variants[0]?.accessCode, "do-not-persist");
  assert.equal(restored.settings.variants.variants[1]?.accessCode, "");
});

test("malformed JSON is rejected without invoking config validation", () => {
  let validationCalls = 0;
  const result = parseAdminDraft("{not-json", () => {
    validationCalls += 1;
    return { success: true as const, data: config };
  });

  assert.deepEqual(result, { status: "invalid", reason: "malformed" });
  assert.equal(validationCalls, 0);
});

test("unsupported draft versions and invalid timestamps are rejected", () => {
  assert.deepEqual(
    parseAdminDraft(JSON.stringify({ version: 2, savedAt: new Date().toISOString(), config }), acceptConfig),
    { status: "invalid", reason: "unsupported-version" }
  );
  assert.deepEqual(
    parseAdminDraft(JSON.stringify({ version: 1, savedAt: "not-a-date", config }), acceptConfig),
    { status: "invalid", reason: "invalid-shape" }
  );
});

test("legacy drafts that may contain access codes are rejected", () => {
  const legacyDraft = JSON.stringify({ version: 1, savedAt: new Date().toISOString(), config });
  assert.deepEqual(parseAdminDraft(legacyDraft, acceptConfig), { status: "invalid", reason: "invalid-shape" });
});

test("a draft that fails SiteConfig validation is never restored", () => {
  const result = parseAdminDraft(
    serializeAdminDraft(config),
    () => ({ success: false as const, error: "settings.projectName: Required" })
  );

  assert.deepEqual(result, {
    status: "invalid",
    reason: "invalid-config",
    detail: "settings.projectName: Required"
  });
});
