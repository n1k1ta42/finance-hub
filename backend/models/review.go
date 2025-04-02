package models

import (
	"time"
)

// Review модель отзыва
type Review struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null" json:"userId"`
	User      User      `gorm:"foreignKey:UserID" json:"user"`
	Rating    uint      `gorm:"not null" json:"rating"` // Рейтинг от 1 до 5
	Comment   string    `gorm:"size:1000" json:"comment"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// ReviewResponse структура для ответа с включением данных пользователя
type ReviewResponse struct {
	ID        uint         `json:"id"`
	User      UserResponse `json:"user"`
	Rating    uint         `json:"rating"`
	Comment   string       `json:"comment"`
	CreatedAt time.Time    `json:"createdAt"`
}

// CreateReviewDTO структура для создания отзыва
type CreateReviewDTO struct {
	Rating  uint   `json:"rating" validate:"required,min=1,max=5"`
	Comment string `json:"comment" validate:"required,min=10,max=1000"`
}

// ToReviewResponse конвертирует Review в ReviewResponse
func (r *Review) ToReviewResponse() ReviewResponse {
	return ReviewResponse{
		ID:        r.ID,
		User:      r.User.ToUserResponse(),
		Rating:    r.Rating,
		Comment:   r.Comment,
		CreatedAt: r.CreatedAt,
	}
}
