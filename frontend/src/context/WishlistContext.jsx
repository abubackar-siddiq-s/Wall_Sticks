import { createContext, useContext, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { getSessionId } from '../lib/session'

const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pw_wishlist')) || [] } catch { return [] }
  })
  const isLive = useRef(false)

  useEffect(() => {
    const sessionId = getSessionId()
    api.get(`/wishlist/${sessionId}`)
      .then(({ data }) => {
        isLive.current = true
        if (data?.products?.length) setItems(data.products)
      })
      .catch(() => { /* offline / no backend yet — localStorage wishlist stands */ })
  }, [])

  useEffect(() => { localStorage.setItem('pw_wishlist', JSON.stringify(items)) }, [items])

  const toggleWishlist = (product) => {
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
      const sessionId = getSessionId()
      api.post(`/wishlist/${sessionId}/toggle`, { productId: product._id }).catch(() => { /* best-effort sync */ })
    }
  }

  const isWishlisted = (id) => items.some((p) => p._id === id)
  const removeFromWishlist = (id) => {
    setItems((prev) => prev.filter((p) => p._id !== id))
    const sessionId = getSessionId()
    api.post(`/wishlist/${sessionId}/toggle`, { productId: id }).catch(() => {})
  }

  return (
    <WishlistContext.Provider value={{ items, toggleWishlist, isWishlisted, removeFromWishlist }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => useContext(WishlistContext)
