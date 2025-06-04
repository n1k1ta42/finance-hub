package telegram

import (
	"fmt"
	"log"
	"strconv"
	"strings"
	"time"

	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
	"github.com/nikitagorchakov/finance-hub/backend/db"
	"github.com/nikitagorchakov/finance-hub/backend/models"
)

// Bot представляет Telegram-бота для создания транзакций
type Bot struct {
	api            *tgbotapi.BotAPI
	config         *BotConfig
	userStates     map[int64]*UserState
	commandHandler map[string]CommandHandler
}

// UserState хранит текущее состояние пользователя в диалоге
type UserState struct {
	Stage       DialogStage
	UserID      uint
	Amount      float64
	Description string
	CategoryID  uint
	Categories  []models.Category
}

// DialogStage представляет этап диалога с пользователем
type DialogStage int

const (
	StageNone DialogStage = iota
	StageWaitAmount
	StageWaitCategory
	StageWaitDescription
	StageConfirm
)

// CommandHandler представляет обработчик команды
type CommandHandler func(bot *Bot, message *tgbotapi.Message, state *UserState) error

// NewBot создает новый экземпляр бота
func NewBot(config *BotConfig) (*Bot, error) {
	bot, err := tgbotapi.NewBotAPI(config.Token)
	if err != nil {
		return nil, fmt.Errorf("ошибка создания бота: %w", err)
	}

	bot.Debug = config.Debug
	log.Printf("Авторизован как %s", bot.Self.UserName)

	b := &Bot{
		api:        bot,
		config:     config,
		userStates: make(map[int64]*UserState),
	}

	// Регистрируем обработчики команд
	b.commandHandler = map[string]CommandHandler{
		"start":      handleStart,
		"help":       handleHelp,
		"add":        handleAdd,
		"categories": handleCategories,
	}

	return b, nil
}

// Start запускает бота для прослушивания сообщений
func (b *Bot) Start() error {
	u := tgbotapi.NewUpdate(0)
	u.Timeout = 60

	updates := b.api.GetUpdatesChan(u)

	for update := range updates {
		if update.Message != nil {
			b.handleMessage(update.Message)
		} else if update.CallbackQuery != nil {
			b.handleCallback(update.CallbackQuery)
		}
	}

	return nil
}

// handleMessage обрабатывает входящие сообщения
func (b *Bot) handleMessage(message *tgbotapi.Message) {
	userID := message.From.ID
	log.Printf("[%s] %s", message.From.UserName, message.Text)

	// Получаем или создаем состояние для пользователя
	state, exists := b.userStates[userID]
	if !exists {
		state = &UserState{
			Stage: StageNone,
		}
		b.userStates[userID] = state
	}

	// Если сообщение начинается с /, обрабатываем как команду
	if message.IsCommand() {
		command := message.Command()
		handler, ok := b.commandHandler[command]
		
		if !ok {
			b.sendMessage(message.Chat.ID, "Неизвестная команда. Введите /help для получения списка команд.")
			return
		}
		
		err := handler(b, message, state)
		if err != nil {
			log.Printf("Ошибка обработки команды %s: %v", command, err)
			b.sendMessage(message.Chat.ID, fmt.Sprintf("Произошла ошибка: %v", err))
		}
		return
	}

	// Обрабатываем кнопки клавиатуры
	if message.Text == "💰 Добавить транзакцию" {
		err := handleAdd(b, message, state)
		if err != nil {
			log.Printf("Ошибка обработки кнопки Добавить транзакцию: %v", err)
			b.sendMessage(message.Chat.ID, fmt.Sprintf("Произошла ошибка: %v", err))
		}
		return
	} else if message.Text == "📋 Категории" {
		err := handleCategories(b, message, state)
		if err != nil {
			log.Printf("Ошибка обработки кнопки Категории: %v", err)
			b.sendMessage(message.Chat.ID, fmt.Sprintf("Произошла ошибка: %v", err))
		}
		return
	} else if message.Text == "❓ Помощь" {
		err := handleHelp(b, message, state)
		if err != nil {
			log.Printf("Ошибка обработки кнопки Помощь: %v", err)
			b.sendMessage(message.Chat.ID, fmt.Sprintf("Произошла ошибка: %v", err))
		}
		return
	} else if message.Text == "❌ Отмена" {
		// Обрабатываем кнопку отмены
		state.Stage = StageNone
		b.sendMessage(message.Chat.ID, "Действие отменено. Используйте кнопки или команды для продолжения.")
		return
	}

	// Обрабатываем сообщение в зависимости от текущего состояния диалога
	switch state.Stage {
	case StageWaitAmount:
		b.handleAmountInput(message, state)
	case StageWaitCategory:
		// Категории выбираются через инлайн-кнопки, но можно также обработать текстовый ввод
		b.sendMessage(message.Chat.ID, "Пожалуйста, выберите категорию из списка ниже:")
		b.sendCategoriesKeyboard(message.Chat.ID, state)
	case StageWaitDescription:
		b.handleDescriptionInput(message, state)
	case StageConfirm:
		b.handleConfirmation(message, state)
	default:
		// Добавляем вывод клавиатуры для неизвестных команд
		keyboard := tgbotapi.NewReplyKeyboard(
			tgbotapi.NewKeyboardButtonRow(
				tgbotapi.NewKeyboardButton("💰 Добавить транзакцию"),
				tgbotapi.NewKeyboardButton("📋 Категории"),
			),
			tgbotapi.NewKeyboardButtonRow(
				tgbotapi.NewKeyboardButton("❓ Помощь"),
			),
		)
		
		msg := tgbotapi.NewMessage(message.Chat.ID, "Выберите действие с помощью кнопок или введите команду /help для получения справки.")
		msg.ReplyMarkup = keyboard
		
		_, err := b.api.Send(msg)
		if err != nil {
			log.Printf("Ошибка отправки клавиатуры: %v", err)
		}
	}
}

