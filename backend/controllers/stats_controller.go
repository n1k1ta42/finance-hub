package controllers

import (
	"fmt"
	"sort"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/nikitagorchakov/finance-hub/backend/db"
	"github.com/nikitagorchakov/finance-hub/backend/middlewares"
	"github.com/nikitagorchakov/finance-hub/backend/models"
	"github.com/nikitagorchakov/finance-hub/backend/utils"
)

// StatsController контроллер для статистики
type StatsController struct{}

// NewStatsController создает новый контроллер статистики
func NewStatsController() *StatsController {
	return &StatsController{}
}

// CategoryStats структура для хранения статистики по категориям
type CategoryStats struct {
	CategoryID   uint    `json:"categoryId"`
	CategoryName string  `json:"categoryName"`
	Amount       float64 `json:"amount"`
	Percentage   float64 `json:"percentage"`
}

// BalanceStats структура для хранения статистики баланса
type BalanceStats struct {
	TotalIncome  float64 `json:"totalIncome"`
	TotalExpense float64 `json:"totalExpense"`
	Balance      float64 `json:"balance"`
}

// DynamicsPoint точка данных для динамики баланса
type DynamicsPoint struct {
	Date    time.Time `json:"date"`
	Income  float64   `json:"income"`
	Expense float64   `json:"expense"`
	Balance float64   `json:"balance"`
}

// GetCategorySummary получает сводку по категориям
func (sc *StatsController) GetCategorySummary(c *fiber.Ctx) error {
	userID := middlewares.GetUserID(c)
	transactionType := c.Query("type", "expense") // По умолчанию смотрим расходы
	startDateStr := c.Query("start_date")
	endDateStr := c.Query("end_date")

	var startDate, endDate time.Time
	var err error

	// Настраиваем временной период
	if startDateStr != "" {
		startDate, err = time.Parse(time.RFC3339, startDateStr)
		if err != nil {
			// Если дата начала не указана или неверный формат, берем начало текущего месяца
			now := time.Now()
			startDate = time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
		}
	} else {
		// Если дата начала не указана, берем начало текущего месяца
		now := time.Now()
		startDate = time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	}

	if endDateStr != "" {
		endDate, err = time.Parse(time.RFC3339, endDateStr)
		if err != nil {
			// Если дата конца не указана или неверный формат, берем текущую дату
			endDate = time.Now()
		}
	} else {
		// Если дата конца не указана, берем текущую дату
		endDate = time.Now()
	}

	// Получаем все категории пользователя с указанным типом
	var categories []models.Category
	if err := db.DB.Where("user_id = ? AND type = ?", userID, transactionType).Find(&categories).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось получить категории",
			"error":   err.Error(),
		})
	}

	// Создаем мапу для хранения ID -> Имя категории
	categoryNames := make(map[uint]string)
	for _, cat := range categories {
		categoryNames[cat.ID] = cat.Name
	}

	// Получаем сумму расходов/доходов по категориям
	type CategorySum struct {
		CategoryID uint
		Sum        float64
	}

	var categorySums []CategorySum
	query := `
		SELECT t.category_id, SUM(t.amount) as sum
		FROM transactions t
		JOIN categories c ON t.category_id = c.id
		WHERE t.user_id = ? AND c.type = ? AND t.date BETWEEN ? AND ?
		GROUP BY t.category_id
	`
	if err := db.DB.Raw(query, userID, transactionType, startDate, endDate).Scan(&categorySums).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось получить статистику по категориям",
			"error":   err.Error(),
		})
	}

	// Считаем общую сумму
	var totalAmount float64
	for _, cs := range categorySums {
		totalAmount += cs.Sum
	}

	// Преобразуем в результирующий формат с процентами
	var result []CategoryStats
	for _, cs := range categorySums {
		percentage := 0.0
		if totalAmount > 0 {
			percentage = (cs.Sum / totalAmount) * 100
		}

		result = append(result, CategoryStats{
			CategoryID:   cs.CategoryID,
			CategoryName: categoryNames[cs.CategoryID],
			Amount:       cs.Sum,
			Percentage:   percentage,
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "success",
		"data": fiber.Map{
			"categories": result,
			"total":      totalAmount,
			"start_date": startDate,
			"end_date":   endDate,
		},
	})
}

