import { Page } from "@playwright/test";

/**
 * Функция для авторизации пользователя в приложении
 */
export async function login(
  page: Page,
  username: string,
  password: string
): Promise<void> {
  await page.goto("/login");
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL("/**");
}

/**
 * Функция для выхода из системы
 */
export async function logout(page: Page): Promise<void> {
  await page.click('button[aria-label="Выйти"]');
  await page.waitForURL("/login");
}
