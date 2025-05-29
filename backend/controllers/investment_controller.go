package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/nikitagorchakov/finance-hub/backend/db"
	"github.com/nikitagorchakov/finance-hub/backend/middlewares"
	"github.com/nikitagorchakov/finance-hub/backend/models"
	"github.com/nikitagorchakov/finance-hub/backend/utils"
)

type InvestmentController struct{}

func NewInvestmentController() *InvestmentController { return &InvestmentController{} }

func (ct *InvestmentController) GetAll(c *fiber.Ctx) error {
	userID := middlewares.GetUserID(c)
	var investments []models.Investment
	if err := db.DB.Where("user_id = ?", userID).Order("created_at desc").Find(&investments).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Не удалось получить инвестиции"})
	}
	return c.JSON(fiber.Map{"status": "success", "data": investments})
}

func (ct *InvestmentController) GetByID(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := middlewares.GetUserID(c)
	var investment models.Investment
	if err := db.DB.Where("id = ? AND user_id = ?", id, userID).First(&investment).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "error", "message": "Инвестиция не найдена"})
	}
	return c.JSON(fiber.Map{"status": "success", "data": investment})
}

func (ct *InvestmentController) Create(c *fiber.Ctx) error {
	userID := middlewares.GetUserID(c)
	var input models.Investment
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Некорректные данные"})
	}
	input.UserID = userID
	if err := db.DB.Create(&input).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Не удалось создать инвестицию"})
	}
	
	// Логируем создание инвестиции
	utils.CreateChangeLog(userID, models.EntityInvestment, input.ID, models.ActionCreate, nil, input)
	
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"status": "success", "data": input})
}

func (ct *InvestmentController) Update(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := middlewares.GetUserID(c)
	var investment models.Investment
	if err := db.DB.Where("id = ? AND user_id = ?", id, userID).First(&investment).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "error", "message": "Инвестиция не найдена"})
	}
	
	// Сохраняем старые данные для истории
	oldInvestment := investment
	
	var input models.Investment
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Некорректные данные"})
	}
	input.ID = investment.ID
	input.UserID = userID
	if err := db.DB.Model(&investment).Updates(input).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Не удалось обновить инвестицию"})
	}
	
	// Логируем обновление инвестиции
	utils.CreateChangeLog(userID, models.EntityInvestment, investment.ID, models.ActionUpdate, oldInvestment, investment)
	
	return c.JSON(fiber.Map{"status": "success", "data": investment})
}

func (ct *InvestmentController) Archive(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := middlewares.GetUserID(c)
	var investment models.Investment
	if err := db.DB.Where("id = ? AND user_id = ?", id, userID).First(&investment).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "error", "message": "Инвестиция не найдена"})
	}
	
	// Сохраняем старые данные для истории
	oldInvestment := investment
	
	investment.Status = models.InvestmentArchived
	if err := db.DB.Save(&investment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Не удалось архивировать инвестицию"})
	}
	
	// Логируем архивирование инвестиции
	utils.CreateChangeLog(userID, models.EntityInvestment, investment.ID, models.ActionArchive, oldInvestment, investment)
	
	return c.JSON(fiber.Map{"status": "success", "data": investment})
}

func (ct *InvestmentController) Unarchive(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := middlewares.GetUserID(c)
	var investment models.Investment
	if err := db.DB.Where("id = ? AND user_id = ?", id, userID).First(&investment).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "error", "message": "Инвестиция не найдена"})
	}
	
	if investment.Status != models.InvestmentArchived {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Инвестиция не архивирована"})
	}
	
	// Сохраняем старые данные для истории
	oldInvestment := investment
	
	investment.Status = models.InvestmentOpen
	if err := db.DB.Save(&investment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Не удалось разархивировать инвестицию"})
	}
	
	// Логируем разархивирование инвестиции
	utils.CreateChangeLog(userID, models.EntityInvestment, investment.ID, models.ActionUnarchive, oldInvestment, investment)
	
	return c.JSON(fiber.Map{"status": "success", "data": investment})
}

