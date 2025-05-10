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

let isRefreshing = false
let refreshPromise: Promise<void> | null = null

// Обработка ошибок 401 (Unauthorized)
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      if (!isRefreshing) {
        isRefreshing = true
        refreshPromise = axios
          .post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/auth/refresh-token`,
            {},
            { withCredentials: true },
          )
          .then(() => {
            isRefreshing = false
            refreshPromise = null
          })
          .catch(err => {
            isRefreshing = false
            refreshPromise = null
            throw err
          })
      }

      try {
        await refreshPromise
        return api(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem('token')
        localStorage.removeItem('isAuthenticated')
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
