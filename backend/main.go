package main

import (
	"fmt"
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/nikitagorchakov/finance-hub/backend/config"
	"github.com/nikitagorchakov/finance-hub/backend/db"
	"github.com/nikitagorchakov/finance-hub/backend/middlewares"
	"github.com/nikitagorchakov/finance-hub/backend/models"
	"github.com/nikitagorchakov/finance-hub/backend/routes"
	"github.com/nikitagorchakov/finance-hub/backend/telegram"
	"github.com/nikitagorchakov/finance-hub/backend/utils"
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

	// Запускаем Telegram бот в отдельной горутине
	go func() {
		telegramService, err := telegram.NewService()
		if err != nil {
			log.Printf("Ошибка инициализации Telegram бота: %v", err)
			return
		}
		telegramService.Start()
	}()

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

	// Запускаем обработчик recurring транзакций
	go startRecurringProcessor()

	// Запускаем background процесс для проверки превышения бюджетов
	go startBudgetThresholdChecker()

	// Запуск сервера
	port := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("Server starting on port %s", cfg.Port)
	if err := app.Listen(port); err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}

// getAllowedOrigins возвращает разрешенные домены в зависимости от окружения
func getAllowedOrigins(cfg *config.Config) string {
	if cfg.Env == "development" {
		return "http://localhost:3001"
	}
	return cfg.FrontendURL
}

// startRecurringProcessor запускает периодическую обработку recurring транзакций
func startRecurringProcessor() {
	ticker := time.NewTicker(1 * time.Hour) // Проверяем каждый час
	defer ticker.Stop()

	log.Println("Запущен обработчик регулярных транзакций")

	for {
		select {
		case <-ticker.C:
			processRecurringTransactions()
		}
	}
}

// processRecurringTransactions обрабатывает активные recurring правила
func processRecurringTransactions() {
	log.Println("Обработка регулярных транзакций...")
	
	now := time.Now()
	var rules []models.RecurringRule
	
	if err := db.DB.Where("is_active = ? AND next_execute_date <= ?", true, now).
		Preload("Category").
		Find(&rules).Error; err != nil {
		log.Printf("Ошибка получения recurring правил: %v", err)
		return
	}

	processedCount := 0
	for _, rule := range rules {
		if rule.IsTimeToExecute() {
			// Создаем транзакцию
			transaction := models.Transaction{
				Amount:          rule.Amount,
				Description:     rule.Description,
				Date:            rule.NextExecuteDate,
				CategoryID:      rule.CategoryID,
				UserID:          rule.UserID,
				RecurringRuleID: &rule.ID,
				IsRecurring:     true,
			}

			if err := db.DB.Create(&transaction).Error; err != nil {
				log.Printf("Ошибка создания recurring транзакции: %v", err)
				continue
			}

			// Обновляем следующую дату выполнения
			rule.NextExecuteDate = rule.CalculateNextExecuteDate()
			
			// Проверяем, не истек ли срок действия правила
			if rule.EndDate != nil && rule.NextExecuteDate.After(*rule.EndDate) {
				rule.IsActive = false
			}

			if err := db.DB.Save(&rule).Error; err != nil {
				log.Printf("Ошибка обновления recurring правила: %v", err)
				continue
			}

			processedCount++
		}
	}

	if processedCount > 0 {
		log.Printf("Обработано %d регулярных транзакций", processedCount)
	}
}

// startBudgetThresholdChecker запускает периодическую проверку превышения бюджетов
func startBudgetThresholdChecker() {
	ticker := time.NewTicker(1 * time.Hour) // Проверяем каждый час
	defer ticker.Stop()

	log.Println("Запущен обработчик проверки превышения бюджетов")

	for {
		select {
		case <-ticker.C:
			checkBudgetThresholds()
		}
	}
}

// checkBudgetThresholds проверяет превышение бюджетов
func checkBudgetThresholds() {
	log.Println("Проверка превышения бюджетов...")
	
	var users []models.User
	
	if err := db.DB.Find(&users).Error; err != nil {
		log.Printf("Ошибка получения пользователей: %v", err)
		return
	}

	for _, user := range users {
		if err := utils.CheckBudgetThresholds(user.ID); err != nil {
			log.Printf("Ошибка проверки бюджетов пользователя %d: %v", user.ID, err)
		}
	}
	
	log.Println("Проверка превышения бюджетов завершена")
}
