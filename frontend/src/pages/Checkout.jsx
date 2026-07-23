import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Truck, Store } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'
import { useSettings } from '../hooks/useSettings'

export default function Checkout() {
  const { items, subtotal } = useCart()
  const { settings } = useSettings()
  const navigate = useNavigate()
  const [deliveryMethod, setDeliveryMethod] = useState('courier')
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '', state: '', pincode: '' })

  const courierCharge = deliveryMethod === 'courier' ? settings.courierCharge : 0
  const gst = Math.round(subtotal * (settings.gstPercent / 100))
  const total = subtotal + courierCharge + gst

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleContinue = (e) => {
    e.preventDefault()
    if (!form.name || !form.phone || (deliveryMethod === 'courier' && (!form.address || !form.city || !form.pincode))) {
      return toast.error('Please fill in all required fields')
    }
    sessionStorage.setItem('pw_checkout', JSON.stringify({ ...form, deliveryMethod }))
    navigate('/payment')
  }

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-10">
      <h1 className="text-3xl md:text-4xl font-extrabold mb-8">Checkout</h1>
      <div className="grid md:grid-cols-[1fr_340px] gap-10">
        <form onSubmit={handleContinue} className="space-y-8">
          <div>
            <h3 className="font-bold mb-4">Shipping Details</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <input required value={form.name} onChange={update('name')} placeholder="Full name" className="px-4 py-3.5 rounded-xl bg-brand-smoke border border-transparent focus:border-brand-yellow outline-none text-sm sm:col-span-2" />
              <input required value={form.phone} onChange={update('phone')} placeholder="Phone number" className="px-4 py-3.5 rounded-xl bg-brand-smoke border border-transparent focus:border-brand-yellow outline-none text-sm sm:col-span-2" />
              {deliveryMethod === 'courier' && (
                <>
                  <textarea required value={form.address} onChange={update('address')} placeholder="Address" rows={2} className="px-4 py-3.5 rounded-xl bg-brand-smoke border border-transparent focus:border-brand-yellow outline-none text-sm sm:col-span-2 resize-none" />
                  <input required value={form.city} onChange={update('city')} placeholder="City" className="px-4 py-3.5 rounded-xl bg-brand-smoke border border-transparent focus:border-brand-yellow outline-none text-sm" />
                  <input required value={form.state} onChange={update('state')} placeholder="State" className="px-4 py-3.5 rounded-xl bg-brand-smoke border border-transparent focus:border-brand-yellow outline-none text-sm" />
                  <input required value={form.pincode} onChange={update('pincode')} placeholder="Pincode" className="px-4 py-3.5 rounded-xl bg-brand-smoke border border-transparent focus:border-brand-yellow outline-none text-sm sm:col-span-2" />
                </>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-4">Delivery Method</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <button type="button" onClick={() => setDeliveryMethod('courier')} className={`flex items-center gap-3 p-4 rounded-xl2 border-2 text-left ${deliveryMethod === 'courier' ? 'border-brand-black bg-brand-smoke' : 'border-black/10'}`}>
                <Truck size={20} />
                <div>
                  <p className="font-semibold text-sm">Courier</p>
                  <p className="text-xs text-black/45">₹{settings.courierCharge} · 3–6 days</p>
                </div>
              </button>
              <button type="button" onClick={() => setDeliveryMethod('pickup')} className={`flex items-center gap-3 p-4 rounded-xl2 border-2 text-left ${deliveryMethod === 'pickup' ? 'border-brand-black bg-brand-smoke' : 'border-black/10'}`}>
                <Store size={20} />
                <div>
                  <p className="font-semibold text-sm">Store Pickup</p>
                  <p className="text-xs text-black/45">Free</p>
                </div>
              </button>
            </div>

            {deliveryMethod === 'pickup' && (
              <div className="mt-4 bg-brand-smoke rounded-xl2 p-5 text-sm space-y-1.5">
                <p><span className="font-semibold">Pickup address:</span> {settings.pickupAddress}</p>
                <p><span className="font-semibold">Pickup time:</span> {settings.pickupTime}</p>
                <p><span className="font-semibold">Owner contact:</span> {settings.phone}</p>
              </div>
            )}
          </div>

          <button type="submit" className="w-full bg-brand-black text-brand-yellow font-bold py-4 rounded-full hover:shadow-glow transition-shadow">
            Continue to Payment
          </button>
        </form>

        <div className="bg-brand-smoke rounded-xl2 p-6 h-fit">
          <h3 className="font-bold mb-5">Order Summary</h3>
          <div className="space-y-3 mb-5 max-h-64 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.key} className="flex gap-3 text-sm">
                <img src={item.product.images[0]} className="w-12 h-14 object-cover rounded-lg" alt="" />
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{item.product.name}</p>
                  <p className="text-black/45 text-xs">Qty {item.quantity} · {item.size}</p>
                </div>
                <p className="font-semibold">₹{item.product.price * item.quantity}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2.5 text-sm border-t border-black/10 pt-4">
            <div className="flex justify-between text-black/60"><span>Poster price</span><span>₹{subtotal}</span></div>
            <div className="flex justify-between text-black/60"><span>Courier charge</span><span>₹{courierCharge}</span></div>
            {settings.gstPercent > 0 && <div className="flex justify-between text-black/60"><span>GST ({settings.gstPercent}%)</span><span>₹{gst}</span></div>}
          </div>
          <div className="flex justify-between font-extrabold text-lg border-t border-black/10 pt-4 mt-4">
            <span>Grand Total</span><span>₹{total}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
