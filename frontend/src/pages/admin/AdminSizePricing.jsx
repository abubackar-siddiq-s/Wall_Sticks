import { useEffect, useState } from 'react'
import { Tag, Sparkles, Plus, Trash2, X, Info } from 'lucide-react'
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

const defaultDescriptions = {
  A5: 'Small Compact Desk/Shelf Poster (5.8 x 8.3 in)',
  A4: 'Standard Frame Document Poster (8.3 x 11.7 in)',
  A3: 'Medium Wall Accent Poster (11.7 x 16.5 in)',
  '12x18': 'Large Classic Wall Frame Poster (12 x 18 in)',
  '18x24': 'Extra Large Gallery Wall Poster (18 x 24 in)',
  '24x36': 'Masterpiece Giant Wall Art Poster (24 x 36 in)',
}

export default function AdminSizePricing() {
  const [sizePrices, setSizePrices] = useState(defaultPrices)
  const [descriptions, setDescriptions] = useState(defaultDescriptions)
  const [saving, setSaving] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  // New size form state
  const [newSizeKey, setNewSizeKey] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newDesc, setNewDesc] = useState('')

  useEffect(() => {
    api.get('/settings')
      .then(({ data }) => {
        if (data?.sizePrices && typeof data.sizePrices === 'object' && Object.keys(data.sizePrices).length > 0) {
          setSizePrices(data.sizePrices)
        } else {
          setSizePrices(defaultPrices)
        }
        if (data?.sizeDescriptions && typeof data.sizeDescriptions === 'object' && Object.keys(data.sizeDescriptions).length > 0) {
          setDescriptions(data.sizeDescriptions)
        } else {
          setDescriptions(defaultDescriptions)
        }
      })
      .catch(() => {})
  }, [])

  const handlePriceChange = (size, value) => {
    const val = Number(value)
    setSizePrices((prev) => ({
      ...prev,
      [size]: isNaN(val) ? 0 : val,
    }))
  }

  const handleDescChange = (size, value) => {
    setDescriptions((prev) => ({
      ...prev,
      [size]: value,
    }))
  }

  const handleDeleteSize = (sizeKey) => {
    if (Object.keys(sizePrices).length <= 1) {
      return toast.error('At least one size variant must remain configured.')
    }
    setSizePrices((prev) => {
      const next = { ...prev }
      delete next[sizeKey]
      return next
    })
    setDescriptions((prev) => {
      const next = { ...prev }
      delete next[sizeKey]
      return next
    })
    toast.success(`Removed size "${sizeKey}". Click 'Save Size Prices' to persist.`)
  }

  const handleAddSize = (e) => {
    e.preventDefault()
    const cleanKey = newSizeKey.trim().toUpperCase()
    if (!cleanKey) return toast.error('Size identifier is required (e.g. A2, 16x20)')

    if (sizePrices[cleanKey] !== undefined) {
      return toast.error(`Size "${cleanKey}" already exists in the pricing matrix.`)
    }

    const priceVal = Number(newPrice)
    if (isNaN(priceVal) || priceVal <= 0) {
      return toast.error('Please enter a valid price (greater than ₹0)')
    }

    setSizePrices((prev) => ({ ...prev, [cleanKey]: priceVal }))
    setDescriptions((prev) => ({ ...prev, [cleanKey]: newDesc.trim() || `${cleanKey} Poster Variant` }))

    setNewSizeKey('')
    setNewPrice('')
    setNewDesc('')
    setShowAddModal(false)
    toast.success(`Added size variant "${cleanKey}". Click 'Save Size Prices' to persist.`)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      await api.put('/settings', { sizePrices, sizeDescriptions: descriptions })
      window.dispatchEvent(new Event('settingsUpdated'))
      toast.success('Size pricing matrix & descriptions saved to database!')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not save size prices')
    } finally {
      setSaving(false)
    }
  }

  const sizeKeys = Object.keys(sizePrices)

  return (
    <AdminLayout title="Size Pricing Management">
      <div className="max-w-4xl space-y-6">
        {/* HEADER NOTICE & ADD BUTTON */}
        <div className="bg-white p-6 rounded-3xl shadow-soft border border-black/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-yellow/20 text-brand-gold flex items-center justify-center shrink-0">
              <Tag size={22} />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-brand-black">Poster Size Price Matrix</h2>
              <p className="text-xs text-black/55 mt-1 leading-relaxed max-w-xl">
                Configure prices and introduce custom sizes for posters. Customers can select from these sizes on the product page and custom poster builder.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-brand-black text-brand-yellow font-extrabold px-5 py-3 rounded-2xl text-xs hover:shadow-md transition-all shrink-0"
          >
            <Plus size={16} /> Add New Size
          </button>
        </div>

        {/* PRICING INPUT FORM */}
        <form onSubmit={handleSave} className="bg-white p-6 md:p-8 rounded-3xl shadow-soft border border-black/5 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-black/10">
            <h3 className="font-extrabold text-base text-brand-black">Active Size Variants</h3>
            <span className="text-xs font-bold text-black/40">{sizeKeys.length} Configured Sizes</span>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {sizeKeys.map((sizeKey) => (
              <div key={sizeKey} className="bg-brand-smoke/60 p-4 rounded-2xl border border-black/5 space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-lg text-brand-black">{sizeKey}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold bg-brand-yellow/20 text-brand-gold px-2.5 py-0.5 rounded-full">
                      Size
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteSize(sizeKey)}
                      className="p-1 rounded-lg text-black/30 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title={`Remove size ${sizeKey}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-black/50 uppercase tracking-wider mb-1">
                    Description / Dimensions
                  </label>
                  <input
                    type="text"
                    value={descriptions[sizeKey] || ''}
                    onChange={(e) => handleDescChange(sizeKey, e.target.value)}
                    placeholder={`${sizeKey} Poster Variant`}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-black/10 text-xs font-medium text-black/70 outline-none focus:border-brand-black transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-black/50 uppercase tracking-wider mb-1">
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

          <div className="pt-4 border-t border-black/10 flex justify-between items-center">
            <span className="text-xs text-black/40 font-medium">Click save after adding, editing or deleting sizes.</span>
            <button
              type="submit"
              disabled={saving}
              className="bg-brand-black text-brand-yellow font-extrabold px-8 py-4 rounded-2xl hover:shadow-glow transition-all text-sm flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles size={16} /> {saving ? 'Saving...' : 'Save Size Prices'}
            </button>
          </div>
        </form>

        {/* ADD NEW SIZE MODAL */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
            <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-card space-y-5" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center pb-3 border-b border-black/10">
                <div className="flex items-center gap-2">
                  <Tag size={18} className="text-brand-gold" />
                  <h3 className="font-extrabold text-lg text-brand-black">Introduce New Size</h3>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-full hover:bg-brand-smoke transition-colors">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddSize} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-black/70 mb-1">
                    Size Name / Identifier <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. A2, 16x20, 30x40"
                    value={newSizeKey}
                    onChange={(e) => setNewSizeKey(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-brand-smoke border border-black/10 focus:border-brand-black outline-none text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-black/70 mb-1">
                    Base Selling Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 599"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-brand-smoke border border-black/10 focus:border-brand-black outline-none text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-black/70 mb-1">
                    Description / Dimensions (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Exhibition Large Gallery Frame (16.5 x 23.4 in)"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-brand-smoke border border-black/10 focus:border-brand-black outline-none text-xs"
                  />
                </div>

                <div className="pt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 rounded-xl border border-black/10 font-bold text-xs hover:bg-brand-smoke transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-brand-black text-brand-yellow font-extrabold py-3 rounded-xl text-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus size={15} /> Add Size Variant
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
