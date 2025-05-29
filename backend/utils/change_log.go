package utils

import (
	"encoding/json"

	"github.com/nikitagorchakov/finance-hub/backend/db"
	"github.com/nikitagorchakov/finance-hub/backend/models"
)

// CreateChangeLog создает запись в истории изменений
func CreateChangeLog(userID uint, entityType models.ChangeLogEntityType, entityID uint, action models.ChangeLogAction, oldData, newData interface{}) error {
	var oldDataJSON, newDataJSON, changesJSON string
	
	if oldData != nil {
		if data, err := json.Marshal(oldData); err == nil {
			oldDataJSON = string(data)
		}
	}
	
	if newData != nil {
		if data, err := json.Marshal(newData); err == nil {
			newDataJSON = string(data)
		}
	}
	
	// Вычисляем изменения
	changes := models.CalculateChanges(oldData, newData, action)
	if changesData, err := json.Marshal(changes); err == nil {
		changesJSON = string(changesData)
	}
	
	changeLog := models.ChangeLog{
		UserID:     userID,
		EntityType: entityType,
		EntityID:   entityID,
		Action:     action,
		OldData:    oldDataJSON,
		NewData:    newDataJSON,
		Changes:    changesJSON,
	}
	
	return db.DB.Create(&changeLog).Error
} 