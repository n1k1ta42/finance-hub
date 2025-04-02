package controllers

import (
	"fmt"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/nikitagorchakov/finance-hub/backend/db"
	"github.com/nikitagorchakov/finance-hub/backend/middlewares"
	"github.com/nikitagorchakov/finance-hub/backend/models"
	"github.com/nikitagorchakov/finance-hub/backend/utils"
)

// TransactionController контроллер для транзакций
type TransactionController struct{}

// NewTransactionController создает новый контроллер транзакций
func NewTransactionController() *TransactionController {
	return &TransactionController{}
}

// GetAllTransactions получает все транзакции пользователя с возможностью фильтрации
func (tc *TransactionController) GetAllTransactions(c *fiber.Ctx) error {
	userID := middlewares.GetUserID(c)

	// Параметры фильтрации
	categoryID := c.Query("category_id")
	startDateStr := c.Query("start_date")
	endDateStr := c.Query("end_date")
	transactionType := c.Query("type") // expense или income
	limitStr := c.Query("limit")       // ограничение количества записей
	pageStr := c.Query("page")         // номер страницы
	perPageStr := c.Query("per_page")  // количество записей на странице
	
	query := db.DB.Model(&models.Transaction{}).Where("transactions.user_id = ?", userID)

	// Применяем фильтры, если они указаны
	if categoryID != "" {
		query = query.Where("transactions.category_id = ?", categoryID)
	}

	if startDateStr != "" {
		startDate, err := time.Parse(time.RFC3339, startDateStr)
		if err == nil {
			query = query.Where("transactions.date >= ?", startDate)
		}
	}

	if endDateStr != "" {
		endDate, err := time.Parse(time.RFC3339, endDateStr)
		if err == nil {
			query = query.Where("transactions.date <= ?", endDate)
		}
	}

	if transactionType != "" {
		// Присоединяем категорию, чтобы фильтровать по типу
		query = query.Joins("JOIN categories ON transactions.category_id = categories.id").
			Where("categories.type = ?", transactionType)
	}
	
	// Добавляем сортировку по дате (от новых к старым)
	query = query.Order("transactions.date DESC")
	
	// Получаем общее количество записей для пагинации
	var total int64
	if err := query.Count(&total).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось посчитать общее количество транзакций",
			"error":   err.Error(),
		})
	}
	
	// Параметры пагинации
	page := 1
	perPage := 10
	
	if pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}
	
	if perPageStr != "" {
		if pp, err := strconv.Atoi(perPageStr); err == nil && pp > 0 && pp <= 100 {
			perPage = pp
		}
	}
	
	// Если указан лимит, он имеет приоритет над perPage
	if limitStr != "" {
		if limit, err := strconv.Atoi(limitStr); err == nil && limit > 0 {
			perPage = limit
			page = 1 // Сбрасываем страницу на первую
		}
	}
	
	// Применяем пагинацию
	offset := (page - 1) * perPage
	query = query.Offset(offset).Limit(perPage)

	var transactions []models.Transaction
	// Подгружаем связанные категории
	if err := query.Preload("Category").Find(&transactions).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось получить транзакции",
			"error":   err.Error(),
		})
	}

	// Вычисляем общее количество страниц
	totalPages := int(total) / perPage
	if int(total)%perPage > 0 {
		totalPages++
	}

	// Метаданные для пагинации
	meta := fiber.Map{
		"current_page": page,
		"per_page":     perPage,
		"total":        total,
		"total_pages":  totalPages,
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "success",
		"data":   transactions,
		"meta":   meta,
	})
}

// GetTransactionByID получает транзакцию по ID
func (tc *TransactionController) GetTransactionByID(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := middlewares.GetUserID(c)

	var transaction models.Transaction
	if err := db.DB.Where("id = ? AND user_id = ?", id, userID).Preload("Category").First(&transaction).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "Транзакция не найдена",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "success",
		"data":   transaction,
	})
}

