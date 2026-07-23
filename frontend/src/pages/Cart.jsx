import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'
import { useSettings } from '../hooks/useSettings'

export default function Cart() {
  const { items, removeFromCart, updateQuantity, subtotal } = useCart()
  const { settings } = useSettings()
  const [coupon, setCoupon] = useState('')
  const [discount, setDiscount] = useState(0)
  const navigate = useNavigate()

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === 'WELCOME10') {
      setDiscount(Math.round(subtotal * 0.1))
      toast.success('Coupon applied — 10% off')
    } else {
      toast.error('Invalid coupon code')
    }
  }

  const total = subtotal - discount + (items.length ? settings.courierCharge : 0)

  if (items.length === 0) {
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
      <h1 className="text-3xl md:text-4xl font-extrabold mb-8">My Cart <span className="text-black/40 font-medium text-xl">({items.length})</span></h1>
      <div className="grid md:grid-cols-[1fr_340px] gap-10">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.key} className="flex gap-4 bg-white rounded-xl2 p-4 shadow-soft">
              <img src={item.product.images[0]} alt={item.product.name} className="w-24 h-28 object-cover rounded-xl shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm mb-1 truncate">{item.product.name}</h3>
                <p className="text-xs text-black/45 mb-2">
                  {[item.size, item.finish, item.border].filter(Boolean).join(' · ')}
                </p>
                <p className="font-bold">₹{item.product.price}</p>
              </div>
              <div className="flex flex-col items-end justify-between">
                <button onClick={() => removeFromCart(item.key)} aria-label="Remove item" className="text-black/30 hover:text-red-500 transition-colors">
                  <Trash2 size={17} />
                </button>
                <div className="flex items-center border-2 border-black/10 rounded-full">
                  <button onClick={() => updateQuantity(item.key, item.quantity - 1)} className="p-2" aria-label="Decrease"><Minus size={13} /></button>
                  <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.key, item.quantity + 1)} className="p-2" aria-label="Increase"><Plus size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-brand-smoke rounded-xl2 p-6 h-fit sticky top-24">
          <h3 className="font-bold mb-5">Order Summary</h3>
          <div className="flex gap-2 mb-5">
            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="Coupon code"
              className="flex-1 px-4 py-2.5 rounded-full bg-white border border-transparent focus:border-brand-yellow outline-none text-sm"
            />
            <button onClick={applyCoupon} className="px-5 py-2.5 rounded-full bg-brand-black text-brand-yellow text-sm font-semibold">Apply</button>
          </div>
          <div className="space-y-2.5 text-sm mb-5">
            <div className="flex justify-between text-black/60"><span>Subtotal</span><span>₹{subtotal}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-700"><span>Discount</span><span>-₹{discount}</span></div>}
            <div className="flex justify-between text-black/60"><span>Courier charge</span><span>₹{settings.courierCharge}</span></div>
          </div>
          <div className="flex justify-between font-extrabold text-lg border-t border-black/10 pt-4 mb-6">
            <span>Total</span><span>₹{total}</span>
          </div>
          <button onClick={() => navigate('/checkout')} className="w-full bg-brand-black text-brand-yellow font-bold py-4 rounded-full hover:shadow-glow transition-shadow">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  )
}
