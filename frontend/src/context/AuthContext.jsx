import { createContext, useContext, useState } from 'react'
import api from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const token = localStorage.getItem('pw_admin_token')
    return token ? { token } : null
  })

  const login = async (email, password) => {
    const { data } = await api.post('/auth/admin/login', { email, password })
    localStorage.setItem('pw_admin_token', data.token)
    setAdmin({ token: data.token, ...data.admin })
    return data
  }

  const logout = () => {
    localStorage.removeItem('pw_admin_token')
    setAdmin(null)
  }

  return (
    <AuthContext.Provider value={{ admin, login, logout, isAuthenticated: !!admin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
