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

// DefaultCategoryColors цвета по умолчанию для базовых категорий
var DefaultCategoryColors = map[string]string{
	"food":       "#FF5722", // Оранжевый
	"transport":  "#2196F3", // Синий
	"home":       "#4CAF50", // Зеленый
	"salary":     "#009688", // Бирюзовый
	"investment": "#9C27B0", // Фиолетовый
}

// DefaultCategoryIcons иконки по умолчанию для базовых категорий
var DefaultCategoryIcons = map[string]string{
	"food":       "🍽️",
	"transport":  "🚗",
	"home":       "🏠",
	"salary":     "💼",
	"investment": "📈",
}

// DefaultCategories список базовых категорий для нового пользователя
var DefaultCategories = []struct {
	Name        string
	Description string
	Type        CategoryType
	Color       string
	Icon        string
}{
	{
		Name:        "Еда и продукты",
		Description: "Расходы на питание, продукты, кафе и рестораны",
		Type:        Expense,
		Color:       DefaultCategoryColors["food"],
		Icon:        DefaultCategoryIcons["food"],
	},
	{
		Name:        "Транспорт",
		Description: "Расходы на общественный транспорт, такси, бензин",
		Type:        Expense,
		Color:       DefaultCategoryColors["transport"],
		Icon:        DefaultCategoryIcons["transport"],
	},
	{
		Name:        "Жилье и коммунальные услуги",
		Description: "Аренда, коммунальные платежи, интернет",
		Type:        Expense,
		Color:       DefaultCategoryColors["home"],
		Icon:        DefaultCategoryIcons["home"],
	},
	{
		Name:        "Зарплата",
		Description: "Основной доход от работы",
		Type:        Income,
		Color:       DefaultCategoryColors["salary"],
		Icon:        DefaultCategoryIcons["salary"],
	},
	{
		Name:        "Инвестиции",
		Description: "Доход от инвестиций, дивиденды",
		Type:        Income,
		Color:       DefaultCategoryColors["investment"],
		Icon:        DefaultCategoryIcons["investment"],
	},
}

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