// CreateTransaction создает новую транзакцию
func (tc *TransactionController) CreateTransaction(c *fiber.Ctx) error {
	var input models.TransactionDTO
	userID := middlewares.GetUserID(c)

	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось обработать данные",
			"error":   err.Error(),
		})
	}

	errors := utils.ValidateStruct(input)
	if len(errors) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status": "error",
			"errors": errors,
		})
	}

	// Проверяем, существует ли категория и принадлежит ли она пользователю
	var category models.Category
	if err := db.DB.Where("id = ? AND user_id = ?", input.CategoryID, userID).First(&category).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Категория не найдена или не принадлежит пользователю",
			"error":   err.Error(),
		})
	}

	transaction := models.Transaction{
		Amount:      input.Amount,
		Description: input.Description,
		Date:        input.Date,
		CategoryID:  input.CategoryID,
		UserID:      userID,
	}

	if err := db.DB.Create(&transaction).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось создать транзакцию",
			"error":   err.Error(),
		})
	}

	// Обновляем поле Spent в соответствующих бюджетах
	if err := tc.updateBudgetSpent(transaction.CategoryID, transaction.Date, userID); err != nil {
		// Логируем ошибку, но не прерываем выполнение запроса
		logError(err, "Ошибка при обновлении бюджетов")
	}

	// Загружаем связанную категорию для ответа
	db.DB.Preload("Category").First(&transaction, transaction.ID)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"status":  "success",
		"message": "Транзакция успешно создана",
		"data":    transaction,
	})
}

// UpdateTransaction обновляет транзакцию
func (tc *TransactionController) UpdateTransaction(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := middlewares.GetUserID(c)

	var transaction models.Transaction
	if err := db.DB.Where("id = ? AND user_id = ?", id, userID).First(&transaction).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "Транзакция не найдена",
			"error":   err.Error(),
		})
	}

	// Сохраняем старые значения для последующего обновления бюджетов
	oldCategoryID := transaction.CategoryID
	oldDate := transaction.Date

	var input models.TransactionDTO
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось обработать данные",
			"error":   err.Error(),
		})
	}

	errors := utils.ValidateStruct(input)
	if len(errors) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status": "error",
			"errors": errors,
		})
	}

	// Проверяем, существует ли категория и принадлежит ли она пользователю
	var category models.Category
	if err := db.DB.Where("id = ? AND user_id = ?", input.CategoryID, userID).First(&category).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Категория не найдена или не принадлежит пользователю",
			"error":   err.Error(),
		})
	}

	transaction.Amount = input.Amount
	transaction.Description = input.Description
	transaction.Date = input.Date
	transaction.CategoryID = input.CategoryID

	if err := db.DB.Save(&transaction).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось обновить транзакцию",
			"error":   err.Error(),
		})
	}

	// Обновляем поле Spent в бюджетах, связанных со старой категорией
	if err := tc.updateBudgetSpent(oldCategoryID, oldDate, userID); err != nil {
		logError(err, "Ошибка при обновлении старых бюджетов")
	}

	// Обновляем поле Spent в бюджетах, связанных с новой категорией
	if err := tc.updateBudgetSpent(transaction.CategoryID, transaction.Date, userID); err != nil {
		logError(err, "Ошибка при обновлении новых бюджетов")
	}

	// Загружаем связанную категорию для ответа
	db.DB.Preload("Category").First(&transaction, transaction.ID)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  "success",
		"message": "Транзакция успешно обновлена",
		"data":    transaction,
	})
}

// DeleteTransaction удаляет транзакцию
func (tc *TransactionController) DeleteTransaction(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := middlewares.GetUserID(c)

	var transaction models.Transaction
	if err := db.DB.Where("id = ? AND user_id = ?", id, userID).First(&transaction).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "Транзакция не найдена",
			"error":   err.Error(),
		})
	}

	// Сохраняем значения для последующего обновления бюджетов
	categoryID := transaction.CategoryID
	date := transaction.Date

	if err := db.DB.Delete(&transaction).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось удалить транзакцию",
			"error":   err.Error(),
		})
	}

	// Обновляем поле Spent в соответствующих бюджетах
	if err := tc.updateBudgetSpent(categoryID, date, userID); err != nil {
		logError(err, "Ошибка при обновлении бюджетов после удаления транзакции")
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  "success",
		"message": "Транзакция успешно удалена",
	})
}

