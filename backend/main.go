package main

import (
	"fmt"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/nikitagorchakov/finance-hub/backend/config"
	"github.com/nikitagorchakov/finance-hub/backend/db"
	"github.com/nikitagorchakov/finance-hub/backend/middlewares"
	"github.com/nikitagorchakov/finance-hub/backend/routes"
	"github.com/nikitagorchakov/finance-hub/backend/telegram"
)

func main() {
	// Загружаем конфигурацию
	cfg := config.LoadConfig()

	// Подключаемся к базе данных
	db.Connect(cfg)

	// Выполняем миграции
	db.MigrateDB()

	// Заполняем тестовыми данными в режиме разработки
	if cfg.Env == "development" {
		db.SeedDefaultData()
	}

	// Инициализируем и запускаем Telegram-бота
	initTelegramBot()

	// Инициализируем приложение Fiber
	app := fiber.New(fiber.Config{
		AppName:               "Finance Hub API",
		DisableStartupMessage: false,
	})

	// Middleware
	app.Use(logger.New())
	app.Use(recover.New())

	// Применяем CORS с более детальными настройками
	app.Use(cors.New(cors.Config{
		AllowOrigins:     getAllowedOrigins(cfg),
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization, X-CSRF-Token",
		ExposeHeaders:    "Content-Length, Content-Type",
		AllowCredentials: true,
		MaxAge:           86400, // 24 часа, кэширование preflight запросов
	}))

	// Глобальный rate limiter только для production окружения
	if cfg.Env == "production" {
		app.Use(middlewares.RateLimiter())
	}

	// Маршрут для проверки работоспособности API
	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "success",
			"message": "Finance Hub API is running",
		})
	})

	// Настройка маршрутов
	routes.SetupRoutes(app, cfg)

	// Запуск сервера
	port := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("Server starting on port %s", cfg.Port)
	if err := app.Listen(port); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}

// initTelegramBot инициализирует и запускает клиентский Telegram-бот
func initTelegramBot() {
	botService, err := telegram.GetInstance()
	if err != nil {
		log.Printf("Ошибка инициализации клиентского Telegram-бота: %v", err)
		log.Println("Приложение продолжит работу без клиентского Telegram-бота")
		return
	}
	
	botService.Start()
	log.Println("Клиентский Telegram бот успешно инициализирован")
}

// getAllowedOrigins возвращает разрешенные домены в зависимости от окружения
func getAllowedOrigins(cfg *config.Config) string {
	if cfg.Env == "development" {
		return "http://localhost:3001"
	}
	return cfg.FrontendURL
}
