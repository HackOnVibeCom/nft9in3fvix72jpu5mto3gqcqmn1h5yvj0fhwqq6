import { expect, test } from "@playwright/test";
test("landing and login render without overflow", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Turn your projects into proof of your skills." })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("landing.png"), fullPage: true });
  await page.getByRole("link", { name: "Sign in with GitHub" }).click();
  await expect(page.getByRole("heading", { name: "Welcome to SkillLoop." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in with GitHub" })).toBeVisible();
});
for (const path of ["/dashboard", "/dashboard/projects", "/dashboard/portfolio", "/dashboard/portfolio/preview", "/dashboard/analytics"]) {
  test(`${path} redirects unauthenticated visitors`, async ({ page }) => { await page.goto(path); await expect(page).toHaveURL(/\/login$/); });
}
test("authentication errors are safe and readable", async ({ page }) => { await page.goto("/login?error=OAuthCallback"); await expect(page.getByRole("alert").filter({ hasText: /sign-in|GitHub/i })).toBeVisible(); await expect(page.locator("body")).not.toContainText("stack trace"); });
