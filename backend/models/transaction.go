package models

import (
	"time"
)

// RecurringFrequency частота повторения
type RecurringFrequency string

const (
	// RecurringDaily ежедневно
	RecurringDaily RecurringFrequency = "daily"
	// RecurringWeekly еженедельно
	RecurringWeekly RecurringFrequency = "weekly"
	// RecurringMonthly ежемесячно
	RecurringMonthly RecurringFrequency = "monthly"
	// RecurringYearly ежегодно
	RecurringYearly RecurringFrequency = "yearly"
)

// RecurringRule модель правила регулярного платежа
type RecurringRule struct {
	ID              uint               `gorm:"primaryKey" json:"id"`
	UserID          uint               `gorm:"not null" json:"userId"`
	User            User               `gorm:"foreignKey:UserID" json:"-"`
	Amount          float64            `gorm:"not null" json:"amount"`
	Description     string             `json:"description"`
	CategoryID      uint               `gorm:"not null" json:"categoryId"`
	Category        Category           `gorm:"foreignKey:CategoryID" json:"category"`
	Frequency       RecurringFrequency `gorm:"not null" json:"frequency"`
	StartDate       time.Time          `gorm:"not null" json:"startDate"`
	EndDate         *time.Time         `json:"endDate"`                           // null для бессрочных
	NextExecuteDate time.Time          `gorm:"not null" json:"nextExecuteDate"`   // следующая дата создания транзакции
	IsActive        bool               `gorm:"default:true" json:"isActive"`      // активно ли правило
	CreatedAt       time.Time          `json:"createdAt"`
	UpdatedAt       time.Time          `json:"updatedAt"`
}

// Transaction модель транзакции
type Transaction struct {
	ID               uint           `gorm:"primaryKey" json:"id"`
	Amount           float64        `gorm:"not null" json:"amount"`
	Description      string         `json:"description"`
	Date             time.Time      `gorm:"not null" json:"date"`
	CategoryID       uint           `gorm:"not null" json:"categoryId"`
	Category         Category       `gorm:"foreignKey:CategoryID" json:"category"`
	UserID           uint           `gorm:"not null" json:"userId"`
	User             User           `gorm:"foreignKey:UserID" json:"-"`
	RecurringRuleID  *uint          `json:"recurringRuleId"`                      // ссылка на правило, если транзакция создана автоматически
	RecurringRule    *RecurringRule `gorm:"foreignKey:RecurringRuleID" json:"-"` // загружается по требованию
	IsRecurring      bool           `gorm:"default:false" json:"isRecurring"`     // создана ли автоматически
	CreatedAt        time.Time      `json:"createdAt"`
	UpdatedAt        time.Time      `json:"updatedAt"`
}

// TransactionDTO структура для создания/обновления транзакции
type TransactionDTO struct {
	Amount      float64   `json:"amount" validate:"required,gt=0"`
	Description string    `json:"description"`
	Date        time.Time `json:"date" validate:"required"`
	CategoryID  uint      `json:"categoryId" validate:"required"`
	// Поля для создания регулярного платежа
	CreateRecurring bool                `json:"createRecurring"`
	Frequency       *RecurringFrequency `json:"frequency"`
	EndDate         *time.Time          `json:"endDate"`
}

// RecurringRuleDTO структура для создания/обновления правила
type RecurringRuleDTO struct {
	Amount      float64            `json:"amount" validate:"required,gt=0"`
	Description string             `json:"description"`
	CategoryID  uint               `json:"categoryId" validate:"required"`
	Frequency   RecurringFrequency `json:"frequency" validate:"required,oneof=daily weekly monthly yearly"`
	StartDate   time.Time          `json:"startDate" validate:"required"`
	EndDate     *time.Time         `json:"endDate"`
}

// BulkTransactionDTO структура для массового создания транзакций
type BulkTransactionDTO struct {
	Transactions []TransactionDTO `json:"transactions" validate:"required,min=1,dive"`
}

// BulkDeleteDTO структура для массового удаления транзакций
type BulkDeleteDTO struct {
	TransactionIDs []uint `json:"transactionIds" validate:"required,min=1"`
}

// CalculateNextExecuteDate вычисляет следующую дату выполнения
func (r *RecurringRule) CalculateNextExecuteDate() time.Time {
	switch r.Frequency {
	case RecurringDaily:
		return r.NextExecuteDate.AddDate(0, 0, 1)
	case RecurringWeekly:
		return r.NextExecuteDate.AddDate(0, 0, 7)
	case RecurringMonthly:
		return r.NextExecuteDate.AddDate(0, 1, 0)
	case RecurringYearly:
		return r.NextExecuteDate.AddDate(1, 0, 0)
	default:
		return r.NextExecuteDate
	}
}

// IsTimeToExecute проверяет, пора ли выполнять правило
func (r *RecurringRule) IsTimeToExecute() bool {
	now := time.Now()
	return r.IsActive && r.NextExecuteDate.Before(now) && (r.EndDate == nil || r.EndDate.After(now))
}
