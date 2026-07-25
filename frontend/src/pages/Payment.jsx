import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Upload, Copy, Check, ShoppingBag } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'
import { useSettings } from '../hooks/useSettings'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import api from '../lib/api'

export default function Payment() {
  const { items = [], subtotal = 0, clearCart } = useCart() || {}
  const { settings = { courierCharge: 79, gstPercent: 0, upiId: '', upiQr: {} } } = useSettings() || {}
  const { customer } = useCustomerAuth() || {}
  const navigate = useNavigate()
  const fileInput = useRef()
  const [copied, setCopied] = useState(false)
  const [screenshot, setScreenshot] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const checkoutInfo = JSON.parse(sessionStorage.getItem('pw_checkout') || '{}')
  const [form, setForm] = useState(() => ({
    name: checkoutInfo.name || (customer?.name && customer.name !== 'Customer' ? customer.name : ''),
    phone: checkoutInfo.phone || customer?.phone || '',
    transactionId: '',
    notes: '',
  }))

  const deliveryMethod = checkoutInfo.deliveryMethod || 'courier'
  const safeCourierCharge = settings?.courierCharge ?? 79
  const safeGstPercent = settings?.gstPercent ?? 0

  const courierCharge = deliveryMethod === 'courier' ? safeCourierCharge : 0
  const gst = Math.round(subtotal * (safeGstPercent / 100))
  const total = Math.max(0, subtotal + courierCharge + gst)

  const copyUpi = () => {
    if (!settings?.upiId) return
    navigator.clipboard.writeText(settings.upiId)
    setCopied(true)
    toast.success('UPI ID copied')
    setTimeout(() => setCopied(false), 2000)
  }

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.phone || !form.transactionId) return toast.error('Please fill in all required fields')
    if (!screenshot) return toast.error('Please upload a payment screenshot')

    const validItems = items.filter((i) => i && i.product)
    if (validItems.length === 0) return toast.error('Your cart is empty')

    setSubmitting(true)
    try {
      const orderPayload = {
        shipping: checkoutInfo,
        deliveryMethod,
        pricing: { subtotal, courierCharge, gst, total },
        items: validItems.map((i) => ({
          product: i.product?.isCustom ? undefined : i.product?._id,
          name: i.product?.name || 'Poster',
          isCustom: !!i.product?.isCustom,
          size: i.size,
          finish: i.finish,
          border: i.border,
          orientation: i.orientation,
          quantity: i.quantity,
          price: i.product?.price || i.priceAtAdd || 0,
          notes: i.notes,
          customImage: i.product?.isCustom ? { url: i.product?.images?.[0] } : undefined,
        })),
      }

      let orderId = null
      try {
        const { data: order } = await api.post('/orders', orderPayload)
        orderId = order._id

        const paymentForm = new FormData()
        paymentForm.append('orderId', orderId)
        paymentForm.append('name', form.name)
        paymentForm.append('phone', form.phone)
        paymentForm.append('transactionId', form.transactionId)
        paymentForm.append('notes', form.notes)
        paymentForm.append('amount', total)
        const screenshotBlob = await (await fetch(screenshot)).blob()
        paymentForm.append('screenshot', screenshotBlob, 'payment-screenshot.png')
        await api.post('/payments', paymentForm, { headers: { 'Content-Type': 'multipart/form-data' } })

        clearCart()
        sessionStorage.removeItem('pw_checkout')
        navigate(`/order-success/${order.orderNumber}`)
      } catch (apiErr) {
        toast.error(apiErr?.response?.data?.message || 'Error creating order or submitting payment')
      }
    } catch (err) {
      toast.error('Something went wrong submitting your payment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const validItems = items.filter((i) => i && i.product)
  if (validItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-32 text-center">
        <div className="w-20 h-20 rounded-full bg-brand-smoke flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={28} className="text-black/30" />
        </div>
        <h1 className="text-2xl font-extrabold mb-3">Your cart is empty</h1>
        <p className="text-black/50 mb-8">Add items to your cart before proceeding to payment.</p>
        <Link to="/shop" className="inline-block bg-brand-black text-brand-yellow font-bold px-7 py-3.5 rounded-full">
          Browse Posters
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-5 md:px-8 py-10">
      <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Payment</h1>
      <p className="text-black/50 mb-8">Pay via UPI, then submit your transaction details below for verification.</p>

      <div className="grid md:grid-cols-2 gap-10">
        {/* LEFT: QR */}
        <div className="bg-brand-smoke rounded-xl3 p-8 text-center">
          <div className="w-56 h-56 bg-white rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-soft overflow-hidden p-2">
            {settings?.upiQr?.url ? (
              <img src={settings.upiQr.url} alt="UPI QR Code" className="w-full h-full object-contain" />
            ) : (
              <div className="grid grid-cols-6 gap-1 p-4">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div key={i} className={`w-5 h-5 ${(i * 7) % 3 === 0 ? 'bg-black' : 'bg-transparent'}`} />
                ))}
              </div>
            )}
          </div>
          <p className="font-bold text-lg mb-1">₹{total}</p>
          <p className="text-sm text-black/50 mb-5">Scan with any UPI app</p>
          <div className="bg-white rounded-xl p-4 text-left space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-black/50">Business</span>
              <span className="font-semibold">{settings?.businessName || 'WallSticks'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black/50">Owner</span>
              <span className="font-semibold">{settings?.ownerName || 'Admin'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-black/50">UPI ID</span>
              <button onClick={copyUpi} className="font-semibold flex items-center gap-1.5">
                {settings?.upiId || 'wallsticks@upi'} {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            value={form.name}
            onChange={update('name')}
            placeholder="Full name"
            className="w-full px-4 py-3.5 rounded-xl bg-brand-smoke border border-transparent focus:border-brand-yellow outline-none text-sm"
          />
          <input
            required
            value={form.phone}
            onChange={update('phone')}
            placeholder="Phone number"
            className="w-full px-4 py-3.5 rounded-xl bg-brand-smoke border border-transparent focus:border-brand-yellow outline-none text-sm"
          />
          <input
            required
            value={form.transactionId}
            onChange={update('transactionId')}
            placeholder="UPI transaction / reference ID"
            className="w-full px-4 py-3.5 rounded-xl bg-brand-smoke border border-transparent focus:border-brand-yellow outline-none text-sm"
          />

          <div
            onClick={() => fileInput.current.click()}
            className="border-2 border-dashed border-black/15 hover:border-brand-yellow rounded-xl2 p-6 text-center cursor-pointer bg-brand-smoke"
          >
            {screenshot ? (
              <img src={screenshot} alt="Payment screenshot" className="max-h-40 mx-auto rounded-lg" />
            ) : (
              <>
                <Upload size={20} className="mx-auto mb-2 text-brand-gold" />
                <p className="text-sm font-medium">Upload payment screenshot</p>
              </>
            )}
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = (ev) => setScreenshot(ev.target.result)
                reader.readAsDataURL(file)
              }}
            />
          </div>

          <textarea
            value={form.notes}
            onChange={update('notes')}
            placeholder="Notes (optional)"
            rows={3}
            className="w-full px-4 py-3.5 rounded-xl bg-brand-smoke border border-transparent focus:border-brand-yellow outline-none text-sm resize-none"
          />

          <button
            disabled={submitting}
            type="submit"
            className="w-full bg-brand-black text-brand-yellow font-bold py-4 rounded-full hover:shadow-glow transition-shadow disabled:opacity-60"
          >
            {submitting ? 'Submitting...' : 'Submit Payment'}
          </button>
          <p className="text-xs text-black/40 text-center">
            Your order status will show "Payment Verification Pending" until our team confirms receipt — usually within a few hours.
          </p>
        </form>
      </div>
    </div>
  )
}
