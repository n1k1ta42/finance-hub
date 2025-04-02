import { format, formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'

// Форматы для дат
export const DATE_FORMATS = {
  DISPLAY: 'dd.MM.yyyy',
  API: 'yyyy-MM-dd',
  FULL_MONTH: 'd MMMM yyyy',
  DATE_RANGE: 'dd.MM.yyyy',
}

// Форматирование даты для отображения (dd.MM.yyyy)
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, DATE_FORMATS.DISPLAY)
}

// Форматирование даты для API (yyyy-MM-dd)
export const formatDateForApi = (date: Date): string => {
  return format(date, DATE_FORMATS.API)
}

// Форматирование даты с месяцем прописью
export const formatFullDate = (date: Date): string => {
  return format(date, DATE_FORMATS.FULL_MONTH, { locale: ru })
}

// Форматирование диапазона дат
export const formatDateRange = (from: Date, to: Date): string => {
  return `${formatDate(from)} - ${formatDate(to)}`
}

// Форматирование относительного времени (например, "5 минут назад")
export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: ru })
}
