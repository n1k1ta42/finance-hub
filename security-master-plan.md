# Мастер-план улучшения безопасности Finance Hub

## Обзор выявленных проблем

### Аутентификация и управление сессиями

- Хранение JWT в localStorage вместо HttpOnly cookies
- Отсутствие механизма refresh token на обеих сторонах
- Длительный срок жизни JWT токена (24 часа)
- Небезопасное хранение JWT секрета на бэкенде
- Отсутствие защиты от брутфорс-атак

### Передача и защита данных

- Отсутствие настроек безопасности Cookies (HttpOnly, Secure, SameSite)
- Отсутствие CSP (Content Security Policy) на фронтенде
- Базовая реализация CORS, отсутствие preflight настроек
- Нешифрованные соединения с API и базой данных
- Отсутствие принудительного HTTPS

### Защита от атак

- Отсутствие защиты от CSRF на обеих сторонах
- Отсутствие Rate Limiting для API-запросов
- Недостаточная валидация входных данных
- Небезопасное перенаправление при ошибках

### Конфигурация и инфраструктура

- Открытые чувствительные данные в конфигурационных файлах
- Отсутствие HTTP-заголовков безопасности
- Небезопасная настройка NGINX
- Отсутствие правильного шифрования чувствительных данных

### Зависимости и аудит

- Уязвимые версии npm и Go-пакетов
- Отсутствие автоматизированного аудита зависимостей
- Отсутствие мониторинга и логирования событий безопасности

## План внедрения улучшений

### Фаза 1: Критические улучшения (2 недели)

#### Full-Stack: Улучшение аутентификации и безопасности сессий

| ID  | Задача                                                                        | Компонент | Приоритет | Сложность |
| --- | ----------------------------------------------------------------------------- | --------- | --------- | --------- |
| 1.1 | Создать модель RefreshToken и соответствующие таблицы в БД                    | Backend   | Высокий   | Средняя   |
| 1.2 | Внедрить механизм refresh token с коротким сроком жизни access token (15 мин) | Backend   | Высокий   | Средняя   |
| 1.3 | Реализовать эндпоинт обновления токенов                                       | Backend   | Высокий   | Средняя   |
| 1.4 | Изменить API клиент для использования HttpOnly cookies вместо localStorage    | Frontend  | Высокий   | Средняя   |
| 1.5 | Добавить механизм автоматического обновления токенов на клиенте               | Frontend  | Высокий   | Высокая   |

#### Backend: Базовая защита от атак

| ID  | Задача                                                   | Компонент | Приоритет | Сложность |
| --- | -------------------------------------------------------- | --------- | --------- | --------- |
| 1.6 | Внедрить middleware защиты от брутфорс-атак              | Backend   | Высокий   | Низкая    |
| 1.7 | Внедрить Rate Limiting middleware для всех API-маршрутов | Backend   | Высокий   | Низкая    |
| 1.8 | Улучшить политику CORS с детальными настройками          | Backend   | Высокий   | Низкая    |
| 1.9 | Добавить валидацию инпутов с санитизацией данных         | Backend   | Высокий   | Средняя   |

#### Frontend: Базовая защита фронтенда

| ID   | Задача                                         | Компонент | Приоритет | Сложность |
| ---- | ---------------------------------------------- | --------- | --------- | --------- |
| 1.10 | Внедрить базовую Content Security Policy       | Frontend  | Высокий   | Низкая    |
| 1.11 | Добавить проверки на XSS при рендеринге данных | Frontend  | Высокий   | Средняя   |
| 1.12 | Улучшить валидацию форм на стороне клиента     | Frontend  | Высокий   | Средняя   |
| 1.13 | Исправить небезопасные перенаправления         | Frontend  | Высокий   | Низкая    |

#### Обновление зависимостей

| ID   | Задача                                                   | Компонент | Приоритет | Сложность |
| ---- | -------------------------------------------------------- | --------- | --------- | --------- |
| 1.14 | Обновить Vite и другие уязвимые зависимости на фронтенде | Frontend  | Высокий   | Средняя   |
| 1.15 | Обновить Go-модули с известными уязвимостями             | Backend   | Высокий   | Средняя   |
| 1.16 | Настроить автоматизированный аудит зависимостей          | DevOps    | Средний   | Низкая    |

### Фаза 2: Защита данных и CSRF (2 недели)

#### Full-Stack: Внедрение CSRF-защиты

