import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

const systemChrome = ["/usr/bin/google-chrome", "/usr/bin/google-chrome-stable"].find(existsSync);
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || systemChrome;

export default defineConfig({
  testDir: "./tests/e2e",
  use: { baseURL: "http://127.0.0.1:3000", launchOptions: { ...(executablePath ? { executablePath } : {}) } },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" } },
  ],
  webServer: [
    { command: "npm start", url: "http://127.0.0.1:3000", reuseExistingServer: !process.env.CI },
    { command: "npx vite --config tests/e2e/vite.config.mts --host 127.0.0.1", url: "http://127.0.0.1:4173/portfolio-fixture.html", reuseExistingServer: !process.env.CI },
  ],
});
