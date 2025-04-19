import {expect, test} from "@playwright/test";
import {users} from "../../fixtures/test-data";

test.describe("API тесты", () => {
  test("Проверка API аутентификации", async ({ request }) => {
    // Запрос на авторизацию
    const loginResponse = await request.post("http://localhost:3000/api/v1/auth/login", {
      data: {
        email: users.user.username,
        password: users.user.password,
      },
    });

    expect(loginResponse.ok()).toBeTruthy();
    const responseBody = await loginResponse.json();
    expect(responseBody.status).toBe('success');
  });
});