// CreateBulkTransactions создает несколько транзакций одним запросом
func (tc *TransactionController) CreateBulkTransactions(c *fiber.Ctx) error {
	var input models.BulkTransactionDTO
	userID := middlewares.GetUserID(c)

	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось обработать данные",
			"error":   err.Error(),
		})
	}

	errors := utils.ValidateStruct(input)
	if len(errors) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status": "error",
			"errors": errors,
		})
	}

	// Проверяем, что все категории существуют и принадлежат пользователю
	categoryIDs := make(map[uint]bool)
	for _, t := range input.Transactions {
		categoryIDs[t.CategoryID] = true
	}

	for categoryID := range categoryIDs {
		var category models.Category
		if err := db.DB.Where("id = ? AND user_id = ?", categoryID, userID).First(&category).Error; err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"status":  "error",
				"message": fmt.Sprintf("Категория с ID %d не найдена или не принадлежит пользователю", categoryID),
				"error":   err.Error(),
			})
		}
	}

	// Создаем транзакции
	transactions := make([]models.Transaction, 0, len(input.Transactions))
	for _, t := range input.Transactions {
		transaction := models.Transaction{
			Amount:      t.Amount,
			Description: t.Description,
			Date:        t.Date,
			CategoryID:  t.CategoryID,
			UserID:      userID,
		}
		transactions = append(transactions, transaction)
	}

	// Выполняем транзакцию в базе данных
	tx := db.DB.Begin()
	if tx.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось начать транзакцию в базе данных",
			"error":   tx.Error.Error(),
		})
	}

	// Создаем записи транзакций
	if err := tx.Create(&transactions).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось создать транзакции",
			"error":   err.Error(),
		})
	}

	// Обновляем бюджеты для каждой категории
	for _, transaction := range transactions {
		if err := tc.updateBudgetSpent(transaction.CategoryID, transaction.Date, userID); err != nil {
			// Логируем ошибку, но продолжаем выполнение
			logError(err, fmt.Sprintf("Ошибка при обновлении бюджета для категории %d", transaction.CategoryID))
		}
	}

	// Подтверждаем транзакцию
	if err := tx.Commit().Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось завершить транзакцию в базе данных",
			"error":   err.Error(),
		})
	}

	// Загружаем созданные транзакции с данными категорий для ответа
	for i := range transactions {
		db.DB.Preload("Category").First(&transactions[i], transactions[i].ID)
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"status":  "success",
		"message": fmt.Sprintf("Успешно создано %d транзакций", len(transactions)),
		"data":    transactions,
	})
}

// ExportTransactionsToCSV экспортирует транзакции пользователя в CSV
func (tc *TransactionController) ExportTransactionsToCSV(c *fiber.Ctx) error {
	userID := middlewares.GetUserID(c)

	// Получаем такие же параметры фильтрации, как и в GetAllTransactions
	categoryID := c.Query("category_id")
	startDateStr := c.Query("start_date")
	endDateStr := c.Query("end_date")
	transactionType := c.Query("type")
	
	query := db.DB.Model(&models.Transaction{}).Where("transactions.user_id = ?", userID)

	// Применяем фильтры, если они указаны
	if categoryID != "" {
		query = query.Where("transactions.category_id = ?", categoryID)
	}

	if startDateStr != "" {
		startDate, err := time.Parse(time.RFC3339, startDateStr)
		if err == nil {
			query = query.Where("transactions.date >= ?", startDate)
		}
	}

	if endDateStr != "" {
		endDate, err := time.Parse(time.RFC3339, endDateStr)
		if err == nil {
			query = query.Where("transactions.date <= ?", endDate)
		}
	}

	if transactionType != "" {
		query = query.Joins("JOIN categories ON transactions.category_id = categories.id").
			Where("categories.type = ?", transactionType)
	}
	
	// Сортировка от новых к старым
	query = query.Order("transactions.date DESC")

	var transactions []models.Transaction
	if err := query.Preload("Category").Find(&transactions).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось получить транзакции для экспорта",
			"error":   err.Error(),
		})
	}

	// Генерируем CSV файл
	csvData, err := utils.ExportTransactionsToCSV(transactions)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось создать CSV файл",
			"error":   err.Error(),
		})
	}

	// Формируем имя файла с текущей датой
	currentTime := time.Now().Format("2006-01-02_15-04-05")
	fileName := fmt.Sprintf("transactions_%s.csv", currentTime)

	c.Set("Content-Type", "text/csv")
	c.Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", fileName))

	return c.Send(csvData)
}

