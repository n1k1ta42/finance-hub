package controllers

import (
	"math"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/nikitagorchakov/finance-hub/backend/config"
	"github.com/nikitagorchakov/finance-hub/backend/db"
	"github.com/nikitagorchakov/finance-hub/backend/middlewares"
	"github.com/nikitagorchakov/finance-hub/backend/models"
	"github.com/nikitagorchakov/finance-hub/backend/utils"
)

// AuthController контроллер аутентификации
type AuthController struct {
	Config *config.Config
}

// NewAuthController создает новый контроллер аутентификации
func NewAuthController(config *config.Config) *AuthController {
	return &AuthController{Config: config}
}

// Register регистрирует нового пользователя
func (a *AuthController) Register(c *fiber.Ctx) error {
	var input models.RegisterDTO

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

	// Проверяем, существует ли пользователь с таким email
	var existingUser models.User
	result := db.DB.Where("email = ?", input.Email).First(&existingUser)
	if result.RowsAffected > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Пользователь с таким email уже существует",
		})
	}

	// Создаем нового пользователя
	user := models.User{
		Email:     input.Email,
		Password:  input.Password,
		FirstName: input.FirstName,
		LastName:  input.LastName,
	}

	if err := db.DB.Create(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось создать пользователя",
			"error":   err.Error(),
		})
	}

	// Создаем пожизненную базовую подписку для нового пользователя
	features := strings.Join(models.PlanFeatures[models.Basic], ", ")
	subscription := models.Subscription{
		UserID:    user.ID,
		Plan:      models.Basic,
		Period:    models.LifetimeSubscription,
		StartDate: time.Now(),
		EndDate:   nil, // пожизненная подписка не имеет даты окончания
		Active:    true,
		Price:     0, // бесплатная базовая подписка
		Features:  features,
	}

	if err := db.DB.Create(&subscription).Error; err != nil {
		// Логируем ошибку, но не останавливаем регистрацию
		// Пользователь уже создан, можно продолжить
		// В реальной системе здесь следует обработать эту ситуацию более тщательно
	} else {
		// Создаем уведомление о получении базовой подписки
		notification := models.Notification{
			UserID:     user.ID,
			Type:       models.NotificationSubscription,
			Title:      "Добро пожаловать!",
			Message:    "Вам выдана бесплатная пожизненная базовая подписка. Вы можете начать пользоваться сервисом прямо сейчас.",
			Importance: models.NotificationNormal,
			IsRead:     false,
		}

		db.DB.Create(&notification)
	}

	// Генерируем короткоживущий JWT access токен
	accessToken, err := utils.GenerateAccessToken(user.ID, user.Email, user.Role, a.Config)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось создать токен доступа",
			"error":   err.Error(),
		})
	}

	// Генерируем refresh токен и сохраняем в БД
	refreshToken, expiresAt, err := utils.GenerateRefreshToken(user.ID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось создать refresh токен",
			"error":   err.Error(),
		})
	}

	// Устанавливаем access токен в httpOnly cookie
	c.Cookie(&fiber.Cookie{
		Name:     "access_token",
		Value:    accessToken,
		Path:     "/",
		MaxAge:   15 * 60, // 15 минут
		Secure:   a.Config.Env != "development",
		HTTPOnly: true,
		SameSite: "Strict",
	})

	// Устанавливаем refresh токен в httpOnly cookie
	c.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    refreshToken,
		Path:     "/",
		MaxAge:   int(time.Until(expiresAt).Seconds()),
		Secure:   a.Config.Env != "development",
		HTTPOnly: true,
		SameSite: "Strict",
	})

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"status":  "success",
		"message": "Пользователь успешно зарегистрирован",
		"data": fiber.Map{
			"user": user.ToUserResponse(),
		},
	})
}

