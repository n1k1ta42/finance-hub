package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/nikitagorchakov/finance-hub/backend/db"
	"github.com/nikitagorchakov/finance-hub/backend/middlewares"
	"github.com/nikitagorchakov/finance-hub/backend/models"
	"github.com/nikitagorchakov/finance-hub/backend/utils"
)

// CategoryController контроллер для категорий
type CategoryController struct{}

// NewCategoryController создает новый контроллер категорий
func NewCategoryController() *CategoryController {
	return &CategoryController{}
}

// GetAllCategories получает все категории пользователя
func (ct *CategoryController) GetAllCategories(c *fiber.Ctx) error {
	userID := middlewares.GetUserID(c)

	var categories []models.Category
	if err := db.DB.Where("user_id = ?", userID).Order("categories.name").Find(&categories).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось получить категории",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "success",
		"data":   categories,
	})
}

// GetCategoryByID получает категорию по ID
func (ct *CategoryController) GetCategoryByID(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := middlewares.GetUserID(c)

	var category models.Category
	if err := db.DB.Where("id = ? AND user_id = ?", id, userID).First(&category).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "Категория не найдена",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "success",
		"data":   category,
	})
}

// CreateCategory создает новую категорию
func (ct *CategoryController) CreateCategory(c *fiber.Ctx) error {
	var input models.CategoryDTO
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

	category := models.Category{
		Name:        input.Name,
		Description: input.Description,
		Type:        input.Type,
		Color:       input.Color,
		Icon:        input.Icon,
		UserID:      userID,
	}

	if err := db.DB.Create(&category).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось создать категорию",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"status":  "success",
		"message": "Категория успешно создана",
		"data":    category,
	})
}

// UpdateCategory обновляет категорию
func (ct *CategoryController) UpdateCategory(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := middlewares.GetUserID(c)

	var category models.Category
	if err := db.DB.Where("id = ? AND user_id = ?", id, userID).First(&category).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "Категория не найдена",
			"error":   err.Error(),
		})
	}

	var input models.CategoryDTO
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

	category.Name = input.Name
	category.Description = input.Description
	category.Type = input.Type
	category.Color = input.Color
	category.Icon = input.Icon

	if err := db.DB.Save(&category).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось обновить категорию",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  "success",
		"message": "Категория успешно обновлена",
		"data":    category,
	})
}

// DeleteCategory удаляет категорию
func (ct *CategoryController) DeleteCategory(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := middlewares.GetUserID(c)

	var category models.Category
	if err := db.DB.Where("id = ? AND user_id = ?", id, userID).First(&category).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "Категория не найдена",
			"error":   err.Error(),
		})
	}

	// Проверяем, есть ли транзакции с этой категорией
	var transactionCount int64
	db.DB.Model(&models.Transaction{}).Where("category_id = ?", id).Count(&transactionCount)

	if transactionCount > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Невозможно удалить категорию, так как существуют связанные с ней транзакции",
		})
	}

	if err := db.DB.Delete(&category).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось удалить категорию",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  "success",
		"message": "Категория успешно удалена",
	})
}
