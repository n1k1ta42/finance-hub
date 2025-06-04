package telegram

import (
	"fmt"
	"log"
	"sync"
)

// Service представляет сервис для работы с Telegram ботом
type Service struct {
	bot    *Bot
	config *BotConfig
}

var (
	service *Service
	once    sync.Once
)

// NewService создает новый сервис для работы с Telegram ботом
func NewService() (*Service, error) {
	var initErr error
	
	once.Do(func() {
		// Загружаем конфигурацию
		config, err := LoadBotConfig()
		if err != nil {
			initErr = err
			return
		}
		
		// Создаем бота
		bot, err := NewBot(config)
		if err != nil {
			initErr = err
			return
		}
		
		service = &Service{
			bot:    bot,
			config: config,
		}
	})
	
	if initErr != nil {
		return nil, initErr
	}
	
	return service, nil
}

// Start запускает сервис бота в отдельной горутине
func (s *Service) Start() {
	go func() {
		if err := s.bot.Start(); err != nil {
			log.Printf("Ошибка запуска клиентского бота: %v", err)
		}
	}()
	
	log.Println("Клиентский Telegram бот запущен")
}

// GetInstance возвращает экземпляр сервиса бота
func GetInstance() (*Service, error) {
	return NewService()
}

// SendNotification отправляет уведомление пользователю через клиентский бот
func (s *Service) SendNotification(userChatID string, message string) error {
	if s.bot == nil {
		return fmt.Errorf("бот не инициализирован")
	}
	return s.bot.SendNotificationMessage(userChatID, message)
} 