import { createContext, useContext, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { getSessionId } from '../lib/session'
import { useCustomerAuth } from './CustomerAuthContext'

const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
  const { customer, isCustomerLoggedIn, openLoginModal } = useCustomerAuth()

  const getStorageKey = () => (customer ? `pw_wishlist_${customer.phone}` : null)

  const [items, setItems] = useState([])

  useEffect(() => {
    const key = getStorageKey()
    if (!key) {
      setItems([])
      return
    }
    try {
      const saved = localStorage.getItem(key)
      setItems(saved ? JSON.parse(saved) : [])
    } catch {
      setItems([])
    }

    const sessionId = customer?.phone || getSessionId()
    api.get(`/wishlist/${sessionId}`)
      .then(({ data }) => {
        if (data?.products?.length) setItems(data.products)
      })
      .catch(() => {})
  }, [customer?.phone])

  useEffect(() => {
    const key = getStorageKey()
    if (key) localStorage.setItem(key, JSON.stringify(items))
  }, [items, customer?.phone])

  const toggleWishlist = (product) => {
    if (!isCustomerLoggedIn) {
      toast('Please login to save items to wishlist', { icon: '🔒' })
      openLoginModal()
      return
    }

    setItems((prev) => {
      const exists = prev.find((p) => p._id === product._id)
      if (exists) {
        toast('Removed from wishlist', { icon: '💔' })
        return prev.filter((p) => p._id !== product._id)
      }
      toast.success('Added to wishlist')
      return [...prev, product]
    })

    if (!product._id?.startsWith?.('custom-')) {
      const sessionId = customer?.phone || getSessionId()
      api.post(`/wishlist/${sessionId}/toggle`, { productId: product._id }).catch(() => {})
    }
  }

  const isWishlisted = (id) => items.some((p) => p._id === id)
  const removeFromWishlist = (id) => {
    setItems((prev) => prev.filter((p) => p._id !== id))
    const sessionId = customer?.phone || getSessionId()
    api.post(`/wishlist/${sessionId}/toggle`, { productId: id }).catch(() => {})
  }

  return (
    <WishlistContext.Provider value={{ items, toggleWishlist, isWishlisted, removeFromWishlist }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => useContext(WishlistContext)
