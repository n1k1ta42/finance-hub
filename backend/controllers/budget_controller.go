package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/nikitagorchakov/finance-hub/backend/db"
	"github.com/nikitagorchakov/finance-hub/backend/middlewares"
	"github.com/nikitagorchakov/finance-hub/backend/models"
	"github.com/nikitagorchakov/finance-hub/backend/utils"
)

// BudgetController контроллер для бюджетов
type BudgetController struct{}

// NewBudgetController создает новый контроллер бюджетов
func NewBudgetController() *BudgetController {
	return &BudgetController{}
}

// GetAllBudgets получает все бюджеты пользователя
func (bc *BudgetController) GetAllBudgets(c *fiber.Ctx) error {
	userID := middlewares.GetUserID(c)

	var budgets []models.Budget
	if err := db.DB.Where("user_id = ?", userID).Preload("Category").Find(&budgets).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось получить бюджеты",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "success",
		"data":   budgets,
	})
}

// GetBudgetByID получает бюджет по ID
func (bc *BudgetController) GetBudgetByID(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := middlewares.GetUserID(c)

	var budget models.Budget
	if err := db.DB.Where("id = ? AND user_id = ?", id, userID).Preload("Category").First(&budget).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "Бюджет не найден",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "success",
		"data":   budget,
	})
}

// CreateBudget создает новый бюджет
func (bc *BudgetController) CreateBudget(c *fiber.Ctx) error {
	var input models.BudgetDTO
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

	// Проверяем, существует ли категория и принадлежит ли она пользователю (если указана)
	if input.CategoryID != nil {
		var category models.Category
		if err := db.DB.Where("id = ? AND user_id = ?", *input.CategoryID, userID).First(&category).Error; err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"status":  "error",
				"message": "Категория не найдена или не принадлежит пользователю",
				"error":   err.Error(),
			})
		}
	}

	budget := models.Budget{
		Name:       input.Name,
		Amount:     input.Amount,
		Period:     input.Period,
		StartDate:  input.StartDate,
		EndDate:    input.EndDate,
		CategoryID: input.CategoryID,
		UserID:     userID,
	}

	if err := db.DB.Create(&budget).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось создать бюджет",
			"error":   err.Error(),
		})
	}

	// Загружаем связанную категорию для ответа (если есть)
	db.DB.Preload("Category").First(&budget, budget.ID)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"status":  "success",
		"message": "Бюджет успешно создан",
		"data":    budget,
	})
}

// UpdateBudget обновляет бюджет
func (bc *BudgetController) UpdateBudget(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := middlewares.GetUserID(c)

	var budget models.Budget
	if err := db.DB.Where("id = ? AND user_id = ?", id, userID).First(&budget).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "Бюджет не найден",
			"error":   err.Error(),
		})
	}

	var input models.BudgetDTO
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

	// Проверяем, существует ли категория и принадлежит ли она пользователю (если указана)
	if input.CategoryID != nil {
		var category models.Category
		if err := db.DB.Where("id = ? AND user_id = ?", *input.CategoryID, userID).First(&category).Error; err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"status":  "error",
				"message": "Категория не найдена или не принадлежит пользователю",
				"error":   err.Error(),
			})
		}
	}

	budget.Name = input.Name
	budget.Amount = input.Amount
	budget.Period = input.Period
	budget.StartDate = input.StartDate
	budget.EndDate = input.EndDate
	budget.CategoryID = input.CategoryID

	if err := db.DB.Save(&budget).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось обновить бюджет",
			"error":   err.Error(),
		})
	}

	// Загружаем связанную категорию для ответа (если есть)
	db.DB.Preload("Category").First(&budget, budget.ID)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  "success",
		"message": "Бюджет успешно обновлен",
		"data":    budget,
	})
}

// DeleteBudget удаляет бюджет
func (bc *BudgetController) DeleteBudget(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := middlewares.GetUserID(c)

	var budget models.Budget
	if err := db.DB.Where("id = ? AND user_id = ?", id, userID).First(&budget).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "Бюджет не найден",
			"error":   err.Error(),
		})
	}

	if err := db.DB.Delete(&budget).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось удалить бюджет",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  "success",
		"message": "Бюджет успешно удален",
	})
}
