package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/nikitagorchakov/finance-hub/backend/models"
)

// PublicController контроллер для публичных эндпоинтов
type PublicController struct{}

// NewPublicController создает новый экземпляр PublicController
func NewPublicController() *PublicController {
	return &PublicController{}
}

// GetSubscriptionPlans возвращает информацию о планах подписок
func (c *PublicController) GetSubscriptionPlans(ctx *fiber.Ctx) error {
	var plans []map[string]interface{}

	// Собираем все планы на основе данных из models.SubscriptionPrices
	for plan, periodPrices := range models.SubscriptionPrices {
		for period, price := range periodPrices {
			var description string
			
			// Определяем описание в зависимости от плана и периода
			switch {
			case plan == models.Basic:
				description = "Основные функции для учёта финансов"
			case plan == models.Premium && period == models.MonthlySubscription:
				description = "Расширенные функции: бюджетирование и регулярные платежи"
			case plan == models.Premium && period == models.YearlySubscription:
				description = "Расширенные функции со скидкой 20%"
			case plan == models.Premium && period == models.LifetimeSubscription:
				description = "Единоразовый платеж без необходимости продления"
			case plan == models.Pro && period == models.MonthlySubscription:
				description = "Полный доступ ко всем функциям без ограничений"
			case plan == models.Pro && period == models.YearlySubscription:
				description = "Полный доступ со скидкой 20%"
			case plan == models.Pro && period == models.LifetimeSubscription:
				description = "Полный доступ навсегда"
			}

			// Получаем функции плана из models.PlanFeatures
			features := models.PlanFeatures[plan]
			
			// Добавляем дополнительные функции для Lifetime подписок
			if period == models.LifetimeSubscription {
				if plan == models.Premium {
					features = append([]string{
						"Все функции Премиум плана навсегда",
						"Без ежемесячных платежей",
						"Бесплатные обновления",
					}, features...)
				} else if plan == models.Pro {
					features = append([]string{
						"Все функции Профессионального плана навсегда",
						"Без ежемесячных платежей",
						"Бесплатные обновления",
						"Приоритетная поддержка на весь срок",
					}, features...)
				}
			}

			planInfo := map[string]interface{}{
				"plan":        string(plan),
				"period":      string(period),
				"price":       price,
				"description": description,
				"features":    features,
			}
			
			plans = append(plans, planInfo)
		}
	}

	return ctx.JSON(plans)
}

// GetAppFeatures возвращает информацию о возможностях приложения
func (c *PublicController) GetAppFeatures(ctx *fiber.Ctx) error {
	features := []map[string]string{
		{
			"title":       "Дашборд",
			"description": "Общий обзор финансового состояния с графиками и быстрым доступом к основным функциям",
		},
		{
			"title":       "Транзакции",
			"description": "Удобное добавление, отслеживание и фильтрация всех финансовых операций",
		},
		{
			"title":       "Категории",
			"description": "Организация финансов с помощью персонализированных категорий с иконками и цветами",
		},
		{
			"title":       "Статистика",
			"description": "Детальный анализ доходов и расходов в виде наглядных графиков и отчетов",
		},
		{
			"title":       "Бюджеты",
			"description": "Планирование и отслеживание бюджетов по категориям с уведомлениями о превышении",
		},
		{
			"title":       "Платежи",
			"description": "Управление регулярными платежами и подписками с напоминаниями о предстоящих платежах",
		},
	}

	return ctx.JSON(fiber.Map{
		"features": features,
	})
}

// GetAppInfo возвращает общую информацию о приложении
func (c *PublicController) GetAppInfo(ctx *fiber.Ctx) error {
	return ctx.JSON(fiber.Map{
		"name":        "Finance Hub",
		"description": "Управляйте финансами просто и эффективно",
		"tagline":     "Наш сервис помогает контролировать расходы, планировать бюджет и достигать ваших финансовых целей",
		"contacts": map[string]string{
			"telegram": "@financehub_app",
		},
	})
} 