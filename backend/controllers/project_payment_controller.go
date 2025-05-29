package controllers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/nikitagorchakov/finance-hub/backend/db"
	"github.com/nikitagorchakov/finance-hub/backend/middlewares"
	"github.com/nikitagorchakov/finance-hub/backend/models"
	"github.com/nikitagorchakov/finance-hub/backend/utils"
)

type ProjectPaymentController struct{}

func NewProjectPaymentController() *ProjectPaymentController { return &ProjectPaymentController{} }

// ProjectPaymentCreateDTO структура для создания платежа
type ProjectPaymentCreateDTO struct {
	Amount  float64 `json:"amount"`
	Date    string  `json:"date"`
	Comment string  `json:"comment"`
}

func (ct *ProjectPaymentController) GetAll(c *fiber.Ctx) error {
	projectID := c.Params("projectId")
	userID := middlewares.GetUserID(c)
	var payments []models.ProjectPayment
	if err := db.DB.Where("project_id = ? AND user_id = ?", projectID, userID).Order("date desc").Find(&payments).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Не удалось получить платежи"})
	}
	return c.JSON(fiber.Map{"status": "success", "data": payments})
}

func (ct *ProjectPaymentController) GetByID(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := middlewares.GetUserID(c)
	var payment models.ProjectPayment
	if err := db.DB.Where("id = ? AND user_id = ?", id, userID).First(&payment).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "error", "message": "Платеж не найден"})
	}
	return c.JSON(fiber.Map{"status": "success", "data": payment})
}

func (ct *ProjectPaymentController) Create(c *fiber.Ctx) error {
	userID := middlewares.GetUserID(c)
	
	var input ProjectPaymentCreateDTO
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Некорректные данные"})
	}
	
	// Валидация данных
	if input.Amount <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Сумма должна быть больше 0"})
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
	
	projectIDInt, _ := c.ParamsInt("projectId")
	
	// Создаем платеж
	payment := models.ProjectPayment{
		UserID:    userID,
		ProjectID: uint(projectIDInt),
		Amount:    input.Amount,
		Date:      parsedDate,
		Comment:   input.Comment,
	}
	
	if err := db.DB.Create(&payment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Не удалось создать платеж"})
	}
	
	// Обновляем currentAmount проекта
	var project models.Project
	if err := db.DB.First(&project, projectIDInt).Error; err == nil {
		oldProject := project
		project.CurrentAmount += payment.Amount
		if err := db.DB.Save(&project).Error; err == nil {
			// Логируем обновление проекта
			utils.CreateChangeLog(userID, models.EntityProject, project.ID, models.ActionUpdate, oldProject, project)
		}
	}
	
	// Логируем создание платежа
	utils.CreateChangeLog(userID, models.EntityProjectPayment, payment.ID, models.ActionCreate, nil, payment)
	
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"status": "success", "data": payment})
}

func (ct *ProjectPaymentController) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := middlewares.GetUserID(c)
	var payment models.ProjectPayment
	if err := db.DB.Where("id = ? AND user_id = ?", id, userID).First(&payment).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "error", "message": "Платеж не найден"})
	}
	
	// Обновляем currentAmount проекта до удаления платежа
	var project models.Project
	if err := db.DB.First(&project, payment.ProjectID).Error; err == nil {
		oldProject := project
		project.CurrentAmount -= payment.Amount
		if project.CurrentAmount < 0 {
			project.CurrentAmount = 0 // Не позволяем отрицательные значения
		}
		if err := db.DB.Save(&project).Error; err == nil {
			// Логируем обновление проекта
			utils.CreateChangeLog(userID, models.EntityProject, project.ID, models.ActionUpdate, oldProject, project)
		}
	}
	
	// Логируем удаление платежа
	utils.CreateChangeLog(userID, models.EntityProjectPayment, payment.ID, models.ActionDelete, payment, nil)
	
	if err := db.DB.Delete(&payment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Не удалось удалить платеж"})
	}
	return c.JSON(fiber.Map{"status": "success", "message": "Платеж удален"})
} 