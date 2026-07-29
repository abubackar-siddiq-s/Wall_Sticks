import { createContext, useContext, useState, useEffect } from 'react'
import api from '../lib/api'

const CustomerAuthContext = createContext(null)

export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(() => {
    try {
      const saved = localStorage.getItem('wallsticks_customer')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  useEffect(() => {
    if (customer) {
      localStorage.setItem('wallsticks_customer', JSON.stringify(customer))
    } else {
      localStorage.removeItem('wallsticks_customer')
      localStorage.removeItem('wallsticks_customer_token')
    }
  }, [customer])

  const requestCustomerOtp = async (email, phone) => {
    const cleanedPhone = phone.replace(/\D/g, '')
    const { data } = await api.post('/auth/customer/request-otp', { email, phone: cleanedPhone })
    return data
  }

  const verifyCustomerOtp = async (email, phone, code) => {
    const cleanedPhone = phone.replace(/\D/g, '')
    const { data } = await api.post('/auth/customer/verify-otp', { email, phone: cleanedPhone, code })
    
    if (data.token) {
      localStorage.setItem('wallsticks_customer_token', data.token)
    }
    const userData = { id: data.user.id, email: data.user.email, phone: data.user.phone, name: data.user.name }
    setCustomer(userData)
    setIsLoginModalOpen(false)
    return userData
  }

  const logoutCustomer = () => {
    setCustomer(null)
    localStorage.removeItem('wallsticks_customer')
    localStorage.removeItem('wallsticks_customer_token')
  }

  const openLoginModal = () => setIsLoginModalOpen(true)
  const closeLoginModal = () => setIsLoginModalOpen(false)

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        isCustomerLoggedIn: !!customer,
        requestCustomerOtp,
        verifyCustomerOtp,
        logoutCustomer,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  )
}

export const useCustomerAuth = () => useContext(CustomerAuthContext)
