package middlewares

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/nikitagorchakov/finance-hub/backend/db"
	"github.com/nikitagorchakov/finance-hub/backend/models"
)

// CheckActiveSubscription проверяет наличие активной подписки
func CheckActiveSubscription() fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := GetUserID(c)

		var subscription models.Subscription
		result := db.DB.Where("user_id = ? AND active = ?", userID, true).
			Order("created_at DESC").First(&subscription)

		// Если подписка не найдена
		if result.RowsAffected == 0 {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"status":  "error",
				"message": "Требуется активная подписка для доступа к этому ресурсу",
			})
		}

		// Проверка срока действия подписки
		now := time.Now()
		if subscription.EndDate != nil && now.After(*subscription.EndDate) {
			// Подписка истекла, отмечаем ее как неактивную
			subscription.Active = false
			db.DB.Save(&subscription)

			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"status":  "error",
				"message": "Ваша подписка истекла, необходимо продлить подписку",
			})
		}

		// Добавляем информацию о плане в контекст
		c.Locals("subscription_plan", subscription.Plan)
		return c.Next()
	}
}

// RequiresPlan проверяет, что у пользователя есть подписка заданного или более высокого уровня
func RequiresPlan(minimumPlan models.SubscriptionPlan) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Получаем план из контекста (после middleware CheckActiveSubscription)
		plan := c.Locals("subscription_plan")
		if plan == nil {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"status":  "error",
				"message": "Не удалось определить план подписки",
			})
		}

		// Проверка плана
		userPlan := plan.(models.SubscriptionPlan)

		// Проверяем, что план пользователя достаточен
		if userPlan == models.Pro {
			// Pro план имеет доступ ко всему
			return c.Next()
		}

		if userPlan == models.Premium && (minimumPlan == models.Basic || minimumPlan == models.Premium) {
			// Premium план имеет доступ к Premium и Basic функциям
			return c.Next()
		}

		if userPlan == models.Basic && minimumPlan == models.Basic {
			// Basic план имеет доступ только к Basic функциям
			return c.Next()
		}

		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"status":  "error",
			"message": "Для доступа к этому ресурсу требуется подписка более высокого уровня",
		})
	}
}

// CheckResourceLimits проверяет ограничения ресурсов в зависимости от плана подписки
func CheckResourceLimits(resourceType string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userID := GetUserID(c)
		plan := c.Locals("subscription_plan")

		if plan == nil {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"status":  "error",
				"message": "Не удалось определить план подписки",
			})
		}

		userPlan := plan.(models.SubscriptionPlan)

		switch resourceType {
		case "categories":
			// Ограничение на количество категорий
			var categoryCount int64
			db.DB.Model(&models.Category{}).Where("user_id = ?", userID).Count(&categoryCount)

			if userPlan == models.Basic && categoryCount >= 5 && c.Method() == "POST" {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"status":  "error",
					"message": "Достигнут лимит категорий для базового плана. Перейдите на премиум план для создания большего количества категорий.",
				})
			}

		case "transactions":
			// Ограничение на количество транзакций
			var transactionCount int64
			db.DB.Model(&models.Transaction{}).Where("user_id = ?", userID).Count(&transactionCount)

			if userPlan == models.Basic && transactionCount >= 100 && c.Method() == "POST" {
				return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
					"status":  "error",
					"message": "Достигнут лимит транзакций для базового плана. Перейдите на премиум план для создания большего количества транзакций.",
				})
			}

			if userPlan == models.Premium && transactionCount >= 1000 && c.Method() == "POST" {
				return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
					"status":  "error",
					"message": "Достигнут лимит транзакций для премиум плана. Перейдите на профессиональный план для создания неограниченного количества транзакций.",
				})
			}

		case "budgets":
			// Доступ к бюджетам только для Premium и Pro планов
			if userPlan == models.Basic {
				return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
					"status":  "error",
					"message": "Бюджетирование доступно только для премиум и профессионального планов.",
				})
			}
		}

		return c.Next()
	}
}
