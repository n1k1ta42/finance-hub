package controllers

import (
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/nikitagorchakov/finance-hub/backend/db"
	"github.com/nikitagorchakov/finance-hub/backend/middlewares"
	"github.com/nikitagorchakov/finance-hub/backend/models"
	"github.com/nikitagorchakov/finance-hub/backend/utils"
)

// NotificationController контроллер для уведомлений
type NotificationController struct{}

// NewNotificationController создает новый контроллер уведомлений
func NewNotificationController() *NotificationController {
	return &NotificationController{}
}

// GetUserNotifications получает уведомления пользователя
func (nc *NotificationController) GetUserNotifications(c *fiber.Ctx) error {
	userID := middlewares.GetUserID(c)

	// Создаем фильтр
	filter := models.NotificationFilter{
		UserID: userID,
	}

	// Парсим параметры запроса
	if typeParam := c.Query("type"); typeParam != "" {
		filter.Type = typeParam
	}

	if isReadParam := c.Query("isRead"); isReadParam != "" {
		isRead := isReadParam == "true"
		filter.IsRead = &isRead
	}

	if importanceParam := c.Query("importance"); importanceParam != "" {
		filter.Importance = importanceParam
	}

	if limitParam := c.Query("limit"); limitParam != "" {
		if limit, err := strconv.Atoi(limitParam); err == nil {
			filter.Limit = limit
		}
	}

	if offsetParam := c.Query("offset"); offsetParam != "" {
		if offset, err := strconv.Atoi(offsetParam); err == nil {
			filter.Offset = offset
		}
	}

	// Выборка уведомлений
	var notifications []models.Notification
	query := db.DB.Where("user_id = ?", userID)

	if filter.Type != "" {
		query = query.Where("type = ?", filter.Type)
	}

	if filter.IsRead != nil {
		query = query.Where("is_read = ?", *filter.IsRead)
	}

	if filter.Importance != "" {
		query = query.Where("importance = ?", filter.Importance)
	}

	// Получаем общее количество уведомлений по этому запросу
	var count int64
	query.Model(&models.Notification{}).Count(&count)

	// Сортировка и пагинация
	if filter.Limit <= 0 {
		filter.Limit = 20 // Значение по умолчанию
	}

	query = query.Order("created_at DESC")

	if filter.Offset > 0 {
		query = query.Offset(filter.Offset)
	}

	query = query.Limit(filter.Limit)

	if err := query.Find(&notifications).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось получить уведомления",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "success",
		"data": fiber.Map{
			"notifications": notifications,
			"total":         count,
			"limit":         filter.Limit,
			"offset":        filter.Offset,
		},
	})
}

// GetUnreadCount получает количество непрочитанных уведомлений
func (nc *NotificationController) GetUnreadCount(c *fiber.Ctx) error {
	userID := middlewares.GetUserID(c)

	var count int64
	if err := db.DB.Model(&models.Notification{}).Where("user_id = ? AND is_read = ?", userID, false).Count(&count).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось получить количество непрочитанных уведомлений",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "success",
		"data": fiber.Map{
			"count": count,
		},
	})
}

// MarkAsRead помечает уведомление как прочитанное
func (nc *NotificationController) MarkAsRead(c *fiber.Ctx) error {
	userID := middlewares.GetUserID(c)
	id := c.Params("id")

	var notification models.Notification
	if err := db.DB.Where("id = ? AND user_id = ?", id, userID).First(&notification).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "Уведомление не найдено",
			"error":   err.Error(),
		})
	}

	// Помечаем как прочитанное
	notification.MarkAsRead()

	if err := db.DB.Save(&notification).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось обновить статус уведомления",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  "success",
		"message": "Уведомление помечено как прочитанное",
		"data":    notification,
	})
}

// MarkAllAsRead помечает все уведомления пользователя как прочитанные
func (nc *NotificationController) MarkAllAsRead(c *fiber.Ctx) error {
	userID := middlewares.GetUserID(c)
	now := time.Now()

	// Обновляем все непрочитанные уведомления
	result := db.DB.Model(&models.Notification{}).
		Where("user_id = ? AND is_read = ?", userID, false).
		Updates(map[string]interface{}{
			"is_read": true,
			"read_at": now,
		})

	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось обновить статус уведомлений",
			"error":   result.Error.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  "success",
		"message": "Все уведомления помечены как прочитанные",
		"data": fiber.Map{
			"count": result.RowsAffected,
		},
	})
}

// DeleteNotification удаляет уведомление
func (nc *NotificationController) DeleteNotification(c *fiber.Ctx) error {
	userID := middlewares.GetUserID(c)
	id := c.Params("id")

	var notification models.Notification
	if err := db.DB.Where("id = ? AND user_id = ?", id, userID).First(&notification).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "Уведомление не найдено",
			"error":   err.Error(),
		})
	}

	if err := db.DB.Delete(&notification).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось удалить уведомление",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  "success",
		"message": "Уведомление удалено",
	})
}

// DeleteAllNotifications удаляет все уведомления пользователя
func (nc *NotificationController) DeleteAllNotifications(c *fiber.Ctx) error {
	userID := middlewares.GetUserID(c)

	result := db.DB.Where("user_id = ?", userID).Delete(&models.Notification{})
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось удалить уведомления",
			"error":   result.Error.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  "success",
		"message": "Все уведомления удалены",
		"data": fiber.Map{
			"count": result.RowsAffected,
		},
	})
}

// CreateNotification создает новое уведомление
func (nc *NotificationController) CreateNotification(c *fiber.Ctx) error {
	var input models.NotificationCreate

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

	// Создаем уведомление
	notification := models.Notification{
		UserID:     input.UserID,
		Type:       input.Type,
		Title:      input.Title,
		Message:    input.Message,
		Importance: input.Importance,
		Data:       input.Data,
		IsRead:     false,
	}

	if err := db.DB.Create(&notification).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось создать уведомление",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"status":  "success",
		"message": "Уведомление создано",
		"data":    notification,
	})
} 