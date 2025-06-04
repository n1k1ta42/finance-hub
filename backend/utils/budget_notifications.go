package utils

import (
	"fmt"
	"log"

	"github.com/nikitagorchakov/finance-hub/backend/db"
	"github.com/nikitagorchakov/finance-hub/backend/models"
	"github.com/nikitagorchakov/finance-hub/backend/telegram"
)

// CheckBudgetThresholds проверяет превышение пороговых значений для всех бюджетов пользователя
func CheckBudgetThresholds(userID uint) error {
	// Получаем все активные бюджеты пользователя
	var budgets []models.Budget
	if err := db.DB.Where("user_id = ?", userID).
		Preload("Category").
		Find(&budgets).Error; err != nil {
		return fmt.Errorf("ошибка получения бюджетов: %w", err)
	}

	for _, budget := range budgets {
		if err := checkSingleBudgetThresholds(&budget); err != nil {
			log.Printf("Ошибка проверки бюджета %d: %v", budget.ID, err)
		}
	}

	return nil
}

// checkSingleBudgetThresholds проверяет пороговые значения для одного бюджета
func checkSingleBudgetThresholds(budget *models.Budget) error {
	exceededThresholds := budget.GetThresholdStatus()
	
	for _, threshold := range exceededThresholds {
		// Проверяем, не отправляли ли уже уведомление для этого порога
		if hasNotificationBeenSent(budget.ID, threshold) {
			continue
		}

		notification := createBudgetNotification(budget, threshold)
		if err := db.DB.Create(&notification).Error; err != nil {
			return fmt.Errorf("ошибка создания уведомления: %w", err)
		}

		// Получаем пользователя для отправки Telegram уведомления
		var user models.User
		if err := db.DB.First(&user, budget.UserID).Error; err != nil {
			log.Printf("Ошибка получения пользователя %d: %v", budget.UserID, err)
			continue
		}

		// Отправляем Telegram уведомление только если у пользователя настроен chat ID
		if user.TelegramChatID != "" {
			telegramMessage := formatTelegramBudgetMessage(budget, threshold)
			
			// Получаем экземпляр клиентского бота
			telegramService, err := telegram.GetInstance()
			if err != nil {
				log.Printf("Ошибка получения Telegram сервиса: %v", err)
			} else {
				if err := telegramService.SendNotification(user.TelegramChatID, telegramMessage); err != nil {
					log.Printf("Ошибка отправки Telegram уведомления пользователю %d: %v", user.ID, err)
				} else {
					log.Printf("Отправлено Telegram уведомление пользователю %d о превышении бюджета %s на %.0f%%", user.ID, budget.Name, threshold)
				}
			}
		}

		log.Printf("Отправлено уведомление о превышении бюджета %s на %.0f%%", budget.Name, threshold)
	}

	return nil
}

// hasNotificationBeenSent проверяет, отправлялось ли уже уведомление для данного бюджета и порога
func hasNotificationBeenSent(budgetID uint, threshold float64) bool {
	var count int64
	dataPattern := fmt.Sprintf(`%%"budgetId": %d%%"threshold": %.0f%%`, budgetID, threshold)
	
	db.DB.Model(&models.Notification{}).
		Where("type = ? AND data LIKE ?", models.NotificationBudget, dataPattern).
		Count(&count)
	
	return count > 0
}

// createBudgetNotification создает уведомление о превышении бюджета
func createBudgetNotification(budget *models.Budget, threshold float64) models.Notification {
	title, message, importance := getBudgetNotificationContent(budget, threshold)
	
	return models.Notification{
		UserID:     budget.UserID,
		Type:       models.NotificationBudget,
		Title:      title,
		Message:    message,
		Importance: importance,
		IsRead:     false,
		Data:       fmt.Sprintf(`{"budgetId": %d, "threshold": %.0f, "usage": %.2f, "amount": %.2f, "spent": %.2f}`, 
			budget.ID, threshold, budget.GetUsagePercentage(), budget.Amount, budget.Spent),
	}
}

// getBudgetNotificationContent возвращает содержимое уведомления в зависимости от порога
func getBudgetNotificationContent(budget *models.Budget, threshold float64) (string, string, models.NotificationImportance) {
	categoryName := "Общий"
	if budget.Category != nil {
		categoryName = budget.Category.Name
	}

	usage := budget.GetUsagePercentage()
	
	switch threshold {
	case 80:
		return "⚠️ Бюджет на 80%",
			fmt.Sprintf("Бюджет \"%s\" (%s) израсходован на %.1f%%. Потрачено: %.2f₽ из %.2f₽", 
				budget.Name, categoryName, usage, budget.Spent, budget.Amount),
			models.NotificationNormal
	case 100:
		return "🚨 Бюджет превышен!",
			fmt.Sprintf("Бюджет \"%s\" (%s) превышен на %.1f%%! Потрачено: %.2f₽ из %.2f₽", 
				budget.Name, categoryName, usage-100, budget.Spent, budget.Amount),
			models.NotificationHigh
	case 120:
		return "🔥 Критическое превышение!",
			fmt.Sprintf("Бюджет \"%s\" (%s) критически превышен на %.1f%%! Потрачено: %.2f₽ из %.2f₽", 
				budget.Name, categoryName, usage-100, budget.Spent, budget.Amount),
			models.NotificationHigh
	default:
		return "📊 Уведомление о бюджете",
			fmt.Sprintf("Бюджет \"%s\" (%s) использован на %.1f%%", budget.Name, categoryName, usage),
			models.NotificationNormal
	}
}

// formatTelegramBudgetMessage форматирует сообщение для Telegram
func formatTelegramBudgetMessage(budget *models.Budget, threshold float64) string {
	categoryName := "Общий"
	if budget.Category != nil {
		categoryName = budget.Category.Name
	}

	usage := budget.GetUsagePercentage()
	
	switch threshold {
	case 80:
		return fmt.Sprintf("⚠️ Предупреждение о бюджете\n\nБюджет: %s (%s)\nИспользовано: %.1f%%\nПотрачено: %.2f₽ из %.2f₽\n\nРекомендуем контролировать расходы в этой категории.", 
			budget.Name, categoryName, usage, budget.Spent, budget.Amount)
	case 100:
		return fmt.Sprintf("🚨 ПРЕВЫШЕНИЕ БЮДЖЕТА!\n\nБюджет: %s (%s)\nПревышение: %.1f%%\nПотрачено: %.2f₽ из %.2f₽\n\nВНИМАНИЕ! Бюджет превышен!", 
			budget.Name, categoryName, usage-100, budget.Spent, budget.Amount)
	case 120:
		return fmt.Sprintf("🔥 КРИТИЧЕСКОЕ ПРЕВЫШЕНИЕ!\n\nБюджет: %s (%s)\nПревышение: %.1f%%\nПотрачено: %.2f₽ из %.2f₽\n\n🚨 СРОЧНО ТРЕБУЕТСЯ КОНТРОЛЬ РАСХОДОВ!", 
			budget.Name, categoryName, usage-100, budget.Spent, budget.Amount)
	default:
		return fmt.Sprintf("📊 Уведомление о бюджете\n\nБюджет: %s (%s)\nИспользовано: %.1f%%\nПотрачено: %.2f₽ из %.2f₽", 
			budget.Name, categoryName, usage, budget.Spent, budget.Amount)
	}
} 