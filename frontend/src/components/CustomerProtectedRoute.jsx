import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import toast from 'react-hot-toast'

export default function CustomerProtectedRoute({ children }) {
  const { isCustomerLoggedIn, openLoginModal } = useCustomerAuth()

  useEffect(() => {
    if (!isCustomerLoggedIn) {
      toast('Please login with your mobile number first', { icon: '📱' })
      openLoginModal()
    }
  }, [isCustomerLoggedIn, openLoginModal])

  if (!isCustomerLoggedIn) {
    return <Navigate to="/shop" replace />
  }

  return children
}
