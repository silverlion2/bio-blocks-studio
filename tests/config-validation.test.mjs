import assert from 'node:assert/strict';
import test from 'node:test';
import { defaultSiteConfig } from '../lib/default-site-config.ts';
import { validateSiteConfig } from '../lib/validators.ts';
import { getSiteContentSnapshot, normalizeContentFlowConfig } from '../lib/utils.ts';
import { parseAdminDraft, serializeAdminDraft } from '../lib/admin-draft.ts';

const fresh = () => structuredClone(defaultSiteConfig);

test('actual default config normalizes and survives the real recovery validator', () => {
  const config = normalizeContentFlowConfig(fresh());
  const parsed = validateSiteConfig(config);
  assert.equal(parsed.success, true);
  const restored = parseAdminDraft(serializeAdminDraft(config), validateSiteConfig);
  assert.equal(restored.status, 'ready');
  assert.deepEqual(restored.draft.config.profile, config.profile);
  // Recovery is JSON-backed: properties whose value is undefined are omitted.
  assert.deepEqual(restored.draft.config.blocks, JSON.parse(JSON.stringify(config.blocks)));
});

test('legacy defaults and sparse visibility remain valid without widening allowed keys', () => {
  const config = fresh();
  delete config.settings.languages;
  delete config.settings.variants;
  delete config.settings.projectName;
  delete config.contentVariants;
  config.profile.visibleModules = { name: true };
  const result = validateSiteConfig(config);
  assert.equal(result.success, true);
  assert.equal(result.data.settings.languages.mainLocale, 'zh-CN');
  assert.equal(result.data.settings.variants.mainVariantId, 'main');
  assert.equal(result.data.settings.projectName, 'Bio Template Editor');
  assert.deepEqual(result.data.contentVariants, {});
  assert.deepEqual(result.data.profile.visibleModules, { name: true });
  config.profile.visibleModules.unrecognizedModule = true;
  assert.equal(validateSiteConfig(config).success, false);
});

test('metadata and language records retain arbitrary supported values in scoped snapshots', () => {
  const config = fresh();
  config.blocks[0].metadata = { nested: { count: 3 }, list: ['item', null], enabled: false };
  config.settings.variants.variants[0].languageSettings = { en: { isEnabled: true }, fr: { isEnabled: false } };
  config.contentVariants = { 'main:fr': getSiteContentSnapshot(config) };
  const parsed = validateSiteConfig(config);
  assert.equal(parsed.success, true);
  assert.deepEqual(parsed.data.contentVariants['main:fr'].blocks[0].metadata, config.blocks[0].metadata);
  assert.equal(parsed.data.settings.variants.variants[0].languageSettings.fr.isEnabled, false);
  config.contentVariants['main:fr'].profile.displayName = 123;
  assert.equal(validateSiteConfig(config).success, false);
});

test('safe links remain valid and executable schemes remain rejected', () => {
  for (const href of ['/work/example', 'https://example.com', 'http://example.com', 'mailto:test@example.com', 'tel:+123']) {
    const config = fresh();
    config.profile.socialLinks[0].href = href;
    assert.equal(validateSiteConfig(config).success, true, href);
  }
  for (const href of ['javascript:alert(1)', 'data:text/html,test', 'file:///tmp/example']) {
    const config = fresh();
    config.profile.socialLinks[0].href = href;
    assert.equal(validateSiteConfig(config).success, false, href);
  }
});

test('duplicate identities and invalid references still fail with field errors', () => {
  const cases = [
    config => config.blocks.push(structuredClone(config.blocks[0])),
    config => { config.blocks[0].sectionId = 'missing-section'; },
    config => config.profile.moduleOrder.push(config.profile.moduleOrder[0]),
    config => config.settings.languages.languages.push(structuredClone(config.settings.languages.languages[0])),
    config => { config.settings.languages.mainLocale = 'missing-language'; },
    config => config.settings.variants.variants.push(structuredClone(config.settings.variants.variants[0])),
    config => { config.settings.variants.mainVariantId = 'missing-version'; },
    config => { config.settings.variants.variants[0].accessCode = 'admin'; },
  ];
  for (const mutate of cases) {
    const config = fresh();
    mutate(config);
    const result = validateSiteConfig(config);
    assert.equal(result.success, false);
    assert.ok(result.error.length > 0);
  }
});

test('unknown JSON input and invalid record values return validation failure without throwing', () => {
  for (const input of [null, false, 1, 'text', [], {}, { settings: null }]) {
    assert.equal(validateSiteConfig(input).success, false);
  }
  const config = fresh();
  config.settings.variants.variants[0].languageSettings = { en: { isEnabled: 'yes' } };
  assert.equal(validateSiteConfig(config).success, false);
});
