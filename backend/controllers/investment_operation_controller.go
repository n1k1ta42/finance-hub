package controllers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/nikitagorchakov/finance-hub/backend/db"
	"github.com/nikitagorchakov/finance-hub/backend/middlewares"
	"github.com/nikitagorchakov/finance-hub/backend/models"
	"github.com/nikitagorchakov/finance-hub/backend/utils"
)

type InvestmentOperationController struct{}

func NewInvestmentOperationController() *InvestmentOperationController { return &InvestmentOperationController{} }

// InvestmentOperationCreateDTO структура для создания операции
type InvestmentOperationCreateDTO struct {
	Type    string  `json:"type"`
	Amount  float64 `json:"amount"`
	Date    string  `json:"date"`
	Comment string  `json:"comment"`
}

func (ct *InvestmentOperationController) GetAll(c *fiber.Ctx) error {
	investmentID := c.Params("investmentId")
	userID := middlewares.GetUserID(c)
	var ops []models.InvestmentOperation
	if err := db.DB.Where("investment_id = ? AND user_id = ?", investmentID, userID).Order("date desc").Find(&ops).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Не удалось получить операции"})
	}
	return c.JSON(fiber.Map{"status": "success", "data": ops})
}

func (ct *InvestmentOperationController) GetByID(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := middlewares.GetUserID(c)
	var op models.InvestmentOperation
	if err := db.DB.Where("id = ? AND user_id = ?", id, userID).First(&op).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "error", "message": "Операция не найдена"})
	}
	return c.JSON(fiber.Map{"status": "success", "data": op})
}

func (ct *InvestmentOperationController) Create(c *fiber.Ctx) error {
	userID := middlewares.GetUserID(c)
	
	var input InvestmentOperationCreateDTO
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Некорректные данные"})
	}
	
	// Валидация данных
	if input.Amount <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Сумма должна быть больше 0"})
	}
	
	if input.Type == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Тип операции обязателен"})
	}
	
	// Проверяем допустимые типы операций
	if input.Type != "deposit" && input.Type != "withdrawal" && input.Type != "capitalization" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Недопустимый тип операции"})
	}
	
	if input.Date == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Дата обязательна"})
	}
	
	// Парсинг даты
	parsedDate, err := time.Parse("2006-01-02", input.Date)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Неверный формат даты"})
	}
	
	// Проверяем, что дата не из будущего
	if parsedDate.After(time.Now()) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Дата не может быть в будущем"})
	}
	
	investmentIDInt, _ := c.ParamsInt("investmentId")
	
	// Создаем операцию
	operation := models.InvestmentOperation{
		UserID:       userID,
		InvestmentID: uint(investmentIDInt),
		Type:         input.Type,
		Amount:       input.Amount,
		Date:         parsedDate,
		Comment:      input.Comment,
	}
	
	if err := db.DB.Create(&operation).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Не удалось создать операцию"})
	}
	
	// Обновляем инвестицию в зависимости от типа операции
	var investment models.Investment
	if err := db.DB.First(&investment, investmentIDInt).Error; err == nil {
		oldInvestment := investment
		
		switch input.Type {
		case "deposit":
			investment.Amount += operation.Amount
		case "withdrawal":
			investment.Amount -= operation.Amount
			if investment.Amount < 0 {
				investment.Amount = 0 // Не позволяем отрицательные значения
			}
		case "capitalization":
			investment.Capitalization += operation.Amount
		}
		
		if err := db.DB.Save(&investment).Error; err == nil {
			// Логируем обновление инвестиции
			utils.CreateChangeLog(userID, models.EntityInvestment, investment.ID, models.ActionUpdate, oldInvestment, investment)
		}
	}
	
	// Логируем создание операции
	utils.CreateChangeLog(userID, models.EntityInvestmentOperation, operation.ID, models.ActionCreate, nil, operation)
	
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"status": "success", "data": operation})
}

func (ct *InvestmentOperationController) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := middlewares.GetUserID(c)
	var op models.InvestmentOperation
	if err := db.DB.Where("id = ? AND user_id = ?", id, userID).First(&op).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "error", "message": "Операция не найдена"})
	}
	
	// Обновляем инвестицию до удаления операции (обратная операция)
	var investment models.Investment
	if err := db.DB.First(&investment, op.InvestmentID).Error; err == nil {
		oldInvestment := investment
		
		switch op.Type {
		case "deposit":
			investment.Amount -= op.Amount
			if investment.Amount < 0 {
				investment.Amount = 0
			}
		case "withdrawal":
			investment.Amount += op.Amount
		case "capitalization":
			investment.Capitalization -= op.Amount
		}
		
		if err := db.DB.Save(&investment).Error; err == nil {
			// Логируем обновление инвестиции
			utils.CreateChangeLog(userID, models.EntityInvestment, investment.ID, models.ActionUpdate, oldInvestment, investment)
		}
	}
	
	// Логируем удаление операции
	utils.CreateChangeLog(userID, models.EntityInvestmentOperation, op.ID, models.ActionDelete, op, nil)
	
	if err := db.DB.Delete(&op).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Не удалось удалить операцию"})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Операция удалена"})
} 