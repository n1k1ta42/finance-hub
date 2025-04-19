package controllers

import (
	"fmt"
	"log"
	"math/rand"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/nikitagorchakov/finance-hub/backend/db"
	"github.com/nikitagorchakov/finance-hub/backend/middlewares"
	"github.com/nikitagorchakov/finance-hub/backend/models"
	"github.com/nikitagorchakov/finance-hub/backend/utils"
)

// PaymentController контроллер для платежей
type PaymentController struct{}

// NewPaymentController создает новый контроллер платежей
func NewPaymentController() *PaymentController {
	return &PaymentController{}
}

// GetUserPayments получает все платежи пользователя
func (pc *PaymentController) GetUserPayments(c *fiber.Ctx) error {
	userID := middlewares.GetUserID(c)

	var payments []models.Payment
	if err := db.DB.Where("user_id = ?", userID).Order("created_at DESC").
		Preload("Subscription").Find(&payments).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось получить платежи",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "success",
		"data":   payments,
	})
}

// GetPaymentByID получает платеж по ID
func (pc *PaymentController) GetPaymentByID(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := middlewares.GetUserID(c)

	var payment models.Payment
	if err := db.DB.Where("id = ? AND user_id = ?", id, userID).
		Preload("Subscription").First(&payment).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "Платеж не найден",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "success",
		"data":   payment,
	})
}

// ProcessPayment обрабатывает платеж за подписку
func (pc *PaymentController) ProcessPayment(c *fiber.Ctx) error {
	userID := middlewares.GetUserID(c)
	var input struct {
		Plan            string `json:"plan" validate:"required,oneof=basic premium pro"`
		Period          string `json:"period" validate:"required,oneof=monthly yearly lifetime"`
		PaymentMethod   string `json:"paymentMethod" validate:"required"`
		PaymentIntentId string `json:"paymentIntentId" validate:"required"`
	}

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

	// Сначала создаем новую подписку
	subscriptionInput := models.SubscriptionCreate{
		Plan:      models.SubscriptionPlan(input.Plan),
		Period:    models.SubscriptionPeriod(input.Period),
		StartDate: time.Now(),
	}

	// Деактивируем существующие активные подписки
	db.DB.Model(&models.Subscription{}).
		Where("user_id = ? AND active = ?", userID, true).
		Updates(map[string]interface{}{"active": false})

	// Определяем дату окончания
	startDate := subscriptionInput.StartDate
	if startDate.IsZero() {
		startDate = time.Now()
	}

	var endDate *time.Time
	if subscriptionInput.Period != models.LifetimeSubscription {
		var ed time.Time
		if subscriptionInput.Period == models.MonthlySubscription {
			ed = startDate.AddDate(0, 1, 0) // +1 месяц
		} else { // Yearly
			ed = startDate.AddDate(1, 0, 0) // +1 год
		}
		endDate = &ed
	}

	// Получаем цену из предопределенных значений
	price := models.SubscriptionPrices[subscriptionInput.Plan][subscriptionInput.Period]

	// Создаем список функций в виде строки
	features := strings.Join(models.PlanFeatures[subscriptionInput.Plan], ", ")

	// Создаем новую подписку
	subscription := models.Subscription{
		UserID:    userID,
		Plan:      subscriptionInput.Plan,
		Period:    subscriptionInput.Period,
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

	// Получаем пользователя для информации
	var user models.User
	db.DB.First(&user, userID)
	firstName, _ := utils.DecryptString(user.FirstName)
	lastName, _ := utils.DecryptString(user.LastName)

	// Формируем и отправляем сообщение в Telegram
	start := subscription.StartDate.Format("2006-01-02")
	end := "-"
	if subscription.EndDate != nil {
		end = subscription.EndDate.Format("2006-01-02")
	}
	msg := "🆕 Новая подписка (оплата)\n" +
		"Email: " + user.Email + "\n" +
		"Имя: " + firstName + "\n" +
		"Фамилия: " + lastName + "\n" +
		"План: " + string(subscription.Plan) + "\n" +
		"Период: " + string(subscription.Period) + "\n" +
		"Дата начала: " + start + "\n" +
		"Дата окончания: " + end
	utils.SendTelegramMessage(msg)

	// Создаем новый платеж
	payment := models.Payment{
		UserID:         userID,
		SubscriptionID: subscription.ID,
		Amount:         subscription.Price,
		Currency:       "RUB",
		Status:         models.PaymentSuccess,
		Method:         models.PaymentMethod(input.PaymentMethod),
		PaymentDate:    time.Now(),
		Description:    fmt.Sprintf("Оплата подписки %s (%s)", subscription.Plan, subscription.Period),
		TransactionID:  input.PaymentIntentId,
		InvoiceID:      fmt.Sprintf("INV-%d-%03d", time.Now().Year(), rand.Intn(1000)),
	}

	if err := db.DB.Create(&payment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось создать платеж",
			"error":   err.Error(),
		})
	}

	// Создаем уведомление о платеже
	notification := models.Notification{
		UserID:     userID,
		Type:       models.NotificationPayment,
		Title:      "Оплата успешно проведена",
		Message:    fmt.Sprintf("Ваша оплата подписки %s успешно проведена. Сумма: %.2f %s", subscription.Plan, payment.Amount, payment.Currency),
		Importance: models.NotificationNormal,
		IsRead:     false,
		Data:       fmt.Sprintf(`{"paymentId": %d, "amount": %.2f, "subscriptionId": %d}`, payment.ID, payment.Amount, payment.SubscriptionID),
	}

	if err := db.DB.Create(&notification).Error; err != nil {
		log.Printf("Failed to create payment notification: %v", err)
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  "success",
		"message": "Платеж успешно обработан",
		"data": fiber.Map{
			"payment":      payment,
			"subscription": subscription,
		},
	})
}

// RefundPayment возвращает деньги за подписку (имитация)
func (pc *PaymentController) RefundPayment(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := middlewares.GetUserID(c)

	var payment models.Payment
	if err := db.DB.Where("id = ? AND user_id = ?", id, userID).
		Preload("Subscription").First(&payment).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "Платеж не найден",
			"error":   err.Error(),
		})
	}

	// Проверяем, что платеж был успешным
	if payment.Status != models.PaymentSuccess {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Возврат возможен только для успешных платежей",
		})
	}

	// Обновляем статус платежа
	payment.Status = models.PaymentRefunded
	db.DB.Save(&payment)

	// Деактивируем подписку
	var subscription models.Subscription
	db.DB.First(&subscription, payment.SubscriptionID)
	if subscription.ID != 0 {
		subscription.Active = false
		db.DB.Save(&subscription)
	}

	// Создаем уведомление о возврате платежа
	notification := models.Notification{
		UserID:     userID,
		Type:       models.NotificationPayment,
		Title:      "Возврат платежа выполнен",
		Message:    fmt.Sprintf("Возврат платежа на сумму %.2f %s успешно выполнен", payment.Amount, payment.Currency),
		Importance: models.NotificationHigh,
		IsRead:     false,
		Data:       fmt.Sprintf(`{"paymentId": %d, "amount": %.2f, "subscriptionId": %d}`, payment.ID, payment.Amount, payment.SubscriptionID),
	}

	if err := db.DB.Create(&notification).Error; err != nil {
		log.Printf("Failed to create refund notification: %v", err)
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  "success",
		"message": "Платеж успешно возвращен",
		"data":    payment,
	})
}