// GetBalanceSummary получает сводку по балансу
func (sc *StatsController) GetBalanceSummary(c *fiber.Ctx) error {
	userID := middlewares.GetUserID(c)
	startDateStr := c.Query("start_date")
	endDateStr := c.Query("end_date")

	var startDate, endDate time.Time
	var err error

	// Настраиваем временной период
	if startDateStr != "" {
		startDate, err = time.Parse(time.RFC3339, startDateStr)
		if err != nil {
			// Если дата начала не указана или неверный формат, берем начало текущего месяца
			now := time.Now()
			startDate = time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
		}
	} else {
		// Если дата начала не указана, берем начало текущего месяца
		now := time.Now()
		startDate = time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	}

	if endDateStr != "" {
		endDate, err = time.Parse(time.RFC3339, endDateStr)
		if err != nil {
			// Если дата конца не указана или неверный формат, берем текущую дату
			endDate = time.Now()
		}
	} else {
		// Если дата конца не указана, берем текущую дату
		endDate = time.Now()
	}

	// Получаем сумму доходов
	var totalIncome float64
	incomeQuery := `
		SELECT COALESCE(SUM(t.amount), 0) as total
		FROM transactions t
		JOIN categories c ON t.category_id = c.id
		WHERE t.user_id = ? AND c.type = 'income' AND t.date BETWEEN ? AND ?
	`
	db.DB.Raw(incomeQuery, userID, startDate, endDate).Scan(&totalIncome)

	// Получаем сумму расходов
	var totalExpense float64
	expenseQuery := `
		SELECT COALESCE(SUM(t.amount), 0) as total
		FROM transactions t
		JOIN categories c ON t.category_id = c.id
		WHERE t.user_id = ? AND c.type = 'expense' AND t.date BETWEEN ? AND ?
	`
	db.DB.Raw(expenseQuery, userID, startDate, endDate).Scan(&totalExpense)

	// Вычисляем баланс
	balance := totalIncome - totalExpense

	stats := BalanceStats{
		TotalIncome:  totalIncome,
		TotalExpense: totalExpense,
		Balance:      balance,
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "success",
		"data": fiber.Map{
			"stats":      stats,
			"start_date": startDate,
			"end_date":   endDate,
		},
	})
}

// GetBudgetProgress получает прогресс по бюджетам
func (sc *StatsController) GetBudgetProgress(c *fiber.Ctx) error {
	userID := middlewares.GetUserID(c)

	// Получаем все активные бюджеты пользователя
	var budgets []models.Budget
	if err := db.DB.Where("user_id = ? AND start_date <= ? AND end_date >= ?", userID, time.Now(), time.Now()).
		Preload("Category").Find(&budgets).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось получить бюджеты",
			"error":   err.Error(),
		})
	}

	type BudgetProgress struct {
		Budget        models.Budget `json:"budget"`
		SpentAmount   float64       `json:"spent_amount"`
		RemainingDays int           `json:"remaining_days"`
		Progress      float64       `json:"progress"`
	}

	var result []BudgetProgress

	for _, budget := range budgets {
		var spentAmount float64
		query := db.DB.Model(&models.Transaction{}).
			Joins("JOIN categories ON transactions.category_id = categories.id")

		// Если бюджет для конкретной категории
		if budget.CategoryID != nil {
			query = query.Where("transactions.category_id = ?", *budget.CategoryID)
		} else {
			// Иначе учитываем все расходы
			query = query.Where("categories.type = ?", models.Expense)
		}

		// Учитываем только транзакции в период действия бюджета
		query = query.Where("transactions.user_id = ? AND transactions.date BETWEEN ? AND ?",
			userID, budget.StartDate, budget.EndDate)

		query.Select("COALESCE(SUM(transactions.amount), 0)").Scan(&spentAmount)

		// Рассчитываем оставшиеся дни
		remainingDays := int(budget.EndDate.Sub(time.Now()).Hours() / 24)
		if remainingDays < 0 {
			remainingDays = 0
		}

		// Рассчитываем прогресс (потраченная сумма / бюджет * 100)
		progress := (spentAmount / budget.Amount) * 100

		result = append(result, BudgetProgress{
			Budget:        budget,
			SpentAmount:   spentAmount,
			RemainingDays: remainingDays,
			Progress:      progress,
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "success",
		"data":   result,
	})
}

