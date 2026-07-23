import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import AdminLayout from '../../components/AdminLayout'
import { settings as mockSettings } from '../../data/mockData'
import api from '../../lib/api'

function Field({ label, ...props }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-black/50 mb-1.5">{label}</label>
      <input {...props} className="w-full px-4 py-3 rounded-xl bg-brand-smoke text-sm outline-none focus:ring-2 focus:ring-brand-yellow" />
    </div>
  )
}

export default function AdminSettings() {
  const [form, setForm] = useState(mockSettings)
  const [isLive, setIsLive] = useState(false)
  const [saving, setSaving] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    api.get('/settings')
      .then(({ data }) => { setForm(data); setIsLive(true) })
      .catch(() => { setForm(mockSettings); setIsLive(false) })
  }, [])

  const save = async (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      courierCharge: Number(form.courierCharge || 0),
      gstPercent: Number(form.gstPercent || 0)
    }
    if (!isLive) return toast.success('Settings saved (local demo mode — connect the backend to persist)')
    setSaving(true)
    try {
      await api.put('/settings', payload)
      toast.success('Settings saved')
    } catch {
      toast.error('Could not save — check the backend connection')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout title="Settings">
      {!isLive && (
        <p className="text-xs text-black/40 mb-4">Editing demo settings — connect the backend (see README) to persist changes.</p>
      )}
      <form onSubmit={save} className="max-w-2xl space-y-8">
        <div className="bg-white rounded-xl2 p-6 shadow-soft space-y-4">
          <h3 className="font-bold mb-1">Business Details</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Business Name" value={form.businessName || ''} onChange={set('businessName')} />
            <Field label="Owner Name" value={form.ownerName || ''} onChange={set('ownerName')} />
            <Field label="Phone" value={form.phone || ''} onChange={set('phone')} />
            <Field label="Email" value={form.email || ''} onChange={set('email')} />
            <Field label="Address" value={form.address || ''} onChange={set('address')} />
            <Field label="Business Hours" value={form.businessHours || ''} onChange={set('businessHours')} />
          </div>
        </div>

        <div className="bg-white rounded-xl2 p-6 shadow-soft space-y-4">
          <h3 className="font-bold mb-1">Payments</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="UPI ID" value={form.upiId || ''} onChange={set('upiId')} />
            <Field label="Courier Charge (₹)" type="number" value={form.courierCharge || 0} onChange={set('courierCharge')} />
            <Field label="GST (%)" type="number" value={form.gstPercent || 0} onChange={set('gstPercent')} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-black/50 mb-1.5">UPI QR Code</label>
            <div className="w-32 h-32 bg-brand-smoke rounded-xl flex items-center justify-center text-xs text-black/40 cursor-pointer hover:bg-black/5">Upload QR</div>
          </div>
        </div>

        <div className="bg-white rounded-xl2 p-6 shadow-soft space-y-4">
          <h3 className="font-bold mb-1">Pickup & Social</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Pickup Address" value={form.pickupAddress || ''} onChange={set('pickupAddress')} />
            <Field label="Pickup Time" value={form.pickupTime || ''} onChange={set('pickupTime')} />
            <Field label="Instagram Handle" value={form.instagram || ''} onChange={set('instagram')} />
            <Field label="WhatsApp Channel Link" value={form.whatsappChannelUrl || form.whatsapp || ''} onChange={set('whatsappChannelUrl')} />
          </div>
        </div>

        <button disabled={saving} className="bg-brand-black text-brand-yellow font-bold px-8 py-3.5 rounded-full disabled:opacity-60">
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </AdminLayout>
  )
}
