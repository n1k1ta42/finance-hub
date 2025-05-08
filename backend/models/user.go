package models

import (
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// UserRole тип роли пользователя
type UserRole string

const (
	// RoleUser обычный пользователь
	RoleUser UserRole = "user"
	// RoleAdmin администратор
	RoleAdmin UserRole = "admin"
)

// User модель пользователя
type User struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	Email          string    `gorm:"uniqueIndex;not null" json:"email"`
	Password       string    `gorm:"not null" json:"-"`
	FirstName      string    `json:"firstName"`
	LastName       string    `json:"lastName"`
	Role           UserRole  `gorm:"type:varchar(10);default:'user'" json:"role"`
	TelegramChatID string    `json:"telegramChatId"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedUt"`
}

// UserResponse структура для ответа без пароля
type UserResponse struct {
	ID             uint      `json:"id"`
	Email          string    `json:"email"`
	FirstName      string    `json:"firstName"`
	LastName       string    `json:"lastName"`
	Role           UserRole  `json:"role"`
	TelegramChatID string    `json:"telegramChatId"`
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedUt"`
}

// RegisterDTO структура для регистрации
type RegisterDTO struct {
	Email     string `json:"email" validate:"required,email"`
	Password  string `json:"password" validate:"required,min=6"`
	FirstName string `json:"firstName" validate:"required"`
	LastName  string `json:"lastName" validate:"required"`
}

// LoginDTO структура для входа
type LoginDTO struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

// UpdateUserDTO структура для обновления пользователя
type UpdateUserDTO struct {
	Email          string `json:"email" validate:"required,email"`
	FirstName      string `json:"firstName" validate:"required"`
	LastName       string `json:"lastName" validate:"required"`
	TelegramChatID string `json:"telegramChatId"`
}

// UpdateRoleDTO структура для обновления роли пользователя
type UpdateRoleDTO struct {
	Role UserRole `json:"role" validate:"required"`
}

// ResetToken модель токена для сброса пароля
type ResetToken struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null" json:"userId"`
	Token     string    `gorm:"not null;uniqueIndex" json:"token"`
	ExpiresAt time.Time `gorm:"not null" json:"expiresAt"`
	Used      bool      `gorm:"default:false" json:"used"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
	User      User      `gorm:"foreignKey:UserID" json:"-"`
}

// RequestResetDTO структура для запроса сброса пароля
type RequestResetDTO struct {
	Email string `json:"email" validate:"required,email"`
}

// VerifyTokenDTO структура для проверки токена
type VerifyTokenDTO struct {
	Token string `json:"token" validate:"required"`
}

// ResetPasswordDTO структура для сброса пароля
type ResetPasswordDTO struct {
	Token       string `json:"token" validate:"required"`
	NewPassword string `json:"newPassword" validate:"required,min=6"`
}

// BeforeSave хеширует пароль перед сохранением
func (u *User) BeforeSave(tx *gorm.DB) error {
	if u.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
		u.Password = string(hashedPassword)
	}
	return nil
}

// ComparePassword сравнивает пароль с хешем
func (u *User) ComparePassword(password string) error {
	return bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
}

// ToUserResponse конвертирует User в UserResponse
func (u *User) ToUserResponse() UserResponse {
	return UserResponse{
		ID:             u.ID,
		Email:          u.Email,
		FirstName:      u.FirstName,
		LastName:       u.LastName,
		Role:           u.Role,
		TelegramChatID: u.TelegramChatID,
		CreatedAt:      u.CreatedAt,
		UpdatedAt:      u.UpdatedAt,
	}
}