// ExportStatsToPDF экспортирует статистику в PDF
func (sc *StatsController) ExportStatsToPDF(c *fiber.Ctx) error {
	userID := middlewares.GetUserID(c)
	startDateStr := c.Query("start_date")
	endDateStr := c.Query("end_date")

	var startDate, endDate time.Time
	var err error

	// Настраиваем временной период
	if startDateStr != "" {
		startDate, err = time.Parse(time.RFC3339, startDateStr)
		if err != nil {
			// Если дата начала не указана или неверный формат, берем начало текущего месяца
			now := time.Now()
			startDate = time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
		}
	} else {
		// Если дата начала не указана, берем начало текущего месяца
		now := time.Now()
		startDate = time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	}

	if endDateStr != "" {
		endDate, err = time.Parse(time.RFC3339, endDateStr)
		if err != nil {
			// Если дата конца не указана или неверный формат, берем текущую дату
			endDate = time.Now()
		}
	} else {
		// Если дата конца не указана, берем текущую дату
		endDate = time.Now()
	}

	// Получаем данные о балансе
	var totalIncome float64
	incomeQuery := `
		SELECT COALESCE(SUM(t.amount), 0) as total
		FROM transactions t
		JOIN categories c ON t.category_id = c.id
		WHERE t.user_id = ? AND c.type = 'income' AND t.date BETWEEN ? AND ?
	`
	db.DB.Raw(incomeQuery, userID, startDate, endDate).Scan(&totalIncome)

	// Получаем сумму расходов
	var totalExpense float64
	expenseQuery := `
		SELECT COALESCE(SUM(t.amount), 0) as total
		FROM transactions t
		JOIN categories c ON t.category_id = c.id
		WHERE t.user_id = ? AND c.type = 'expense' AND t.date BETWEEN ? AND ?
	`
	db.DB.Raw(expenseQuery, userID, startDate, endDate).Scan(&totalExpense)

	// Вычисляем баланс
	balance := totalIncome - totalExpense

	// Получаем категории расходов
	expenseCategories := []CategoryStats{}
	expenseQuery = `
		SELECT t.category_id, c.name as category_name, SUM(t.amount) as amount
		FROM transactions t
		JOIN categories c ON t.category_id = c.id
		WHERE t.user_id = ? AND c.type = 'expense' AND t.date BETWEEN ? AND ?
		GROUP BY t.category_id, c.name
	`
	type CategorySum struct {
		CategoryID   uint
		CategoryName string
		Amount       float64
	}
	var expenseSums []CategorySum
	db.DB.Raw(expenseQuery, userID, startDate, endDate).Scan(&expenseSums)

	// Рассчитываем проценты для расходов
	for _, cs := range expenseSums {
		percentage := 0.0
		if totalExpense > 0 {
			percentage = (cs.Amount / totalExpense) * 100
		}
		expenseCategories = append(expenseCategories, CategoryStats{
			CategoryID:   cs.CategoryID,
			CategoryName: cs.CategoryName,
			Amount:       cs.Amount,
			Percentage:   percentage,
		})
	}

	// Получаем категории доходов
	incomeCategories := []CategoryStats{}
	incomeQuery = `
		SELECT t.category_id, c.name as category_name, SUM(t.amount) as amount
		FROM transactions t
		JOIN categories c ON t.category_id = c.id
		WHERE t.user_id = ? AND c.type = 'income' AND t.date BETWEEN ? AND ?
		GROUP BY t.category_id, c.name
	`
	var incomeSums []CategorySum
	db.DB.Raw(incomeQuery, userID, startDate, endDate).Scan(&incomeSums)

	// Рассчитываем проценты для доходов
	for _, cs := range incomeSums {
		percentage := 0.0
		if totalIncome > 0 {
			percentage = (cs.Amount / totalIncome) * 100
		}
		incomeCategories = append(incomeCategories, CategoryStats{
			CategoryID:   cs.CategoryID,
			CategoryName: cs.CategoryName,
			Amount:       cs.Amount,
			Percentage:   percentage,
		})
	}

	// Получаем информацию о пользователе
	var user models.User
	if err := db.DB.First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось получить данные пользователя",
			"error":   err.Error(),
		})
	}

	// Формируем данные для PDF
	statsSummary := utils.StatsSummary{
		TotalIncome:  totalIncome,
		TotalExpense: totalExpense,
		Balance:      balance,
		StartDate:    startDate,
		EndDate:      endDate,
		Categories:   []utils.CategorySummary{},
	}

	// Добавляем категории расходов
	for _, ec := range expenseCategories {
		statsSummary.Categories = append(statsSummary.Categories, utils.CategorySummary{
			Name:       ec.CategoryName,
			Amount:     ec.Amount,
			Percentage: ec.Percentage,
			Type:       "expense",
		})
	}

	// Добавляем категории доходов
	for _, ic := range incomeCategories {
		statsSummary.Categories = append(statsSummary.Categories, utils.CategorySummary{
			Name:       ic.CategoryName,
			Amount:     ic.Amount,
			Percentage: ic.Percentage,
			Type:       "income",
		})
	}

	// Имя пользователя для отчета
	userName := fmt.Sprintf("%s %s", user.FirstName, user.LastName)

	// Генерируем PDF
	pdfData, err := utils.ExportStatsToPDF(statsSummary, userName)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось создать PDF файл",
			"error":   err.Error(),
		})
	}

	// Формируем имя файла с текущей датой
	currentTime := time.Now().Format("2006-01-02_15-04-05")
	fileName := fmt.Sprintf("finance_stats_%s.pdf", currentTime)

	c.Set("Content-Type", "application/pdf")
	c.Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", fileName))

	return c.Send(pdfData)
}