// handleCallback обрабатывает колбэки от инлайн-кнопок
func (b *Bot) handleCallback(callback *tgbotapi.CallbackQuery) {
	userID := callback.From.ID
	state, exists := b.userStates[userID]
	
	if !exists {
		b.sendMessage(callback.Message.Chat.ID, "Ошибка: сессия не найдена. Начните заново с команды /add")
		return
	}

	// Разбираем данные колбэка
	parts := strings.Split(callback.Data, ":")
	action := parts[0]

	// Обрабатываем отмену операции
	if action == "cancel" {
		b.handleCancellation(callback.Message.Chat.ID, state)
		
		// Отвечаем на колбэк
		callbackResponse := tgbotapi.NewCallback(callback.ID, "")
		b.api.Request(callbackResponse)
		return
	}
	
	if len(parts) != 2 {
		b.sendMessage(callback.Message.Chat.ID, "Ошибка: неверный формат данных.")
		return
	}

	switch action {
	case "cat":
		// Выбрана категория
		categoryID, err := strconv.ParseUint(parts[1], 10, 32)
		if err != nil {
			b.sendMessage(callback.Message.Chat.ID, "Ошибка: неверный ID категории.")
			return
		}

		// Находим выбранную категорию
		var selectedCategory models.Category
		for _, cat := range state.Categories {
			if cat.ID == uint(categoryID) {
				selectedCategory = cat
				break
			}
		}

		state.CategoryID = uint(categoryID)
		state.Stage = StageWaitDescription

		// Отвечаем на колбэк
		callbackResponse := tgbotapi.NewCallback(callback.ID, "")
		b.api.Request(callbackResponse)

		// Создаем клавиатуру с кнопкой отмены
		keyboard := tgbotapi.NewReplyKeyboard(
			tgbotapi.NewKeyboardButtonRow(
				tgbotapi.NewKeyboardButton("❌ Отмена"),
			),
		)
		
		// Отправляем сообщение с подтверждением выбора категории
		msg := tgbotapi.NewMessage(callback.Message.Chat.ID, 
			fmt.Sprintf("Выбрана категория: %s\nВведите описание транзакции или отправьте '-' для пропуска:", selectedCategory.Name))
		msg.ReplyMarkup = keyboard
		
		_, err = b.api.Send(msg)
		if err != nil {
			log.Printf("Ошибка отправки сообщения: %v", err)
		}

	case "confirm":
		// Подтверждение создания транзакции
		result := parts[1]
		if result == "yes" {
			err := b.createTransaction(callback.Message.Chat.ID, state)
			if err != nil {
				b.sendMessage(callback.Message.Chat.ID, fmt.Sprintf("Ошибка при создании транзакции: %v", err))
			} else {
				// Восстанавливаем обычную клавиатуру
				keyboard := tgbotapi.NewReplyKeyboard(
					tgbotapi.NewKeyboardButtonRow(
						tgbotapi.NewKeyboardButton("💰 Добавить транзакцию"),
						tgbotapi.NewKeyboardButton("📋 Категории"),
					),
					tgbotapi.NewKeyboardButtonRow(
						tgbotapi.NewKeyboardButton("❓ Помощь"),
					),
				)
				
				msg := tgbotapi.NewMessage(callback.Message.Chat.ID, "Транзакция успешно создана!")
				msg.ReplyMarkup = keyboard
				
				_, err = b.api.Send(msg)
				if err != nil {
					log.Printf("Ошибка отправки сообщения: %v", err)
				}
				
				// Сбрасываем состояние
				state.Stage = StageNone
			}
		} else {
			b.handleCancellation(callback.Message.Chat.ID, state)
		}

		// Отвечаем на колбэк
		callbackResponse := tgbotapi.NewCallback(callback.ID, "")
		b.api.Request(callbackResponse)
	}
}

