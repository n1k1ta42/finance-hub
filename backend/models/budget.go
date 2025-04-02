package models

import (
	"time"
)

// BudgetPeriod период действия бюджета
type BudgetPeriod string

const (
	// Monthly месячный бюджет
	Monthly BudgetPeriod = "monthly"
	// Weekly недельный бюджет
	Weekly BudgetPeriod = "weekly"
	// Yearly годовой бюджет
	Yearly BudgetPeriod = "yearly"
)

// Budget модель бюджета
type Budget struct {
	ID         uint         `gorm:"primaryKey" json:"id"`
	Name       string       `gorm:"not null" json:"name"`
	Amount     float64      `gorm:"not null" json:"amount"`
	Period     BudgetPeriod `gorm:"not null" json:"period"`
	Spent      float64      `gorm:"default:0" json:"spent"` // сумма потраченных средств
	StartDate  time.Time    `gorm:"not null" json:"startDate"`
	EndDate    time.Time    `gorm:"not null" json:"endDate"`
	CategoryID *uint        `json:"categoryId"`
	Category   *Category    `gorm:"foreignKey:CategoryID" json:"category"`
	UserID     uint         `gorm:"not null" json:"userId"`
	User       User         `gorm:"foreignKey:UserID" json:"-"`
	CreatedAt  time.Time    `json:"createdAt"`
	UpdatedAt  time.Time    `json:"updatedAt"`
}

// BudgetDTO структура для создания/обновления бюджета
type BudgetDTO struct {
	Name       string       `json:"name" validate:"required"`
	Amount     float64      `json:"amount" validate:"required,gt=0"`
	Period     BudgetPeriod `json:"period" validate:"required,oneof=monthly weekly yearly"`
	StartDate  time.Time    `json:"startDate" validate:"required"`
	EndDate    time.Time    `json:"endDate" validate:"required,gtfield=StartDate"`
	CategoryID *uint        `json:"categoryId"`
}
