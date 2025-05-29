package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/nikitagorchakov/finance-hub/backend/config"
	"github.com/nikitagorchakov/finance-hub/backend/controllers"
	"github.com/nikitagorchakov/finance-hub/backend/middlewares"
	"github.com/nikitagorchakov/finance-hub/backend/models"
)

// SetupRoutes настраивает маршруты приложения
func SetupRoutes(app *fiber.App, config *config.Config) {
	// Контроллеры
	authController := controllers.NewAuthController(config)
	categoryController := controllers.NewCategoryController()
	transactionController := controllers.NewTransactionController()
	budgetController := controllers.NewBudgetController()
	statsController := controllers.NewStatsController()
	subscriptionController := controllers.NewSubscriptionController()
	paymentController := controllers.NewPaymentController()
	notificationController := controllers.NewNotificationController()
	publicController := controllers.NewPublicController()
	reviewController := controllers.NewReviewController()
	projectController := controllers.NewProjectController()
	investmentController := controllers.NewInvestmentController()
	projectPaymentController := controllers.NewProjectPaymentController()
	investmentOperationController := controllers.NewInvestmentOperationController()
	changeLogController := controllers.NewChangeLogController()

	// Группа API v1
	api := app.Group("/api/v1")

	// Публичные маршруты
	publicApi := api.Group("/public")
	publicApi.Get("/subscriptions/plans", publicController.GetSubscriptionPlans)
	publicApi.Get("/features", publicController.GetAppFeatures)
	publicApi.Get("/info", publicController.GetAppInfo)
	publicApi.Get("/reviews/latest", reviewController.GetLatestReviews)

	// Публичные маршруты аутентификации
	auth := api.Group("/auth")

	// Защищаем эндпоинты аутентификации от брутфорса
	if config.Env == "production" {
		auth.Use(middlewares.AuthLimiter())
	}

	auth.Post("/register", authController.Register)
	auth.Post("/login", authController.Login)
	auth.Post("/logout", authController.Logout)
	auth.Post("/refresh-token", authController.RefreshToken)
	auth.Post("/forgot-password", authController.RequestPasswordReset)
	auth.Post("/verify-reset-token", authController.VerifyResetToken)
	auth.Post("/reset-password", authController.ResetPassword)

	// Защищенные маршруты с JWT
	protected := api.Group("", middlewares.Protected(config))

	// Пользователь
	protected.Get("/me", authController.GetMe)
	protected.Put("/me", authController.UpdateMe)

	// Маршруты администратора
	admin := protected.Group("/admin", middlewares.RequireAdmin)
	admin.Get("/users", authController.GetUsers)
	admin.Put("/users/:id/role", authController.UpdateUserRole)
	admin.Get("/categories", categoryController.GetAllUsersCategories)

	// Отзывы (доступны всем с JWT)
	reviews := protected.Group("/reviews")
	reviews.Get("/", reviewController.GetAllReviews)
	reviews.Post("/", reviewController.CreateReview)
	reviews.Delete("/:id", reviewController.DeleteReview)

	// Подписки (доступны всем с JWT)
	subscriptions := protected.Group("/subscriptions")
	subscriptions.Get("/plans", subscriptionController.GetAllPlans)
	subscriptions.Get("/current", subscriptionController.GetUserSubscription)
	subscriptions.Post("/subscribe", subscriptionController.SubscribeUser)
	subscriptions.Put("/cancel", subscriptionController.CancelSubscription)

	// Платежи (доступны всем с JWT)
	payments := protected.Group("/payments")
	payments.Get("/", paymentController.GetUserPayments)
	payments.Get("/:id", paymentController.GetPaymentByID)
	payments.Post("/process", paymentController.ProcessPayment)
	payments.Post("/:id/refund", paymentController.RefundPayment)

	// Уведомления (доступны всем с JWT)
	notifications := protected.Group("/notifications")
	notifications.Get("/", notificationController.GetUserNotifications)
	notifications.Get("/unread-count", notificationController.GetUnreadCount)
	notifications.Put("/:id/read", notificationController.MarkAsRead)
	notifications.Put("/read-all", notificationController.MarkAllAsRead)
	notifications.Delete("/:id", notificationController.DeleteNotification)
	notifications.Delete("/", notificationController.DeleteAllNotifications)

	// Защищенные маршруты с проверкой подписки
	subscribedOnly := protected.Group("", middlewares.CheckActiveSubscription())

	// Категории
	categories := subscribedOnly.Group("/categories")
	categories.Use(middlewares.CheckResourceLimits("categories"))
	categories.Get("/", categoryController.GetAllCategories)
	categories.Get("/:id", categoryController.GetCategoryByID)
	categories.Post("/", categoryController.CreateCategory)
	categories.Put("/:id", categoryController.UpdateCategory)
	categories.Delete("/:id", categoryController.DeleteCategory)

	// Транзакции
	transactions := subscribedOnly.Group("/transactions")
	transactions.Use(middlewares.CheckResourceLimits("transactions"))
	transactions.Get("/", transactionController.GetAllTransactions)
	transactions.Get("/:id", transactionController.GetTransactionByID)
	transactions.Post("/", transactionController.CreateTransaction)
	transactions.Post("/bulk", transactionController.CreateBulkTransactions)
	transactions.Put("/:id", transactionController.UpdateTransaction)
	transactions.Delete("/bulk", transactionController.DeleteBulkTransactions)
	transactions.Delete("/:id", transactionController.DeleteTransaction)

	// Экспорт транзакций (доступен только для Pro)
	exportsGroup := transactions.Group("/export", middlewares.RequiresPlan(models.Pro))
	exportsGroup.Get("/csv", transactionController.ExportTransactionsToCSV)
	exportsGroup.Get("/excel", transactionController.ExportTransactionsToExcel)

	// Бюджеты (доступны только для Premium и Pro)
	budgets := subscribedOnly.Group("/budgets")
	budgets.Use(middlewares.CheckResourceLimits("budgets"))
	budgets.Use(middlewares.RequiresPlan(models.Premium))
	budgets.Get("/", budgetController.GetAllBudgets)
	budgets.Get("/:id", budgetController.GetBudgetByID)
	budgets.Post("/", budgetController.CreateBudget)
	budgets.Put("/:id", budgetController.UpdateBudget)
	budgets.Delete("/:id", budgetController.DeleteBudget)

	// Базовая статистика (доступна для всех планов)
	stats := subscribedOnly.Group("/stats")
	stats.Get("/balance", statsController.GetBalanceSummary)
	stats.Get("/dynamics", statsController.GetBalanceDynamics)

	// Расширенная статистика (доступна только для Premium и Pro)
	advancedStats := stats.Group("", middlewares.RequiresPlan(models.Premium))
	advancedStats.Get("/categories", statsController.GetCategorySummary)
	advancedStats.Get("/budgets", statsController.GetBudgetProgress)

	// Экспорт статистики (доступен только для Pro)
	statsExport := stats.Group("/export", middlewares.RequiresPlan(models.Pro))
	statsExport.Get("/pdf", statsController.ExportStatsToPDF)

	// Проекты
	projects := subscribedOnly.Group("/projects")
	projects.Get("/", projectController.GetAll)
	projects.Get("/stats", projectController.Stats)
	projects.Get(":id", projectController.GetByID)
	projects.Post("/", projectController.Create)
	projects.Put(":id", projectController.Update)
	projects.Delete(":id/archive", projectController.Archive)
	projects.Put(":id/unarchive", projectController.Unarchive)
	projects.Put(":id/complete", projectController.Complete)
	projects.Get(":id/analytics", projectController.Analytics)

	// Операции по проектам
	projectPayments := projects.Group(":projectId/payments")
	projectPayments.Get("/", projectPaymentController.GetAll)
	projectPayments.Get(":id", projectPaymentController.GetByID)
	projectPayments.Post("/", projectPaymentController.Create)
	projectPayments.Delete(":id", projectPaymentController.Delete)

	// Инвестиции
	investments := subscribedOnly.Group("/investments")
	investments.Get("/", investmentController.GetAll)
	investments.Get("/stats", investmentController.Stats)
	investments.Get(":id", investmentController.GetByID)
	investments.Post("/", investmentController.Create)
	investments.Put(":id", investmentController.Update)
	investments.Delete(":id/archive", investmentController.Archive)
	investments.Put(":id/unarchive", investmentController.Unarchive)
	investments.Put(":id/complete", investmentController.Complete)
	investments.Get(":id/analytics", investmentController.Analytics)

	// Операции по инвестициям
	investmentOps := investments.Group(":investmentId/operations")
	investmentOps.Get("/", investmentOperationController.GetAll)
	investmentOps.Get(":id", investmentOperationController.GetByID)
	investmentOps.Post("/", investmentOperationController.Create)
	investmentOps.Delete(":id", investmentOperationController.Delete)

	// История изменений (доступна только для Premium и Pro)
	changeLogs := subscribedOnly.Group("/change-logs", middlewares.RequiresPlan(models.Premium))
	changeLogs.Get("/", changeLogController.GetUserHistory)
	changeLogs.Get("/:entityType/:entityId", changeLogController.GetEntityHistory)
}