// handleAmountInput обрабатывает ввод суммы
func (b *Bot) handleAmountInput(message *tgbotapi.Message, state *UserState) {
	amount, err := strconv.ParseFloat(message.Text, 64)
	if err != nil || amount <= 0 {
		// Создаем клавиатуру с кнопкой отмены
		keyboard := tgbotapi.NewReplyKeyboard(
			tgbotapi.NewKeyboardButtonRow(
				tgbotapi.NewKeyboardButton("❌ Отмена"),
			),
		)
		
		msg := tgbotapi.NewMessage(message.Chat.ID, "Пожалуйста, введите положительное число как сумму транзакции.")
		msg.ReplyMarkup = keyboard
		
		_, err := b.api.Send(msg)
		if err != nil {
			log.Printf("Ошибка отправки сообщения: %v", err)
		}
		return
	}

	state.Amount = amount
	state.Stage = StageWaitCategory

	// Загружаем категории пользователя
	var categories []models.Category
	if err := db.DB.Where("user_id = ?", state.UserID).Find(&categories).Error; err != nil {
		b.sendMessage(message.Chat.ID, fmt.Sprintf("Ошибка при загрузке категорий: %v", err))
		state.Stage = StageNone
		return
	}

	if len(categories) == 0 {
		// Восстанавливаем обычную клавиатуру
		keyboard := tgbotapi.NewReplyKeyboard(
			tgbotapi.NewKeyboardButtonRow(
				tgbotapi.NewKeyboardButton("💰 Добавить транзакцию"),
				tgbotapi.NewKeyboardButton("📋 Категории"),
			),
			tgbotapi.NewKeyboardButtonRow(
				tgbotapi.NewKeyboardButton("❓ Помощь"),
			),
		)
		
		msg := tgbotapi.NewMessage(message.Chat.ID, "У вас нет созданных категорий. Пожалуйста, создайте категории в приложении.")
		msg.ReplyMarkup = keyboard
		
		_, err := b.api.Send(msg)
		if err != nil {
			log.Printf("Ошибка отправки сообщения: %v", err)
		}
		
		state.Stage = StageNone
		return
	}

	state.Categories = categories
	b.sendMessage(message.Chat.ID, fmt.Sprintf("Введена сумма: %.2f\nВыберите категорию:", amount))
	b.sendCategoriesKeyboard(message.Chat.ID, state)
}

