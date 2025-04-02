package utils

import (
	"time"

	"github.com/golang-jwt/jwt/v4"
	"github.com/google/uuid"
	"github.com/nikitagorchakov/finance-hub/backend/config"
	"github.com/nikitagorchakov/finance-hub/backend/db"
	"github.com/nikitagorchakov/finance-hub/backend/models"
)

// JWTCustomClaims кастомные поля для JWT
type JWTCustomClaims struct {
	UserID uint            `json:"user_id"`
	Email  string          `json:"email"`
	Role   models.UserRole `json:"role"`
	jwt.RegisteredClaims
}

// GenerateToken генерирует JWT токен с длительным сроком жизни (для обратной совместимости)
// Deprecated: используйте GenerateAccessToken и GenerateRefreshToken
func GenerateToken(userID uint, email string, role models.UserRole, config *config.Config) (string, error) {
	// Время жизни токена - 24 часа
	expirationTime := time.Now().Add(24 * time.Hour)

	claims := &JWTCustomClaims{
		UserID: userID,
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "finance-hub",
			Subject:   email,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(config.JWTSecret))

	return tokenString, err
}

// GenerateAccessToken генерирует короткоживущий JWT токен доступа
func GenerateAccessToken(userID uint, email string, role models.UserRole, config *config.Config) (string, error) {
	// Время жизни токена - 15 минут
	expirationTime := time.Now().Add(15 * time.Minute)

	claims := &JWTCustomClaims{
		UserID: userID,
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "finance-hub",
			Subject:   email,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(config.JWTSecret))

	return tokenString, err
}

// GenerateRefreshToken генерирует Refresh Token и сохраняет его в БД
func GenerateRefreshToken(userID uint) (string, time.Time, error) {
	// Время жизни refresh токена - 7 дней
	expirationTime := time.Now().Add(7 * 24 * time.Hour)

	// Создаем уникальный токен
	token := uuid.New().String()

	// Сохраняем refresh токен в базе данных
	refreshToken := models.RefreshToken{
		Token:     token,
		UserID:    userID,
		ExpiresAt: expirationTime,
		Used:      false,
	}

	if err := db.DB.Create(&refreshToken).Error; err != nil {
		return "", time.Time{}, err
	}

	return token, expirationTime, nil
}

// ValidateRefreshToken проверяет действительность refresh токена
func ValidateRefreshToken(token string) (*models.RefreshToken, error) {
	var refreshToken models.RefreshToken

	// Находим токен в БД
	if err := db.DB.Where("token = ? AND used = ? AND revoked_at IS NULL", token, false).First(&refreshToken).Error; err != nil {
		return nil, err
	}

	// Проверяем срок действия токена
	if time.Now().After(refreshToken.ExpiresAt) {
		return nil, jwt.ErrTokenExpired
	}

	return &refreshToken, nil
}

// InvalidateRefreshToken помечает токен как использованный
func InvalidateRefreshToken(token string) error {
	return db.DB.Model(&models.RefreshToken{}).
		Where("token = ?", token).
		Updates(map[string]interface{}{
			"used":       true,
			"updated_at": time.Now(),
		}).Error
}
