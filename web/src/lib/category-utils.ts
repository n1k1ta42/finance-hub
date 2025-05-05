/**
 * Получает классы стилей для цвета категории
 */
export const getCategoryColorClasses = (colorValue: string) => {
  const baseClasses = 'text-white dark:text-white'
  const darkTextColors = 'text-black dark:text-black'
  const colorMap: Record<string, string> = {
    // Основные цвета
    blue: 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700',
    red: 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700',
    green:
      'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700',
    yellow: `bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700 ${darkTextColors}`,
    indigo:
      'bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700',
    pink: 'bg-pink-500 hover:bg-pink-600 dark:bg-pink-600 dark:hover:bg-pink-700',
    purple:
      'bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700',
    violet:
      'bg-violet-500 hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-700',

    // Серые оттенки
    zinc: 'bg-zinc-500 hover:bg-zinc-600 dark:bg-zinc-600 dark:hover:bg-zinc-700',
    slate:
      'bg-slate-700 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-900',
    gray: 'bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700',
    stone:
      'bg-stone-500 hover:bg-stone-600 dark:bg-stone-600 dark:hover:bg-stone-700',
    neutral:
      'bg-neutral-500 hover:bg-neutral-600 dark:bg-neutral-600 dark:hover:bg-neutral-700',

    // Оттенки рыжего/оранжевого
    orange:
      'bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700',
    amber: `bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 ${darkTextColors}`,

    // Оттенки зеленого
    lime: `bg-lime-500 hover:bg-lime-600 dark:bg-lime-600 dark:hover:bg-lime-700 ${darkTextColors}`,
    emerald:
      'bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700',
    teal: 'bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700',

    // Оттенки синего
    sky: 'bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700',
    cyan: 'bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-700',

    // Другие цвета
    fuchsia:
      'bg-fuchsia-500 hover:bg-fuchsia-600 dark:bg-fuchsia-600 dark:hover:bg-fuchsia-700',
    rose: 'bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700',

    // Дополнительные оттенки
    lightBlue:
      'bg-blue-400 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600',
    darkBlue:
      'bg-blue-700 hover:bg-blue-800 dark:bg-blue-800 dark:hover:bg-blue-900',
    lightGreen: `bg-green-400 hover:bg-green-500 dark:bg-green-400 dark:hover:bg-green-500 ${darkTextColors}`,
    darkGreen:
      'bg-green-700 hover:bg-green-800 dark:bg-green-800 dark:hover:bg-green-900',
    lightRed:
      'bg-red-400 hover:bg-red-500 dark:bg-red-400 dark:hover:bg-red-500',
    darkRed:
      'bg-red-700 hover:bg-red-800 dark:bg-red-800 dark:hover:bg-red-900',
    lightPurple:
      'bg-purple-400 hover:bg-purple-500 dark:bg-purple-400 dark:hover:bg-purple-500',
    darkPurple:
      'bg-purple-800 hover:bg-purple-900 dark:bg-purple-900 dark:hover:bg-purple-950',
    brown:
      'bg-amber-800 hover:bg-amber-900 dark:bg-amber-900 dark:hover:bg-amber-950',
    coral:
      'bg-rose-400 hover:bg-rose-500 dark:bg-rose-400 dark:hover:bg-rose-500',
    turquoise:
      'bg-teal-400 hover:bg-teal-500 dark:bg-teal-400 dark:hover:bg-teal-500',
    lavender:
      'bg-violet-300 hover:bg-violet-400 dark:bg-violet-400 dark:hover:bg-violet-500',
    mint: `bg-emerald-300 hover:bg-emerald-400 dark:bg-emerald-300 dark:hover:bg-emerald-400 ${darkTextColors}`,
    salmon: 'bg-red-300 hover:bg-red-400 dark:bg-red-300 dark:hover:bg-red-400',
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
    // Основные цвета
    blue: 'bg-blue-500 dark:bg-blue-600',
    red: 'bg-red-500 dark:bg-red-600',
    green: 'bg-green-500 dark:bg-green-600',
    yellow: 'bg-yellow-500 dark:bg-yellow-600',
    indigo: 'bg-indigo-500 dark:bg-indigo-600',
    pink: 'bg-pink-500 dark:bg-pink-600',
    purple: 'bg-purple-500 dark:bg-purple-600',
    violet: 'bg-violet-500 dark:bg-violet-600',

    // Серые оттенки
    zinc: 'bg-zinc-500 dark:bg-zinc-600',
    slate: 'bg-slate-700 dark:bg-slate-800',
    gray: 'bg-gray-500 dark:bg-gray-600',
    stone: 'bg-stone-500 dark:bg-stone-600',
    neutral: 'bg-neutral-500 dark:bg-neutral-600',

    // Оттенки рыжего/оранжевого
    orange: 'bg-orange-500 dark:bg-orange-600',
    amber: 'bg-amber-500 dark:bg-amber-600',

    // Оттенки зеленого
    lime: 'bg-lime-500 dark:bg-lime-600',
    emerald: 'bg-emerald-500 dark:bg-emerald-600',
    teal: 'bg-teal-500 dark:bg-teal-600',

    // Оттенки синего
    sky: 'bg-sky-500 dark:bg-sky-600',
    cyan: 'bg-cyan-500 dark:bg-cyan-600',

    // Другие цвета
    fuchsia: 'bg-fuchsia-500 dark:bg-fuchsia-600',
    rose: 'bg-rose-500 dark:bg-rose-600',

    // Дополнительные оттенки
    lightBlue: 'bg-blue-400 dark:bg-blue-500',
    darkBlue: 'bg-blue-700 dark:bg-blue-800',
    lightGreen: 'bg-green-400 dark:bg-green-400',
    darkGreen: 'bg-green-700 dark:bg-green-800',
    lightRed: 'bg-red-400 dark:bg-red-400',
    darkRed: 'bg-red-700 dark:bg-red-800',
    lightPurple: 'bg-purple-400 dark:bg-purple-400',
    darkPurple: 'bg-purple-800 dark:bg-purple-900',
    brown: 'bg-amber-800 dark:bg-amber-900',
    coral: 'bg-rose-400 dark:bg-rose-400',
    turquoise: 'bg-teal-400 dark:bg-teal-400',
    lavender: 'bg-violet-300 dark:bg-violet-400',
    mint: 'bg-emerald-300 dark:bg-emerald-300',
    salmon: 'bg-red-300 dark:bg-red-300',
  }

  return colorMap[colorValue] || colorMap.indigo
}

