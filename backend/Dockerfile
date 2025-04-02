FROM golang:1.24-alpine AS builder

WORKDIR /app

# Копируем файлы зависимостей
COPY go.mod go.sum ./

# Загружаем зависимости
RUN go mod download

# Копируем исходный код
COPY . .

# Компилируем
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# Создаем финальный образ
FROM alpine:latest

# Необходимые зависимости
RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app

# Копируем скомпилированное приложение из предыдущего этапа
COPY --from=builder /app/main .

# Копируем .env файл
COPY .env .

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["./main"] 