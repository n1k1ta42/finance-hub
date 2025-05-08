package telegram

import (
	"fmt"

	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
	"github.com/nikitagorchakov/finance-hub/backend/db"
	"github.com/nikitagorchakov/finance-hub/backend/models"
)

// handleStart обрабатывает команду /start
func handleStart(bot *Bot, message *tgbotapi.Message, state *UserState) error {
	chatID := message.Chat.ID
	
	// Проверяем, привязан ли пользователь к чату
	user, err := bot.findUserByTelegramChatID(chatID)
	if err != nil {
		return bot.sendWelcomeWithoutUser(chatID)
	}
	
	// Обновляем состояние с найденным пользователем
	state.UserID = user.ID
	
	welcomeText := fmt.Sprintf(
		"Привет, %s! Добро пожаловать в бот Finance Hub.\n\n"+
		"Этот бот позволяет добавлять транзакции в ваш аккаунт.\n\n"+
		"Используйте кнопки ниже или следующие команды:\n"+
		"/add - создать новую транзакцию\n"+
		"/categories - просмотр доступных категорий\n"+
		"/help - получить справку",
		user.FirstName,
	)
	
	// Создаем клавиатуру с кнопками
	keyboard := tgbotapi.NewReplyKeyboard(
		tgbotapi.NewKeyboardButtonRow(
			tgbotapi.NewKeyboardButton("💰 Добавить транзакцию"),
			tgbotapi.NewKeyboardButton("📋 Категории"),
		),
		tgbotapi.NewKeyboardButtonRow(
			tgbotapi.NewKeyboardButton("❓ Помощь"),
		),
	)
	
	msg := tgbotapi.NewMessage(chatID, welcomeText)
	msg.ReplyMarkup = keyboard
	
	_, err = bot.api.Send(msg)
	if err != nil {
		return fmt.Errorf("ошибка отправки приветствия: %w", err)
	}
	
	return nil
}

// sendWelcomeWithoutUser отправляет приветствие непривязанному пользователю
func (b *Bot) sendWelcomeWithoutUser(chatID int64) error {
	welcomeText := "Привет! Я бот Finance Hub для учета финансов.\n\n" +
		"Для начала работы необходимо связать ваш аккаунт с этим чатом.\n\n" +
		"Пожалуйста, откройте приложение и добавьте следующий ID в настройках профиля:\n\n" +
		fmt.Sprintf("<code>%d</code>\n\n", chatID) +
		"После этого вернитесь сюда и отправьте команду /start для активации бота."
	
	msg := tgbotapi.NewMessage(chatID, welcomeText)
	msg.ParseMode = "HTML"
	_, err := b.api.Send(msg)
	if err != nil {
		return fmt.Errorf("ошибка отправки приветствия: %w", err)
	}
	
	return nil
}

// handleHelp обрабатывает команду /help
func handleHelp(bot *Bot, message *tgbotapi.Message, state *UserState) error {
	helpText := "Доступные команды бота Finance Hub:\n\n" +
		"/start - начать работу с ботом\n" +
		"/add - добавить новую транзакцию\n" +
		"/categories - показать доступные категории\n" +
		"/help - показать эту справку\n\n" +
		"Также вы можете использовать кнопки внизу экрана для навигации и создания транзакций."
	
	// Создаем клавиатуру с кнопками (аналогично /start)
	keyboard := tgbotapi.NewReplyKeyboard(
		tgbotapi.NewKeyboardButtonRow(
			tgbotapi.NewKeyboardButton("💰 Добавить транзакцию"),
			tgbotapi.NewKeyboardButton("📋 Категории"),
		),
		tgbotapi.NewKeyboardButtonRow(
			tgbotapi.NewKeyboardButton("❓ Помощь"),
		),
	)
	
	msg := tgbotapi.NewMessage(message.Chat.ID, helpText)
	msg.ReplyMarkup = keyboard
	
	_, err := bot.api.Send(msg)
	if err != nil {
		return fmt.Errorf("ошибка отправки справки: %w", err)
	}
	
	return nil
}

// handleAdd обрабатывает команду /add
func handleAdd(bot *Bot, message *tgbotapi.Message, state *UserState) error {
	chatID := message.Chat.ID
	
	// Проверяем, привязан ли пользователь к чату
	user, err := bot.findUserByTelegramChatID(chatID)
	if err != nil {
		bot.sendMessage(chatID, "Для начала работы необходимо связать ваш аккаунт с этим чатом. Используйте /start для получения инструкций.")
		return nil
	}
	
	// Обновляем состояние с найденным пользователем
	state.UserID = user.ID
	state.Stage = StageWaitAmount
	
	bot.sendMessage(chatID, "Введите сумму транзакции (положительное число):")
	return nil
}

// handleCategories обрабатывает команду /categories
func handleCategories(bot *Bot, message *tgbotapi.Message, state *UserState) error {
	chatID := message.Chat.ID
	
	// Проверяем, привязан ли пользователь к чату
	user, err := bot.findUserByTelegramChatID(chatID)
	if err != nil {
		bot.sendMessage(chatID, "Для начала работы необходимо связать ваш аккаунт с этим чатом. Используйте /start для получения инструкций.")
		return nil
	}
	
	// Загружаем категории пользователя
	var categories []models.Category
	if err := db.DB.Where("user_id = ?", user.ID).Find(&categories).Error; err != nil {
		return fmt.Errorf("ошибка при загрузке категорий: %w", err)
	}
	
	if len(categories) == 0 {
		bot.sendMessage(chatID, "У вас нет созданных категорий. Пожалуйста, создайте категории в приложении.")
		return nil
	}
	
	// Формируем сообщение с категориями
	expenseText := "📥 РАСХОДЫ:\n"
	incomeText := "📤 ДОХОДЫ:\n"
	
	hasExpenses := false
	hasIncome := false
	
	for _, cat := range categories {
		if cat.Type == models.Expense {
			expenseText += fmt.Sprintf("• %s\n", cat.Name)
			hasExpenses = true
		} else {
			incomeText += fmt.Sprintf("• %s\n", cat.Name)
			hasIncome = true
		}
	}
	
	var resultText string
	
	if hasExpenses {
		resultText += expenseText + "\n"
	}
	
	if hasIncome {
		resultText += incomeText + "\n"
	}
	
	resultText += "Для добавления транзакции используйте команду /add или кнопку 'Добавить транзакцию'"
	
	bot.sendMessage(chatID, resultText)
	return nil
} 