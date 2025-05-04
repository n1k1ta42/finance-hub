package test

import "testing"

func TestBasic(t *testing.T) {
	// Проверяем, что тест проходит
	if false {
		t.Error("Этот тест должен пройти успешно")
	}
} 