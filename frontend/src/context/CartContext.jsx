import { createContext, useContext, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { getSessionId } from '../lib/session'
import { useCustomerAuth } from './CustomerAuthContext'

const CartContext = createContext(null)

const toServerItem = (i) => ({
  product: i.product?.isCustom ? undefined : i.product?._id,
  customImage: i.product?.isCustom ? (i.product.customImage || { url: i.product.images?.[0] }) : undefined,
  isCustom: !!i.product?.isCustom,
  size: i.size, finish: i.finish, border: i.border, orientation: i.orientation,
  quantity: i.quantity, notes: i.notes, priceAtAdd: i.product?.price,
})

const fromServerItem = (i) => ({
  key: `${i.product?._id || 'custom'}-${i.size || ''}-${i.finish || ''}-${i.border || ''}`,
  product: i.isCustom
    ? { _id: `custom-${i.customImage?.url}`, name: 'Custom Poster', isCustom: true, price: i.priceAtAdd, images: [i.customImage?.url], customImage: i.customImage }
    : i.product,
  quantity: i.quantity, size: i.size, finish: i.finish, border: i.border, orientation: i.orientation, notes: i.notes,
})

export function CartProvider({ children }) {
  const { customer, isCustomerLoggedIn, openLoginModal } = useCustomerAuth()
  
  const getStorageKey = () => (customer ? `pw_cart_${customer.phone}` : null)

  const [items, setItems] = useState([])
  const hydrated = useRef(false)
  const syncTimer = useRef(null)

  // Reload cart whenever customer changes (log in / log out / switch account)
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
    api.get(`/cart/${sessionId}`)
      .then(({ data }) => {
        if (data?.items?.length) setItems(data.items.map(fromServerItem))
      })
      .catch(() => {})
      .finally(() => { hydrated.current = true })
  }, [customer?.phone])

  // Sync to local storage & backend
  useEffect(() => {
    const key = getStorageKey()
    if (!key) return
    localStorage.setItem(key, JSON.stringify(items))
    if (!hydrated.current) return
    clearTimeout(syncTimer.current)
    syncTimer.current = setTimeout(() => {
      const sessionId = customer?.phone || getSessionId()
      api.put(`/cart/${sessionId}`, { items: items.map(toServerItem) }).catch(() => {})
    }, 600)
    return () => clearTimeout(syncTimer.current)
  }, [items, customer?.phone])

  const addToCart = (product, options = {}) => {
    if (!isCustomerLoggedIn) {
      toast('Please login to add items to cart', { icon: '🔒' })
      openLoginModal()
      return
    }

    const size = options.size || product.sizes?.[2] || 'A3'
    const finish = options.finish || product.finishes?.[0] || 'Premium Matte'
    const border = options.border || 'White'
    const quantity = options.quantity || 1
    const finalOptions = { ...options, size, finish, border, quantity }

    setItems((prev) => {
      const key = `${product._id}-${size}-${finish}-${border}`
      const existing = prev.find((i) => i.key === key)
      if (existing) {
        return prev.map((i) => i.key === key ? { ...i, quantity: i.quantity + quantity } : i)
      }
      return [...prev, { key, product, ...finalOptions }]
    })
    toast.success(`Added "${product.name}" to cart`)
  }

  const removeFromCart = (key) => setItems((prev) => prev.filter((i) => i.key !== key))

  const updateQuantity = (key, quantity) => {
    if (quantity < 1) return
    setItems((prev) => prev.map((i) => i.key === key ? { ...i, quantity } : i))
  }

  const clearCart = () => {
    setItems([])
    const key = getStorageKey()
    if (key) localStorage.removeItem(key)
    const sessionId = customer?.phone || getSessionId()
    api.delete(`/cart/${sessionId}`).catch(() => {})
  }

  const subtotal = items.reduce((sum, i) => sum + ((i.product?.price || 0) * i.quantity), 0)

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, subtotal }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
