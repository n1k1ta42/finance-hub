package middlewares

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/limiter"
)

// RateLimiter middleware для ограничения запросов
func RateLimiter() fiber.Handler {
	return limiter.New(limiter.Config{
		Max:        100,          // Максимум 100 запросов
		Expiration: 1 * time.Minute, // За 1 минуту
		KeyGenerator: func(c *fiber.Ctx) string {
			return c.IP() // Идентификатор по IP
		},
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"status":  "error",
				"message": "Слишком много запросов, попробуйте позже",
			})
		},
	})
}

// AuthLimiter middleware для защиты от брутфорса на эндпоинтах аутентификации
func AuthLimiter() fiber.Handler {
	return limiter.New(limiter.Config{
		Max:        5,            // Максимум 5 попыток
		Expiration: 15 * time.Minute, // За 15 минут
		KeyGenerator: func(c *fiber.Ctx) string {
			// Для аутентификации используем IP + path
			return c.IP() + "_auth"
		},
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"status":  "error",
				"message": "Превышено количество попыток входа. Аккаунт временно заблокирован.",
			})
		},
		SkipSuccessfulRequests: true, // Пропускаем успешные запросы, чтобы лимитировать только ошибки
	})
}

// APILimiter middleware для ограничения запросов к API
func APILimiter() fiber.Handler {
	return limiter.New(limiter.Config{
		Max:        30,           // Максимум 30 запросов
		Expiration: 1 * time.Minute, // За 1 минуту
		KeyGenerator: func(c *fiber.Ctx) string {
			// Используем IP + путь запроса
			return c.IP() + "_api"
		},
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"status":  "error",
				"message": "Превышено количество запросов к API. Пожалуйста, повторите попытку позже.",
			})
		},
	})
} 