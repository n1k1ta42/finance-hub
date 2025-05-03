package utils

import (
	"crypto/rand"
	"encoding/hex"
)

// GenerateRandomToken генерирует случайный токен указанной длины
func GenerateRandomToken(length int) string {
	b := make([]byte, length)
	if _, err := rand.Read(b); err != nil {
		return ""
	}
	return hex.EncodeToString(b)
} 