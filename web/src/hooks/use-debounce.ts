import { useEffect, useState } from 'react'

/**
 * Хук для создания отложенного значения
 * @param value Исходное значение
 * @param delay Задержка в миллисекундах
 * @returns Отложенное значение
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Создаем таймер для обновления значения после задержки
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Очищаем таймер при изменении value или размонтировании компонента
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
