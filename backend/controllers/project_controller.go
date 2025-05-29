package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/nikitagorchakov/finance-hub/backend/db"
	"github.com/nikitagorchakov/finance-hub/backend/middlewares"
	"github.com/nikitagorchakov/finance-hub/backend/models"
	"github.com/nikitagorchakov/finance-hub/backend/utils"
)

type ProjectController struct{}

func NewProjectController() *ProjectController { return &ProjectController{} }

func (ct *ProjectController) GetAll(c *fiber.Ctx) error {
	userID := middlewares.GetUserID(c)
	var projects []models.Project
	if err := db.DB.Where("user_id = ?", userID).Order("created_at desc").Find(&projects).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Не удалось получить проекты"})
	}
	return c.JSON(fiber.Map{"status": "success", "data": projects})
}

func (ct *ProjectController) GetByID(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := middlewares.GetUserID(c)
	var project models.Project
	if err := db.DB.Where("id = ? AND user_id = ?", id, userID).First(&project).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "error", "message": "Проект не найден"})
	}
	return c.JSON(fiber.Map{"status": "success", "data": project})
}

func (ct *ProjectController) Create(c *fiber.Ctx) error {
	userID := middlewares.GetUserID(c)
	var input models.Project
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Некорректные данные"})
	}
	input.UserID = userID
	if err := db.DB.Create(&input).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Не удалось создать проект"})
	}
	
	// Логируем создание проекта
	utils.CreateChangeLog(userID, models.EntityProject, input.ID, models.ActionCreate, nil, input)
	
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"status": "success", "data": input})
}

func (ct *ProjectController) Update(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := middlewares.GetUserID(c)
	var project models.Project
	if err := db.DB.Where("id = ? AND user_id = ?", id, userID).First(&project).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "error", "message": "Проект не найден"})
	}
	
	// Сохраняем старые данные для истории
	oldProject := project
	
	var input models.Project
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Некорректные данные"})
	}
	input.ID = project.ID
	input.UserID = userID
	if err := db.DB.Model(&project).Updates(input).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Не удалось обновить проект"})
	}
	
	// Логируем обновление проекта
	utils.CreateChangeLog(userID, models.EntityProject, project.ID, models.ActionUpdate, oldProject, project)
	
	return c.JSON(fiber.Map{"status": "success", "data": project})
}

func (ct *ProjectController) Archive(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := middlewares.GetUserID(c)
	var project models.Project
	if err := db.DB.Where("id = ? AND user_id = ?", id, userID).First(&project).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "error", "message": "Проект не найден"})
	}
	
	// Сохраняем старые данные для истории
	oldProject := project
	
	project.Status = models.ProjectArchived
	if err := db.DB.Save(&project).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Не удалось архивировать проект"})
	}
	
	// Логируем архивирование проекта
	utils.CreateChangeLog(userID, models.EntityProject, project.ID, models.ActionArchive, oldProject, project)
	
	return c.JSON(fiber.Map{"status": "success", "data": project})
}

func (ct *ProjectController) Unarchive(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := middlewares.GetUserID(c)
	var project models.Project
	if err := db.DB.Where("id = ? AND user_id = ?", id, userID).First(&project).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "error", "message": "Проект не найден"})
	}
	
	if project.Status != models.ProjectArchived {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Проект не архивирован"})
	}
	
	// Сохраняем старые данные для истории
	oldProject := project
	
	project.Status = models.ProjectOpen
	if err := db.DB.Save(&project).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Не удалось разархивировать проект"})
	}
	
	// Логируем разархивирование проекта
	utils.CreateChangeLog(userID, models.EntityProject, project.ID, models.ActionUnarchive, oldProject, project)
	
	return c.JSON(fiber.Map{"status": "success", "data": project})
}

func (ct *ProjectController) Complete(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := middlewares.GetUserID(c)
	var project models.Project
	if err := db.DB.Where("id = ? AND user_id = ?", id, userID).First(&project).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "error", "message": "Проект не найден"})
	}
	
	if project.Status != models.ProjectOpen {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"status": "error", "message": "Завершить можно только активный проект"})
	}
	
	// Сохраняем старые данные для истории
	oldProject := project
	
	project.Status = models.ProjectClosed
	if err := db.DB.Save(&project).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Не удалось завершить проект"})
	}
	
	// Логируем завершение проекта
	utils.CreateChangeLog(userID, models.EntityProject, project.ID, models.ActionComplete, oldProject, project)
	
	return c.JSON(fiber.Map{"status": "success", "data": project})
}

func (ct *ProjectController) Analytics(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := middlewares.GetUserID(c)
	var project models.Project
	if err := db.DB.Where("id = ? AND user_id = ?", id, userID).First(&project).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"status": "error", "message": "Проект не найден"})
	}
	var payments []models.ProjectPayment
	if err := db.DB.Where("project_id = ? AND user_id = ?", id, userID).Order("date asc").Find(&payments).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Не удалось получить платежи"})
	}
	totalPaid := 0.0
	var paymentGraph []map[string]interface{}
	cumulative := 0.0
	for _, p := range payments {
		totalPaid += p.Amount
		cumulative += p.Amount
		paymentGraph = append(paymentGraph, map[string]interface{}{
			"date": p.Date,
			"amount": p.Amount,
			"cumulative": cumulative,
		})
	}
	overpayment := 0.0
	earlyRepaymentBenefit := 0.0
	if project.Type == models.ProjectLoan {
		// Примитивная оценка: переплата = totalPaid - targetAmount
		overpayment = totalPaid - project.TargetAmount
		// Если есть досрочные платежи, считаем экономию (разница между плановой и фактической переплатой)
		// Для MVP: если totalPaid < (targetAmount + плановая переплата), считаем разницу экономией
		plannedOverpayment := project.TargetAmount * 0.1 // например, 10% годовых
		if overpayment < plannedOverpayment {
			earlyRepaymentBenefit = plannedOverpayment - overpayment
		}
	}
	return c.JSON(fiber.Map{
		"status": "success",
		"data": fiber.Map{
			"totalPaid": totalPaid,
			"overpayment": overpayment,
			"earlyRepaymentBenefit": earlyRepaymentBenefit,
			"payments": paymentGraph,
		},
	})
}

