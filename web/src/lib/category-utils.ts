/**
 * Получает классы стилей для цвета категории
 */
export const getCategoryColorClasses = (colorValue: string) => {
  const baseClasses = 'text-white dark:text-white'
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700',
    red: 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700',
    green:
      'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700',
    yellow:
      'bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700 text-black dark:text-black',
    indigo:
      'bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700',
    pink: 'bg-pink-500 hover:bg-pink-600 dark:bg-pink-600 dark:hover:bg-pink-700',
    zinc: 'bg-zinc-500 hover:bg-zinc-600 dark:bg-zinc-600 dark:hover:bg-zinc-700',
    slate:
      'bg-slate-700 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-900',
    orange:
      'bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700',
    amber:
      'bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-black dark:text-black',
    lime: 'bg-lime-500 hover:bg-lime-600 dark:bg-lime-600 dark:hover:bg-lime-700 text-black dark:text-black',
    emerald:
      'bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700',
    teal: 'bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700',
    sky: 'bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700',
    purple:
      'bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700',
  }

  return `${baseClasses} ${colorMap[colorValue] || colorMap.indigo}`
}

/**
 * Получает цвета категории с дополнительными классами для кнопок
 */
export const getCategoryButtonClasses = (colorValue: string) => {
  return `h-8 justify-between p-1 ${getCategoryColorClasses(colorValue)}`
}

/**
 * Получает классы для небольшого индикатора цвета категории
 */
export const getCategoryIndicatorClasses = (colorValue: string) => {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500 dark:bg-blue-600',
    red: 'bg-red-500 dark:bg-red-600',
    green: 'bg-green-500 dark:bg-green-600',
    yellow: 'bg-yellow-500 dark:bg-yellow-600',
    indigo: 'bg-indigo-500 dark:bg-indigo-600',
    pink: 'bg-pink-500 dark:bg-pink-600',
    zinc: 'bg-zinc-500 dark:bg-zinc-600',
    slate: 'bg-slate-700 dark:bg-slate-800',
    orange: 'bg-orange-500 dark:bg-orange-600',
    amber: 'bg-amber-500 dark:bg-amber-600',
    lime: 'bg-lime-500 dark:bg-lime-600',
    emerald: 'bg-emerald-500 dark:bg-emerald-600',
    teal: 'bg-teal-500 dark:bg-teal-600',
    sky: 'bg-sky-500 dark:bg-sky-600',
    purple: 'bg-purple-500 dark:bg-purple-600',
  }

  return colorMap[colorValue] || colorMap.indigo
}

/**
 * Получает названия цветов для категорий
 */
export const getCategoryColors = () => [
  // Стандартные цвета
  { label: 'Синий', value: 'blue' },
  { label: 'Красный', value: 'red' },
  { label: 'Зеленый', value: 'green' },
  { label: 'Желтый', value: 'yellow' },
  { label: 'Фиолетовый', value: 'indigo' },
  { label: 'Розовый', value: 'pink' },
  { label: 'Серый', value: 'zinc' },
  { label: 'Черный', value: 'slate' },
]

/**
 * Получает название цвета по его значению
 */
export const getCategoryColorLabel = (colorValue: string) => {
  const color = getCategoryColors().find(c => c.value === colorValue)
  return color?.label || colorValue
}
