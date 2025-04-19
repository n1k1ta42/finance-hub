package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

type telegramMessage struct {
	ChatID int64  `json:"chat_id"`
	Text   string `json:"text"`
}

func SendTelegramMessage(text string) error {
	token := os.Getenv("TELEGRAM_BOT_TOKEN")
	chatID := os.Getenv("TELEGRAM_CHAT_ID")
	if token == "" || chatID == "" {
		return nil // Не настроено — не отправляем
	}

	url := "https://api.telegram.org/bot" + token + "/sendMessage"
	msg := telegramMessage{
		ChatID: parseChatID(chatID),
		Text:   text,
	}
	body, _ := json.Marshal(msg)
	_, err := http.Post(url, "application/json", bytes.NewBuffer(body))
	return err
}

func parseChatID(s string) int64 {
	var id int64
	_, _ = fmt.Sscan(s, &id)
	return id
}
