import {expect, test} from "@playwright/test";

test.describe("Базовые тесты приложения", () => {
  test("Должна загружаться главная страница", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("Finance hub");
  });
});
