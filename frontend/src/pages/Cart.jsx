import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'
import { useSettings } from '../hooks/useSettings'
import { imgSrc } from '../lib/imageUrl'

export default function Cart() {
  const { items = [], removeFromCart, updateQuantity, subtotal = 0 } = useCart() || {}
  const { settings = { courierCharge: 79 } } = useSettings() || {}
  const navigate = useNavigate()
  const [landscapeItems, setLandscapeItems] = useState({})
  const courierCharge = settings?.courierCharge ?? 79
  const total = subtotal + courierCharge

  const validItems = items.filter((item) => item.product && item.product._id)

  if (validItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-32 text-center">
        <div className="w-20 h-20 rounded-full bg-brand-smoke flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={28} className="text-black/30" />
        </div>
        <h1 className="text-2xl font-extrabold mb-3">Your cart is empty</h1>
        <p className="text-black/50 mb-8">Nothing here yet. Find a poster your wall's been missing.</p>
        <Link to="/shop" className="inline-block bg-brand-black text-brand-yellow font-bold px-7 py-3.5 rounded-full">Browse Posters</Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-10">
      <h1 className="text-3xl md:text-4xl font-extrabold mb-8">
        My Cart <span className="text-black/40 font-medium text-xl">({validItems.length})</span>
      </h1>
      <div className="grid md:grid-cols-[1fr_340px] gap-10">
        <div className="space-y-4">
          {validItems.map((item) => {
            const product = item.product || {}
            const imageSrc = imgSrc(product.images?.[0])
            const isLandscape = !!landscapeItems[item.key]

            return (
              <div key={item.key} className="flex gap-4 bg-white rounded-xl2 p-4 shadow-soft">
                <div className="w-24 h-28 overflow-hidden rounded-xl shrink-0 border border-black/5 flex items-center justify-center bg-white">
                  <img
                    src={imageSrc}
                    alt={product.name || 'Poster'}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm mb-1 truncate">{product.name || 'Custom Poster'}</h3>
                  <p className="text-xs text-black/45 mb-2">
                    {[item.size, item.finish, item.border].filter(Boolean).join(' · ')}
                  </p>
                  <p className="font-bold">₹{product.price || item.priceAtAdd || 0}</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeFromCart(item.key)}
                    aria-label="Remove item"
                    className="text-black/30 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={17} />
                  </button>
                  <div className="flex items-center border-2 border-black/10 rounded-full">
                    <button
                      onClick={() => updateQuantity(item.key, item.quantity - 1)}
                      className="p-2"
                      aria-label="Decrease"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.key, item.quantity + 1)}
                      className="p-2"
                      aria-label="Increase"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="bg-brand-smoke rounded-xl2 p-6 h-fit sticky top-24">
          <h3 className="font-bold mb-5">Order Summary</h3>
          <div className="space-y-2.5 text-sm mb-5">
            <div className="flex justify-between text-black/60">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-black/60">
              <span>Courier charge</span>
              <span>₹{courierCharge}</span>
            </div>
          </div>
          <div className="flex justify-between font-extrabold text-lg border-t border-black/10 pt-4 mb-6">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-brand-black text-brand-yellow font-bold py-4 rounded-full hover:shadow-glow transition-shadow"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  )
}
