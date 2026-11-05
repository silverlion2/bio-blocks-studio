import { test, expect, type Page, type Route } from '@playwright/test';

const browserErrors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }, testInfo) => {
  const errors: string[] = [];
  browserErrors.set(page, errors);
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (testInfo.title.includes('network failure') && text.includes('net::ERR_INTERNET_DISCONNECTED')) return;
    if (testInfo.title.includes('missing storage') && text.includes('400 (Bad Request)')) return;
    errors.push(text);
  });
});
test.afterEach(async ({ page }) => {
  expect(browserErrors.get(page)).toEqual([]);
});

async function openEditor(page: Page) {
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    return url.origin === 'http://127.0.0.1:3179' || url.protocol === 'data:'
      ? route.continue() : route.fulfill({ status: 204, body: '' });
  });
  await page.goto('/admin/login');
  await page.locator('#admin-password').fill('local-e2e-password-not-for-real-accounts');
  await page.locator('button[type=submit]').click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole('button', { name: 'Project Settings', exact: true })).toBeVisible();
  await expect(page).toHaveTitle('Site Editor');
  await expect(page.locator('main')).not.toBeEmpty();
  await expect(page.locator('nextjs-dialog')).toHaveCount(0);
  await expect(page.locator('header').getByText('Saved', { exact: true })).toBeVisible();
}

async function openSettings(page: Page) {
  await page.getByRole('button', { name: 'Project Settings', exact: true }).click();
}

function projectName(page: Page) {
  return page.getByText('Project Name', { exact: true }).locator('..').locator('input');
}

async function saveResponse(route: Route) {
  await route.fulfill({ json: { success: true, updatedAt: new Date().toISOString() } });
}

test('a completed old save does not mark newer edits saved', async ({ page }, testInfo) => {
  await openEditor(page);
  await openSettings(page);
  await projectName(page).fill('Synthetic draft A');
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  let finish!: () => Promise<void>;
  let submitted: Record<string, unknown> | undefined;
  await page.route('**/api/admin/config', async route => {
    submitted = route.request().postDataJSON();
    await new Promise<void>(resolve => { finish = async () => { await saveResponse(route); resolve(); }; });
  });
  await page.locator('header').getByRole('button', { name: 'Save', exact: true }).click();
  await expect.poll(() => Boolean(finish)).toBe(true);
  expect((submitted?.settings as { projectName: string }).projectName).toBe('Synthetic draft A');
  await openSettings(page);
  await projectName(page).fill('Synthetic draft B');
  await finish();
  await expect(page.locator('header').getByRole('button', { name: 'Save', exact: true })).toBeEnabled();
  await expect(page.locator('header').getByText('Unsaved Changes', { exact: true })).toBeVisible();
  await expect(projectName(page)).toHaveValue('Synthetic draft B');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('bio-blocks-studio:admin-draft:v1'))).toContain('Synthetic draft B');
  await page.screenshot({ path: testInfo.outputPath('desktop-newer-draft-retained.png') });
  await page.unroute('**/api/admin/config');
  await page.route('**/api/admin/config', async route => {
    expect(route.request().postDataJSON().settings.projectName).toBe('Synthetic draft B');
    await saveResponse(route);
  });
  await page.getByRole('button', { name: 'Save', exact: true }).last().click();
  await expect(page.locator('header').getByText('Saved', { exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('bio-blocks-studio:admin-draft:v1'))).toBeNull();
});

test('network failure releases saving and keeps the editor open for retry', async ({ page }) => {
  await openEditor(page);
  await openSettings(page);
  await projectName(page).fill('Synthetic retry draft');
  await page.route('**/api/admin/config', route => route.abort('internetdisconnected'));
  await page.getByRole('button', { name: 'Save', exact: true }).last().click();
  await expect(page.getByRole('button', { name: 'Save', exact: true }).last()).toBeEnabled();
  await expect(page.getByText('Save Failed', { exact: true })).toBeVisible();
  await expect(projectName(page)).toHaveValue('Synthetic retry draft');
  await expect(page.locator('header').getByText('Unsaved Changes', { exact: true })).toBeVisible();
  await page.unroute('**/api/admin/config');
  await page.route('**/api/admin/config', saveResponse);
  await page.getByRole('button', { name: 'Save', exact: true }).last().click();
  await expect(page.locator('header').getByText('Saved', { exact: true })).toBeVisible();
});

test('a malformed success response never acknowledges the draft', async ({ page }) => {
  await openEditor(page);
  await openSettings(page);
  await projectName(page).fill('Synthetic invalid response');
  await page.route('**/api/admin/config', route => route.fulfill({ status: 200, body: 'not JSON' }));
  await page.getByRole('button', { name: 'Save', exact: true }).last().click();
  await expect(page.getByText('Save Failed', { exact: true })).toBeVisible();
  await expect(projectName(page)).toHaveValue('Synthetic invalid response');
  await expect(page.locator('header').getByText('Unsaved Changes', { exact: true })).toBeVisible();
});

