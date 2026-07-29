import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
})

api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('pw_admin_token')
  const customerToken = localStorage.getItem('wallsticks_customer_token')
  const isAdminContext = (typeof window !== 'undefined' && window.location.pathname.includes('/admin')) || config.url?.includes('/admin')

  if (isAdminContext && adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`
  } else if (customerToken) {
    config.headers.Authorization = `Bearer ${customerToken}`
  } else if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`
  }
  return config
})

export default api
