import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";

const localPassword = "local-e2e-password-not-for-real-accounts";
const draftKey = "bio-blocks-studio:admin-draft:v1";

async function login(page: Page) {
  await page.goto("/admin/login");
  await page.getByRole("textbox", { name: "Admin password" }).fill(localPassword);
  await page.getByRole("button", { name: "Continue to editor" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("button", { name: "Project Settings" })).toBeVisible();
}

async function openSettings(page: Page, panel?: string) {
  await page.getByRole("button", { name: "Project Settings" }).click();
  await expect(page.getByRole("heading", { name: "Project Settings" })).toBeVisible();
  if (panel) await page.getByRole("button", { name: new RegExp(`^${panel}`) }).click();
}

async function closeSettings(page: Page) {
  await page.getByRole("heading", { name: "Project Settings" }).locator("../..").getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByRole("heading", { name: "Project Settings" })).toHaveCount(0);
}

function siteTitleInput(page: Page) {
  return page.getByText("Site Title", { exact: true }).locator("..").locator("input");
}

async function editScopedTitle(page: Page, title: string) {
  await openSettings(page, "Website & Domain");
  await siteTitleInput(page).fill(title);
  await expect(siteTitleInput(page)).toHaveValue(title);
  await closeSettings(page);
}

async function addVersionAndLanguage(page: Page) {
  await openSettings(page, "Versions & Languages");
  await page.getByRole("button", { name: "Add Version" }).click();
  await expect(page.getByRole("combobox", { name: "选择版本" }).locator("option")).toHaveCount(2);
  // The main version's language-plus button lives on its own card. This is a
  // user-created scope, not a direct mutation of app state or storage.
  await page.getByText("Languages in This Version", { exact: true }).first().locator("..").getByRole("button").click();
  await page.getByText("Language Code", { exact: true }).locator("..").locator("select").selectOption("zh-CN");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await expect(page.getByText("zh-CN", { exact: true }).first()).toBeVisible();
  await closeSettings(page);
  await expect(page.getByRole("combobox", { name: "选择版本" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "选择语言" })).toBeVisible();
}

async function draft(page: Page) {
  return page.evaluate((key) => window.localStorage.getItem(key), draftKey);
}

async function tabToRecoveryActions(page: Page) {
  const remaining = new Set(["Restore Draft", "Export Backup", "Discard Local Draft"]);
  for (let index = 0; index < 40 && remaining.size; index++) {
    await page.keyboard.press("Tab");
    const name = await page.evaluate(() => document.activeElement?.textContent?.trim() ?? "");
    if (remaining.has(name)) {
      await expect(page.getByRole("button", { name })).toBeFocused();
      remaining.delete(name);
    }
  }
  expect([...remaining], "Every recovery action must occur in real Tab order").toEqual([]);
}

test("local password login and missing-Blob state remain explicit", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.getByRole("textbox", { name: "Admin password" }).fill("not-the-test-password");
  await page.getByRole("button", { name: "Continue to editor" }).click();
  await expect(page.locator("#admin-login-error")).toContainText("password is incorrect");
  await page.getByRole("textbox", { name: "Admin password" }).fill(localPassword);
  await page.getByRole("button", { name: "Continue to editor" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.locator('section[role="status"]')).toContainText("Remote saving is not configured");
  await expect(page.locator('section[role="status"]')).toContainText("not published");
});

