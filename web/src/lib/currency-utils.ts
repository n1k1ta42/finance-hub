// Форматирование суммы в рубли
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
  }).format(amount)
}

// Форматирование суммы с указанной валютой
export const formatAmount = (
  amount: number,
  currency: string = 'RUB',
): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount)
}

// Форматирование суммы без символа валюты
export const formatNumber = (number: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 0,
  }).format(number)
}

// Парсинг строки с валютой в число
export const parseCurrency = (value: string): number => {
  return Number(value.replace(/[^0-9.-]+/g, ''))
}
