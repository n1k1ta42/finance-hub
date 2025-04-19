package utils

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"os"
)

// getEncryptionKey возвращает ключ для шифрования из переменных окружения
func getEncryptionKey() ([]byte, error) {
	keyB64 := os.Getenv("ENCRYPTION_KEY")
	key, err := base64.StdEncoding.DecodeString(keyB64)
	if err != nil {
		return nil, errors.New("failed to decode ENCRYPTION_KEY from base64")
	}
	if len(key) != 32 {
		return nil, errors.New("encryption key must be 32 bytes (256 bit)")
	}
	return key, nil
}

// EncryptString шифрует строку с помощью AES-GCM
func EncryptString(plainText string) (string, error) {
	key, err := getEncryptionKey()
	if err != nil {
		return "", err
	}
	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}
	nonce := make([]byte, gcm.NonceSize())
	if _, err := rand.Read(nonce); err != nil {
		return "", err
	}
	cipherText := gcm.Seal(nonce, nonce, []byte(plainText), nil)
	return base64.StdEncoding.EncodeToString(cipherText), nil
}

// DecryptString дешифрует строку, зашифрованную EncryptString
func DecryptString(cipherText string) (string, error) {
	key, err := getEncryptionKey()
	if err != nil {
		return "", err
	}
	data, err := base64.StdEncoding.DecodeString(cipherText)
	if err != nil {
		return "", err
	}
	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}
	if len(data) < gcm.NonceSize() {
		return "", errors.New("invalid ciphertext")
	}
	nonce := data[:gcm.NonceSize()]
	cipherData := data[gcm.NonceSize():]
	plainText, err := gcm.Open(nil, nonce, cipherData, nil)
	if err != nil {
		return "", err
	}
	return string(plainText), nil
}