// Login аутентификация пользователя
func (a *AuthController) Login(c *fiber.Ctx) error {
	var input models.LoginDTO

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

	// Ищем пользователя по email
	var user models.User
	result := db.DB.Where("email = ?", input.Email).First(&user)
	if result.RowsAffected == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Неверный email или пароль",
		})
	}

	// Проверяем пароль
	if err := user.ComparePassword(input.Password); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Неверный email или пароль",
		})
	}

	// Генерируем короткоживущий JWT access токен
	accessToken, err := utils.GenerateAccessToken(user.ID, user.Email, user.Role, a.Config)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось создать токен доступа",
			"error":   err.Error(),
		})
	}

	// Генерируем refresh токен и сохраняем в БД
	refreshToken, expiresAt, err := utils.GenerateRefreshToken(user.ID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось создать refresh токен",
			"error":   err.Error(),
		})
	}

	// Устанавливаем access токен в httpOnly cookie
	c.Cookie(&fiber.Cookie{
		Name:     "access_token",
		Value:    accessToken,
		Path:     "/",
		MaxAge:   15 * 60, // 15 минут
		Secure:   a.Config.Env != "development",
		HTTPOnly: true,
		SameSite: "Strict",
	})

	// Устанавливаем refresh токен в httpOnly cookie
	c.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    refreshToken,
		Path:     "/",
		MaxAge:   int(time.Until(expiresAt).Seconds()),
		Secure:   a.Config.Env != "development",
		HTTPOnly: true,
		SameSite: "Strict",
	})

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  "success",
		"message": "Вход выполнен успешно",
		"data": fiber.Map{
			"user": user.ToUserResponse(),
		},
	})
}

// GetMe получает информацию о текущем пользователе
func (a *AuthController) GetMe(c *fiber.Ctx) error {
	// Получаем ID пользователя из JWT токена
	userID := middlewares.GetUserID(c)

	var user models.User
	if err := db.DB.First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "Пользователь не найден",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "success",
		"data":   user.ToUserResponse(),
	})
}

// UpdateMe обновляет данные текущего пользователя
func (a *AuthController) UpdateMe(c *fiber.Ctx) error {
	// Получаем ID пользователя из JWT токена
	userID := middlewares.GetUserID(c)

	// Проверяем существование пользователя
	var user models.User
	if err := db.DB.First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "Пользователь не найден",
			"error":   err.Error(),
		})
	}

	// Парсим входные данные
	var input models.UpdateUserDTO
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось обработать данные",
			"error":   err.Error(),
		})
	}

	// Валидируем входные данные
	errors := utils.ValidateStruct(input)
	if len(errors) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status": "error",
			"errors": errors,
		})
	}

	// Проверяем, не занят ли новый email другим пользователем
	if input.Email != user.Email {
		var existingUser models.User
		result := db.DB.Where("email = ? AND id != ?", input.Email, userID).First(&existingUser)
		if result.RowsAffected > 0 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"status":  "error",
				"message": "Пользователь с таким email уже существует",
			})
		}
	}

	// Обновляем данные пользователя
	user.Email = input.Email
	user.FirstName = input.FirstName
	user.LastName = input.LastName

	if err := db.DB.Save(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось обновить данные пользователя",
			"error":   err.Error(),
		})
	}

	// Если email изменился, обновляем токен
	if input.Email != user.Email {
		// Генерируем новый JWT токен
		token, err := utils.GenerateToken(user.ID, user.Email, user.Role, a.Config)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"status":  "error",
				"message": "Не удалось создать токен",
				"error":   err.Error(),
			})
		}

		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"status":  "success",
			"message": "Данные пользователя успешно обновлены",
			"data": fiber.Map{
				"token": token,
				"user":  user.ToUserResponse(),
			},
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  "success",
		"message": "Данные пользователя успешно обновлены",
		"data":    user.ToUserResponse(),
	})
}

// UpdateUserRole обновляет роль пользователя (только для администраторов)
func (a *AuthController) UpdateUserRole(c *fiber.Ctx) error {
	var input models.UpdateRoleDTO

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

	// Проверяем валидность роли
	if input.Role != models.RoleUser && input.Role != models.RoleAdmin {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Недопустимая роль",
		})
	}

	// Получаем ID пользователя из параметров
	userID, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Неверный ID пользователя",
			"error":   err.Error(),
		})
	}

	// Находим пользователя
	var user models.User
	if err := db.DB.First(&user, userID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "Пользователь не найден",
			"error":   err.Error(),
		})
	}

	// Обновляем роль
	user.Role = input.Role
	if err := db.DB.Save(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось обновить роль пользователя",
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  "success",
		"message": "Роль пользователя успешно обновлена",
		"data":    user.ToUserResponse(),
	})
}

