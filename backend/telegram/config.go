package telegram

import (
	"errors"
	"log"
	"os"
)

// BotConfig содержит настройки для Telegram-бота
type BotConfig struct {
	Token           string
	Debug           bool
	AllowedCommands []string
}

// DefaultCommands возвращает список команд, которые поддерживает бот
func DefaultCommands() []string {
	return []string{
		"start",
		"help",
		"add",
		"categories",
	}
}

// LoadBotConfig загружает конфигурацию из переменных окружения
func LoadBotConfig() (*BotConfig, error) {
	token := os.Getenv("TELEGRAM_CLIENT_BOT_TOKEN")
	if token == "" {
		return nil, errors.New("TELEGRAM_CLIENT_BOT_TOKEN не задан в переменных окружения")
	}

	debug := os.Getenv("TELEGRAM_CLIENT_BOT_DEBUG") == "true"

	config := &BotConfig{
		Token:           token,
		Debug:           debug,
		AllowedCommands: DefaultCommands(),
	}

	log.Printf("Telegram client bot config loaded, debug mode: %v", debug)
	return config, nil
} 