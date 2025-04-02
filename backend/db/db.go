package db

import (
	"fmt"
	"log"

	"github.com/nikitagorchakov/finance-hub/backend/config"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// Connect устанавливает соединение с базой данных
func Connect(config *config.Config) {
	var err error
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		config.DBHost, config.DBPort, config.DBUser, config.DBPassword, config.DBName)

	// Настройка логирования
	logLevel := logger.Silent
	if config.Env == "development" {
		logLevel = logger.Info
	}

	// Подключение к БД
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
	})

	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	log.Println("Connected to database successfully")
}
