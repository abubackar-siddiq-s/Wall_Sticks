import { useParams, Link } from 'react-router-dom'
import { Clock3, MessageCircle, Receipt } from 'lucide-react'
import { API_BASE_URL } from '../lib/api'

export default function OrderSuccess() {
  const { orderId } = useParams()
  const eta = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

  return (
    <div className="max-w-lg mx-auto px-5 py-24 text-center">
      <div className="w-20 h-20 rounded-full bg-brand-yellow/20 flex items-center justify-center mx-auto mb-6">
        <Clock3 size={30} className="text-brand-gold" />
      </div>
      <h1 className="text-2xl md:text-3xl font-extrabold mb-3">Payment Verification Pending</h1>
      <p className="text-black/55 mb-8">
        We've received your payment details for order <span className="font-bold text-black">#{orderId}</span>.
        Our team verifies each payment manually — you'll get a confirmation shortly.
      </p>

      <div className="bg-brand-smoke rounded-xl2 p-6 text-left space-y-3 mb-8">
        <div className="flex justify-between text-sm"><span className="text-black/50">Order Number</span><span className="font-semibold">#{orderId}</span></div>
        <div className="flex justify-between text-sm"><span className="text-black/50">Status</span><span className="font-semibold text-amber-600">Verification Pending</span></div>
        <div className="flex justify-between text-sm"><span className="text-black/50">Estimated Delivery</span><span className="font-semibold">{eta}</span></div>
      </div>

      <div className="flex flex-col gap-3">
        <a href="#" className="flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-3.5 rounded-full">
          <MessageCircle size={18} /> Join WhatsApp Channel
        </a>
        <a
          href={`${API_BASE_URL}/orders/${orderId}/receipt`}
          target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 font-semibold text-sm border-2 border-black/10 hover:border-brand-black rounded-full py-3 transition-colors"
        >
          <Receipt size={15} /> View Receipt
        </a>
        <Link to="/" className="font-semibold text-sm underline">Back to Home</Link>
      </div>
    </div>
  )
}