test("a version and two language scopes retain separate edits", async ({ page }) => {
  await login(page);
  await addVersionAndLanguage(page);
  const version = page.getByRole("combobox", { name: "选择版本" });
  const language = page.getByRole("combobox", { name: "选择语言" });
  const mainId = await version.inputValue();
  const secondId = await version.locator("option").last().getAttribute("value");
  expect(secondId).toBeTruthy();
  await language.selectOption("en");
  await editScopedTitle(page, "E2E English main scope");
  await language.selectOption("zh-CN");
  await editScopedTitle(page, "E2E Chinese main scope");
  await version.selectOption(secondId!);
  // A newly added version legitimately inherits main content until edited;
  // assert write isolation after creating its own snapshot.
  await editScopedTitle(page, "E2E second version scope");
  await openSettings(page, "Website & Domain");
  await expect(siteTitleInput(page)).toHaveValue("E2E second version scope");
  await closeSettings(page);
  await version.selectOption(mainId);
  await language.selectOption("en");
  await openSettings(page, "Website & Domain");
  await expect(siteTitleInput(page)).toHaveValue("E2E English main scope");
  await closeSettings(page);
  await language.selectOption("zh-CN");
  await openSettings(page, "Website & Domain");
  await expect(siteTitleInput(page)).toHaveValue("E2E Chinese main scope");
  await closeSettings(page);
  const saved = JSON.parse((await draft(page))!);
  expect(saved.config.settings.variants.variants).toHaveLength(2);
  expect(saved.config.contentVariants[`${mainId}:zh-CN`].siteTitle).toBe("E2E Chinese main scope");
});