// handleDescriptionInput обрабатывает ввод описания
func (b *Bot) handleDescriptionInput(message *tgbotapi.Message, state *UserState) {
	description := message.Text
	if description == "-" {
		description = ""
	}

	state.Description = description
	state.Stage = StageConfirm

	// Находим выбранную категорию
	var categoryName string
	for _, cat := range state.Categories {
		if cat.ID == state.CategoryID {
			categoryName = cat.Name
			break
		}
	}

	// Отправляем сообщение для подтверждения
	confirmMessage := fmt.Sprintf(
		"Подтвердите создание транзакции:\n\nСумма: %.2f\nКатегория: %s\nОписание: %s\n\nСоздать транзакцию?",
		state.Amount, categoryName, state.Description,
	)

	b.sendConfirmKeyboard(message.Chat.ID, confirmMessage)
}

// handleConfirmation обрабатывает подтверждение транзакции (для текстового ввода)
func (b *Bot) handleConfirmation(message *tgbotapi.Message, state *UserState) {
	text := strings.ToLower(message.Text)
	if text == "да" || text == "yes" || text == "y" {
		err := b.createTransaction(message.Chat.ID, state)
		if err != nil {
			b.sendMessage(message.Chat.ID, fmt.Sprintf("Ошибка при создании транзакции: %v", err))
		} else {
			b.sendMessage(message.Chat.ID, "Транзакция успешно создана!")
		}
	} else {
		b.sendMessage(message.Chat.ID, "Создание транзакции отменено.")
	}

	// Сбрасываем состояние
	state.Stage = StageNone
}

// sendCategoriesKeyboard отправляет клавиатуру с категориями
func (b *Bot) sendCategoriesKeyboard(chatID int64, state *UserState) {
	var keyboard [][]tgbotapi.InlineKeyboardButton
	
	// Группируем по типу (расходы и доходы)
	var expenseCategories []models.Category
	var incomeCategories []models.Category
	
	for _, cat := range state.Categories {
		if cat.Type == models.Expense {
			expenseCategories = append(expenseCategories, cat)
		} else {
			incomeCategories = append(incomeCategories, cat)
		}
	}
	
	// Добавляем заголовок для расходов, если есть
	if len(expenseCategories) > 0 {
		keyboard = append(keyboard, []tgbotapi.InlineKeyboardButton{
			tgbotapi.NewInlineKeyboardButtonData("📥 РАСХОДЫ", "header:expense"),
		})
		
		// Добавляем кнопки для расходных категорий по 2 в ряд
		for i := 0; i < len(expenseCategories); i += 2 {
			var row []tgbotapi.InlineKeyboardButton
			row = append(row, tgbotapi.NewInlineKeyboardButtonData(
				expenseCategories[i].Name, 
				fmt.Sprintf("cat:%d", expenseCategories[i].ID),
			))
			
			if i+1 < len(expenseCategories) {
				row = append(row, tgbotapi.NewInlineKeyboardButtonData(
					expenseCategories[i+1].Name, 
					fmt.Sprintf("cat:%d", expenseCategories[i+1].ID),
				))
			}
			
			keyboard = append(keyboard, row)
		}
	}
	
	// Добавляем заголовок для доходов, если есть
	if len(incomeCategories) > 0 {
		keyboard = append(keyboard, []tgbotapi.InlineKeyboardButton{
			tgbotapi.NewInlineKeyboardButtonData("📤 ДОХОДЫ", "header:income"),
		})
		
		// Добавляем кнопки для категорий доходов по 2 в ряд
		for i := 0; i < len(incomeCategories); i += 2 {
			var row []tgbotapi.InlineKeyboardButton
			row = append(row, tgbotapi.NewInlineKeyboardButtonData(
				incomeCategories[i].Name, 
				fmt.Sprintf("cat:%d", incomeCategories[i].ID),
			))
			
			if i+1 < len(incomeCategories) {
				row = append(row, tgbotapi.NewInlineKeyboardButtonData(
					incomeCategories[i+1].Name, 
					fmt.Sprintf("cat:%d", incomeCategories[i+1].ID),
				))
			}
			
			keyboard = append(keyboard, row)
		}
	}
	
	// Добавляем кнопку отмены
	keyboard = append(keyboard, []tgbotapi.InlineKeyboardButton{
		tgbotapi.NewInlineKeyboardButtonData("❌ Отмена", "cancel"),
	})
	
	// Создаем сообщение с клавиатурой
	msg := tgbotapi.NewMessage(chatID, "Выберите категорию:")
	msg.ReplyMarkup = tgbotapi.NewInlineKeyboardMarkup(keyboard...)
	
	_, err := b.api.Send(msg)
	if err != nil {
		log.Printf("Ошибка отправки клавиатуры категорий: %v", err)
	}
}

