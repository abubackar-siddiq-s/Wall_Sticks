import { createContext, useContext, useState, useEffect } from 'react'

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
    }
  }, [customer])

  const loginCustomer = (phone, name = 'Customer') => {
    const cleanedPhone = phone.replace(/\D/g, '')
    const userData = { phone: cleanedPhone, name }
    setCustomer(userData)
    setIsLoginModalOpen(false)
    return userData
  }

  const logoutCustomer = () => {
    setCustomer(null)
  }

  const openLoginModal = () => setIsLoginModalOpen(true)
  const closeLoginModal = () => setIsLoginModalOpen(false)

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        isCustomerLoggedIn: !!customer,
        loginCustomer,
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