test("failed save keeps the modal and draft; reload offers explicit recovery", async ({ page }) => {
  await login(page);
  await openSettings(page);
  await page.getByText("Project Name", { exact: true }).locator("..").locator("input").fill("E2E unpublished recovery");
  await expect.poll(() => draft(page)).not.toBeNull();
  const beforeSave = await draft(page);
  await page.getByRole("heading", { name: "Project Settings" }).locator("../..").getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("heading", { name: "Project Settings" })).toBeVisible();
  await expect(page.locator('section[role="alert"]')).toContainText("Blob token is missing");
  expect(await draft(page)).toBeTruthy();
  expect(JSON.parse((await draft(page))!).config.settings.projectName).toBe("E2E unpublished recovery");
  expect(beforeSave).toBeTruthy();
  await closeSettings(page);
  page.once("dialog", (dialog) => dialog.accept());
  await page.reload();
  await expect(page.getByRole("button", { name: "Restore Draft" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Save", exact: true })).toBeDisabled();
  await expect(page.getByText("E2E unpublished recovery", { exact: true })).toHaveCount(0);
  await tabToRecoveryActions(page);
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("button", { name: "Restore Draft" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByText("E2E unpublished recovery", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Export Backup" })).toBeVisible();
  expect(await draft(page)).toBeTruthy();
});

test("scoped export, invalid imports, and valid import have no remote write", async ({ page }) => {
  await login(page);
  await addVersionAndLanguage(page);
  const version = page.getByRole("combobox", { name: "选择版本" });
  const language = page.getByRole("combobox", { name: "选择语言" });
  const mainId = await version.inputValue();
  const secondId = (await version.locator("option").last().getAttribute("value"))!;
  await language.selectOption("en");
  await editScopedTitle(page, "E2E export other English title");
  await language.selectOption("zh-CN");
  await editScopedTitle(page, "E2E export target Chinese title");
  await version.selectOption(secondId);
  await editScopedTitle(page, "E2E export other version title");
  await version.selectOption(mainId);
  await language.selectOption("zh-CN");
  await openSettings(page, "Import / Export");
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export Current Scope" }).click();
  const exportFile = await downloaded;
  expect(exportFile.suggestedFilename()).toMatch(/\.json$/);
  const exported = JSON.parse(await readFile(await exportFile.path(), "utf8"));
  expect(exported.version).toBe(1);
  expect(exported.contentVariants).toEqual({});
  expect(exported.settings.siteTitle).toBe("E2E export target Chinese title");
  expect(JSON.stringify(exported)).not.toContain("E2E export other English title");
  expect(JSON.stringify(exported)).not.toContain("E2E export other version title");
  const input = page.locator('input[type="file"][accept="application/json,.json"]');
  let puts = 0;
  page.on("request", (request) => {
    if (request.method() === "PUT" && request.url().endsWith("/api/admin/config")) puts += 1;
  });
  await input.setInputFiles({ name: "malformed.json", mimeType: "application/json", buffer: Buffer.from("{bad") });
  await expect(page.getByText("Import Failed").last()).toBeVisible();
  await input.setInputFiles({ name: "invalid.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify({ version: 1 })) });
  await expect(page.getByText("Import Failed").last()).toBeVisible();
  const beforeImport = JSON.parse((await draft(page))!).config;
  expect(beforeImport.contentVariants[`${mainId}:zh-CN`].siteTitle).toBe("E2E export target Chinese title");
  exported.profile.displayName = "E2E imported scoped profile";
  exported.settings.siteTitle = "E2E imported target Chinese title";
  exported.settings.seoTitle = "E2E imported target Chinese title";
  await input.setInputFiles({ name: "valid.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(exported)) });
  await expect(page.getByText("Config Imported")).toBeVisible();
  await expect.poll(async () => {
    const raw = await draft(page);
    return raw ? JSON.parse(raw).config.contentVariants[`${mainId}:zh-CN`]?.profile.displayName : null;
  }).toBe("E2E imported scoped profile");
  const afterImport = JSON.parse((await draft(page))!).config;
  expect(afterImport.contentVariants[`${mainId}:zh-CN`].profile.displayName).toBe("E2E imported scoped profile");
  expect(afterImport.contentVariants[`${mainId}:zh-CN`].siteTitle).toBe("E2E imported target Chinese title");
  expect(afterImport.settings.siteTitle).toBe("E2E export other English title");
  expect(afterImport.contentVariants[`${secondId}:en`].siteTitle).toBe("E2E export other version title");
  expect(puts).toBe(0);
  await closeSettings(page);
  await language.selectOption("en");
  await openSettings(page, "Website & Domain");
  await expect(siteTitleInput(page)).toHaveValue("E2E export other English title");
  await closeSettings(page);
  await language.selectOption("zh-CN");
  await openSettings(page, "Website & Domain");
  await expect(siteTitleInput(page)).toHaveValue("E2E imported target Chinese title");
  await closeSettings(page);
});

test("unauthenticated config writes and uploads stay 401", async ({ request }) => {
  const configWrite = await request.put("/api/admin/config", { data: { version: 1 } });
  expect(configWrite.status()).toBe(401);
  const upload = await request.post("/api/admin/upload", {
    multipart: {
      folder: "blocks",
      file: { name: "test.png", mimeType: "image/png", buffer: Buffer.from([137, 80, 78, 71]) }
    }
  });
  expect(upload.status()).toBe(401);
});

for (const width of [390, 1280]) {
  test(`recovery controls remain keyboard reachable, 44px, and overflow-free at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await login(page);
    await openSettings(page);
    await page.getByText("Project Name", { exact: true }).locator("..").locator("input").fill(`E2E layout ${width}`);
    await expect.poll(() => draft(page)).not.toBeNull();
    await closeSettings(page);
    page.once("dialog", (dialog) => dialog.accept());
    await page.reload();
    const actions = ["Restore Draft", "Export Backup", "Discard Local Draft"];
    await tabToRecoveryActions(page);
    for (const name of actions) {
      const button = page.getByRole("button", { name });
      await expect(button).toBeVisible();
      const box = (await button.boundingBox())!;
      expect(box.height, `${name} height`).toBeGreaterThanOrEqual(44);
      expect(box.width, `${name} width`).toBeGreaterThanOrEqual(44);
    }
    for (const name of ["Project Settings", "Save"]) {
      const box = (await page.getByRole("button", { name, exact: true }).boundingBox())!;
      expect(box.height, `${name} height`).toBeGreaterThanOrEqual(44);
      expect(box.width, `${name} width`).toBeGreaterThanOrEqual(44);
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    await expect(page.getByRole("button", { name: "Discard Local Draft" })).toBeFocused();
    await page.keyboard.press("Enter");
    expect(await draft(page)).toBeNull();
  });
}
