import { defineConfig, devices } from "@playwright/test";

const port = 3179;
const baseURL = `http://127.0.0.1:${port}`;
if (process.env.BIO_E2E_LOCAL_SERVER !== "1") {
  throw new Error("Use npm run test:e2e to start the exclusive local production server.");
}

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  outputDir: "output/playwright/test-results",
  use: {
    ...devices["Desktop Chrome"],
    baseURL,
    locale: "en-US",
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  }
});