| ID  | Задача                                                        | Компонент | Приоритет | Сложность |
| --- | ------------------------------------------------------------- | --------- | --------- | --------- |
| 2.1 | Создать модель для CSRF-токенов                               | Backend   | Высокий   | Низкая    |
| 2.2 | Реализовать эндпоинт для получения CSRF-токена                | Backend   | Высокий   | Низкая    |
| 2.3 | Добавить middleware проверки CSRF-токенов для POST/PUT/DELETE | Backend   | Высокий   | Средняя   |
| 2.4 | Внедрить автоматическую отправку CSRF-токена с запросами      | Frontend  | Высокий   | Средняя   |
| 2.5 | Обновить запросы API для передачи CSRF-токенов                | Frontend  | Высокий   | Средняя   |

#### Backend: Шифрование данных

| ID   | Задача                                            | Компонент | Приоритет | Сложность |
| ---- | ------------------------------------------------- | --------- | --------- | --------- |
| 2.6  | Создать утилиты шифрования чувствительных данных  | Backend   | Высокий   | Средняя   |
| 2.7  | Внедрить шифрование личных данных пользователей   | Backend   | Высокий   | Средняя   |
| 2.8  | Реализовать безопасное хранение ключей шифрования | Backend   | Высокий   | Высокая   |
| 2.9  | Настроить SSL/TLS для подключения к базе данных   | Backend   | Средний   | Средняя   |
| 2.10 | Защитить SMTP и другие конфиденциальные настройки | Backend   | Средний   | Низкая    |

#### Мониторинг и логирование

| ID   | Задача                                                     | Компонент | Приоритет | Сложность |
| ---- |------------------------------------------------------------| --------- | --------- | --------- |
| 2.11 | Настроить логирование событий безопасности                 | Backend   | Средний   | Средняя   |
| 2.12 | Внедрить систему оповещений о подозрительных входах с помошью Telegram | Backend   | Средний   | Средняя   |
| 2.13 | Добавить логирование критических операций                  | Backend   | Средний   | Низкая    |
| 2.14 | Создать механизм отслеживания истории входов               | Backend   | Средний   | Средняя   |

### Фаза 3: Инфраструктурная безопасность (2 недели)

#### HTTPS и конфигурация веб-сервера

| ID  | Задача                                                         | Компонент | Приоритет | Сложность |
| --- | -------------------------------------------------------------- | --------- | --------- | --------- |
| 3.1 | Настроить HTTPS для всех окружений (dev, staging, prod)        | DevOps    | Высокий   | Средняя   |
| 3.2 | Обновить NGINX-конфигурацию с HTTPS поддержкой                 | DevOps    | Высокий   | Низкая    |
| 3.3 | Внедрить HTTP Strict Transport Security                        | DevOps    | Высокий   | Низкая    |
| 3.4 | Добавить заголовки безопасности (X-Content-Type-Options и др.) | DevOps    | Высокий   | Низкая    |
| 3.5 | Настроить автоматическое обновление сертификатов               | DevOps    | Средний   | Средняя   |

#### Управление секретами и доступом

| ID   | Задача                                                   | Компонент | Приоритет | Сложность |
| ---- | -------------------------------------------------------- | --------- | --------- | --------- |
| 3.6  | Внедрить безопасное хранилище секретов (HashiCorp Vault) | DevOps    | Высокий   | Высокая   |
| 3.7  | Переместить все секреты из .env в хранилище              | DevOps    | Высокий   | Средняя   |
| 3.8  | Обновить скрипты развертывания для работы с хранилищем   | DevOps    | Высокий   | Средняя   |
| 3.9  | Пересмотреть разделение прав доступа в проекте           | Backend   | Средний   | Средняя   |
| 3.10 | Внедрить улучшенную систему RBAC                         | Backend   | Средний   | Высокая   |

#### Оптимизация производительности и безопасности

| ID   | Задача                                                   | Компонент  | Приоритет | Сложность |
| ---- | -------------------------------------------------------- | ---------- | --------- | --------- |
| 3.11 | Внедрить потоковую обработку для экспорта больших данных | Backend    | Средний   | Высокая   |
| 3.12 | Оптимизировать загрузку статических ресурсов             | Frontend   | Средний   | Средняя   |
| 3.13 | Улучшить обработку ошибок во всех компонентах            | Full-Stack | Средний   | Средняя   |
| 3.14 | Добавить защиту от подделки API-ответов                  | Frontend   | Средний   | Средняя   |

### Фаза 4: Автоматизация и документация (1 неделя)

#### Автоматизация безопасности

