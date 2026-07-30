import { useEffect, useState } from 'react'
import { Sparkles, Upload, Check, Store, ShieldCheck, CreditCard, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminLayout from '../../components/AdminLayout'
import api from '../../lib/api'
import { imgSrc } from '../../lib/imageUrl'

function Field({ label, ...props }) {
  return (
    <div>
      <label className="block text-xs font-bold text-black/70 mb-1.5 uppercase tracking-wider">{label}</label>
      <input
        {...props}
        className="w-full px-4 py-3 rounded-2xl bg-brand-smoke border border-black/5 text-sm font-medium outline-none focus:border-brand-black transition-colors"
      />
    </div>
  )
}

const defaultFormState = {
  businessName: 'WallSticks',
  ownerName: 'Palani Kumar',
  phone: '+91 88705 58436',
  whatsapp: '+91 88705 58436',
  email: 'wallsticks0319@gmail.com',
  instagram: '@wall_sticks_official',
  address: 'Perundurai, Erode, Tamil Nadu',
  upiId: 'wallsticks@okhdfcbank',
  courierCharge: 79,
  gstPercent: 0,
  pickupAddress: 'Perundurai, Erode, Tamil Nadu',
}

export default function AdminSettings() {
  const [form, setForm] = useState(defaultFormState)
  const [qrPreview, setQrPreview] = useState('')
  const [qrFile, setQrFile] = useState(null)
  const [saving, setSaving] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    api.get('/settings')
      .then(({ data }) => {
        if (data && typeof data === 'object') {
          setForm((prev) => ({
            ...prev,
            ...data,
          }))
          if (data.upiQr?.url) {
            setQrPreview(imgSrc(data.upiQr))
          }
        }
      })
      .catch(() => {})
  }, [])

  const handleQrChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setQrFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setQrPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)

    const payload = {
      ...form,
      courierCharge: Number(form.courierCharge || 0),
      gstPercent: Number(form.gstPercent || 0),
    }

    delete payload.businessHours

    try {
      if (qrFile) {
        const formData = new FormData()
        Object.keys(payload).forEach((key) => {
          if (typeof payload[key] !== 'object') {
            formData.append(key, payload[key])
          }
        })
        formData.append('upiQr', qrFile)
        await api.put('/settings', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      } else {
        await api.put('/settings', payload)
      }
      toast.success('Store settings saved to database!')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout title="Storefront & Payment Settings">
      <form onSubmit={save} className="max-w-3xl space-y-6">
        {/* BUSINESS DETAILS */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-soft border border-black/5 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-black/10">
            <div className="w-10 h-10 rounded-xl bg-brand-yellow/20 text-brand-gold flex items-center justify-center">
              <Store size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-brand-black">Business Info</h3>
              <p className="text-xs text-black/50">Owner and official contact details</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 pt-1">
            <Field label="Business Name" value={form.businessName || 'WallSticks'} onChange={set('businessName')} />
            <Field label="Owner Name" value={form.ownerName || 'Palani Kumar'} onChange={set('ownerName')} />
            <Field label="Phone Number" value={form.phone || '+91 88705 58436'} onChange={set('phone')} />
            <Field label="WhatsApp Number" value={form.whatsapp || '+91 88705 58436'} onChange={set('whatsapp')} />
            <Field label="Email Address" type="email" value={form.email || 'wallsticks0319@gmail.com'} onChange={set('email')} />
            <Field label="Instagram Handle" value={form.instagram || '@wall_sticks_official'} onChange={set('instagram')} />
          </div>

          <div>
            <Field label="Location / Store Address" value={form.address || 'Perundurai, Erode, Tamil Nadu'} onChange={set('address')} />
          </div>
        </div>

        {/* PAYMENTS & UPI */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-soft border border-black/5 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-black/10">
            <div className="w-10 h-10 rounded-xl bg-brand-yellow/20 text-brand-gold flex items-center justify-center">
              <CreditCard size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-brand-black">Payment & Shipping Pricing</h3>
              <p className="text-xs text-black/50">UPI ID, QR Code image, and courier delivery fee</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 pt-1">
            <Field label="UPI ID" value={form.upiId || 'wallsticks@okhdfcbank'} onChange={set('upiId')} />
            <Field label="Courier Delivery Charge (₹)" type="number" value={form.courierCharge ?? 79} onChange={set('courierCharge')} />
            <Field label="GST (%)" type="number" value={form.gstPercent ?? 0} onChange={set('gstPercent')} />
          </div>

          {/* UPI QR CODE UPLOAD */}
          <div>
            <label className="block text-xs font-bold text-black/70 mb-1.5 uppercase tracking-wider">UPI QR Code Image</label>
            <div className="relative border-2 border-dashed border-black/15 hover:border-brand-black rounded-2xl p-4 transition-colors bg-brand-smoke/50 cursor-pointer max-w-sm">
              <input
                type="file"
                accept="image/*"
                onChange={handleQrChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              />
              {qrPreview ? (
                <div className="flex items-center gap-3">
                  <img src={qrPreview} alt="UPI QR" className="w-16 h-16 object-contain rounded-xl border border-black/10 bg-white p-1" />
                  <div>
                    <p className="text-xs font-bold text-brand-black">QR Code Selected</p>
                    <p className="text-[11px] text-brand-gold font-semibold mt-0.5">Click to change QR image</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-brand-yellow/20 text-brand-gold flex items-center justify-center">
                    <Upload size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-brand-black">Click to upload UPI QR image</p>
                    <p className="text-[11px] text-black/40">Customers scan this to make UPI payment</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PICKUP LOCATION */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-soft border border-black/5 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-black/10">
            <div className="w-10 h-10 rounded-xl bg-brand-yellow/20 text-brand-gold flex items-center justify-center">
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-brand-black">Store Pickup Address</h3>
              <p className="text-xs text-black/50">Address shown for customers choosing local pickup</p>
            </div>
          </div>

          <Field label="Pickup Location Address" value={form.pickupAddress || 'Perundurai, Erode, Tamil Nadu'} onChange={set('pickupAddress')} />
        </div>

        {/* SAVE BUTTON */}
        <button
          type="submit"
          disabled={saving}
          className="bg-brand-black text-brand-yellow font-extrabold px-8 py-4 rounded-2xl hover:shadow-glow transition-all disabled:opacity-50 text-sm flex items-center gap-2"
        >
          <Sparkles size={16} /> {saving ? 'Saving Settings...' : 'Save All Settings'}
        </button>
      </form>
    </AdminLayout>
  )
}
