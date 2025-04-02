import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  // Важно для работы с куками
  withCredentials: true,
})

// Этот перехватчик больше не требуется, так как используются httpOnly cookies
// Но оставляем для обратной совместимости - токен из localStorage если есть
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  },
)

// Обработка ошибок 401 (Unauthorized)
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    // Если ошибка 401 и запрос не был попыткой обновления токена
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Пытаемся обновить токен
        await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/auth/refresh-token`,
          {},
          { withCredentials: true },
        )

        // Если успешно, повторяем оригинальный запрос
        return api(originalRequest)
      } catch (refreshError) {
        // Если не удалось обновить токен, очищаем localStorage и перенаправляем на страницу входа
        localStorage.removeItem('token')
        localStorage.removeItem('isAuthenticated')

        // Если это клиентское приложение, перенаправляем на страницу входа
        if (window) {
          window.location.href = '/login'
        }

        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export default api
