import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Printer, ArrowLeft, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import api from '../lib/api'
import { useSettings } from '../hooks/useSettings'

export default function ReceiptPage() {
  const { orderNumber } = useParams()
  const { settings } = useSettings()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    api.get(`/orders/track/${orderNumber}`)
      .then(({ data }) => {
        setOrder(data)
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'Order not found')
      })
      .finally(() => setLoading(false))
  }, [orderNumber])

  const handlePrint = () => {
    window.focus()
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-5">
        <p className="text-black/50 font-semibold animate-pulse">Loading receipt...</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-5 text-center">
        <AlertCircle size={40} className="text-red-500 mb-3" />
        <h1 className="text-xl font-bold mb-2">Receipt Not Found</h1>
        <p className="text-black/50 text-sm mb-6">Could not load receipt for order #{orderNumber}.</p>
        <Link to="/" className="bg-brand-black text-brand-yellow px-6 py-2.5 rounded-full font-bold text-sm">
          Return to Home
        </Link>
      </div>
    )
  }

  const statusLabel = {
    payment_pending: 'Payment Verification Pending',
    verified: 'Payment Verified',
    rejected: 'Payment Rejected',
    printing: 'In Printing',
    packed: 'Packed',
    shipped: 'Shipped',
    delivered: 'Delivered',
  }[order.status] || order.status

  return (
    <div className="min-h-screen bg-neutral-100 py-8 px-4 sm:px-6 print:bg-white print:py-0 print:px-0">
      {/* ACTION BAR (HIDDEN WHEN PRINTING) */}
      <div className="max-w-2xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link to="/" className="text-sm font-semibold text-black/60 hover:text-black flex items-center gap-1.5">
          <ArrowLeft size={16} /> Back to Store
        </Link>
        <button
          type="button"
          onClick={handlePrint}
          className="bg-brand-black text-brand-yellow font-bold px-6 py-3 rounded-full text-sm shadow-md hover:shadow-lg flex items-center gap-2 transition-all cursor-pointer"
        >
          <Printer size={18} /> Print / Save PDF
        </button>
      </div>

      {/* PRINTABLE RECEIPT CARD */}
      <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-12 shadow-xl print:shadow-none print:rounded-none print:p-0 print:max-w-full">
        {/* HEADER */}
        <div className="flex justify-between items-start border-b-2 border-brand-yellow pb-6 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-brand-black">
              {settings.businessName || 'WallSticks'}
            </h1>
            <p className="text-xs text-black/50 mt-1">{settings.address || 'Erode, Tamil Nadu'}</p>
            <p className="text-xs text-black/50">{settings.phone || ''}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-black/40 font-semibold uppercase tracking-wider">Order Receipt</p>
            <p className="text-lg font-bold text-brand-black mt-0.5">#{order.orderNumber}</p>
            <span className="inline-block mt-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
              {statusLabel}
            </span>
          </div>
        </div>

        {/* BILLED TO & DATE */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8 text-sm">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-black/40 mb-1">Billed To</p>
            <p className="font-bold text-brand-black">{order.shipping?.name}</p>
            <p className="text-black/60 text-xs mt-0.5">{order.shipping?.phone}</p>
            {order.deliveryMethod === 'courier' ? (
              <p className="text-black/60 text-xs mt-0.5 max-w-xs leading-relaxed">
                {[order.shipping?.address, order.shipping?.city, order.shipping?.state, order.shipping?.pincode].filter(Boolean).join(', ')}
              </p>
            ) : (
              <p className="text-black/60 text-xs mt-0.5 font-semibold text-brand-gold">Store Pickup</p>
            )}
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-bold uppercase tracking-wider text-black/40 mb-1">Order Date</p>
            <p className="font-semibold text-brand-black">
              {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* ITEMS TABLE */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/10 text-xs text-black/40 uppercase tracking-wider">
                <th className="py-3 font-bold">Item & Details</th>
                <th className="py-3 font-bold text-center">Qty</th>
                <th className="py-3 font-bold text-right">Price</th>
                <th className="py-3 font-bold text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 text-sm">
              {order.items?.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3.5 pr-4">
                    <p className="font-semibold text-brand-black">
                      {item.name} {item.isCustom && <span className="text-xs font-normal text-black/40">(Custom Upload)</span>}
                    </p>
                    <p className="text-xs text-black/50 mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <span>Size: {item.size}</span>
                      {item.border && (
                        <>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1">
                            {item.borderColor && (
                              <span className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0 inline-block" style={{ backgroundColor: item.borderColor }} />
                            )}
                            <span className="font-semibold text-brand-black">{item.border}</span>
                          </span>
                        </>
                      )}
                    </p>
                  </td>
                  <td className="py-3.5 text-center font-medium">{item.quantity}</td>
                  <td className="py-3.5 text-right text-black/70">₹{item.price}</td>
                  <td className="py-3.5 text-right font-semibold text-brand-black">₹{item.price * item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PRICING BREAKDOWN */}
        <div className="border-t border-black/10 pt-4 max-w-xs ml-auto text-sm space-y-2 mb-10">
          <div className="flex justify-between text-black/60">
            <span>Subtotal</span>
            <span>₹{order.pricing?.subtotal ?? 0}</span>
          </div>
          {order.pricing?.discount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Discount</span>
              <span>-₹{order.pricing.discount}</span>
            </div>
          )}
          <div className="flex justify-between text-black/60">
            <span>{order.deliveryMethod === 'pickup' ? 'Pickup Fee' : 'Courier Charge'}</span>
            <span>₹{order.pricing?.courierCharge ?? 0}</span>
          </div>
          {order.pricing?.gst > 0 && (
            <div className="flex justify-between text-black/60">
              <span>GST</span>
              <span>₹{order.pricing.gst}</span>
            </div>
          )}
          <div className="flex justify-between font-extrabold text-base text-brand-black border-t border-black/15 pt-2 mt-2">
            <span>Grand Total</span>
            <span>₹{order.pricing?.total ?? 0}</span>
          </div>
        </div>

        {/* FOOTER */}
        <div className="border-t border-black/5 pt-6 text-center text-xs text-black/40">
          <p>Thank you for shopping with <strong className="text-black/60">{settings.businessName || 'WallSticks'}</strong>!</p>
          <p className="mt-1">For support or tracking inquiries: {settings.email || 'wallsticks0319@gmail.com'}</p>
        </div>
      </div>
    </div>
  )
}
