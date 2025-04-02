package models

import (
	"time"
)

// RefreshToken модель для хранения токенов обновления
type RefreshToken struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Token     string    `gorm:"uniqueIndex;not null" json:"token"`
	UserID    uint      `gorm:"not null;index" json:"userId"`
	User      User      `gorm:"foreignKey:UserID" json:"-"`
	ExpiresAt time.Time `gorm:"not null" json:"expiresAt"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
	Used      bool      `gorm:"default:false" json:"used"`
	RevokedAt *time.Time `json:"revokedAt"`
}

// IsValid проверяет, действителен ли токен обновления
func (rt *RefreshToken) IsValid() bool {
	return !rt.Used && rt.RevokedAt == nil && time.Now().Before(rt.ExpiresAt)
} 