import { useParams, Link } from 'react-router-dom'
import { Clock3, MessageCircle, Receipt, ArrowLeft } from 'lucide-react'
import { useSettings } from '../hooks/useSettings'

export default function OrderSuccess() {
  const { orderId } = useParams()
  const { settings } = useSettings()

  const eta = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })

  const whatsappUrl = settings?.whatsappChannelUrl || `https://wa.me/${(settings?.phone || '8870558436').replace(/\D/g, '')}`

  return (
    <div className="max-w-lg mx-auto px-5 py-24 text-center">
      <div className="w-20 h-20 rounded-full bg-brand-yellow/20 flex items-center justify-center mx-auto mb-6">
        <Clock3 size={32} className="text-brand-gold" />
      </div>
      <h1 className="text-2xl md:text-3xl font-extrabold mb-3">Payment Verification Pending</h1>
      <p className="text-black/55 text-sm mb-8 leading-relaxed">
        We've received your order and payment screenshot for order <span className="font-extrabold text-brand-black">#{orderId || 'N/A'}</span>.
        Our team verifies each payment manually — you'll receive an order status update shortly.
      </p>

      <div className="bg-brand-smoke rounded-xl2 p-6 text-left space-y-3 mb-8 border border-black/5 shadow-soft">
        <div className="flex justify-between text-sm">
          <span className="text-black/50">Order Number</span>
          <span className="font-extrabold text-brand-black">#{orderId || 'N/A'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-black/50">Payment Status</span>
          <span className="font-extrabold text-amber-600 bg-amber-100 px-2.5 py-0.5 rounded-full text-xs">
            Verification Pending
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-black/50">Estimated Delivery</span>
          <span className="font-semibold text-brand-black">{eta}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-full text-sm transition-colors shadow-md"
          >
            <MessageCircle size={18} /> Join WhatsApp Channel / Contact Support
          </a>
        )}

        {orderId && (
          <Link
            to={`/receipt/${orderId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 font-bold text-sm border-2 border-black/10 hover:border-brand-black rounded-full py-3.5 transition-colors"
          >
            <Receipt size={16} /> View & Print Receipt
          </Link>
        )}

        <Link
          to="/"
          className="inline-flex items-center justify-center gap-1.5 font-bold text-xs text-black/50 hover:text-black mt-2 transition-colors"
        >
          <ArrowLeft size={14} /> Return to Storefront
        </Link>
      </div>
    </div>
  )
}
