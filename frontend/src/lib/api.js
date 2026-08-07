import axios from 'axios'

const defaultApiUrl = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
  ? 'https://wallsticks-backend.onrender.com/api'
  : 'http://localhost:5000/api'

export const API_BASE_URL = import.meta.env.VITE_API_URL || defaultApiUrl

const api = axios.create({
  baseURL: API_BASE_URL,
})

api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('pw_admin_token')
  const customerToken = localStorage.getItem('wallsticks_customer_token')
  const isAdminContext = (typeof window !== 'undefined' && window.location.pathname.includes('/admin')) || config.url?.includes('/admin')
  const isDeleteReview = config.method?.toLowerCase() === 'delete' && config.url?.includes('/reviews')

  if ((isAdminContext || isDeleteReview) && adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`
  } else if (customerToken) {
    config.headers.Authorization = `Bearer ${customerToken}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const msg = error.response.data?.message?.toLowerCase() || ''
      const isExpired = msg.includes('jwt expired') || msg.includes('expired') || msg.includes('not authorized')
      if (isExpired && typeof window !== 'undefined') {
        if (window.location.pathname.includes('/admin')) {
          localStorage.removeItem('pw_admin_token')
        } else {
          localStorage.removeItem('wallsticks_customer_token')
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api