test('a success flag without a server timestamp does not clear the recovery draft', async ({ page }) => {
  await openEditor(page);
  await openSettings(page);
  await projectName(page).fill('Draft without acknowledgment');
  await page.route('**/api/admin/config', route => route.fulfill({ json: { success: true } }));
  await page.getByRole('button', { name: 'Save', exact: true }).last().click();
  await expect(page.getByText('Save Failed', { exact: true })).toBeVisible();
  await expect(projectName(page)).toHaveValue('Draft without acknowledgment');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('bio-blocks-studio:admin-draft:v1'))).toContain('Draft without acknowledgment');
});

async function openImportPanel(page: Page) {
  await openSettings(page);
  await page.getByRole('button', { name: /^Import \/ Export/ }).click();
}

async function sourceConfig(page: Page) {
  const response = await page.evaluate(async () => {
    const result = await fetch('/api/admin/config');
    return { status: result.status, data: await result.json() };
  });
  expect(response.status).toBe(200);
  return response.data;
}

async function exportScope(page: Page) {
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export Current Scope', exact: true }).click();
  const download = await pending;
  expect(download.suggestedFilename()).toMatch(/\.json$/);
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  return JSON.parse(Buffer.concat(chunks).toString());
}

test('invalid import preserves the draft and scoped JSON exports round trip', async ({ page }) => {
  await openEditor(page);
  const original = await sourceConfig(page);
  await openImportPanel(page);
  await page.locator('input[type=file][accept="application/json,.json"]').setInputFiles({ name: 'invalid.json', mimeType: 'application/json', buffer: Buffer.from('{') });
  await expect(page.getByText('Import Failed', { exact: true })).toBeVisible();
  expect((await exportScope(page)).profile).toEqual(original.profile);
  await expect(page.locator('header').getByText('Saved', { exact: true })).toBeVisible();
  const imported = structuredClone(original);
  imported.profile.displayName = 'Synthetic imported scope';
  imported.settings.projectName = 'Must not replace global settings';
  await page.locator('input[type=file][accept="application/json,.json"]').setInputFiles({ name: 'scope.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(imported)) });
  await expect(page.getByText('Config Imported', { exact: true })).toBeVisible();
  const exported = await exportScope(page);
  expect(exported.profile.displayName).toBe('Synthetic imported scope');
  expect(exported.settings.projectName).toBe(original.settings.projectName);
  expect(exported.contentVariants).toEqual({});
  await expect(page.locator('header').getByText('Unsaved Changes', { exact: true })).toBeVisible();
});

async function delayImport(page: Page) {
  await page.addInitScript(() => {
    const read = File.prototype.text;
    File.prototype.text = async function () {
      const text = await read.call(this);
      if (this.name !== 'delayed.json') return text;
      return new Promise<string>(resolve => {
        Object.defineProperty(window, 'releaseDelayedImport', { configurable: true, value: () => resolve(text) });
      });
    };
  });
}

async function releaseImport(page: Page) {
  await page.evaluate(() => (window as unknown as { releaseDelayedImport: () => void }).releaseDelayedImport());
}

test('editing during a file read cancels import and preserves the newer draft', async ({ page }) => {
  await delayImport(page);
  await openEditor(page);
  const original = await sourceConfig(page);
  const incoming = structuredClone(original);
  incoming.profile.displayName = 'Stale file content';
  await openImportPanel(page);
  await page.locator('input[type=file][accept="application/json,.json"]').setInputFiles({ name: 'delayed.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(incoming)) });
  await expect.poll(() => page.evaluate(() => 'releaseDelayedImport' in window)).toBe(true);
  await page.getByRole('button', { name: /^Basic & Editor/ }).click();
  await projectName(page).fill('Newer draft must survive');
  await releaseImport(page);
  await expect(page.getByText(/The draft or scope changed while reading/)).toBeVisible();
  await expect(projectName(page)).toHaveValue('Newer draft must survive');
  await page.getByRole('button', { name: /^Import \/ Export/ }).click();
  expect((await exportScope(page)).profile).toEqual(original.profile);
});

test('only the newest selected import may complete', async ({ page }) => {
  await delayImport(page);
  await openEditor(page);
  const incoming = await sourceConfig(page);
  await openImportPanel(page);
  const input = page.locator('input[type=file][accept="application/json,.json"]');
  incoming.profile.displayName = 'Superseded import';
  await input.setInputFiles({ name: 'delayed.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(incoming)) });
  await expect.poll(() => page.evaluate(() => 'releaseDelayedImport' in window)).toBe(true);
  incoming.profile.displayName = 'Latest selected import';
  await input.setInputFiles({ name: 'latest.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(incoming)) });
  await expect(page.getByText('Config Imported', { exact: true })).toBeVisible();
  await releaseImport(page);
  expect((await exportScope(page)).profile.displayName).toBe('Latest selected import');
});

test('changing the selected version during import cannot overwrite either scope', async ({ page }) => {
  await delayImport(page);
  await openEditor(page);
  const original = await sourceConfig(page);
  await openSettings(page);
  await page.getByRole('button', { name: /^Versions & Languages/ }).click();
  await page.getByRole('button', { name: 'Add Version', exact: true }).click();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await openImportPanel(page);
  const incoming = structuredClone(original);
  incoming.profile.displayName = 'Wrong scope import';
  await page.locator('input[type=file][accept="application/json,.json"]').setInputFiles({ name: 'delayed.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(incoming)) });
  await expect.poll(() => page.evaluate(() => 'releaseDelayedImport' in window)).toBe(true);
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('combobox', { name: '选择版本', exact: true }).selectOption('v2');
  await releaseImport(page);
  await expect(page.getByText(/The draft or scope changed while reading/)).toBeVisible();
  for (const scope of ['v2', original.settings.variants.mainVariantId]) {
    await page.getByRole('combobox', { name: '选择版本', exact: true }).selectOption(scope);
    await openImportPanel(page);
    expect((await exportScope(page)).profile.displayName).toBe(original.profile.displayName);
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  }
});

test('version and language imports preserve other scopes in the saved document', async ({ page }) => {
  await openEditor(page);
  const original = await sourceConfig(page);
  await openSettings(page);
  await page.getByRole('button', { name: /^Versions & Languages/ }).click();
  await page.getByRole('button', { name: 'Add Version', exact: true }).click();
  await page.getByText('Languages in This Version', { exact: true }).last().locator('..').getByRole('button').click();
  await page.getByText('Language Code', { exact: true }).locator('..').locator('select').selectOption('zh-CN');
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('combobox', { name: '选择版本', exact: true }).selectOption('v2');
  await page.getByRole('combobox', { name: '选择语言', exact: true }).selectOption('zh-CN');
  await openImportPanel(page);
  const incoming = structuredClone(original);
  incoming.profile.displayName = 'Only version two Chinese';
  await page.locator('input[type=file][accept="application/json,.json"]').setInputFiles({ name: 'scope.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(incoming)) });
  await expect(page.getByText('Config Imported', { exact: true })).toBeVisible();
  expect((await exportScope(page)).profile.displayName).toBe('Only version two Chinese');
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('combobox', { name: '选择语言', exact: true }).selectOption('en');
  await openImportPanel(page);
  expect((await exportScope(page)).profile.displayName).toBe(original.profile.displayName);
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('combobox', { name: '选择版本', exact: true }).selectOption(original.settings.variants.mainVariantId);
  await page.route('**/api/admin/config', async route => {
    const saved = route.request().postDataJSON();
    expect(saved.profile.displayName).toBe(original.profile.displayName);
    expect(saved.contentVariants['v2:zh-CN'].profile.displayName).toBe('Only version two Chinese');
    expect(saved.settings.variants.variants).toHaveLength(2);
    await saveResponse(route);
  });
  await page.locator('header').getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.locator('header').getByText('Saved', { exact: true })).toBeVisible();
});

for (const width of [320, 390]) {
  test(`mobile header keeps project identity and save state readable at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 844 });
    await openEditor(page);
    const header = page.locator('header');
    const saved = header.getByText('Saved', { exact: true });
    const title = saved.locator('..').locator('p').first();
    expect((await title.boundingBox())!.width).toBeGreaterThanOrEqual(120);
    await openSettings(page);
    await projectName(page).fill('Readable mobile project');
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    const unsaved = header.getByText('Unsaved Changes', { exact: true });
    await expect(unsaved).toBeVisible();
    expect(await unsaved.evaluate(element => element.clientWidth > 0 && element.scrollWidth <= element.clientWidth)).toBe(true);
    for (const name of ['Project Settings', 'Save']) {
      const button = header.getByRole('button', { name, exact: true });
      await expect(button).toBeVisible();
      const box = (await button.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
      const statusBox = (await unsaved.boundingBox())!;
      expect(box.x >= statusBox.x + statusBox.width || statusBox.x >= box.x + box.width || box.y >= statusBox.y + statusBox.height || statusBox.y >= box.y + box.height).toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByText('Signed in', { exact: true })).not.toBeVisible({ timeout: 10_000 });
    await page.screenshot({ path: testInfo.outputPath(`mobile-header-${width}.png`) });
  });
}

test('real API rejects unauthorized saves and missing storage preserves a mobile draft', async ({ page, request }, testInfo) => {
  expect((await request.put('/api/admin/config', { data: {} })).status()).toBe(401);
  await page.setViewportSize({ width: 390, height: 844 });
  await openEditor(page);
  await openSettings(page);
  await projectName(page).fill('Synthetic mobile draft');
  const response = page.waitForResponse(r => r.url().endsWith('/api/admin/config') && r.request().method() === 'PUT');
  await page.getByRole('button', { name: 'Save', exact: true }).last().click();
  expect((await response).status()).toBe(400);
  await expect(page.getByText('Save Failed', { exact: true })).toBeVisible();
  await expect(projectName(page)).toHaveValue('Synthetic mobile draft');
  await expect(page.locator('header').getByText('Unsaved Changes', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('mobile-save-recovery.png') });
});