// GetUsers возвращает список всех пользователей (только для администраторов)
func (a *AuthController) GetUsers(c *fiber.Ctx) error {
	// Параметры пагинации и поиска
	page := c.QueryInt("page", 1)
	limit := c.QueryInt("limit", 10)
	search := c.Query("search", "")

	// Валидация параметров
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	offset := (page - 1) * limit

	var users []models.User
	var totalCount int64
	query := db.DB.Model(&models.User{})

	// Если задан поисковый запрос, добавляем фильтрацию
	if search != "" {
		searchPattern := "%" + search + "%"
		query = query.Where(
			"email LIKE ? OR first_name LIKE ? OR last_name LIKE ?",
			searchPattern, searchPattern, searchPattern,
		)
	}

	// Получаем общее количество записей
	if err := query.Count(&totalCount).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось получить количество пользователей",
			"error":   err.Error(),
		})
	}

	// Получаем данные с пагинацией
	if err := query.Offset(offset).Limit(limit).Find(&users).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось получить список пользователей",
			"error":   err.Error(),
		})
	}

	// Преобразуем пользователей в безопасный формат без паролей
	userResponses := make([]models.UserResponse, len(users))
	for i, user := range users {
		userResponses[i] = user.ToUserResponse()
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": "success",
		"data":   userResponses,
		"meta": fiber.Map{
			"total":       totalCount,
			"page":        page,
			"limit":       limit,
			"total_pages": int(math.Ceil(float64(totalCount) / float64(limit))),
		},
	})
}

// RequestPasswordReset запрос на сброс пароля
func (a *AuthController) RequestPasswordReset(c *fiber.Ctx) error {
	var input models.RequestResetDTO

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

	// Ищем пользователя по email
	var user models.User
	result := db.DB.Where("email = ?", input.Email).First(&user)
	if result.RowsAffected == 0 {
		// Для безопасности не сообщаем, что пользователь не найден
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"status":  "success",
			"message": "Если адрес электронной почты зарегистрирован, инструкции по сбросу пароля были отправлены",
		})
	}

	// Генерируем токен
	token := utils.GenerateRandomToken(32)
	expiresAt := time.Now().Add(24 * time.Hour) // Токен действителен 24 часа

	// Создаем запись токена в БД
	resetToken := models.ResetToken{
		UserID:    user.ID,
		Token:     token,
		ExpiresAt: expiresAt,
		Used:      false,
	}

	if err := db.DB.Create(&resetToken).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось создать токен сброса пароля",
			"error":   err.Error(),
		})
	}

	// Отправляем email с токеном
	emailBody := utils.GeneratePasswordResetEmail(user.FirstName, token, a.Config)
	emailData := utils.EmailData{
		To:      user.Email,
		Subject: "Сброс пароля на Finance Hub",
		Body:    emailBody,
	}

	if err := utils.SendEmail(emailData, a.Config); err != nil {
		// Логируем ошибку, но не сообщаем пользователю для безопасности
		// В реальной системе здесь следует использовать систему логирования
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"status":  "success",
			"message": "Если адрес электронной почты зарегистрирован, инструкции по сбросу пароля были отправлены",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  "success",
		"message": "Инструкции по сбросу пароля отправлены на электронную почту",
	})
}

// VerifyResetToken проверяет валидность токена сброса пароля
func (a *AuthController) VerifyResetToken(c *fiber.Ctx) error {
	var input models.VerifyTokenDTO

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

	// Проверяем токен в БД
	var resetToken models.ResetToken
	result := db.DB.Where("token = ? AND used = ?", input.Token, false).First(&resetToken)
	if result.RowsAffected == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Недействительный или использованный токен",
		})
	}

	// Проверяем срок действия токена
	if time.Now().After(resetToken.ExpiresAt) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Срок действия токена истек",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  "success",
		"message": "Токен действителен",
	})
}