// ExportTransactionsToExcel экспортирует транзакции пользователя в Excel
func (tc *TransactionController) ExportTransactionsToExcel(c *fiber.Ctx) error {
	userID := middlewares.GetUserID(c)

	// Получаем такие же параметры фильтрации, как и в GetAllTransactions
	categoryID := c.Query("category_id")
	startDateStr := c.Query("start_date")
	endDateStr := c.Query("end_date")
	transactionType := c.Query("type")
	
	query := db.DB.Model(&models.Transaction{}).Where("transactions.user_id = ?", userID)

	// Применяем фильтры, если они указаны
	if categoryID != "" {
		query = query.Where("transactions.category_id = ?", categoryID)
	}

	if startDateStr != "" {
		startDate, err := time.Parse(time.RFC3339, startDateStr)
		if err == nil {
			query = query.Where("transactions.date >= ?", startDate)
		}
	}

	if endDateStr != "" {
		endDate, err := time.Parse(time.RFC3339, endDateStr)
		if err == nil {
			query = query.Where("transactions.date <= ?", endDate)
		}
	}

	if transactionType != "" {
		query = query.Joins("JOIN categories ON transactions.category_id = categories.id").
			Where("categories.type = ?", transactionType)
	}
	
	// Сортировка от новых к старым
	query = query.Order("transactions.date DESC")

	var transactions []models.Transaction
	if err := query.Preload("Category").Find(&transactions).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось получить транзакции для экспорта",
			"error":   err.Error(),
		})
	}

	// Генерируем Excel файл
	excelData, err := utils.ExportTransactionsToExcel(transactions)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось создать Excel файл",
			"error":   err.Error(),
		})
	}

	// Формируем имя файла с текущей датой
	currentTime := time.Now().Format("2006-01-02_15-04-05")
	fileName := fmt.Sprintf("transactions_%s.xlsx", currentTime)

	c.Set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", fileName))

	return c.Send(excelData)
}

// logError логирует ошибки
func logError(err error, message string) {
	fmt.Printf("[ERROR] %s: %v\n", message, err)
}

// updateBudgetSpent обновляет поле Spent в бюджетах на основе транзакций
func (tc *TransactionController) updateBudgetSpent(categoryID uint, date time.Time, userID uint) error {
	// Находим бюджеты, соответствующие категории и дате
	var budgets []models.Budget
	query := db.DB.Where("user_id = ? AND start_date <= ? AND end_date >= ?", userID, date, date)

	// Если указана категория, ищем бюджеты по этой категории или без категории
	if categoryID > 0 {
		query = query.Where("category_id = ? OR category_id IS NULL", categoryID)
	} else {
		query = query.Where("category_id IS NULL")
	}

	if err := query.Find(&budgets).Error; err != nil {
		return err
	}

	// Обновляем поле Spent для каждого бюджета
	for _, budget := range budgets {
		var sum float64
		query := db.DB.Model(&models.Transaction{}).
			Select("COALESCE(SUM(amount), 0)").
			Where("user_id = ? AND date BETWEEN ? AND ?", userID, budget.StartDate, budget.EndDate)

		// Если в бюджете указана категория, учитываем только транзакции с этой категорией
		if budget.CategoryID != nil {
			query = query.Where("category_id = ?", *budget.CategoryID)
		}

		if err := query.Row().Scan(&sum); err != nil {
			return err
		}

		// Обновляем поле Spent в бюджете
		if err := db.DB.Model(&budget).Update("spent", sum).Error; err != nil {
			return err
		}
	}

	return nil
}
