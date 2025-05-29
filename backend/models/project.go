package models

import (
	"time"
)

// ProjectStatus статус проекта
type ProjectStatus string

const (
	ProjectOpen   ProjectStatus = "open"
	ProjectClosed ProjectStatus = "closed"
	ProjectArchived ProjectStatus = "archived"
)

// ProjectType тип проекта (накопление, кредит и т.д.)
type ProjectType string

const (
	ProjectSaving ProjectType = "saving"
	ProjectLoan   ProjectType = "loan"
)

// Project модель проекта
// payments реализуем отдельной сущностью позже
// tags и comments - простые строки, можно расширить при необходимости

type Project struct {
	ID            uint          `gorm:"primaryKey" json:"id"`
	UserID        uint          `gorm:"not null" json:"userId"`
	User          User          `gorm:"foreignKey:UserID" json:"-"`
	Name          string        `gorm:"not null" json:"name"`
	Type          ProjectType   `gorm:"not null" json:"type"`
	Status        ProjectStatus `gorm:"not null;default:'open'" json:"status"`
	TargetAmount  float64       `json:"targetAmount"`
	CurrentAmount float64       `json:"currentAmount"`
	StartDate     time.Time     `json:"startDate"`
	EndDate       *time.Time    `json:"endDate"`
	Comments      string        `json:"comments"`
	Tags          string        `json:"tags"`
	CreatedAt     time.Time     `json:"createdAt"`
	UpdatedAt     time.Time     `json:"updatedAt"`
}

type ProjectPayment struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	ProjectID uint      `gorm:"not null" json:"projectId"`
	Project   Project   `gorm:"foreignKey:ProjectID" json:"-"`
	UserID    uint      `gorm:"not null" json:"userId"`
	Amount    float64   `json:"amount"`
	Date      time.Time `json:"date"`
	Comment   string    `json:"comment"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
} 