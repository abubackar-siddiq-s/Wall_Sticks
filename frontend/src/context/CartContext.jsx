import { createContext, useContext, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { getSessionId } from '../lib/session'

const CartContext = createContext(null)

// Converts our local cart-item shape into the shape backend/models/Cart.js expects.
const toServerItem = (i) => ({
  product: i.product?.isCustom ? undefined : i.product?._id,
  customImage: i.product?.isCustom ? { url: i.product.images?.[0] } : undefined,
  isCustom: !!i.product?.isCustom,
  size: i.size, finish: i.finish, border: i.border, orientation: i.orientation,
  quantity: i.quantity, notes: i.notes, priceAtAdd: i.product?.price,
})

// Converts a server cart item (with a populated `product`) back into our local shape.
const fromServerItem = (i) => ({
  key: `${i.product?._id || 'custom'}-${i.size || ''}-${i.finish || ''}-${i.border || ''}`,
  product: i.isCustom
    ? { _id: `custom-${i.customImage?.url}`, name: 'Custom Poster', isCustom: true, price: i.priceAtAdd, images: [i.customImage?.url] }
    : i.product,
  quantity: i.quantity, size: i.size, finish: i.finish, border: i.border, orientation: i.orientation, notes: i.notes,
})

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pw_cart')) || [] } catch { return [] }
  })
  const hydrated = useRef(false)
  const syncTimer = useRef(null)

  // On mount: try to hydrate from the backend (cross-device persistence via the anonymous
  // session ID). If the backend isn't reachable, we silently keep whatever was in localStorage.
  useEffect(() => {
    const sessionId = getSessionId()
    api.get(`/cart/${sessionId}`)
      .then(({ data }) => {
        if (data?.items?.length) setItems(data.items.map(fromServerItem))
      })
      .catch(() => { /* offline / no backend yet — localStorage cart stands */ })
      .finally(() => { hydrated.current = true })
  }, [])

  useEffect(() => {
    localStorage.setItem('pw_cart', JSON.stringify(items))
    if (!hydrated.current) return // don't push the pre-hydration local snapshot back over live server data
    clearTimeout(syncTimer.current)
    syncTimer.current = setTimeout(() => {
      const sessionId = getSessionId()
      api.put(`/cart/${sessionId}`, { items: items.map(toServerItem) }).catch(() => { /* best-effort sync */ })
    }, 600)
    return () => clearTimeout(syncTimer.current)
  }, [items])

  const addToCart = (product, options = {}) => {
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
    const sessionId = getSessionId()
    api.delete(`/cart/${sessionId}`).catch(() => {})
  }

  const subtotal = items.reduce((sum, i) => sum + (i.product.price * i.quantity), 0)

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, subtotal }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
