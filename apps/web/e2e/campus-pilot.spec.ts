import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("critical student journey", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Your syllabus already knows/ }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Explore the demo" }).click();
  await expect(
    page.getByRole("heading", { name: /Good morning/ }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Import syllabus" }).click();
  await page.locator("input[type=file]").setInputFiles({
    name: "BIO214_Syllabus_Fall2026.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4 CampusPilot synthetic syllabus"),
  });
  await expect(
    page.getByRole("button", { name: "Review extracted details" }),
  ).toBeVisible({ timeout: 10_000 });
  await page.getByRole("button", { name: "Review extracted details" }).click();
  await expect(
    page.getByRole("heading", { name: "Check what we found." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Accept 90%+" }).click();
  const remainingAccept = page.getByRole("button", {
    name: "Accept",
    exact: true,
  });
  await remainingAccept.click();
  await expect(
    page.getByRole("button", { name: "Confirm and create course" }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Confirm and create course" }).click();
  await expect(
    page.getByRole("button", { name: /Course created/ }),
  ).toBeVisible();
  await page.goto("/app/study-plan");
  await page.getByRole("button", { name: "Rebalance week" }).click();
  await expect(page.getByText(/Friday’s load is now spread/)).toBeVisible();
  await page.goto("/app/today");
  await page.getByRole("button", { name: "Complete" }).first().click();
  await expect(
    page.getByRole("button", { name: "Undo" }).first(),
  ).toBeVisible();
});

test("primary pages have no serious accessibility violations", async ({
  page,
}) => {
  for (const route of [
    "/",
    "/app/today",
    "/app/calendar",
    "/app/review/demo",
  ]) {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .exclude(".paper-preview")
      .analyze();
    expect(
      results.violations.filter((violation) =>
        ["serious", "critical"].includes(violation.impact ?? ""),
      ),
    ).toEqual([]);
  }
});

test("offline shell keeps the agenda reachable", async ({
  page,
  context,
  browserName,
}) => {
  test.skip(
    browserName !== "chromium",
    "service worker offline behavior is Chromium-specific",
  );
  await page.goto("/app/today");
  await page.evaluate(() => navigator.serviceWorker?.ready);
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: /Good morning/ }),
  ).toBeVisible();
  await context.setOffline(false);
});

test("responsive layouts avoid horizontal overflow", async ({ page }) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 820, height: 1180 },
    { width: 1366, height: 900 },
    { width: 1728, height: 1117 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/app/today");
    const dimensions = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client + 1);
  }
});
