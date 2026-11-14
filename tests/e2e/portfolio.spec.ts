import { expect, test } from "@playwright/test";

const fixture = "http://127.0.0.1:4173/portfolio-fixture.html";

test("mocked portfolio editor saves profiles, orders approved work and previews the private draft", async ({ page }) => {
  await page.goto(fixture);
  await expect(page.getByText("http://127.0.0.1:4173/p/jane-dev")).toBeVisible();
  await expect(page.getByLabel("Display name")).toHaveValue("Jane Developer");
  await expect(page.getByRole("checkbox", { name: "Include jane/pending" })).toBeDisabled();
  await page.getByLabel("Display name").fill("Jane Lovelace");
  await page.getByLabel("Professional headline").fill("Product minded engineer");
  await page.getByRole("checkbox", { name: "Include jane/one" }).check();
  await page.getByRole("checkbox", { name: "Include jane/two" }).check();
  await page.getByRole("button", { name: "Move jane/two up" }).click();
  await page.getByRole("button", { name: "Save draft" }).click();
  await expect(page.getByRole("status")).toContainText("Draft saved");
  await page.getByRole("button", { name: "Preview", exact: true }).click();
  await expect(page.getByText("PRIVATE PREVIEW · ONLY YOU CAN SEE THIS")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Jane Lovelace" })).toBeVisible();
  const projectHeadings = await page.locator("section article h3").allTextContents();
  expect(projectHeadings).toEqual(["Second approved project", "First approved project"]);
});

test("mocked publish flow keeps draft changes private until republished, supports sharing and unpublishes", async ({ page }) => {
  await page.goto(fixture);
  await page.getByRole("checkbox", { name: "Include jane/one" }).check();
  await page.getByRole("checkbox", { name: "Include jane/two" }).check();
  await page.getByRole("button", { name: "Move jane/two up" }).click();
  await page.getByRole("button", { name: "Publish portfolio" }).click();
  await expect(page.getByRole("status")).toContainText("Portfolio published");
  await page.getByRole("button", { name: "Public portfolio" }).click();
  await expect(page.getByRole("heading", { name: "Jane Developer" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Second approved project" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  await page.getByRole("button", { name: "Editor", exact: true }).click();
  await page.getByLabel("Display name").fill("Jane Updated");
  await page.getByLabel("Public URL slug").fill("jane-updated");
  await page.getByRole("button", { name: "Save draft" }).click();
  await expect(page.getByRole("status")).toContainText("Draft saved");
  await expect(page.getByRole("link", { name: "Visit public page" })).toHaveAttribute("href", "/p/jane-dev");
  await expect(page.getByLabel("Public URL slug").locator("..")).toContainText("http://127.0.0.1:4173/p/jane-dev");
  await page.getByRole("button", { name: "Public portfolio" }).click();
  await expect(page.getByRole("heading", { name: "Jane Developer" })).toBeVisible();
  await page.getByRole("button", { name: "Editor", exact: true }).click();
  await page.getByRole("button", { name: "Share / copy link" }).click();
  expect(await page.evaluate(() => (window as Window & { __shared?: boolean }).__shared)).toBe(true);
  expect(await page.evaluate(() => (window as Window & { __sharedUrl?: string }).__sharedUrl)).toBe("http://127.0.0.1:4173/p/jane-dev");
  await page.getByRole("button", { name: "Publish updates" }).click();
  await expect(page.getByRole("status")).toContainText("Portfolio published");
  await expect(page.getByRole("link", { name: "Visit public page" })).toHaveAttribute("href", "/p/jane-updated");
  await page.getByRole("button", { name: "Public portfolio" }).click();
  await expect(page.getByRole("heading", { name: "Jane Updated" })).toBeVisible();
  await page.getByRole("button", { name: "Editor", exact: true }).click();
  await page.getByRole("button", { name: "Unpublish" }).click();
  await expect(page.getByRole("status")).toContainText("Portfolio unpublished");
  await page.getByRole("button", { name: "Public portfolio" }).click();
  await expect(page.getByRole("heading", { name: "Portfolio not found" })).toBeVisible();
});

test("mocked share control falls back to copying the published link", async ({ page }) => {
  await page.goto(fixture);
  await page.getByRole("checkbox", { name: "Include jane/one" }).check();
  await page.getByRole("button", { name: "Publish portfolio" }).click();
  await expect(page.getByRole("status")).toContainText("Portfolio published");
  await page.evaluate(() => {
    Object.defineProperty(navigator, "share", { configurable: true, value: undefined });
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async (value: string) => { (window as Window & { __copied?: string }).__copied = value; } } });
  });
  await page.getByRole("button", { name: "Share / copy link" }).click();
  await expect(page.getByRole("status")).toContainText("Public portfolio link copied");
  expect(await page.evaluate(() => (window as Window & { __copied?: string }).__copied)).toBe("http://127.0.0.1:4173/p/jane-dev");
});
