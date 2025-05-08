# GitHub Actions для Finance Hub

## Общая информация

Этот репозиторий содержит два GitHub Actions workflow:

1. **Docker Build and Push** - Сборка и публикация Docker-образов на Docker Hub
2. **Deploy to VPS** - Деплой приложения на VPS с использованием опубликованных образов

### Docker Build and Push

Этот workflow выполняет следующие задачи:

- Сборка Docker-образов для backend и web-приложений
- Публикация образов в Docker Hub
- Обновление docker-compose.yml с тегами последних образов
- Создание инструкции по развертыванию

### Deploy to VPS

Этот workflow выполняет следующие задачи:

- Автоматический деплой на VPS после успешной сборки Docker-образов
- Копирование обновленного docker-compose.yml на VPS
- Запуск контейнеров с новыми образами на VPS
- Очистка неиспользуемых образов на VPS

## Необходимые секреты

Для корректной работы GitHub Actions необходимо настроить следующие секреты в репозитории:

### Docker Hub

- `DOCKER_USERNAME` - имя пользователя Docker Hub
- `DOCKER_PASSWORD` - пароль или токен для Docker Hub

### VPS

- `VPS_HOST` - IP-адрес или доменное имя VPS
- `VPS_USERNAME` - имя пользователя для SSH-доступа к VPS
- `VPS_SSH_KEY` - приватный SSH-ключ для доступа к VPS
- `VPS_PORT` - порт SSH (опционально, по умолчанию 22)

### Backend .env

- `DB_HOST` - хост базы данных
- `DB_PORT` - порт базы данных
- `DB_USER` - пользователь базы данных
- `DB_PASSWORD` - пароль базы данных
- `DB_NAME` - имя базы данных
- `JWT_SECRET` - секретный ключ для JWT
- `ENV` - окружение (development, production)
- `FRONTEND_URL` - URL фронтенд-приложения
- `SMTP_HOST` - SMTP хост
- `SMTP_PORT` - SMTP порт
- `SMTP_USER` - SMTP пользователь
- `SMTP_PASSWORD` - SMTP пароль
- `SMTP_FROM` - адрес отправителя
- `ENCRYPTION_KEY` - ключ шифрования
- `TELEGRAM_BOT_TOKEN` - токен Telegram бота
- `TELEGRAM_CHAT_ID` - ID чата Telegram
- `TELEGRAM_CLIENT_BOT_TOKEN` - токен клиентского бота Telegram
- `TELEGRAM_CLIENT_BOT_DEBUG` - режим отладки клиентского бота (true/false)

### Web .env

- `VITE_API_URL` - URL API для фронтенда

## Триггеры запуска

### Docker Build and Push

Workflow запускается автоматически при:

- Push в ветки main или master
- Ручном запуске через интерфейс GitHub

### Deploy to VPS

Workflow запускается автоматически при:

- Успешном завершении workflow Docker Build and Push
- Ручном запуске через интерфейс GitHub (с возможностью выбора тега образа)

## Как работают workflows

### Docker Build and Push

1. Workflow клонирует репозиторий
2. Настраивает Docker Buildx для эффективной сборки образов
3. Авторизуется в Docker Hub
4. Создает необходимые .env файлы из секретов
5. Собирает и публикует образы с тегами latest и SHA коммита
6. Обновляет docker-compose.yml для использования опубликованных образов
7. Создает инструкции по развертыванию

### Deploy to VPS

1. Workflow клонирует репозиторий
2. Определяет теги образов для деплоя
3. Обновляет docker-compose.yml с нужными тегами
4. Создает скрипт деплоя
5. Настраивает SSH-соединение с VPS
6. Копирует docker-compose.yml и скрипт деплоя на VPS
7. Запускает скрипт деплоя на VPS
8. Создает уведомление о успешном деплое

## Как настроить подключение к VPS

1. Сгенерируйте SSH-ключи на локальной машине, если их еще нет:

   ```bash
   ssh-keygen -t rsa -b 4096 -C "ваш-email@example.com"
   ```

2. Скопируйте публичный ключ на VPS:

   ```bash
   ssh-copy-id username@vps-hostname-or-ip
   ```

3. Проверьте, что подключение работает:

   ```bash
   ssh username@vps-hostname-or-ip
   ```

4. Добавьте приватный ключ в секреты GitHub:
   - В секрете `VPS_SSH_KEY` должно быть содержимое файла `~/.ssh/id_rsa`
   - В секрете `VPS_USERNAME` должно быть имя пользователя на VPS
   - В секрете `VPS_HOST` должен быть IP-адрес или доменное имя VPS
   - В секрете `VPS_PORT` должен быть порт SSH (по умолчанию 22)

## Как настроить окружение на VPS

Для первоначальной настройки окружения на VPS мы предоставляем скрипт `vps-setup.sh`. Этот скрипт:

1. Устанавливает Docker и Docker Compose (если они еще не установлены)
2. Создает необходимые директории для проекта
3. Создает пустые файлы конфигурации
4. Проверяет авторизацию в Docker Hub

### Использование скрипта настройки

1. Скопируйте скрипт на ваш VPS:

   ```bash
   scp .github/vps-setup.sh username@vps-hostname-or-ip:/tmp/
   ```

2. Подключитесь к VPS по SSH:

   ```bash
   ssh username@vps-hostname-or-ip
   ```

3. Запустите скрипт:

   ```bash
   chmod +x /tmp/vps-setup.sh
   sudo /tmp/vps-setup.sh
   ```

4. Следуйте инструкциям на экране для завершения настройки

### Ручная настройка .env файлов на VPS

После запуска скрипта вам нужно вручную заполнить .env файлы на VPS. Создайте следующие файлы:

#### /var/www/finance-hub/backend/.env

```
DB_HOST=
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=finance-hub
JWT_SECRET=your_secret_key
PORT=3000
ENV=production
FRONTEND_URL=http://your-domain.com
# ... добавьте остальные переменные окружения
```

#### /var/www/finance-hub/web/.env

```
VITE_API_URL=http://your-domain.com/api/v1
```

## Как настроить секреты

1. Перейдите в настройки репозитория в GitHub
2. Выберите "Secrets and variables" -> "Actions"
3. Добавьте все необходимые секреты через "New repository secret"