| ID  | Задача                                            | Компонент | Приоритет | Сложность |
| --- | ------------------------------------------------- | --------- | --------- | --------- |
| 4.1 | Настроить автоматический анализ кода с SonarQube  | DevOps    | Средний   | Средняя   |
| 4.2 | Внедрить OWASP ZAP для регулярного сканирования   | DevOps    | Средний   | Средняя   |
| 4.3 | Настроить Dependabot для мониторинга зависимостей | DevOps    | Средний   | Низкая    |
| 4.4 | Добавить проверки безопасности в CI/CD пайплайн   | DevOps    | Средний   | Средняя   |

#### Документация и обучение

| ID  | Задача                                               | Компонент  | Приоритет | Сложность |
| --- | ---------------------------------------------------- | ---------- | --------- | --------- |
| 4.5 | Создать документацию по политикам безопасности       | Management | Низкий    | Средняя   |
| 4.6 | Разработать гайдлайны по безопасной разработке       | Management | Низкий    | Средняя   |
| 4.7 | Провести тренинг по безопасности для команды         | Management | Низкий    | Низкая    |
| 4.8 | Документировать все внесенные улучшения безопасности | Management | Низкий    | Низкая    |

## Детали технической реализации

### Аутентификация с Refresh Token

```typescript
// Frontend: src/lib/api.ts

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://localhost:3000/api/v1",
  withCredentials: true, // Важно для работы с куками
  headers: {
    "Content-Type": "application/json",
  },
});

// Перехватчик для автоматического обновления токенов
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Если ошибка 401 и не пытались ранее обновить токен
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Запрос на обновление токена
        await axios.post(
          "/api/v1/auth/refresh-token",
          {},
          {
            withCredentials: true,
          }
        );

        // Повторяем оригинальный запрос
        return api(originalRequest);
      } catch (refreshError) {
        // Если не удалось обновить токен - перенаправляем на логин
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

```go
// Backend: utils/jwt.go

// Функция для генерации Access Token с коротким сроком жизни
func GenerateAccessToken(userID uint, email string, role models.UserRole, config *config.Config) (string, error) {
    // Время жизни токена - 15 минут
    expirationTime := time.Now().Add(15 * time.Minute)

    claims := &JWTCustomClaims{
        UserID: userID,
        Email:  email,
        Role:   role,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(expirationTime),
            IssuedAt:  jwt.NewNumericDate(time.Now()),
            NotBefore: jwt.NewNumericDate(time.Now()),
            Issuer:    "finance-hub",
            Subject:   email,
        },
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString([]byte(config.JWTSecret))
}

// Функция для генерации Refresh Token
func GenerateRefreshToken(userID uint, config *config.Config) (string, time.Time, error) {
    // Время жизни refresh токена - 7 дней
    expirationTime := time.Now().Add(7 * 24 * time.Hour)

    // Создаем уникальный токен
    token := uuid.New().String()

    // Сохраняем refresh токен в базе данных
    refreshToken := models.RefreshToken{
        Token:     token,
        UserID:    userID,
        ExpiresAt: expirationTime,
    }

    if err := db.DB.Create(&refreshToken).Error; err != nil {
        return "", time.Time{}, err
    }

    return token, expirationTime, nil
}
```

### Content Security Policy

```html
<!-- Frontend: index.html -->
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; 
               script-src 'self'; 
               connect-src 'self' https://api.example.com; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data:; 
               font-src 'self'; 
               frame-ancestors 'none';"
/>
```

### NGINX HTTPS конфигурация

```nginx
# Nginx: nginx.conf

server {
    listen 443 ssl;
    server_name example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # HTTP Strict Transport Security
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Другие заголовки безопасности
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    root /usr/share/nginx/html;
    index index.html;

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires max;
        add_header Cache-Control "public, max-age=31536000, immutable";
        try_files $uri =404;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Перенаправление с HTTP на HTTPS
server {
    listen 80;
    server_name example.com;
    return 301 https://$host$request_uri;
}
```

## Метрики успеха

1. **Аутентификация и сессии**

   - 100% JWT токенов хранятся в HttpOnly cookies
   - Все токены имеют срок жизни не более 15 минут
   - Внедрен механизм refresh token
   - 0 инцидентов с компрометацией токенов

2. **Защита от атак**

   - 100% форм защищены от CSRF
   - Все API эндпоинты имеют Rate Limiting
   - Внедрена защита от брутфорс-атак
   - 0 успешных XSS или SQL-инъекций

3. **Инфраструктура**
   - 100% трафика идет через HTTPS
   - Все секреты хранятся в безопасном хранилище
   - Внедрены все необходимые HTTP-заголовки безопасности
   - Регулярное сканирование на уязвимости без критических находок

## Ресурсы

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [Mozilla Web Security Guidelines](https://infosec.mozilla.org/guidelines/web_security)
- [Google Web Fundamentals: Security](https://developers.google.com/web/fundamentals/security)
