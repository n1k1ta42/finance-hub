/**
 * Тестовые пользователи
 */
export const users = {
  admin: {
    username: "admin@example.com",
    password: "nikitathebest",
  },
  user: {
    username: "test@example.com",
    password: "password123",
  },
};

/**
 * Тестовые финансовые категории
 */
export const categories = [
  { name: "Продукты", type: "expense" },
  { name: "Транспорт", type: "expense" },
  { name: "Развлечения", type: "expense" },
  { name: "Зарплата", type: "income" },
  { name: "Подарки", type: "income" },
];

/**
 * Тестовые транзакции
 */
export const transactions = [
  {
    description: "Покупка продуктов",
    amount: 1500,
    category: "Продукты",
    date: new Date().toISOString().split("T")[0],
  },
  {
    description: "Зарплата",
    amount: 50000,
    category: "Зарплата",
    date: new Date().toISOString().split("T")[0],
  },
];
