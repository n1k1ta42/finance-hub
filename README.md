# Finance Hub

![License](https://img.shields.io/badge/license-MIT-blue)
![React](https://img.shields.io/badge/React-18-blue)
![Go](https://img.shields.io/badge/Go-1.18+-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

<p align="center">
  <img src="./docs/logo.png" alt="Finance Hub Logo" width="581" height="112" />
</p>

<p align="center">
  Современная платформа для управления личными финансами с открытым исходным кодом
</p>

## 📋 О проекте

Finance Hub — это полнофункциональное приложение для управления личными финансами, которое помогает пользователям контролировать свои доходы и расходы, планировать бюджет, анализировать финансовые привычки и достигать финансовых целей.

## ✨ Возможности

- **Авторизация и управление аккаунтом**: Безопасная система регистрации и входа
- **Отслеживание транзакций**: Удобная система учета всех финансовых операций
- **Бюджетирование**: Создание и управление бюджетами по категориям
- **Детальная статистика**: Визуализация финансовых данных с помощью интерактивных графиков
- **Подписки**: Система управления подписками и платежами
- **Адаптивный дизайн**: Работает на всех устройствах - от мобильных до десктопных

## 🛠️ Технологии

### Фронтенд

- **React** с TypeScript
- **TanStack Router** для маршрутизации
- **TanStack Form** для управления формами
- **TanStack Query** для работы с данными
- **Tailwind CSS** и **shadcn/ui** для стилизации
- **Lucide** для иконок

### Бэкенд

- **Go** с фреймворком **Fiber**
- **GORM** для работы с базой данных
- **JWT** для аутентификации

## 🚀 Начало работы

### Предварительные требования

- Node.js 18+
- Go 1.18+
- PostgreSQL

### Установка и запуск

1. Клонируйте репозиторий:

```bash
git clone https://github.com/username/finance-hub.git
cd finance-hub
```

2. Настройка и запуск бэкенда:

```bash
cd backend
go mod download
cp env.example .env  # Настройте переменные окружения
go run main.go
```

3. Настройка и запуск фронтенда:

```bash
cd web
yarn install
cp env.example .env  # Настройте переменные окружения
go run main.go
yarn dev
```

4. Откройте браузер и перейдите по адресу `http://localhost:5173`

[//]: # (## 📸 Скриншоты)

[//]: # ()
[//]: # (<div align="center">)

[//]: # (  <img src="docs/screenshot-dashboard.png" alt="Dashboard" width="80%" />)

[//]: # (  <p><em>Главная панель управления</em></p>)

[//]: # (  )
[//]: # (  <img src="docs/screenshot-transactions.png" alt="Transactions" width="80%" />)

[//]: # (  <p><em>Управление транзакциями</em></p>)

[//]: # (  )
[//]: # (  <img src="docs/screenshot-stats.png" alt="Statistics" width="80%" />)

[//]: # (  <p><em>Финансовая аналитика</em></p>)

[//]: # (</div>)

## 🤝 Как внести вклад

Мы приветствуем вклады от сообщества! Если вы хотите внести свой вклад в проект:

1. Форкните репозиторий
2. Создайте ветку для вашей функции (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте изменения (`git commit -m 'Добавлена новая функция'`)
4. Отправьте в свой форк (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

Пожалуйста, ознакомьтесь с нашим [руководством по вкладу](CONTRIBUTING.md) для получения дополнительной информации.

## 📄 Лицензия

Этот проект распространяется под лицензией MIT. См. файл [LICENSE](LICENSE) для получения дополнительной информации.

## 📞 Контакты

- **Автор**: Никита Горчаков
- **Email**: nikitagor456@yandex.ru
- **Telegram**: [@n1k1ta42](https://t.me/nikita_gorchakov)

---

<p align="center">
  Сделано с ❤️ в России
</p>
