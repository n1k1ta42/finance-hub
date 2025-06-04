package controllers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/nikitagorchakov/finance-hub/backend/db"
	"github.com/nikitagorchakov/finance-hub/backend/middlewares"
	"github.com/nikitagorchakov/finance-hub/backend/models"
	"github.com/nikitagorchakov/finance-hub/backend/utils"
)

type RecurringController struct{}

func NewRecurringController() *RecurringController {
	return &RecurringController{}
}

// GetAllRules получает все активные правила пользователя
func (rc *RecurringController) GetAllRules(c *fiber.Ctx) error {
	userID := middlewares.GetUserID(c)
	
	var rules []models.RecurringRule
	if err := db.DB.Where("user_id = ?", userID).
		Preload("Category").
		Order("created_at DESC").
		Find(&rules).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось получить правила",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "success",
		"data":   rules,
	})
}

// GetRuleByID получает правило по ID
func (rc *RecurringController) GetRuleByID(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := middlewares.GetUserID(c)

	var rule models.RecurringRule
	if err := db.DB.Where("id = ? AND user_id = ?", id, userID).
		Preload("Category").
		First(&rule).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "Правило не найдено",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "success",
		"data":   rule,
	})
}

// CreateRule создает новое правило
func (rc *RecurringController) CreateRule(c *fiber.Ctx) error {
	var input models.RecurringRuleDTO
	userID := middlewares.GetUserID(c)

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

	// Проверяем категорию
	var category models.Category
	if err := db.DB.Where("id = ? AND user_id = ?", input.CategoryID, userID).First(&category).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Категория не найдена",
		})
	}

	rule := models.RecurringRule{
		UserID:          userID,
		Amount:          input.Amount,
		Description:     input.Description,
		CategoryID:      input.CategoryID,
		Frequency:       input.Frequency,
		StartDate:       input.StartDate,
		EndDate:         input.EndDate,
		NextExecuteDate: input.StartDate,
		IsActive:        true,
	}

	if err := db.DB.Create(&rule).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось создать правило",
			"error":   err.Error(),
		})
	}

	// Загружаем категорию для ответа
	db.DB.Preload("Category").First(&rule, rule.ID)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"status":  "success",
		"message": "Правило создано",
		"data":    rule,
	})
}

// UpdateRule обновляет правило
func (rc *RecurringController) UpdateRule(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := middlewares.GetUserID(c)
	
	var input models.RecurringRuleDTO
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

	var rule models.RecurringRule
	if err := db.DB.Where("id = ? AND user_id = ?", id, userID).First(&rule).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "Правило не найдено",
		})
	}

	// Обновляем поля
	rule.Amount = input.Amount
	rule.Description = input.Description
	rule.CategoryID = input.CategoryID
	rule.Frequency = input.Frequency
	rule.StartDate = input.StartDate
	rule.EndDate = input.EndDate

	if err := db.DB.Save(&rule).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось обновить правило",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  "success",
		"message": "Правило обновлено",
		"data":    rule,
	})
}

// ToggleRule включает/выключает правило
func (rc *RecurringController) ToggleRule(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := middlewares.GetUserID(c)

	var rule models.RecurringRule
	if err := db.DB.Where("id = ? AND user_id = ?", id, userID).First(&rule).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "Правило не найдено",
		})
	}

	rule.IsActive = !rule.IsActive

	if err := db.DB.Save(&rule).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось обновить правило",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  "success",
		"message": "Статус правила изменен",
		"data":    rule,
	})
}

// DeleteRule удаляет правило
func (rc *RecurringController) DeleteRule(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := middlewares.GetUserID(c)

	var rule models.RecurringRule
	if err := db.DB.Where("id = ? AND user_id = ?", id, userID).First(&rule).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "Правило не найдено",
		})
	}

	if err := db.DB.Delete(&rule).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось удалить правило",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  "success",
		"message": "Правило удалено",
	})
}

// ProcessRecurringTransactions выполняет регулярные транзакции (для cron)
func (rc *RecurringController) ProcessRecurringTransactions(c *fiber.Ctx) error {
	now := time.Now()
	
	var rules []models.RecurringRule
	if err := db.DB.Where("is_active = ? AND next_execute_date <= ?", true, now).
		Preload("Category").
		Find(&rules).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось получить правила для выполнения",
			"error":   err.Error(),
		})
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
				continue // Пропускаем если не удалось создать
			}

			// Обновляем следующую дату выполнения
			rule.NextExecuteDate = rule.CalculateNextExecuteDate()
			
			// Проверяем, не истек ли срок действия правила
			if rule.EndDate != nil && rule.NextExecuteDate.After(*rule.EndDate) {
				rule.IsActive = false
			}

			db.DB.Save(&rule)
			processedCount++
		}
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  "success",
		"message": "Регулярные транзакции обработаны",
		"data": fiber.Map{
			"processed_count": processedCount,
		},
	})
} 