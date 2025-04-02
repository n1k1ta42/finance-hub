package controllers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/nikitagorchakov/finance-hub/backend/db"
	"github.com/nikitagorchakov/finance-hub/backend/middlewares"
	"github.com/nikitagorchakov/finance-hub/backend/models"
	"github.com/nikitagorchakov/finance-hub/backend/utils"
)

// ReviewController контроллер для отзывов
type ReviewController struct{}

// NewReviewController создает новый контроллер отзывов
func NewReviewController() *ReviewController {
	return &ReviewController{}
}

// GetAllReviews получает все отзывы
func (c *ReviewController) GetAllReviews(ctx *fiber.Ctx) error {
	var reviews []models.Review
	result := db.DB.Preload("User").Order("created_at DESC").Find(&reviews)
	if result.Error != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Не удалось получить отзывы",
			"error":   result.Error.Error(),
		})
	}

	// Преобразуем массив отзывов в формат ответа
	var response []models.ReviewResponse
	for _, review := range reviews {
		response = append(response, review.ToReviewResponse())
	}

	return ctx.Status(fiber.StatusOK).JSON(response)
}

// GetLatestReviews получает последние N отзывов
func (c *ReviewController) GetLatestReviews(ctx *fiber.Ctx) error {
	limit := 5 // По умолчанию 5 отзывов

	// Проверка если есть query параметр limit
	if ctx.Query("limit") != "" {
		limitParam, err := strconv.Atoi(ctx.Query("limit"))
		if err != nil || limitParam <= 0 {
			limit = 5
		} else {
			limit = limitParam
		}
	}

	var reviews []models.Review
	result := db.DB.Preload("User").Order("created_at DESC").Limit(limit).Find(&reviews)
	if result.Error != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Не удалось получить отзывы",
			"error":   result.Error.Error(),
		})
	}

	// Преобразуем массив отзывов в формат ответа
	var response []models.ReviewResponse
	for _, review := range reviews {
		response = append(response, review.ToReviewResponse())
	}

	return ctx.Status(fiber.StatusOK).JSON(response)
}

// CreateReview создает новый отзыв
func (c *ReviewController) CreateReview(ctx *fiber.Ctx) error {
	// Получаем ID пользователя из токена
	userID := middlewares.GetUserID(ctx)

	// Парсим входные данные
	var input models.CreateReviewDTO
	if err := ctx.BodyParser(&input); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Некорректные данные",
			"error":   err.Error(),
		})
	}

	// Валидация входных данных
	validationErrors := utils.ValidateStruct(input)
	if len(validationErrors) > 0 {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Некорректные данные",
			"errors":  validationErrors,
		})
	}

	// Создаем новый отзыв
	review := models.Review{
		UserID:  userID,
		Rating:  input.Rating,
		Comment: input.Comment,
	}

	// Сохраняем в БД
	result := db.DB.Create(&review)
	if result.Error != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Не удалось создать отзыв",
			"error":   result.Error.Error(),
		})
	}

	// Загружаем данные пользователя для ответа
	db.DB.Preload("User").First(&review, review.ID)

	return ctx.Status(fiber.StatusCreated).JSON(review.ToReviewResponse())
}

// DeleteReview удаляет отзыв
func (c *ReviewController) DeleteReview(ctx *fiber.Ctx) error {
	// Получаем ID пользователя из токена
	userID := middlewares.GetUserID(ctx)

	// Получаем ID отзыва из параметров
	reviewID, err := strconv.Atoi(ctx.Params("id"))
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Неверный ID отзыва",
		})
	}

	// Проверяем существование отзыва и права на удаление
	var review models.Review
	result := db.DB.First(&review, reviewID)
	if result.Error != nil {
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"message": "Отзыв не найден",
		})
	}

	// Только владелец может удалить свой отзыв
	if review.UserID != userID {
		return ctx.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"message": "У вас нет прав на удаление этого отзыва",
		})
	}

	// Удаляем отзыв
	db.DB.Delete(&review)

	return ctx.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Отзыв успешно удален",
	})
}
