package controllers

import (
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/nikitagorchakov/finance-hub/backend/db"
	"github.com/nikitagorchakov/finance-hub/backend/middlewares"
	"github.com/nikitagorchakov/finance-hub/backend/models"
	"github.com/nikitagorchakov/finance-hub/backend/utils"
)

// SubscriptionController контроллер для подписок
type SubscriptionController struct{}

// NewSubscriptionController создает новый контроллер подписок
func NewSubscriptionController() *SubscriptionController {
	return &SubscriptionController{}
}

// GetAllPlans получает информацию обо всех доступных планах подписки
func (sc *SubscriptionController) GetAllPlans(c *fiber.Ctx) error {
	// Формируем описания для каждого плана и периода
	var plans []models.PlanInfo

	for plan, periods := range models.SubscriptionPrices {
		for period, price := range periods {
			description := ""
			switch plan {
			case models.Basic:
				description = "Базовый план для личных финансов"
			case models.Premium:
				description = "Расширенный план с дополнительными возможностями"
			case models.Pro:
				description = "Профессиональный план без ограничений"
			}

			plans = append(plans, models.PlanInfo{
				Plan:        plan,
				Period:      period,
				Price:       price,
				Description: description,
				Features:    models.PlanFeatures[plan],
			})
		}
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "success",
		"data":   plans,
	})
}

// GetUserSubscription получает текущую подписку пользователя
func (sc *SubscriptionController) GetUserSubscription(c *fiber.Ctx) error {
	userID := middlewares.GetUserID(c)

	var subscription models.Subscription
	if err := db.DB.Where("user_id = ? AND active = ?", userID, true).
		Order("created_at DESC").First(&subscription).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "Активная подписка не найдена",
		})
	}

	// Преобразуем строку features в массив
	var features []string
	if subscription.Features != "" {
		features = strings.Split(subscription.Features, ", ")
	}

	// Проверяем, не истекла ли подписка
	now := time.Now()
	if subscription.EndDate != nil && now.After(*subscription.EndDate) {
		subscription.Active = false
		db.DB.Save(&subscription)

		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"status":  "success",
			"message": "Ваша подписка истекла",
			"data": fiber.Map{
				"subscription": subscription,
				"features":     features,
				"expired":      true,
			},
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "success",
		"data": fiber.Map{
			"subscription": subscription,
			"features":     features,
		},
	})
}

// SubscribeUser подписывает пользователя на выбранный план
func (sc *SubscriptionController) SubscribeUser(c *fiber.Ctx) error {
	userID := middlewares.GetUserID(c)
	var input models.SubscriptionCreate

	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось обработать данные",
			"error":   err.Error(),
		})
	}

	errors := utils.ValidateStruct(input)
	if len(errors) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status": "error",
			"errors": errors,
		})
	}

	// Деактивируем существующие активные подписки
	db.DB.Model(&models.Subscription{}).
		Where("user_id = ? AND active = ?", userID, true).
		Updates(map[string]interface{}{"active": false})

	// Определяем дату окончания
	startDate := input.StartDate
	if startDate.IsZero() {
		startDate = time.Now()
	}

	var endDate *time.Time
	if input.Period != models.LifetimeSubscription {
		var ed time.Time
		if input.Period == models.MonthlySubscription {
			ed = startDate.AddDate(0, 1, 0) // +1 месяц
		} else { // Yearly
			ed = startDate.AddDate(1, 0, 0) // +1 год
		}
		endDate = &ed
	}

	// Получаем цену из предопределенных значений
	price := models.SubscriptionPrices[input.Plan][input.Period]

	// Создаем список функций в виде строки
	features := strings.Join(models.PlanFeatures[input.Plan], ", ")

	// Создаем новую подписку
	subscription := models.Subscription{
		UserID:    userID,
		Plan:      input.Plan,
		Period:    input.Period,
		StartDate: startDate,
		EndDate:   endDate,
		Active:    true,
		Price:     price,
		Features:  features,
	}

	if err := db.DB.Create(&subscription).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось создать подписку",
			"error":   err.Error(),
		})
	}

	// Создаем уведомление о новой подписке
	notification := models.Notification{
		UserID:     userID,
		Type:       models.NotificationSubscription,
		Title:      fmt.Sprintf("Подписка %s активирована", input.Plan),
		Message:    fmt.Sprintf("Ваша подписка %s успешно активирована. %s", input.Plan, subscription.Features),
		Importance: models.NotificationHigh,
		IsRead:     false,
		Data:       fmt.Sprintf(`{"subscriptionId": %d, "plan": "%s", "endDate": "%s"}`, subscription.ID, subscription.Plan, subscription.EndDate.Format(time.RFC3339)),
	}
	
	if err := db.DB.Create(&notification).Error; err != nil {
		log.Printf("Failed to create subscription notification: %v", err)
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"status":  "success",
		"message": "Подписка успешно оформлена",
		"data":    subscription,
	})
}

// CancelSubscription отменяет текущую подписку пользователя
func (sc *SubscriptionController) CancelSubscription(c *fiber.Ctx) error {
	userID := middlewares.GetUserID(c)

	var subscription models.Subscription
	if err := db.DB.Where("user_id = ? AND active = ?", userID, true).
		First(&subscription).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "Активная подписка не найдена",
		})
	}

	// Деактивируем подписку
	subscription.Active = false
	if err := db.DB.Save(&subscription).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось отменить подписку",
			"error":   err.Error(),
		})
	}

	// Создаем уведомление об отмене подписки
	notification := models.Notification{
		UserID:     userID,
		Type:       models.NotificationSubscription,
		Title:      "Подписка отменена",
		Message:    fmt.Sprintf("Ваша подписка %s отменена. Доступ к платным функциям будет прекращен после %s", subscription.Plan, subscription.EndDate.Format("02.01.2006")),
		Importance: models.NotificationNormal,
		IsRead:     false,
		Data:       fmt.Sprintf(`{"subscriptionId": %d, "plan": "%s", "endDate": "%s"}`, subscription.ID, subscription.Plan, subscription.EndDate.Format(time.RFC3339)),
	}
	
	if err := db.DB.Create(&notification).Error; err != nil {
		log.Printf("Failed to create subscription cancellation notification: %v", err)
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  "success",
		"message": "Подписка успешно отменена",
		"data":    subscription,
	})
}
