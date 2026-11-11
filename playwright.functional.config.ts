import { defineConfig, devices } from "@playwright/test";

const recordAllArtifacts = process.env.PLAYWRIGHT_RECORD_ALL === "1";
const baseURL = "http://localhost:3000";

export default defineConfig({
  testDir: "./tests/functional",
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    locale: "en-US",
    trace: recordAllArtifacts ? "on" : "retain-on-failure",
    video: recordAllArtifacts ? "on" : "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: {
    command: "yarn dev -p 3000",
    env: { NEXT_PUBLIC_APPS_SCRIPT_URL: "https://apps-script.test/exec" },
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
