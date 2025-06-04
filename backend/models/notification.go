package models

import (
	"time"
)

// NotificationType тип уведомления
type NotificationType string

// NotificationImportance важность уведомления
type NotificationImportance string

const (
	// NotificationPayment платежное уведомление
	NotificationPayment NotificationType = "payment"
	// NotificationSubscription уведомление о подписке
	NotificationSubscription NotificationType = "subscription"
	// NotificationBudget уведомление о бюджете
	NotificationBudget NotificationType = "budget"
	// NotificationSystem системное уведомление
	NotificationSystem NotificationType = "system"
	// NotificationSecurity уведомление безопасности
	NotificationSecurity NotificationType = "security"

	// NotificationLow низкая важность
	NotificationLow NotificationImportance = "low"
	// NotificationNormal обычная важность
	NotificationNormal NotificationImportance = "normal"
	// NotificationHigh высокая важность
	NotificationHigh NotificationImportance = "high"
)

// Notification модель уведомления
type Notification struct {
	ID          uint                  `gorm:"primaryKey" json:"id"`
	UserID      uint                  `gorm:"not null;index" json:"userId"`
	User        User                  `gorm:"foreignKey:UserID" json:"-"`
	Type        NotificationType      `gorm:"not null" json:"type"`
	Title       string                `gorm:"not null" json:"title"`
	Message     string                `gorm:"not null" json:"message"`
	Importance  NotificationImportance `gorm:"not null;default:medium" json:"importance"`
	IsRead      bool                  `gorm:"not null;default:false" json:"isRead"`
	Data        string                `json:"data"` // JSON строка с дополнительными данными
	CreatedAt   time.Time             `json:"createdAt"`
	UpdatedAt   time.Time             `json:"updatedAt"`
	ReadAt      *time.Time            `json:"readAt"`
}

// NotificationCreate структура для создания уведомления
type NotificationCreate struct {
	UserID     uint                  `json:"userId" validate:"required"`
	Type       NotificationType      `json:"type" validate:"required,oneof=payment subscription budget system security"`
	Title      string                `json:"title" validate:"required"`
	Message    string                `json:"message" validate:"required"`
	Importance NotificationImportance `json:"importance" validate:"omitempty,oneof=low normal high"`
	Data       string                `json:"data,omitempty"`
}

// MarkAsRead помечает уведомление как прочитанное
func (n *Notification) MarkAsRead() {
	if !n.IsRead {
		now := time.Now()
		n.IsRead = true
		n.ReadAt = &now
	}
}

// NotificationFilter фильтр для списка уведомлений
type NotificationFilter struct {
	UserID     uint             `json:"userId"`
	Type       string           `json:"type,omitempty"`
	IsRead     *bool            `json:"isRead,omitempty"`
	Importance string           `json:"importance,omitempty"`
	StartDate  string           `json:"startDate,omitempty"`
	EndDate    string           `json:"endDate,omitempty"`
	Limit      int              `json:"limit,omitempty"`
	Offset     int              `json:"offset,omitempty"`
} 