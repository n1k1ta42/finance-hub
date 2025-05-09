package models

import (
	"time"
)

// Transaction модель транзакции
type Transaction struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Amount      float64   `gorm:"not null" json:"amount"`
	Description string    `json:"description"`
	Date        time.Time `gorm:"not null" json:"date"`
	CategoryID  uint      `gorm:"not null" json:"categoryId"`
	Category    Category  `gorm:"foreignKey:CategoryID" json:"category"`
	UserID      uint      `gorm:"not null" json:"userId"`
	User        User      `gorm:"foreignKey:UserID" json:"-"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// TransactionDTO структура для создания/обновления транзакции
type TransactionDTO struct {
	Amount      float64   `json:"amount" validate:"required,gt=0"`
	Description string    `json:"description"`
	Date        time.Time `json:"date" validate:"required"`
	CategoryID  uint      `json:"categoryId" validate:"required"`
}

// BulkTransactionDTO структура для массового создания транзакций
type BulkTransactionDTO struct {
	Transactions []TransactionDTO `json:"transactions" validate:"required,min=1,dive"`
}

// BulkDeleteDTO структура для массового удаления транзакций
type BulkDeleteDTO struct {
	TransactionIDs []uint `json:"transactionIds" validate:"required,min=1"`
}