/**
 * Получает названия цветов для категорий
 */
export const getCategoryColors = () => [
  // Основные цвета
  { label: 'Синий', value: 'blue' },
  { label: 'Красный', value: 'red' },
  { label: 'Зеленый', value: 'green' },
  { label: 'Желтый', value: 'yellow' },
  { label: 'Индиго', value: 'indigo' },
  { label: 'Розовый', value: 'pink' },
  { label: 'Фиолетовый', value: 'purple' },
  { label: 'Виолетовый', value: 'violet' },

  // Серые оттенки
  { label: 'Цинковый', value: 'zinc' },
  { label: 'Сланцевый', value: 'slate' },
  { label: 'Серый', value: 'gray' },
  { label: 'Каменный', value: 'stone' },
  { label: 'Нейтральный', value: 'neutral' },

  // Оттенки рыжего/оранжевого
  { label: 'Оранжевый', value: 'orange' },
  { label: 'Янтарный', value: 'amber' },

  // Оттенки зеленого
  { label: 'Лаймовый', value: 'lime' },
  { label: 'Изумрудный', value: 'emerald' },
  { label: 'Бирюзовый', value: 'teal' },

  // Оттенки синего
  { label: 'Небесный', value: 'sky' },
  { label: 'Голубой', value: 'cyan' },

  // Другие цвета
  { label: 'Фуксия', value: 'fuchsia' },
  { label: 'Розовый (яркий)', value: 'rose' },

  // Дополнительные оттенки
  { label: 'Светло-синий', value: 'lightBlue' },
  { label: 'Темно-синий', value: 'darkBlue' },
  { label: 'Светло-зеленый', value: 'lightGreen' },
  { label: 'Темно-зеленый', value: 'darkGreen' },
  { label: 'Светло-красный', value: 'lightRed' },
  { label: 'Темно-красный', value: 'darkRed' },
  { label: 'Светло-фиолетовый', value: 'lightPurple' },
  { label: 'Темно-фиолетовый', value: 'darkPurple' },
  { label: 'Коричневый', value: 'brown' },
  { label: 'Коралловый', value: 'coral' },
  { label: 'Бирюза', value: 'turquoise' },
  { label: 'Лаванда', value: 'lavender' },
  { label: 'Мятный', value: 'mint' },
  { label: 'Лососевый', value: 'salmon' },
]

/**
 * Получает название цвета по его значению
 */
export const getCategoryColorLabel = (colorValue: string) => {
  const color = getCategoryColors().find(c => c.value === colorValue)
  return color?.label || colorValue
}
