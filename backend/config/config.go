package config

import (
	"os"

	"github.com/joho/godotenv"
)

// Config структура для хранения конфигурации
type Config struct {
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	JWTSecret  string
	Port       string
	Env        string
	// SMTP настройки
	SMTPHost     string
	SMTPPort     string
	SMTPUser     string
	SMTPPassword string
	SMTPFrom     string
	// Фронтенд
	FrontendURL string
}

// LoadConfig загружает конфигурацию из .env файла
func LoadConfig() *Config {
	err := godotenv.Load()
	if err != nil {
		// Если .env файл не найден, продолжаем, так как переменные окружения
		// могут быть заданы другим способом (например, в Docker)
	}

	return &Config{
		DBHost:       getEnv("DB_HOST", "localhost"),
		DBPort:       getEnv("DB_PORT", "5432"),
		DBUser:       getEnv("DB_USER", "postgres"),
		DBPassword:   getEnv("DB_PASSWORD", "postgres"),
		DBName:       getEnv("DB_NAME", "financehub"),
		JWTSecret:    getEnv("JWT_SECRET", "your_super_secret_key"),
		Port:         getEnv("PORT", "3000"),
		Env:          getEnv("ENV", "development"),
		SMTPHost:     getEnv("SMTP_HOST", "smtp.example.com"),
		SMTPPort:     getEnv("SMTP_PORT", "587"),
		SMTPUser:     getEnv("SMTP_USER", ""),
		SMTPPassword: getEnv("SMTP_PASSWORD", ""),
		SMTPFrom:     getEnv("SMTP_FROM", "noreply@financehub.example.com"),
		FrontendURL:  getEnv("FRONTEND_URL", "http://localhost:3001"),
	}
}

// getEnv получает значение переменной окружения или возвращает значение по умолчанию
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
