package models

import (
	"encoding/json"
	"time"
)

// ChangeLogAction тип действия в истории изменений
type ChangeLogAction string

const (
	ActionCreate ChangeLogAction = "create"
	ActionUpdate ChangeLogAction = "update"
	ActionDelete ChangeLogAction = "delete"
	ActionArchive ChangeLogAction = "archive"
	ActionUnarchive ChangeLogAction = "unarchive"
	ActionComplete ChangeLogAction = "complete"
)

// ChangeLogEntityType тип сущности
type ChangeLogEntityType string

const (
	EntityProject ChangeLogEntityType = "project"
	EntityInvestment ChangeLogEntityType = "investment"
	EntityProjectPayment ChangeLogEntityType = "project_payment"
	EntityInvestmentOperation ChangeLogEntityType = "investment_operation"
)

// ChangeLog модель истории изменений
type ChangeLog struct {
	ID         uint                `gorm:"primaryKey" json:"id"`
	UserID     uint                `gorm:"not null" json:"userId"`
	User       User                `gorm:"foreignKey:UserID" json:"-"`
	EntityType ChangeLogEntityType `gorm:"not null" json:"entityType"`
	EntityID   uint                `gorm:"not null" json:"entityId"`
	Action     ChangeLogAction     `gorm:"not null" json:"action"`
	OldData    string              `gorm:"type:text" json:"oldData"` // JSON строка с предыдущими данными
	NewData    string              `gorm:"type:text" json:"newData"` // JSON строка с новыми данными
	Changes    string              `gorm:"type:text" json:"changes"` // JSON строка с описанием изменений
	CreatedAt  time.Time           `json:"createdAt"`
}

// ChangeLogEntry структура для отображения записи истории
type ChangeLogEntry struct {
	ID         uint                `json:"id"`
	EntityType ChangeLogEntityType `json:"entityType"`
	EntityID   uint                `json:"entityId"`
	EntityName string              `json:"entityName"` // Название связанного объекта
	Action     ChangeLogAction     `json:"action"`
	Changes    map[string]interface{} `json:"changes"`
	CreatedAt  time.Time           `json:"createdAt"`
}

// excludedFields список полей, которые не нужно отслеживать в истории изменений
var excludedFields = map[string]bool{
	"id":        true, // ID не изменяется
	"ID":        true, // ID не изменяется (в разных форматах)
	"userId":    true, // ID пользователя не изменяется
	"UserID":    true, // ID пользователя не изменяется (в разных форматах)
	"createdAt": true, // Дата создания не изменяется
	"CreatedAt": true, // Дата создания не изменяется (в разных форматах)
	"updatedAt": true, // Дата обновления изменяется автоматически
	"UpdatedAt": true, // Дата обновления изменяется автоматически (в разных форматах)
}

// getFieldDisplayName возвращает читаемое название поля
func getFieldDisplayName(field string) string {
	fieldNames := map[string]string{
		"name":            "Название",
		"type":            "Тип",
		"status":          "Статус",
		"targetAmount":    "Целевая сумма",
		"currentAmount":   "Текущая сумма",
		"amount":          "Сумма",
		"startDate":       "Дата начала",
		"endDate":         "Дата окончания",
		"date":            "Дата",
		"comments":        "Комментарии",
		"comment":         "Комментарий",
		"tags":            "Теги",
		"capitalization":  "Капитализация",
		"projectId":       "ID проекта",
		"ProjectID":       "ID проекта",
		"investmentId":    "ID инвестиции",
		"InvestmentID":    "ID инвестиции",
	}
	
	if displayName, exists := fieldNames[field]; exists {
		return displayName
	}
	return field
}

// CalculateChanges вычисляет изменения между старыми и новыми данными
func CalculateChanges(oldData, newData interface{}, action ChangeLogAction) map[string]interface{} {
	changes := make(map[string]interface{})
	
	switch action {
	case ActionCreate:
		changes["action"] = "Создано"
		if newData != nil {
			changes["data"] = newData
		}
	case ActionDelete:
		changes["action"] = "Удалено"
	case ActionArchive:
		changes["action"] = "Архивировано"
	case ActionUnarchive:
		changes["action"] = "Разархивировано"
	case ActionComplete:
		changes["action"] = "Завершено"
	case ActionUpdate:
		changes["action"] = "Обновлено"
		if oldData != nil && newData != nil {
			// Простое сравнение через JSON
			oldJSON, _ := json.Marshal(oldData)
			newJSON, _ := json.Marshal(newData)
			
			var oldMap, newMap map[string]interface{}
			json.Unmarshal(oldJSON, &oldMap)
			json.Unmarshal(newJSON, &newMap)
			
			changedFields := make(map[string]interface{})
			for key, newValue := range newMap {
				// Пропускаем исключенные поля
				if excludedFields[key] {
					continue
				}
				
				if oldValue, exists := oldMap[key]; !exists || oldValue != newValue {
					// Проверяем, что изменение действительно значимое
					if isSignificantChange(oldValue, newValue) {
						changedFields[getFieldDisplayName(key)] = map[string]interface{}{
							"old": oldValue,
							"new": newValue,
						}
					}
				}
			}
			
			// Добавляем изменения только если есть значимые изменения
			if len(changedFields) > 0 {
				changes["fields"] = changedFields
			}
		}
	}
	
	return changes
}

// isSignificantChange проверяет, является ли изменение значимым
func isSignificantChange(oldValue, newValue interface{}) bool {
	// Если значения одинаковые, изменение незначимое
	if oldValue == newValue {
		return false
	}
	
	// Проверяем нулевые значения
	if oldValue == nil && newValue == nil {
		return false
	}
	
	// Для строк проверяем, что это не просто пустые значения
	if oldStr, ok := oldValue.(string); ok {
		if newStr, ok := newValue.(string); ok {
			// Если обе строки пустые, это незначимое изменение
			if (oldStr == "" || oldStr == "null") && (newStr == "" || newStr == "null") {
				return false
			}
		}
	}
	
	// Для чисел проверяем, что это не просто переход от 0 к 0.0
	if oldNum, ok := oldValue.(float64); ok {
		if newNum, ok := newValue.(float64); ok {
			if oldNum == 0 && newNum == 0 {
				return false
			}
		}
	}
	
	return true
} 