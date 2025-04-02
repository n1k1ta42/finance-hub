package db

import (
	"log"
	"time"

	"github.com/nikitagorchakov/finance-hub/backend/models"
)

// MigrateDB выполняет миграцию моделей базы данных
func MigrateDB() {
	log.Println("Running database migrations...")

	// Авто-миграция моделей
	// Порядок важен из-за зависимостей внешних ключей
	if err := DB.AutoMigrate(
		&models.User{},
		&models.Category{},
		&models.Transaction{},
		&models.Budget{},
		&models.Subscription{},
		&models.Payment{},
		&models.Notification{},
		&models.Review{},
		&models.ResetToken{},
		&models.RefreshToken{},
	); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	// Обновляем существующих пользователей, устанавливая роль по умолчанию
	MigrateUserRoles()

	log.Println("Database migration completed successfully")
}

// MigrateUserRoles устанавливает роли по умолчанию для существующих пользователей
func MigrateUserRoles() {
	log.Println("Migrating user roles...")

	// Устанавливаем роль "user" для пользователей без роли
	result := DB.Exec("UPDATE users SET role = ? WHERE role IS NULL OR role = ''", string(models.RoleUser))
	if result.Error != nil {
		log.Printf("Failed to update user roles: %v", result.Error)
	} else {
		log.Printf("Updated roles for %d users", result.RowsAffected)
	}
}

// SeedDefaultData заполняет базу начальными данными (только для разработки)
func SeedDefaultData() {
	log.Println("Seeding default data...")

	// Создаем тестового пользователя, если его нет
	var userCount int64
	DB.Model(&models.User{}).Count(&userCount)
	if userCount == 0 {
		// Создаем обычного пользователя
		testUser := models.User{
			Email:     "test@example.com",
			Password:  "password123",
			FirstName: "Test",
			LastName:  "User",
			Role:      models.RoleUser,
		}
		if err := DB.Create(&testUser).Error; err != nil {
			log.Printf("Failed to create test user: %v", err)
		} else {
			log.Printf("Created test user with email: %s", testUser.Email)

			// Создаем администратора
			adminUser := models.User{
				Email:     "admin@example.com",
				Password:  "nikitathebest",
				FirstName: "Admin",
				LastName:  "User",
				Role:      models.RoleAdmin,
			}
			if err := DB.Create(&adminUser).Error; err != nil {
				log.Printf("Failed to create admin user: %v", err)
			} else {
				log.Printf("Created admin user with email: %s", adminUser.Email)
			}

			// Добавляем базовые категории
			defaultCategories := []models.Category{
				{
					Name:        "Продукты",
					Description: "Расходы на продукты питания",
					Type:        models.Expense,
					UserID:      testUser.ID,
					Color:       "#4CAF50",
					Icon:        "shopping_cart",
				},
				{
					Name:        "Транспорт",
					Description: "Расходы на транспорт",
					Type:        models.Expense,
					UserID:      testUser.ID,
					Color:       "#2196F3",
					Icon:        "directions_car",
				},
				{
					Name:        "Развлечения",
					Description: "Расходы на развлечения",
					Type:        models.Expense,
					UserID:      testUser.ID,
					Color:       "#9C27B0",
					Icon:        "movie",
				},
				{
					Name:        "Зарплата",
					Description: "Доход от работы",
					Type:        models.Income,
					UserID:      testUser.ID,
					Color:       "#4CAF50",
					Icon:        "work",
				},
				{
					Name:        "Подарки",
					Description: "Подарки от друзей и родственников",
					Type:        models.Income,
					UserID:      testUser.ID,
					Color:       "#E91E63",
					Icon:        "card_giftcard",
				},
			}

			for _, category := range defaultCategories {
				if err := DB.Create(&category).Error; err != nil {
					log.Printf("Failed to create category %s: %v", category.Name, err)
				}
			}

			log.Println("Default categories created")

			// Создаем тестовую подписку для пользователя
			now := time.Now()
			endDate := now.AddDate(0, 1, 0) // +1 месяц

			subscription := models.Subscription{
				UserID:    testUser.ID,
				Plan:      models.Basic,
				Period:    models.MonthlySubscription,
				StartDate: now,
				EndDate:   &endDate,
				Active:    true,
				Price:     models.SubscriptionPrices[models.Basic][models.MonthlySubscription],
				Features:  "До 5 категорий, До 100 транзакций, Базовая статистика",
			}

			if err := DB.Create(&subscription).Error; err != nil {
				log.Printf("Failed to create test subscription: %v", err)
			} else {
				log.Println("Test subscription created")

				// Создаем тестовый платеж для подписки
				payment := models.Payment{
					UserID:         testUser.ID,
					SubscriptionID: subscription.ID,
					Amount:         subscription.Price,
					Currency:       "USD",
					Status:         models.PaymentSuccess,
					Method:         models.PaymentCreditCard,
					TransactionID:  "mock_trans_123456",
					InvoiceID:      "INV-2023-001",
					PaymentDate:    now,
					Description:    "Оплата базовой подписки на 1 месяц",
				}

				if err := DB.Create(&payment).Error; err != nil {
					log.Printf("Failed to create test payment: %v", err)
				} else {
					log.Println("Test payment created")

					// Создаем тестовые уведомления
					testNotifications := []models.Notification{
						{
							UserID:     testUser.ID,
							Type:       models.NotificationPayment,
							Title:      "Оплата успешно проведена",
							Message:    "Ваша оплата подписки успешно проведена",
							Importance: models.NotificationNormal,
							IsRead:     false,
							Data:       `{"paymentId": "1", "amount": 5.99}`,
						},
						{
							UserID:     testUser.ID,
							Type:       models.NotificationSubscription,
							Title:      "Активирована подписка Basic",
							Message:    "Ваша подписка Basic активирована. Срок действия: 1 месяц",
							Importance: models.NotificationHigh,
							IsRead:     false,
							Data:       `{"subscriptionId": "1", "plan": "basic", "endDate": "` + endDate.Format(time.RFC3339) + `"}`,
						},
					}

					for _, notification := range testNotifications {
						if err := DB.Create(&notification).Error; err != nil {
							log.Printf("Failed to create test notification: %v", err)
						}
					}

					log.Println("Test notifications created")
				}
			}
		}
	}

	log.Println("Data seeding completed")
}