func (ct *InvestmentController) Complete(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := middlewares.GetUserID(c)
	var investment models.Investment
	if err := db.DB.Where("id = ? AND user_id = ?", id, userID).First(&investment).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "error", "message": "Инвестиция не найдена"})
	}
	
	if investment.Status != models.InvestmentOpen {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Завершить можно только активную инвестицию"})
	}
	
	// Сохраняем старые данные для истории
	oldInvestment := investment
	
	investment.Status = models.InvestmentClosed
	if err := db.DB.Save(&investment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Не удалось завершить инвестицию"})
	}
	
	// Логируем завершение инвестиции
	utils.CreateChangeLog(userID, models.EntityInvestment, investment.ID, models.ActionComplete, oldInvestment, investment)
	
	return c.JSON(fiber.Map{"status": "success", "data": investment})
}

func (ct *InvestmentController) Analytics(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := middlewares.GetUserID(c)
	var investment models.Investment
	if err := db.DB.Where("id = ? AND user_id = ?", id, userID).First(&investment).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "error", "message": "Инвестиция не найдена"})
	}
	var ops []models.InvestmentOperation
	if err := db.DB.Where("investment_id = ? AND user_id = ?", id, userID).Order("date asc").Find(&ops).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Не удалось получить операции"})
	}
	totalInvested := 0.0
	totalCapitalization := 0.0
	cumulative := 0.0
	var opGraph []map[string]interface{}
	for _, op := range ops {
		if op.Type == "deposit" {
			totalInvested += op.Amount
			cumulative += op.Amount
		} else if op.Type == "withdrawal" {
			totalInvested -= op.Amount
			cumulative -= op.Amount
		} else if op.Type == "capitalization" {
			totalCapitalization += op.Amount
			cumulative += op.Amount
		}
		opGraph = append(opGraph, map[string]interface{}{
			"date": op.Date,
			"amount": op.Amount,
			"type": op.Type,
			"cumulative": cumulative,
		})
	}
	return c.JSON(fiber.Map{
		"status": "success",
		"data": fiber.Map{
			"totalInvested": totalInvested,
			"totalCapitalization": totalCapitalization,
			"operations": opGraph,
		},
	})
}