// ResetPassword сбрасывает пароль пользователя
func (a *AuthController) ResetPassword(c *fiber.Ctx) error {
	var input models.ResetPasswordDTO

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

	// Находим токен в БД
	var resetToken models.ResetToken
	result := db.DB.Where("token = ? AND used = ?", input.Token, false).First(&resetToken)
	if result.RowsAffected == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Недействительный или использованный токен",
		})
	}

	// Проверяем срок действия токена
	if time.Now().After(resetToken.ExpiresAt) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Срок действия токена истек",
		})
	}

	// Находим пользователя
	var user models.User
	if err := db.DB.First(&user, resetToken.UserID).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось найти пользователя",
			"error":   err.Error(),
		})
	}

	// Обновляем пароль
	user.Password = input.NewPassword
	if err := db.DB.Save(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось обновить пароль",
			"error":   err.Error(),
		})
	}

	// Помечаем токен как использованный
	resetToken.Used = true
	db.DB.Save(&resetToken)

	// Создаем уведомление о смене пароля
	notification := models.Notification{
		UserID:     user.ID,
		Type:       models.NotificationSecurity,
		Title:      "Пароль изменен",
		Message:    "Ваш пароль был успешно изменен. Если это были не вы, немедленно свяжитесь с поддержкой.",
		Importance: models.NotificationHigh,
		IsRead:     false,
	}

	db.DB.Create(&notification)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  "success",
		"message": "Пароль успешно сброшен",
	})
}

// RefreshToken обновляет JWT токен с помощью refresh токена
func (a *AuthController) RefreshToken(c *fiber.Ctx) error {
	// Получаем refresh токен из cookie
	refreshToken := c.Cookies("refresh_token")
	if refreshToken == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  "error",
			"message": "Refresh token не предоставлен",
		})
	}

	// Проверяем действительность токена
	rt, err := utils.ValidateRefreshToken(refreshToken)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"status":  "error",
			"message": "Недействительный refresh token",
			"error":   err.Error(),
		})
	}

	// Находим пользователя
	var user models.User
	if err := db.DB.First(&user, rt.UserID).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Пользователь не найден",
			"error":   err.Error(),
		})
	}

	// Помечаем старый refresh токен как использованный
	if err := utils.InvalidateRefreshToken(refreshToken); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось отозвать старый токен",
			"error":   err.Error(),
		})
	}

	// Генерируем новый access токен
	accessToken, err := utils.GenerateAccessToken(user.ID, user.Email, user.Role, a.Config)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось создать access токен",
			"error":   err.Error(),
		})
	}

	// Генерируем новый refresh токен
	newRefreshToken, expiresAt, err := utils.GenerateRefreshToken(user.ID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  "error",
			"message": "Не удалось создать refresh токен",
			"error":   err.Error(),
		})
	}

	// Устанавливаем access токен в httpOnly cookie
	c.Cookie(&fiber.Cookie{
		Name:     "access_token",
		Value:    accessToken,
		Path:     "/",
		MaxAge:   15 * 60, // 15 минут
		Secure:   a.Config.Env != "development",
		HTTPOnly: true,
		SameSite: "Strict",
	})

	// Устанавливаем refresh токен в httpOnly cookie
	c.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    newRefreshToken,
		Path:     "/",
		MaxAge:   int(time.Until(expiresAt).Seconds()),
		Secure:   a.Config.Env != "development",
		HTTPOnly: true,
		SameSite: "Strict",
	})

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  "success",
		"message": "Токены успешно обновлены",
	})
}

// Logout метод выхода из системы с очисткой куки
func (a *AuthController) Logout(c *fiber.Ctx) error {
	// Получаем refresh токен из cookie
	refreshToken := c.Cookies("refresh_token")

	// Если токен существует, отзываем его
	if refreshToken != "" {
		// Помечаем токен как использованный в БД (даже если токен не валиден, это не критично)
		utils.InvalidateRefreshToken(refreshToken)
	}

	// Удаляем access_token cookie
	c.Cookie(&fiber.Cookie{
		Name:     "access_token",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HTTPOnly: true,
		SameSite: "Strict",
	})

	// Удаляем refresh_token cookie
	c.Cookie(&fiber.Cookie{
		Name:     "refresh_token",
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HTTPOnly: true,
		SameSite: "Strict",
	})

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  "success",
		"message": "Выход выполнен успешно",
	})
}
