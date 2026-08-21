import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Truck, Store, ShoppingBag, MapPin, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'
import { useSettings } from '../hooks/useSettings'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import { imgSrc } from '../lib/imageUrl'
import { INDIA_STATES_DISTRICTS } from '../data/indiaLocations'

export default function Checkout() {
  const { items = [], subtotal = 0 } = useCart() || {}
  const { settings = { courierCharge: 79, gstPercent: 0 } } = useSettings() || {}
  const { customer } = useCustomerAuth() || {}
  const navigate = useNavigate()
  const [deliveryMethod, setDeliveryMethod] = useState('courier')
  const [pincodeLoading, setPincodeLoading] = useState(false)

  const [form, setForm] = useState(() => {
    try {
      const saved = sessionStorage.getItem('pw_checkout')
      if (saved) {
        const parsed = JSON.parse(saved)
        return {
          ...parsed,
          phone: parsed.phone || customer?.phone || '',
          email: parsed.email || customer?.email || '',
        }
      }
    } catch {}
    return {
      name: customer?.name && customer.name !== 'Customer' ? customer.name : '',
      phone: customer?.phone || '',
      email: customer?.email || '',
      address: '',
      city: '',
      state: 'Tamil Nadu', // Default Tamil Nadu
      pincode: '',
    }
  })

  // List of districts for the currently selected state
  const availableDistricts = useMemo(() => {
    if (!form.state) return []
    return INDIA_STATES_DISTRICTS[form.state] || []
  }, [form.state])

  useEffect(() => {
    if (customer?.phone && !form.phone) {
      setForm((f) => ({ ...f, phone: customer.phone, email: f.email || customer?.email || '' }))
    }
  }, [customer?.phone])

  // Pincode reverse lookup: Typing a 6-digit Pincode automatically sets State & District!
  useEffect(() => {
    const pin = (form.pincode || '').trim()
    if (/^\d{6}$/.test(pin)) {
      setPincodeLoading(true)
      fetch(`https://api.postalpincode.in/pincode/${pin}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice?.length > 0) {
            const po = data[0].PostOffice[0]
            const foundState = po.State
            const foundDistrict = po.District

            setForm((f) => ({
              ...f,
              state: Object.keys(INDIA_STATES_DISTRICTS).includes(foundState) ? foundState : f.state,
              city: foundDistrict || f.city,
            }))
            toast.success(`Location detected: ${foundDistrict}, ${foundState}`)
          }
        })
        .catch(() => {})
        .finally(() => setPincodeLoading(false))
    }
  }, [form.pincode])

  const safeCourierCharge = settings?.courierCharge ?? 79
  const safeGstPercent = settings?.gstPercent ?? 0

  const courierCharge = deliveryMethod === 'courier' ? safeCourierCharge : 0
  const gst = Math.round(subtotal * (safeGstPercent / 100))
  const total = Math.max(0, subtotal + courierCharge + gst)

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleStateChange = (e) => {
    const newState = e.target.value
    const districts = INDIA_STATES_DISTRICTS[newState] || []
    setForm((f) => ({
      ...f,
      state: newState,
      city: districts.length > 0 ? districts[0] : '',
    }))
  }

  const handleContinue = (e) => {
    e.preventDefault()
    if (!form.name || !form.phone || (deliveryMethod === 'courier' && (!form.address || !form.city || !form.pincode))) {
      return toast.error('Please fill in all required fields')
    }
    sessionStorage.setItem('pw_checkout', JSON.stringify({ ...form, deliveryMethod }))
    navigate('/payment')
  }

  const validItems = items.filter((i) => i && i.product)

  if (validItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-32 text-center">
        <div className="w-20 h-20 rounded-full bg-brand-smoke flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={28} className="text-black/30" />
        </div>
        <h1 className="text-2xl font-extrabold mb-3">Your cart is empty</h1>
        <p className="text-black/50 mb-8">Add items to your cart before proceeding to checkout.</p>
        <Link to="/shop" className="inline-block bg-brand-black text-brand-yellow font-bold px-7 py-3.5 rounded-full">
          Browse Posters
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-10">
      <h1 className="text-3xl md:text-4xl font-extrabold mb-8">Checkout</h1>
      <div className="grid md:grid-cols-[1fr_340px] gap-10">
        <form onSubmit={handleContinue} className="space-y-8">
          <div>
            <h3 className="font-bold mb-4">Shipping Details</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                required
                value={form.name}
                onChange={update('name')}
                placeholder="Full name"
                className="px-4 py-3.5 rounded-xl bg-brand-smoke border border-transparent focus:border-brand-yellow outline-none text-sm sm:col-span-2 font-medium"
              />
              <input
                required
                value={form.phone}
                onChange={update('phone')}
                placeholder="Phone number"
                className="px-4 py-3.5 rounded-xl bg-brand-smoke border border-transparent focus:border-brand-yellow outline-none text-sm sm:col-span-2 font-medium"
              />
              <input
                type="email"
                value={form.email || ''}
                onChange={update('email')}
                placeholder="Email address (for shipping tracking & receipts)"
                className="px-4 py-3.5 rounded-xl bg-brand-smoke border border-transparent focus:border-brand-yellow outline-none text-sm sm:col-span-2 font-medium"
              />
              {deliveryMethod === 'courier' && (
                <>
                  <textarea
                    required
                    value={form.address}
                    onChange={update('address')}
                    placeholder="Street Address / House No. / Landmark"
                    rows={2}
                    className="px-4 py-3.5 rounded-xl bg-brand-smoke border border-transparent focus:border-brand-yellow outline-none text-sm sm:col-span-2 resize-none font-medium"
                  />

                  {/* DYNAMIC STATE DROPDOWN */}
                  <div className="flex flex-col">
                    <label className="text-[11px] font-bold text-black/50 mb-1 px-1">State</label>
                    <select
                      required
                      value={form.state}
                      onChange={handleStateChange}
                      className="px-4 py-3.5 rounded-xl bg-brand-smoke border border-transparent focus:border-brand-yellow outline-none text-sm font-semibold text-brand-black"
                    >
                      <option value="">Select State</option>
                      {Object.keys(INDIA_STATES_DISTRICTS).map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* DYNAMIC DISTRICT DROPDOWN BASED ON SELECTED STATE */}
                  <div className="flex flex-col">
                    <label className="text-[11px] font-bold text-black/50 mb-1 px-1">District / City</label>
                    {availableDistricts.length > 0 ? (
                      <select
                        required
                        value={form.city}
                        onChange={update('city')}
                        className="px-4 py-3.5 rounded-xl bg-brand-smoke border border-transparent focus:border-brand-yellow outline-none text-sm font-semibold text-brand-black"
                      >
                        <option value="">Select District</option>
                        {availableDistricts.map((dst) => (
                          <option key={dst} value={dst}>
                            {dst}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        required
                        value={form.city}
                        onChange={update('city')}
                        placeholder="Enter City / District"
                        className="px-4 py-3.5 rounded-xl bg-brand-smoke border border-transparent focus:border-brand-yellow outline-none text-sm font-medium"
                      />
                    )}
                  </div>

                  {/* PINCODE WITH AUTO-LOCATION LOOKUP */}
                  <div className="sm:col-span-2 relative">
                    <label className="text-[11px] font-bold text-black/50 mb-1 px-1 flex items-center justify-between">
                      <span>Pincode</span>
                      {pincodeLoading && (
                        <span className="text-brand-gold flex items-center gap-1">
                          <Loader2 size={11} className="animate-spin" /> Detecting City & State...
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        required
                        maxLength={6}
                        value={form.pincode}
                        onChange={update('pincode')}
                        placeholder="6-Digit Postal Pincode (e.g. 600001)"
                        className="w-full px-4 py-3.5 rounded-xl bg-brand-smoke border border-transparent focus:border-brand-yellow outline-none text-sm font-semibold"
                      />
                      <MapPin size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-black/30 pointer-events-none" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-bold mb-4">Delivery Method</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setDeliveryMethod('courier')}
                className={`flex items-center gap-3 p-4 rounded-xl2 border-2 text-left ${
                  deliveryMethod === 'courier' ? 'border-brand-black bg-brand-smoke' : 'border-black/10'
                }`}
              >
                <Truck size={20} />
                <div>
                  <p className="font-semibold text-sm">Courier</p>
                  <p className="text-xs text-black/45">₹{safeCourierCharge} · 3–6 days</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setDeliveryMethod('pickup')}
                className={`flex items-center gap-3 p-4 rounded-xl2 border-2 text-left ${
                  deliveryMethod === 'pickup' ? 'border-brand-black bg-brand-smoke' : 'border-black/10'
                }`}
              >
                <Store size={20} />
                <div>
                  <p className="font-semibold text-sm">Store Pickup</p>
                  <p className="text-xs text-black/45">Free</p>
                </div>
              </button>
            </div>

            {deliveryMethod === 'pickup' && (
              <div className="mt-4 bg-brand-smoke rounded-xl2 p-5 text-sm space-y-1.5">
                <p>
                  <span className="font-semibold">Pickup address:</span> {settings?.pickupAddress || 'Store Location'}
                </p>
                <p>
                  <span className="font-semibold">Pickup time:</span> {settings?.pickupTime || '10:00 AM - 8:00 PM'}
                </p>
                <p>
                  <span className="font-semibold">Owner contact:</span> {settings?.phone || ''}
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-brand-black text-brand-yellow font-bold py-4 rounded-full hover:shadow-glow transition-shadow"
          >
            Continue to Payment
          </button>
        </form>

        <div className="bg-brand-smoke rounded-xl2 p-6 h-fit">
          <h3 className="font-bold mb-5">Order Summary</h3>
          <div className="space-y-3 mb-5 max-h-64 overflow-y-auto pr-1">
            {validItems.map((item) => {
              const product = item.product || {}
              const imageSrc = imgSrc(product.images?.[0])

              return (
                <div key={item.key} className="flex gap-3 text-sm">
                  <img src={imageSrc} className="w-12 h-14 object-contain bg-white rounded-lg shrink-0 border border-black/5" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{product.name || 'Poster'}</p>
                    <p className="text-black/50 text-xs flex items-center gap-1 flex-wrap mt-0.5">
                      <span>Qty {item.quantity} · {item.size}</span>
                      {item.border && (
                        <span>· {item.border}</span>
                      )}
                    </p>
                  </div>
                  <p className="font-semibold">₹{(product.price || 0) * item.quantity}</p>
                </div>
              )
            })}
          </div>
          <div className="space-y-2.5 text-sm border-t border-black/10 pt-4">
            <div className="flex justify-between text-black/60">
              <span>Poster price</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-black/60">
              <span>Courier charge</span>
              <span>₹{courierCharge}</span>
            </div>
            {safeGstPercent > 0 && (
              <div className="flex justify-between text-black/60">
                <span>GST ({safeGstPercent}%)</span>
                <span>₹{gst}</span>
              </div>
            )}
          </div>
          <div className="flex justify-between font-extrabold text-lg border-t border-black/10 pt-4 mt-4">
            <span>Grand Total</span>
            <span>₹{total}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