// GetBalanceDynamics получает динамику баланса по дням или часам
func (sc *StatsController) GetBalanceDynamics(c *fiber.Ctx) error {
	userID := middlewares.GetUserID(c)
	startDateStr := c.Query("start_date")
	endDateStr := c.Query("end_date")

	var startDate, endDate time.Time
	var err error

	// Настраиваем временной период
	if startDateStr != "" {
		startDate, err = time.Parse(time.RFC3339, startDateStr)
		if err != nil {
			// Если дата начала не указана или неверный формат, берем начало текущего месяца
			now := time.Now()
			startDate = time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
		}
	} else {
		// Если дата начала не указана, берем начало текущего месяца
		now := time.Now()
		startDate = time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	}

	if endDateStr != "" {
		endDate, err = time.Parse(time.RFC3339, endDateStr)
		if err != nil {
			// Если дата конца не указана или неверный формат, берем текущую дату
			endDate = time.Now()
		}
	} else {
		// Если дата конца не указана, берем текущую дату
		endDate = time.Now()
	}

	// Определяем интервал группировки в зависимости от длительности периода
	daysDiff := int(endDate.Sub(startDate).Hours() / 24)
	var interval string
	var dateFormat string

	switch {
	case daysDiff < 1:
		// Если период меньше дня, группируем по часам
		interval = "hour"
		dateFormat = "2006-01-02 15:00:00"
	case daysDiff < 7:
		// Если период меньше недели, группируем по часам с шагом 6 часов
		interval = "6 hour"
		dateFormat = "2006-01-02 15:00:00"
	case daysDiff < 31:
		// Если период меньше месяца, группируем по дням
		interval = "day"
		dateFormat = "2006-01-02 00:00:00"
	case daysDiff < 180:
		// Если период меньше полугода, группируем по неделям
		interval = "week"
		dateFormat = "2006-01-02 00:00:00"
	default:
		// Для более длительных периодов группируем по месяцам
		interval = "month"
		dateFormat = "2006-01-01 00:00:00"
	}

	// Получаем доходы с группировкой по интервалу
	type DynamicsData struct {
		Date  time.Time
		Income  float64
		Expense float64
	}

	// Формируем SQL запрос с использованием выбранного интервала
	var incomeQuery, expenseQuery string

	if interval == "hour" {
		// Группировка по часам
		incomeQuery = `
			SELECT 
				DATE_TRUNC('hour', t.date) as date,
				COALESCE(SUM(t.amount), 0) as income,
				0 as expense
			FROM transactions t
			JOIN categories c ON t.category_id = c.id
			WHERE t.user_id = ? AND c.type = 'income' AND t.date BETWEEN ? AND ?
			GROUP BY DATE_TRUNC('hour', t.date)
			ORDER BY date
		`
		expenseQuery = `
			SELECT 
				DATE_TRUNC('hour', t.date) as date,
				0 as income,
				COALESCE(SUM(t.amount), 0) as expense
			FROM transactions t
			JOIN categories c ON t.category_id = c.id
			WHERE t.user_id = ? AND c.type = 'expense' AND t.date BETWEEN ? AND ?
			GROUP BY DATE_TRUNC('hour', t.date)
			ORDER BY date
		`
	} else if interval == "6 hour" {
		// Группировка по 6 часам
		incomeQuery = `
			SELECT 
				DATE_TRUNC('day', t.date) + 
				INTERVAL '6 hour' * FLOOR(EXTRACT(HOUR FROM t.date) / 6) as date,
				COALESCE(SUM(t.amount), 0) as income,
				0 as expense
			FROM transactions t
			JOIN categories c ON t.category_id = c.id
			WHERE t.user_id = ? AND c.type = 'income' AND t.date BETWEEN ? AND ?
			GROUP BY date
			ORDER BY date
		`
		expenseQuery = `
			SELECT 
				DATE_TRUNC('day', t.date) + 
				INTERVAL '6 hour' * FLOOR(EXTRACT(HOUR FROM t.date) / 6) as date,
				0 as income,
				COALESCE(SUM(t.amount), 0) as expense
			FROM transactions t
			JOIN categories c ON t.category_id = c.id
			WHERE t.user_id = ? AND c.type = 'expense' AND t.date BETWEEN ? AND ?
			GROUP BY date
			ORDER BY date
		`
	} else {
		// Группировка по дням, неделям или месяцам
		incomeQuery = `
			SELECT 
				DATE_TRUNC('` + interval + `', t.date) as date,
				COALESCE(SUM(t.amount), 0) as income,
				0 as expense
			FROM transactions t
			JOIN categories c ON t.category_id = c.id
			WHERE t.user_id = ? AND c.type = 'income' AND t.date BETWEEN ? AND ?
			GROUP BY DATE_TRUNC('` + interval + `', t.date)
			ORDER BY date
		`
		expenseQuery = `
			SELECT 
				DATE_TRUNC('` + interval + `', t.date) as date,
				0 as income,
				COALESCE(SUM(t.amount), 0) as expense
			FROM transactions t
			JOIN categories c ON t.category_id = c.id
			WHERE t.user_id = ? AND c.type = 'expense' AND t.date BETWEEN ? AND ?
			GROUP BY DATE_TRUNC('` + interval + `', t.date)
			ORDER BY date
		`
	}

	// Выполняем запросы для получения доходов и расходов
	var incomeDynamics, expenseDynamics []DynamicsData
	if err := db.DB.Raw(incomeQuery, userID, startDate, endDate).Scan(&incomeDynamics).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось получить динамику доходов",
			"error":   err.Error(),
		})
	}

	if err := db.DB.Raw(expenseQuery, userID, startDate, endDate).Scan(&expenseDynamics).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось получить динамику расходов",
			"error":   err.Error(),
		})
	}

	// Объединяем данные доходов и расходов в единый массив
	dateMap := make(map[string]DynamicsPoint)

	// Добавляем доходы
	for _, data := range incomeDynamics {
		dateKey := data.Date.Format(dateFormat)
		point, exists := dateMap[dateKey]
		if !exists {
			point = DynamicsPoint{
				Date:    data.Date,
				Income:  0,
				Expense: 0,
				Balance: 0,
			}
		}
		point.Income = data.Income
		dateMap[dateKey] = point
	}

	// Добавляем расходы
	for _, data := range expenseDynamics {
		dateKey := data.Date.Format(dateFormat)
		point, exists := dateMap[dateKey]
		if !exists {
			point = DynamicsPoint{
				Date:    data.Date,
				Income:  0,
				Expense: 0,
				Balance: 0,
			}
		}
		point.Expense = data.Expense
		dateMap[dateKey] = point
	}

	// Вычисляем баланс нарастающим итогом
	keys := make([]string, 0, len(dateMap))
	for k := range dateMap {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	// Если нет данных, добавляем начальную и конечную точки
	if len(keys) == 0 {
		// Добавляем начальную точку
		dateMap[startDate.Format(dateFormat)] = DynamicsPoint{
			Date:    startDate,
			Income:  0,
			Expense: 0,
			Balance: 0,
		}
		
		// Добавляем конечную точку
		dateMap[endDate.Format(dateFormat)] = DynamicsPoint{
			Date:    endDate,
			Income:  0,
			Expense: 0,
			Balance: 0,
		}
		
		// Обновляем ключи
		keys = []string{startDate.Format(dateFormat), endDate.Format(dateFormat)}
	}

	// Вычисляем баланс и сортируем результаты
	var result []DynamicsPoint
	var runningBalance float64 = 0
	
	for _, k := range keys {
		point := dateMap[k]
		runningBalance += point.Income - point.Expense
		point.Balance = runningBalance
		result = append(result, point)
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "success",
		"data": fiber.Map{
			"dynamics":   result,
			"start_date": startDate,
			"end_date":   endDate,
		},
	})
}
