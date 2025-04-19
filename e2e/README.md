# E2E тесты для Finance Hub

## Настройка

1. Установите зависимости:

```bash
yarn install
```

2. Установите браузеры для тестирования:

```bash
npx playwright install
```

## Запуск тестов

Запуск всех тестов:

```bash
yarn test
```

Запуск тестов с UI:

```bash
yarn test:ui
```

Запуск тестов в режиме отладки:

```bash
yarn test:debug
```

Просмотр отчета о тестах:

```bash
yarn test:report
```

## Генерация тестов

Вы можете использовать Playwright Codegen для записи тестов:

```bash
yarn test:codegen
```

## Структура проекта

- `/tests` - тесты UI и функциональности
- `/tests/api` - API тесты
- `/fixtures` - тестовые данные
- `/utils` - вспомогательные функции для тестов

## Конфигурация

Настройки тестов находятся в файле `playwright.config.ts`. По умолчанию тесты запускаются для следующих браузеров:

- Chromium
- Firefox
- WebKit
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

## Написание новых тестов

При написании новых тестов следуйте шаблону:

```typescript
import { test, expect } from "@playwright/test";

test.describe("Группа тестов", () => {
  test("Название теста", async ({ page }) => {
    // Код теста
  });
});
```