// Stats возвращает общую статистику инвестиций пользователя
func (ct *InvestmentController) Stats(c *fiber.Ctx) error {
	userID := middlewares.GetUserID(c)
	
	var investments []models.Investment
	if err := db.DB.Where("user_id = ?", userID).Find(&investments).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "error", 
			"message": "Не удалось получить инвестиции",
		})
	}

	// Получаем все операции для анализа
	var operations []models.InvestmentOperation
	if err := db.DB.Where("user_id = ?", userID).Order("date asc").Find(&operations).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "error", 
			"message": "Не удалось получить операции",
		})
	}
	
	stats := map[string]interface{}{
		"totalInvestments": len(investments),
		"activeInvestments": 0,
		"closedInvestments": 0,
		"archivedInvestments": 0,
		"totalAmount": 0.0,
		"totalProfit": 0.0,
		"averageReturn": 0.0,
		"investmentsByType": map[string]int{
			"deposit": 0,
			"security": 0,
			"realty": 0,
		},
		"investmentsByStatus": map[string]int{
			"open": 0,
			"closed": 0,
			"archived": 0,
		},
		"topPerformers": []map[string]interface{}{},
		"operationsDynamics": []map[string]interface{}{},
		"monthlyOperations": map[string]map[string]float64{},
		"returnDistribution": map[string]int{
			"negative": 0,
			"0-5": 0,
			"5-10": 0,
			"10-20": 0,
			"20+": 0,
		},
		"portfolioComposition": []map[string]interface{}{},
	}
	
	totalReturn := 0.0
	var investmentDetails []map[string]interface{}
	
	for _, investment := range investments {
		// Подсчет по статусам
		investmentsByStatus := stats["investmentsByStatus"].(map[string]int)
		switch investment.Status {
		case models.InvestmentOpen:
			stats["activeInvestments"] = stats["activeInvestments"].(int) + 1
			investmentsByStatus["open"]++
		case models.InvestmentClosed:
			stats["closedInvestments"] = stats["closedInvestments"].(int) + 1
			investmentsByStatus["closed"]++
		case models.InvestmentArchived:
			stats["archivedInvestments"] = stats["archivedInvestments"].(int) + 1
			investmentsByStatus["archived"]++
		}
		
		// Подсчет по типам
		investmentsByType := stats["investmentsByType"].(map[string]int)
		investmentsByType[string(investment.Type)]++
		
		// Суммы
		stats["totalAmount"] = stats["totalAmount"].(float64) + investment.Amount
		stats["totalProfit"] = stats["totalProfit"].(float64) + investment.Capitalization
		
		// Доходность
		returnRate := 0.0
		if investment.Amount > 0 {
			returnRate = (investment.Capitalization / investment.Amount) * 100
			totalReturn += returnRate
		}

		// Распределение по доходности
		returnDistribution := stats["returnDistribution"].(map[string]int)
		if returnRate < 0 {
			returnDistribution["negative"]++
		} else if returnRate >= 20 {
			returnDistribution["20+"]++
		} else if returnRate >= 10 {
			returnDistribution["10-20"]++
		} else if returnRate >= 5 {
			returnDistribution["5-10"]++
		} else {
			returnDistribution["0-5"]++
		}
		
		// Детали инвестиции для топ списка
		investmentDetails = append(investmentDetails, map[string]interface{}{
			"id": investment.ID,
			"name": investment.Name,
			"type": investment.Type,
			"return": returnRate,
			"amount": investment.Amount,
			"profit": investment.Capitalization,
			"status": investment.Status,
		})
	}
	
	// Сортируем инвестиции по доходности для топ списка
	for i := 0; i < len(investmentDetails)-1; i++ {
		for j := i + 1; j < len(investmentDetails); j++ {
			if investmentDetails[i]["return"].(float64) < investmentDetails[j]["return"].(float64) {
				investmentDetails[i], investmentDetails[j] = investmentDetails[j], investmentDetails[i]
			}
		}
	}
	
	// Берем топ 5 инвестиций
	topCount := 5
	if len(investmentDetails) < topCount {
		topCount = len(investmentDetails)
	}
	stats["topPerformers"] = investmentDetails[:topCount]
	
	// Средняя доходность
	if len(investments) > 0 {
		stats["averageReturn"] = totalReturn / float64(len(investments))
	}

	// Анализ динамики операций
	operationsByMonth := make(map[string]map[string]float64)
	for _, operation := range operations {
		month := operation.Date.Format("2006-01") // YYYY-MM формат
		if operationsByMonth[month] == nil {
			operationsByMonth[month] = map[string]float64{
				"deposit": 0,
				"withdrawal": 0,
				"capitalization": 0,
			}
		}
		operationsByMonth[month][operation.Type] += operation.Amount
	}
	
	stats["monthlyOperations"] = operationsByMonth
	
	// Создаем массив для графика динамики
	var operationsDynamics []map[string]interface{}
	for month, ops := range operationsByMonth {
		operationsDynamics = append(operationsDynamics, map[string]interface{}{
			"month": month,
			"deposit": ops["deposit"],
			"withdrawal": ops["withdrawal"],
			"capitalization": ops["capitalization"],
		})
	}
	stats["operationsDynamics"] = operationsDynamics

	// Состав портфеля
	var portfolioComposition []map[string]interface{}
	totalPortfolioAmount := stats["totalAmount"].(float64)
	for investmentType, count := range stats["investmentsByType"].(map[string]int) {
		if count > 0 {
			// Вычисляем сумму для каждого типа
			typeAmount := 0.0
			for _, inv := range investments {
				if string(inv.Type) == investmentType {
					typeAmount += inv.Amount
				}
			}
			percentage := 0.0
			if totalPortfolioAmount > 0 {
				percentage = (typeAmount / totalPortfolioAmount) * 100
			}
			
			portfolioComposition = append(portfolioComposition, map[string]interface{}{
				"type": investmentType,
				"amount": typeAmount,
				"percentage": percentage,
				"count": count,
			})
		}
	}
	stats["portfolioComposition"] = portfolioComposition
	
	return c.JSON(fiber.Map{
		"status": "success",
		"data": stats,
	})
} 