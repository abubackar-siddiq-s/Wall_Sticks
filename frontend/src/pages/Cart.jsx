import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'
import { useSettings } from '../hooks/useSettings'
import { imgSrc } from '../lib/imageUrl'
import { getItemUnitPrice } from '../lib/priceUtils'

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
    <div className="max-w-6xl mx-auto px-4 sm:px-5 md:px-8 py-6 sm:py-8 md:py-10">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-6 sm:mb-8">
        My Cart <span className="text-black/40 font-medium text-lg sm:text-xl">({validItems.length})</span>
      </h1>
      <div className="grid md:grid-cols-[1fr_340px] gap-6 sm:gap-10">
        <div className="space-y-4">
          {validItems.map((item) => {
            const product = item.product || {}
            const imageSrc = imgSrc(product.images?.[0])

            return (
              <div key={item.key} className="bg-white rounded-xl2 p-3.5 sm:p-4 shadow-soft flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between">
                <div className="flex gap-3 items-center flex-1 min-w-0">
                  <div 
                    className="w-16 h-20 sm:w-24 sm:h-28 overflow-hidden rounded-xl shrink-0 border border-black/5 flex items-center justify-center"
                    style={{ 
                      backgroundImage: "url('/transparent-background.avif')",
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    <img
                      src={imageSrc}
                      alt={product.name || 'Poster'}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-xs sm:text-sm mb-1 truncate">{product.name || 'Custom Poster'}</h3>
                    <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-black/50 mb-1.5 flex-wrap">
                      <span>Size: <strong className="text-brand-black">{item.size}</strong></span>
                      {item.border && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1 truncate">
                            {item.borderColor && (
                              <span 
                                className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0 inline-block shadow-sm"
                                style={{ backgroundColor: item.borderColor }}
                              />
                            )}
                            <span className="font-semibold text-brand-black truncate">{item.border}</span>
                          </span>
                        </>
                      )}
                    </div>
                    <p className="font-extrabold text-sm sm:text-base">₹{getItemUnitPrice(item, settings?.sizePrices)}</p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/5 shrink-0">
                  <button
                    onClick={() => removeFromCart(item.key)}
                    aria-label="Remove item"
                    className="text-black/40 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="flex items-center border-2 border-black/10 rounded-full">
                    <button
                      onClick={() => updateQuantity(item.key, item.quantity - 1)}
                      className="p-1.5 sm:p-2 hover:bg-black/5 rounded-l-full transition-colors"
                      aria-label="Decrease"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-5 text-center text-xs font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.key, item.quantity + 1)}
                      className="p-1.5 sm:p-2 hover:bg-black/5 rounded-r-full transition-colors"
                      aria-label="Increase"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="bg-brand-smoke rounded-xl2 p-4 sm:p-6 h-fit sticky top-24">
          <h3 className="font-bold mb-4 sm:mb-5 text-base sm:text-lg">Order Summary</h3>
          <div className="space-y-2.5 text-xs sm:text-sm mb-5">
            <div className="flex justify-between text-black/60">
              <span>Subtotal</span>
              <span className="font-semibold text-brand-black">₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-black/60">
              <span>Courier charge</span>
              <span className="font-semibold text-brand-black">₹{courierCharge}</span>
            </div>
          </div>
          <div className="flex justify-between font-extrabold text-base sm:text-lg border-t border-black/10 pt-4 mb-6 text-brand-black">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-brand-black text-brand-yellow font-bold py-3.5 sm:py-4 px-4 rounded-full hover:shadow-glow transition-shadow text-sm sm:text-base truncate"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  )
}