// Stats возвращает общую статистику проектов пользователя
func (ct *ProjectController) Stats(c *fiber.Ctx) error {
	userID := middlewares.GetUserID(c)
	
	var projects []models.Project
	if err := db.DB.Where("user_id = ?", userID).Find(&projects).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "error", 
			"message": "Не удалось получить проекты",
		})
	}

	// Получаем все платежи для анализа
	var payments []models.ProjectPayment
	if err := db.DB.Where("user_id = ?", userID).Order("date asc").Find(&payments).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status": "error", 
			"message": "Не удалось получить платежи",
		})
	}
	
	stats := map[string]interface{}{
		"totalProjects": len(projects),
		"activeProjects": 0,
		"completedProjects": 0,
		"archivedProjects": 0,
		"totalTargetAmount": 0.0,
		"totalCurrentAmount": 0.0,
		"averageProgress": 0.0,
		"projectsByType": map[string]int{
			"saving": 0,
			"loan": 0,
		},
		"projectsByStatus": map[string]int{
			"open": 0,
			"closed": 0,
			"archived": 0,
		},
		"topProjects": []map[string]interface{}{},
		"paymentsDynamics": []map[string]interface{}{},
		"monthlyPayments": map[string]float64{},
		"progressDistribution": map[string]int{
			"0-25": 0,
			"25-50": 0,
			"50-75": 0,
			"75-100": 0,
			"100+": 0,
		},
	}
	
	totalProgress := 0.0
	var projectDetails []map[string]interface{}
	
	for _, project := range projects {
		// Подсчет по статусам
		projectsByStatus := stats["projectsByStatus"].(map[string]int)
		switch project.Status {
		case models.ProjectOpen:
			stats["activeProjects"] = stats["activeProjects"].(int) + 1
			projectsByStatus["open"]++
		case models.ProjectClosed:
			stats["completedProjects"] = stats["completedProjects"].(int) + 1
			projectsByStatus["closed"]++
		case models.ProjectArchived:
			stats["archivedProjects"] = stats["archivedProjects"].(int) + 1
			projectsByStatus["archived"]++
		}
		
		// Подсчет по типам
		projectsByType := stats["projectsByType"].(map[string]int)
		projectsByType[string(project.Type)]++
		
		// Суммы и прогресс
		stats["totalTargetAmount"] = stats["totalTargetAmount"].(float64) + project.TargetAmount
		stats["totalCurrentAmount"] = stats["totalCurrentAmount"].(float64) + project.CurrentAmount
		
		progress := 0.0
		if project.TargetAmount > 0 {
			progress = (project.CurrentAmount / project.TargetAmount) * 100
			totalProgress += progress
		}

		// Распределение по прогрессу
		progressDistribution := stats["progressDistribution"].(map[string]int)
		if progress >= 100 {
			progressDistribution["100+"]++
		} else if progress >= 75 {
			progressDistribution["75-100"]++
		} else if progress >= 50 {
			progressDistribution["50-75"]++
		} else if progress >= 25 {
			progressDistribution["25-50"]++
		} else {
			progressDistribution["0-25"]++
		}
		
		// Детали проекта для топ списка
		projectDetails = append(projectDetails, map[string]interface{}{
			"id": project.ID,
			"name": project.Name,
			"type": project.Type,
			"progress": progress,
			"currentAmount": project.CurrentAmount,
			"targetAmount": project.TargetAmount,
			"status": project.Status,
		})
	}
	
	// Сортируем проекты по прогрессу для топ списка
	for i := 0; i < len(projectDetails)-1; i++ {
		for j := i + 1; j < len(projectDetails); j++ {
			if projectDetails[i]["progress"].(float64) < projectDetails[j]["progress"].(float64) {
				projectDetails[i], projectDetails[j] = projectDetails[j], projectDetails[i]
			}
		}
	}
	
	// Берем топ 5 проектов
	topCount := 5
	if len(projectDetails) < topCount {
		topCount = len(projectDetails)
	}
	stats["topProjects"] = projectDetails[:topCount]
	
	// Средний прогресс
	if len(projects) > 0 {
		stats["averageProgress"] = totalProgress / float64(len(projects))
	}

	// Анализ динамики платежей
	paymentsByMonth := make(map[string]float64)
	for _, payment := range payments {
		month := payment.Date.Format("2006-01") // YYYY-MM формат
		paymentsByMonth[month] += payment.Amount
	}
	
	stats["monthlyPayments"] = paymentsByMonth
	
	// Создаем массив для графика динамики
	var paymentsDynamics []map[string]interface{}
	for month, amount := range paymentsByMonth {
		paymentsDynamics = append(paymentsDynamics, map[string]interface{}{
			"month": month,
			"amount": amount,
		})
	}
	stats["paymentsDynamics"] = paymentsDynamics
	
	return c.JSON(fiber.Map{
		"status": "success",
		"data": stats,
	})
} 