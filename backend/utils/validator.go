package utils

import (
	"github.com/go-playground/validator/v10"
)

// Validator инстанс валидатора
var Validator = validator.New()

// ValidationError структура для ошибок валидации
type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

// ValidateStruct проверяет структуру на соответствие правилам валидации
func ValidateStruct(data interface{}) []ValidationError {
	var errors []ValidationError

	err := Validator.Struct(data)
	if err != nil {
		for _, err := range err.(validator.ValidationErrors) {
			var element ValidationError
			element.Field = err.Field()
			element.Message = getErrorMsg(err)
			errors = append(errors, element)
		}
	}

	return errors
}

// getErrorMsg возвращает сообщение об ошибке для конкретного типа валидации
func getErrorMsg(err validator.FieldError) string {
	switch err.Tag() {
	case "required":
		return "Это поле обязательно для заполнения"
	case "email":
		return "Некорректный email"
	case "min":
		return "Длина должна быть не менее " + err.Param()
	case "gt":
		return "Значение должно быть больше " + err.Param()
	case "gtfield":
		return "Значение должно быть больше поля " + err.Param()
	case "oneof":
		return "Значение должно быть одним из: " + err.Param()
	}
	return "Некорректное значение"
}
