package utils

import (
	"fmt"
	"net/smtp"

	"github.com/nikitagorchakov/finance-hub/backend/config"
)

// EmailData содержит данные для отправки электронного письма
type EmailData struct {
	To      string
	Subject string
	Body    string
}

// SendEmail отправляет электронное письмо
func SendEmail(data EmailData, cfg *config.Config) error {
	// Адрес SMTP сервера
	smtpServer := fmt.Sprintf("%s:%s", cfg.SMTPHost, cfg.SMTPPort)

	// Аутентификация
	auth := smtp.PlainAuth("", cfg.SMTPUser, cfg.SMTPPassword, cfg.SMTPHost)

	// Содержимое письма
	mime := "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n\n"
	subject := fmt.Sprintf("Subject: %s\n", data.Subject)
	from := fmt.Sprintf("From: %s\n", cfg.SMTPFrom)
	to := fmt.Sprintf("To: %s\n", data.To)
	message := []byte(from + to + subject + mime + data.Body)

	// Отправка письма
	return smtp.SendMail(smtpServer, auth, cfg.SMTPFrom, []string{data.To}, message)
}

// GeneratePasswordResetEmail генерирует HTML-письмо с ссылкой на сброс пароля
func GeneratePasswordResetEmail(userName, resetToken string, cfg *config.Config) string {
	// Формируем ссылку на фронтенд сайта с токеном
	resetLink := fmt.Sprintf("%s/reset-password?token=%s", cfg.FrontendURL, resetToken)

	// Базовый шаблон HTML письма
	return fmt.Sprintf(`
	<!DOCTYPE html>
	<html>
	<head>
		<meta charset="UTF-8">
		<title>Сброс пароля</title>
		<style>
			body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
			.container { max-width: 600px; margin: 0 auto; padding: 20px; }
			.header { background-color: #7f22fe; color: #ffffff; padding: 10px; text-align: center; }
			.content { border: 1px solid #ddd; padding: 20px; }
			.button { background-color: #7f22fe; color: #ffffff; padding: 10px 20px; text-decoration: none; display: inline-block; margin: 20px 0; }
			.footer { font-size: 12px; color: #666; margin-top: 20px; }
		</style>
	</head>
	<body>
		<div class="container">
			<div class="header">
				<h1>Finance Hub</h1>
			</div>
			<div class="content">
				<h2>Сброс пароля</h2>
				<p>Здравствуйте, %s!</p>
				<p>Мы получили запрос на сброс пароля для вашей учетной записи. Для создания нового пароля перейдите по ссылке ниже:</p>
				<p><a href="%s" class="button">Сбросить пароль</a></p>
				<p>Если вы не запрашивали сброс пароля, игнорируйте это письмо, и никаких изменений в вашей учетной записи не будет.</p>
				<p>Ссылка действительна в течение 24 часов.</p>
			</div>
			<div class="footer">
				<p>Это автоматическое сообщение, пожалуйста, не отвечайте на него.</p>
				<p>&copy; Finance Hub. Все права защищены.</p>
			</div>
		</div>
	</body>
	</html>
	`, userName, resetLink)
}
