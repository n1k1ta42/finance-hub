package models

import (
	"time"
)

// SubscriptionPlan тип плана подписки
type SubscriptionPlan string

const (
	// Basic базовый план
	Basic SubscriptionPlan = "basic"
	// Premium премиум план
	Premium SubscriptionPlan = "premium"
	// Pro профессиональный план
	Pro SubscriptionPlan = "pro"
)

// SubscriptionPeriod период подписки
type SubscriptionPeriod string

const (
	// MonthlySubscription ежемесячная подписка
	MonthlySubscription SubscriptionPeriod = "monthly"
	// YearlySubscription ежегодная подписка
	YearlySubscription SubscriptionPeriod = "yearly"
	// LifetimeSubscription бессрочная подписка
	LifetimeSubscription SubscriptionPeriod = "lifetime"
)

// Subscription модель подписки
type Subscription struct {
	ID        uint               `gorm:"primaryKey" json:"id"`
	UserID    uint               `gorm:"not null" json:"userId"`
	User      User               `gorm:"foreignKey:UserID" json:"-"`
	Plan      SubscriptionPlan   `gorm:"not null" json:"plan"`
	Period    SubscriptionPeriod `gorm:"not null" json:"period"`
	StartDate time.Time          `gorm:"not null" json:"startDate"`
	EndDate   *time.Time         `json:"end_date"` // null для пожизненной подписки
	Active    bool               `gorm:"not null;default:true" json:"active"`
	Price     float64            `gorm:"not null" json:"price"`
	Features  string             `json:"features"` // Список функций, доступных с этой подпиской
	CreatedAt time.Time          `json:"createdAt"`
	UpdatedAt time.Time          `json:"updatedUt"`
}

// SubscriptionCreate структура для создания подписки
type SubscriptionCreate struct {
	Plan      SubscriptionPlan   `json:"plan" validate:"required,oneof=basic premium pro"`
	Period    SubscriptionPeriod `json:"period" validate:"required,oneof=monthly yearly lifetime"`
	StartDate time.Time          `json:"startDate"`
	EndDate   *time.Time         `json:"endDate,omitempty"`
}

// PlanInfo информация о плане подписки
type PlanInfo struct {
	Plan        SubscriptionPlan   `json:"plan"`
	Period      SubscriptionPeriod `json:"period"`
	Price       float64            `json:"price"`
	Description string             `json:"description"`
	Features    []string           `json:"features"`
}

// Определение цен на подписки
var SubscriptionPrices = map[SubscriptionPlan]map[SubscriptionPeriod]float64{
	Basic: {
		MonthlySubscription:  0.00,
		YearlySubscription:   0.00,
		LifetimeSubscription: 0.00,
	},
	Premium: {
		MonthlySubscription:  199.99,
		YearlySubscription:   1799.99,
		LifetimeSubscription: 3599.99,
	},
	Pro: {
		MonthlySubscription:  999.99,
		YearlySubscription:   8999.99,
		LifetimeSubscription: 17999.99,
	},
}

// Описание функций разных планов
var PlanFeatures = map[SubscriptionPlan][]string{
	Basic: {
		"До 5 категорий",
		"До 100 транзакций",
		"Базовая статистика",
	},
	Premium: {
		"Неограниченное количество категорий",
		"До 1000 транзакций",
		"Расширенная статистика",
		"Бюджетирование",
	},
	Pro: {
		"Неограниченное количество категорий",
		"Неограниченное количество транзакций",
		"Расширенная статистика",
		"Бюджетирование",
		"Экспорт данных",
		"Приоритетная поддержка",
	},
}