// sendConfirmKeyboard отправляет клавиатуру для подтверждения
func (b *Bot) sendConfirmKeyboard(chatID int64, text string) {
	keyboard := [][]tgbotapi.InlineKeyboardButton{
		{
			tgbotapi.NewInlineKeyboardButtonData("✅ Подтвердить", "confirm:yes"),
		},
		{
			tgbotapi.NewInlineKeyboardButtonData("❌ Отменить", "confirm:no"),
		},
	}
	
	msg := tgbotapi.NewMessage(chatID, text)
	msg.ReplyMarkup = tgbotapi.NewInlineKeyboardMarkup(keyboard...)
	
	_, err := b.api.Send(msg)
	if err != nil {
		log.Printf("Ошибка отправки клавиатуры подтверждения: %v", err)
	}
}

// createTransaction создает новую транзакцию
func (b *Bot) createTransaction(chatID int64, state *UserState) error {
	// Устанавливаем время на 12:00 текущего дня
	now := time.Now()
	date := time.Date(now.Year(), now.Month(), now.Day(), 12, 0, 0, 0, time.UTC)

	transaction := models.Transaction{
		Amount:      state.Amount,
		Description: state.Description,
		Date:        date,
		CategoryID:  state.CategoryID,
		UserID:      state.UserID,
	}

	if err := db.DB.Create(&transaction).Error; err != nil {
		return fmt.Errorf("ошибка создания транзакции: %w", err)
	}

	return nil
}

// findUserByTelegramChatID ищет пользователя по ID чата в Telegram
func (b *Bot) findUserByTelegramChatID(chatID int64) (*models.User, error) {
	var user models.User
	
	if err := db.DB.Where("telegram_chat_id = ?", strconv.FormatInt(chatID, 10)).First(&user).Error; err != nil {
		return nil, fmt.Errorf("пользователь не найден: %w", err)
	}
	
	return &user, nil
}

// sendMessage отправляет сообщение в чат
func (b *Bot) sendMessage(chatID int64, text string) {
	msg := tgbotapi.NewMessage(chatID, text)
	_, err := b.api.Send(msg)
	if err != nil {
		log.Printf("Ошибка отправки сообщения: %v", err)
	}
}

// handleCancellation обрабатывает отмену операции
func (b *Bot) handleCancellation(chatID int64, state *UserState) {
	// Восстанавливаем обычную клавиатуру
	keyboard := tgbotapi.NewReplyKeyboard(
		tgbotapi.NewKeyboardButtonRow(
			tgbotapi.NewKeyboardButton("💰 Добавить транзакцию"),
			tgbotapi.NewKeyboardButton("📋 Категории"),
		),
		tgbotapi.NewKeyboardButtonRow(
			tgbotapi.NewKeyboardButton("❓ Помощь"),
		),
	)
	
	msg := tgbotapi.NewMessage(chatID, "Действие отменено. Выберите другую операцию.")
	msg.ReplyMarkup = keyboard
	
	_, err := b.api.Send(msg)
	if err != nil {
		log.Printf("Ошибка отправки сообщения: %v", err)
	}
	
	// Сбрасываем состояние
	state.Stage = StageNone
}

// SendNotificationMessage отправляет уведомление пользователю по chat ID
func (b *Bot) SendNotificationMessage(userChatID string, text string) error {
	if userChatID == "" {
		return nil // Если chat ID не задан, не отправляем
	}

	chatID, err := strconv.ParseInt(userChatID, 10, 64)
	if err != nil {
		return fmt.Errorf("неверный chat ID: %w", err)
	}

	msg := tgbotapi.NewMessage(chatID, text)
	_, err = b.api.Send(msg)
	if err != nil {
		return fmt.Errorf("ошибка отправки уведомления: %w", err)
	}

	return nil
} 