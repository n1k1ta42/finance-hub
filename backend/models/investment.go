package models

import (
	"time"
)

// InvestmentStatus статус инвестиции
type InvestmentStatus string

const (
	InvestmentOpen   InvestmentStatus = "open"
	InvestmentClosed InvestmentStatus = "closed"
	InvestmentArchived InvestmentStatus = "archived"
)

// InvestmentType тип инвестиции (вклад, ценные бумаги, недвижимость и т.д.)
type InvestmentType string

const (
	InvestmentDeposit   InvestmentType = "deposit"
	InvestmentSecurity  InvestmentType = "security"
	InvestmentRealty    InvestmentType = "realty"
)

// Investment модель инвестиции
// capitalization - сумма накопленной прибыли/капитализации
// tags и comments - простые строки, можно расширить при необходимости

type Investment struct {
	ID             uint             `gorm:"primaryKey" json:"id"`
	UserID         uint             `gorm:"not null" json:"userId"`
	User           User             `gorm:"foreignKey:UserID" json:"-"`
	Name           string           `gorm:"not null" json:"name"`
	Type           InvestmentType   `gorm:"not null" json:"type"`
	Status         InvestmentStatus `gorm:"not null;default:'open'" json:"status"`
	Amount         float64          `json:"amount"`
	StartDate      time.Time        `json:"startDate"`
	EndDate        *time.Time       `json:"endDate"`
	Capitalization float64          `json:"capitalization"`
	Comments       string           `json:"comments"`
	Tags           string           `json:"tags"`
	CreatedAt      time.Time        `json:"createdAt"`
	UpdatedAt      time.Time        `json:"updatedAt"`
}

type InvestmentOperation struct {
	ID           uint        `gorm:"primaryKey" json:"id"`
	InvestmentID uint        `gorm:"not null" json:"investmentId"`
	Investment   Investment  `gorm:"foreignKey:InvestmentID" json:"-"`
	UserID       uint        `gorm:"not null" json:"userId"`
	Type         string      `json:"type"` // deposit, withdrawal, capitalization
	Amount       float64     `json:"amount"`
	Date         time.Time   `json:"date"`
	Comment      string      `json:"comment"`
	CreatedAt    time.Time   `json:"createdAt"`
	UpdatedAt    time.Time   `json:"updatedAt"`
} 