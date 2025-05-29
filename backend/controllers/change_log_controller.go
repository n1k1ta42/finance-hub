package controllers

import (
	"encoding/json"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/nikitagorchakov/finance-hub/backend/db"
	"github.com/nikitagorchakov/finance-hub/backend/middlewares"
	"github.com/nikitagorchakov/finance-hub/backend/models"
)

type ChangeLogController struct{}

func NewChangeLogController() *ChangeLogController {
	return &ChangeLogController{}
}

// GetEntityHistory получает историю изменений для конкретной сущности
func (cc *ChangeLogController) GetEntityHistory(c *fiber.Ctx) error {
	userID := middlewares.GetUserID(c)
	entityType := c.Params("entityType")
	entityID := c.Params("entityId")
	
	var changeLogs []models.ChangeLog
	if err := db.DB.Where("user_id = ? AND entity_type = ? AND entity_id = ?", userID, entityType, entityID).
		Order("created_at desc").Find(&changeLogs).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "error",
			"message": "Не удалось получить историю изменений",
		})
	}

	var entries []models.ChangeLogEntry
	for _, log := range changeLogs {
		var changes map[string]interface{}
		if log.Changes != "" {
			json.Unmarshal([]byte(log.Changes), &changes)
		}

		// Получаем название связанного объекта
		entityName := getEntityName(log.EntityType, log.EntityID, userID)

		entries = append(entries, models.ChangeLogEntry{
			ID:         log.ID,
			EntityType: log.EntityType,
			EntityID:   log.EntityID,
			EntityName: entityName,
			Action:     log.Action,
			Changes:    changes,
			CreatedAt:  log.CreatedAt,
		})
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"data":   entries,
	})
}

// GetUserHistory получает общую историю изменений пользователя
func (cc *ChangeLogController) GetUserHistory(c *fiber.Ctx) error {
	userID := middlewares.GetUserID(c)
	
	// Параметры пагинации
	limit := 50
	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed <= 100 {
			limit = parsed
		}
	}

	offset := 0
	if o := c.Query("offset"); o != "" {
		if parsed, err := strconv.Atoi(o); err == nil {
			offset = parsed
		}
	}

	var changeLogs []models.ChangeLog
	query := db.DB.Where("user_id = ?", userID)

	// Фильтр по типу сущности
	if entityType := c.Query("entityType"); entityType != "" {
		query = query.Where("entity_type = ?", entityType)
	}

	if err := query.Order("created_at desc").
		Limit(limit).Offset(offset).Find(&changeLogs).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "error",
			"message": "Не удалось получить историю изменений",
		})
	}

	var entries []models.ChangeLogEntry
	for _, log := range changeLogs {
		var changes map[string]interface{}
		if log.Changes != "" {
			json.Unmarshal([]byte(log.Changes), &changes)
		}

		// Получаем название связанного объекта
		entityName := getEntityName(log.EntityType, log.EntityID, userID)

		entries = append(entries, models.ChangeLogEntry{
			ID:         log.ID,
			EntityType: log.EntityType,
			EntityID:   log.EntityID,
			EntityName: entityName,
			Action:     log.Action,
			Changes:    changes,
			CreatedAt:  log.CreatedAt,
		})
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"data":   entries,
		"pagination": fiber.Map{
			"limit":  limit,
			"offset": offset,
		},
	})
}

// getEntityName получает название объекта по его типу и ID
func getEntityName(entityType models.ChangeLogEntityType, entityID uint, userID uint) string {
	switch entityType {
	case models.EntityProject:
		var project models.Project
		if err := db.DB.Where("id = ? AND user_id = ?", entityID, userID).First(&project).Error; err == nil {
			return project.Name
		}
	case models.EntityInvestment:
		var investment models.Investment
		if err := db.DB.Where("id = ? AND user_id = ?", entityID, userID).First(&investment).Error; err == nil {
			return investment.Name
		}
	case models.EntityProjectPayment:
		var payment models.ProjectPayment
		if err := db.DB.Where("id = ? AND user_id = ?", entityID, userID).First(&payment).Error; err == nil {
			// Получаем название проекта для платежа
			var project models.Project
			if err := db.DB.Where("id = ? AND user_id = ?", payment.ProjectID, userID).First(&project).Error; err == nil {
				return project.Name
			}
		}
	case models.EntityInvestmentOperation:
		var operation models.InvestmentOperation
		if err := db.DB.Where("id = ? AND user_id = ?", entityID, userID).First(&operation).Error; err == nil {
			// Получаем название инвестиции для операции
			var investment models.Investment
			if err := db.DB.Where("id = ? AND user_id = ?", operation.InvestmentID, userID).First(&investment).Error; err == nil {
				return investment.Name
			}
		}
	}
	return "Неизвестный объект"
} 