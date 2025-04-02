package models

import (
	"time"
)

// CategoryType тип категории (расход или доход)
type CategoryType string

const (
	// Expense тип для расходов
	Expense CategoryType = "expense"
	// Income тип для доходов
	Income CategoryType = "income"
)

// Category модель категории
type Category struct {
	ID          uint         `gorm:"primaryKey" json:"id"`
	Name        string       `gorm:"not null" json:"name"`
	Description string       `json:"description"`
	Type        CategoryType `gorm:"not null" json:"type"`
	UserID      uint         `gorm:"not null" json:"userId"`
	User        User         `gorm:"foreignKey:UserID" json:"-"`
	Color       string       `json:"color"`
	Icon        string       `json:"icon"`
	CreatedAt   time.Time    `json:"createdAt"`
	UpdatedAt   time.Time    `json:"updatedAt"`
}

// CategoryDTO структура для создания/обновления категории
type CategoryDTO struct {
	Name        string       `json:"name" validate:"required"`
	Description string       `json:"description"`
	Type        CategoryType `json:"type" validate:"required,oneof=expense income"`
	Color       string       `json:"color"`
	Icon        string       `json:"icon"`
}
