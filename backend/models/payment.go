package models

import (
	"time"
)

// PaymentStatus статус платежа
type PaymentStatus string

const (
	// PaymentPending платеж в обработке
	PaymentPending PaymentStatus = "pending"
	// PaymentSuccess платеж успешно выполнен
	PaymentSuccess PaymentStatus = "success"
	// PaymentFailed платеж не выполнен
	PaymentFailed PaymentStatus = "failed"
	// PaymentRefunded платеж возвращен
	PaymentRefunded PaymentStatus = "refunded"
)

// PaymentMethod способ оплаты
type PaymentMethod string

const (
	// PaymentCreditCard оплата картой
	PaymentCreditCard PaymentMethod = "credit_card"
	// PaymentPayPal оплата через PayPal
	PaymentPayPal PaymentMethod = "paypal"
	// PaymentApplePay оплата через Apple Pay
	PaymentApplePay PaymentMethod = "apple_pay"
	// PaymentGooglePay оплата через Google Pay
	PaymentGooglePay PaymentMethod = "google_pay"
)

// Payment модель платежа
type Payment struct {
	ID             uint          `gorm:"primaryKey" json:"id"`
	UserID         uint          `gorm:"not null" json:"userId"`
	User           User          `gorm:"foreignKey:UserID" json:"-"`
	SubscriptionID uint          `gorm:"not null" json:"subscriptionId"`
	Subscription   Subscription  `gorm:"foreignKey:SubscriptionID" json:"subscription"`
	Amount         float64       `gorm:"not null" json:"amount"`
	Currency       string        `gorm:"not null;default:USD" json:"currency"`
	Status         PaymentStatus `gorm:"not null" json:"status"`
	Method         PaymentMethod `json:"method"`
	TransactionID  string        `json:"transactionId"` // Идентификатор транзакции в платежной системе
	InvoiceID      string        `json:"invoiceId"`     // Номер счета
	PaymentDate    time.Time     `json:"paymentDate"`
	Description    string        `json:"description"`
	CreatedAt      time.Time     `json:"createdAt"`
	UpdatedAt      time.Time     `json:"updatedUt"`
}

// PaymentCreate структура для создания платежа
type PaymentCreate struct {
	SubscriptionID uint          `json:"subscriptionId" validate:"required"`
	Amount         float64       `json:"amount" validate:"required,gt=0"`
	Method         PaymentMethod `json:"method" validate:"required,oneof=credit_card paypal apple_pay google_pay"`
	Description    string        `json:"description"`
}

// MockCreditCard структура для имитации данных кредитной карты
type MockCreditCard struct {
	Number     string `json:"number" validate:"required,min=16,max=16"`
	Expiry     string `json:"expiry" validate:"required,min=5,max=5"` // Формат MM/YY
	CVC        string `json:"cvc" validate:"required,min=3,max=4"`
	HolderName string `json:"holder_name" validate:"required"`
}
