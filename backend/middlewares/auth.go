package middlewares

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"github.com/nikitagorchakov/finance-hub/backend/config"
	"github.com/nikitagorchakov/finance-hub/backend/models"
)

// Protected устанавливает JWT middleware для защищенных маршрутов
func Protected(config *config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Пробуем получить токен из куки
		tokenString := c.Cookies("access_token")
		
		// Если токена нет в куки, проверяем заголовок Authorization
		if tokenString == "" {
			authHeader := c.Get("Authorization")
			if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
				tokenString = strings.TrimPrefix(authHeader, "Bearer ")
			}
		}
		
		// Если токена нет, возвращаем ошибку
		if tokenString == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"status":  "error",
				"message": "Unauthorized",
				"error":   "Missing or invalid JWT token",
			})
		}
		
		// Парсим и проверяем JWT токен
		claims := &jwt.MapClaims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return []byte(config.JWTSecret), nil
		})
		
		if err != nil || !token.Valid {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"status":  "error",
				"message": "Unauthorized",
				"error":   "Invalid or expired token",
			})
		}
		
		// Сохраняем токен в контексте запроса
		c.Locals("user", token)
		
		return c.Next()
	}
}

// jwtError обрабатывает ошибки JWT
func jwtError(c *fiber.Ctx, err error) error {
	return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
		"status":  "error",
		"message": "Unauthorized",
		"error":   err.Error(),
	})
}

// GetUserID получает ID пользователя из JWT токена
func GetUserID(c *fiber.Ctx) uint {
	user := c.Locals("user").(*jwt.Token)
	claims := user.Claims.(*jwt.MapClaims)
	userID := uint((*claims)["user_id"].(float64))
	return userID
}

// GetUserEmail получает email пользователя из JWT токена
func GetUserEmail(c *fiber.Ctx) string {
	user := c.Locals("user").(*jwt.Token)
	claims := user.Claims.(*jwt.MapClaims)
	return (*claims)["email"].(string)
}

// RequireAdmin проверяет, что пользователь имеет роль администратора
func RequireAdmin(c *fiber.Ctx) error {
	user := c.Locals("user").(*jwt.Token)
	claims := user.Claims.(*jwt.MapClaims)
	
	userRole, ok := (*claims)["role"].(string)
	if !ok || userRole != string(models.RoleAdmin) {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"status":  "error",
			"message": "Access denied",
			"error":   "Admin privileges required",
		})
	}
	
	return c.Next()
}

// GetUserRole получает роль пользователя из JWT токена
func GetUserRole(c *fiber.Ctx) models.UserRole {
	user := c.Locals("user").(*jwt.Token)
	claims := user.Claims.(*jwt.MapClaims)
	userRole := (*claims)["role"].(string)
	return models.UserRole(userRole)
}

// HasRole проверяет, имеет ли пользователь указанную роль
func HasRole(requiredRole models.UserRole) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userRole := GetUserRole(c)
		
		if userRole != requiredRole {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"status":  "error",
				"message": "Access denied",
				"error":   "Required role: " + string(requiredRole),
			})
		}
		
		return c.Next()
	}
}
