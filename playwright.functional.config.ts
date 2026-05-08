import { defineConfig, devices } from "@playwright/test";

const recordAllArtifacts = process.env.PLAYWRIGHT_RECORD_ALL === "1";

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
    baseURL: "http://127.0.0.1:3000",
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
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
