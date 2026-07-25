import { useEffect, useState } from 'react'
import { Tag, Sparkles, Check, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminLayout from '../../components/AdminLayout'
import api from '../../lib/api'

const defaultPrices = {
  A5: 259,
  A4: 319,
  A3: 399,
  '12x18': 499,
  '18x24': 699,
  '24x36': 997,
}

const sizeDescriptions = {
  A5: 'Small Compact Desk/Shelf Poster (5.8 x 8.3 in)',
  A4: 'Standard Frame Document Poster (8.3 x 11.7 in)',
  A3: 'Medium Wall Accent Poster (11.7 x 16.5 in)',
  '12x18': 'Large Classic Wall Frame Poster (12 x 18 in)',
  '18x24': 'Extra Large Gallery Wall Poster (18 x 24 in)',
  '24x36': 'Masterpiece Giant Wall Art Poster (24 x 36 in)',
}

export default function AdminSizePricing() {
  const [sizePrices, setSizePrices] = useState(defaultPrices)
  const [isLive, setIsLive] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/settings')
      .then(({ data }) => {
        if (data?.sizePrices && typeof data.sizePrices === 'object') {
          setSizePrices({ ...defaultPrices, ...data.sizePrices })
        } else {
          // Check localStorage as fallback
          const saved = localStorage.getItem('ws_size_prices')
          if (saved) {
            try { setSizePrices(JSON.parse(saved)) } catch {}
          }
        }
        setIsLive(true)
      })
      .catch(() => {
        const saved = localStorage.getItem('ws_size_prices')
        if (saved) {
          try { setSizePrices(JSON.parse(saved)) } catch {}
        }
        setIsLive(false)
      })
  }, [])

  const handlePriceChange = (size, value) => {
    const val = Number(value)
    setSizePrices((prev) => ({
      ...prev,
      [size]: isNaN(val) ? 0 : val,
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)

    // Save locally
    localStorage.setItem('ws_size_prices', JSON.stringify(sizePrices))

    if (!isLive) {
      setSaving(false)
      return toast.success('Size prices saved locally!')
    }

    try {
      await api.put('/settings', { sizePrices })
      toast.success('Size pricing saved to MongoDB Atlas!')
    } catch {
      toast.error('Saved locally. Could not connect to backend.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout title="Size Pricing Management">
      <div className="max-w-3xl space-y-6">
        {/* HEADER NOTICE */}
        <div className="bg-white p-6 rounded-3xl shadow-soft border border-black/5 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-yellow/20 text-brand-gold flex items-center justify-center shrink-0">
            <Tag size={22} />
          </div>
          <div>
            <h2 className="font-extrabold text-lg text-brand-black">Poster Size Price Matrix</h2>
            <p className="text-xs text-black/55 mt-1 leading-relaxed">
              Set the exact selling price for each poster size variant. When customers select a size on the poster detail page or checkout, the price automatically updates based on these rules.
            </p>
          </div>
        </div>

        {/* PRICING INPUT FORM */}
        <form onSubmit={handleSave} className="bg-white p-6 md:p-8 rounded-3xl shadow-soft border border-black/5 space-y-5">
          <h3 className="font-extrabold text-base text-brand-black pb-3 border-b border-black/10 flex items-center justify-between">
            <span>Size Price Rules</span>
            <span className="text-xs font-bold text-black/40">6 Size Variants</span>
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            {Object.keys(defaultPrices).map((sizeKey) => (
              <div key={sizeKey} className="bg-brand-smoke/60 p-4 rounded-2xl border border-black/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-base text-brand-black">{sizeKey}</span>
                  <span className="text-[11px] font-bold bg-brand-yellow/20 text-brand-gold px-2.5 py-0.5 rounded-full">
                    Size Variant
                  </span>
                </div>
                <p className="text-[11px] text-black/50 font-medium">{sizeDescriptions[sizeKey]}</p>

                <div className="pt-2">
                  <label className="block text-[11px] font-bold text-black/60 uppercase tracking-wider mb-1">
                    Price (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-extrabold text-sm text-black/50">₹</span>
                    <input
                      type="number"
                      min="1"
                      required
                      value={sizePrices[sizeKey] ?? 0}
                      onChange={(e) => handlePriceChange(sizeKey, e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white border border-black/10 text-sm font-extrabold text-brand-black outline-none focus:border-brand-black transition-colors"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-black/10 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-brand-black text-brand-yellow font-extrabold px-8 py-4 rounded-2xl hover:shadow-glow transition-all text-sm flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles size={16} /> {saving ? 'Saving...' : 'Save Size Prices'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
