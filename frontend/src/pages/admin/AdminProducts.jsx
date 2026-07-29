import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Star, X, Sparkles, Check, Upload, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminLayout from '../../components/AdminLayout'
import api from '../../lib/api'
import { imgSrc } from '../../lib/imageUrl'
import ImageCropperModal from '../../components/ImageCropperModal'

function ProductModal({ product, onClose, onSave }) {
  const [name, setName] = useState(product?.name || '')
  const featured = false
  const [bestSeller, setBestSeller] = useState(!!product?.bestSeller)
  const [trending, setTrending] = useState(!!product?.trending)
  const [imagePreview, setImagePreview] = useState(
    product?.images?.[0] ? imgSrc(product.images[0]) : ''
  )
  const [imageFile, setImageFile] = useState(null)
  const [pendingFile, setPendingFile] = useState(null)
  const [saving, setSaving] = useState(false)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) return toast.error('Please upload an image file')
      setPendingFile(file)
    }
  }

  const handleCropped = (croppedFile, croppedPreviewUrl) => {
    setPendingFile(null)
    setImageFile(croppedFile)
    setImagePreview(croppedPreviewUrl)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return toast.error('Please enter a poster name')
    if (!imagePreview && !imageFile) return toast.error('Please upload a poster image file')

    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('name', name.trim())
      formData.append('bestSeller', bestSeller)
      formData.append('trending', trending)
      formData.append('featured', featured)
      formData.append('price', product?.price || 399)

      if (imageFile) {
        formData.append('images', imageFile, 'poster.png')
      } else if (product?.images?.[0]) {
        formData.append('images', JSON.stringify(product.images[0]))
      }

      await onSave(formData, product?._id)
      onClose()
    } catch (err) {
      toast.error('Failed to save poster')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-card max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-black/10">
            <div>
              <h3 className="font-extrabold text-xl text-brand-black">
                {product ? 'Edit Poster' : 'Add New Poster'}
              </h3>
              <p className="text-xs text-black/50 mt-0.5">Upload poster image and set poster name</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-brand-smoke transition-colors"><X size={20} /></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* POSTER NAME */}
            <div>
              <label className="block text-xs font-bold text-black/70 mb-1.5 uppercase tracking-wider">Poster Name *</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Midnight Skyline"
                className="w-full px-4 py-3 rounded-2xl bg-brand-smoke border border-black/5 text-sm font-medium outline-none focus:border-brand-black transition-colors"
              />
            </div>

            {/* FILE UPLOAD FOR POSTER IMAGE */}
            <div>
              <label className="block text-xs font-bold text-black/70 mb-1.5 uppercase tracking-wider">Upload Poster Image *</label>
              <div className="relative border-2 border-dashed border-black/15 hover:border-brand-black rounded-2xl p-4 transition-colors text-center bg-brand-smoke/50 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />
                {imagePreview ? (
                  <div className="flex items-center gap-3">
                    <img src={imagePreview} alt="Preview" className="w-14 h-18 object-cover rounded-xl border border-black/10 shrink-0" />
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-xs font-bold text-brand-black truncate">Image selected</p>
                      <p className="text-[11px] text-brand-gold font-semibold mt-0.5">Click to change file</p>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-brand-yellow/20 text-brand-gold flex items-center justify-center">
                      <Upload size={18} />
                    </div>
                    <p className="text-xs font-bold text-brand-black">Click to upload poster image file</p>
                    <p className="text-[11px] text-black/40">PNG, JPG, WEBP formats supported</p>
                  </div>
                )}
              </div>
            </div>

            {/* BADGES */}
            <div>
              <label className="block text-xs font-bold text-black/70 mb-2 uppercase tracking-wider">Catalog Badges</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Best Seller', value: bestSeller, setter: setBestSeller },
                  { label: 'Trending', value: trending, setter: setTrending },
                ].map((b) => (
                  <button
                    type="button"
                    key={b.label}
                    onClick={() => b.setter(!b.value)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border-2 transition-all flex items-center justify-center gap-1.5 ${
                      b.value
                        ? 'bg-brand-black text-brand-yellow border-brand-black shadow-sm'
                        : 'bg-white border-black/10 text-black/60 hover:border-black/30'
                    }`}
                  >
                    {b.value && <Check size={13} />}
                    <span>{b.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full mt-6 bg-brand-black text-brand-yellow font-extrabold py-4 rounded-2xl hover:shadow-glow transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2"
            >
              <Sparkles size={16} /> {saving ? 'Saving...' : product ? 'Update Poster' : 'Publish Poster'}
            </button>
          </form>
        </div>
      </div>

      {pendingFile && (
        <ImageCropperModal
          file={pendingFile}
          onClose={() => setPendingFile(null)}
          onCropped={handleCropped}
        />
      )}
    </>
  )
}

export default function AdminProducts() {
  const [list, setList] = useState([])
  const [modal, setModal] = useState(null)

  const fetchProducts = () => {
    api.get('/products')
      .then(({ data }) => {
        const prodData = data.products || data
        setList(Array.isArray(prodData) ? prodData : [])
      })
      .catch(() => {
        setList([])
      })
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const save = async (formData, id) => {
    try {
      if (id) {
        const { data } = await api.put(`/products/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        setList((l) => l.map((p) => (p._id === data._id ? data : p)))
        toast.success('Poster updated!')
      } else {
        const { data } = await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        setList((l) => [data, ...l])
        toast.success('Poster published!')
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not save poster')
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Are you sure you want to remove this poster?')) return
    try {
      await api.delete(`/products/${id}`)
      setList((l) => l.filter((p) => p._id !== id))
      toast.success('Poster removed')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not delete poster')
    }
  }

  return (
    <AdminLayout title="Poster Catalog">
      {/* HEADER & ACTION */}
      <div className="flex items-center justify-between gap-4 mb-6 bg-white p-5 rounded-2xl shadow-soft border border-black/5">
        <div>
          <h2 className="font-extrabold text-lg text-brand-black">Posters ({list.length})</h2>
          <p className="text-xs text-black/50">Manage poster artwork catalog</p>
        </div>

        <button
          onClick={() => setModal('new')}
          className="bg-brand-black text-brand-yellow font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 hover:shadow-md transition-all shrink-0"
        >
          <Plus size={16} /> Add New Poster
        </button>
      </div>

      {/* POSTERS TABLE */}
      <div className="bg-white rounded-2xl shadow-soft overflow-hidden border border-black/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/10 text-[11px] uppercase tracking-wider font-extrabold text-black/45 bg-brand-smoke/40">
                <th className="py-4 px-4">Poster</th>
                <th className="py-4 px-4">Rating</th>
                <th className="py-4 px-4">Badges</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 text-xs font-medium">
              {list.map((p) => (
                <tr key={p._id} className="hover:bg-brand-smoke/40 transition-colors">
                  {/* POSTER (IMAGE + NAME) */}
                  <td className="py-3.5 px-4 flex items-center gap-3.5">
                    <img
                      src={imgSrc(p.images?.[0])}
                      className="w-10 h-13 object-cover rounded-xl border border-black/10 shadow-sm shrink-0"
                      alt=""
                    />
                    <span className="font-extrabold text-brand-black text-sm">{p.name}</span>
                  </td>

                  {/* RATING */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full text-[11px]">
                      <Star size={13} fill="#FFD000" stroke="#FFD000" /> {p.rating || 5.0}
                    </span>
                  </td>

                  {/* BADGES */}
                  <td className="py-3.5 px-4">
                    <div className="flex gap-1.5 flex-wrap">
                      {p.bestSeller && <span className="text-[10px] bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-extrabold">Best Seller</span>}
                      {p.trending && <span className="text-[10px] bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full font-extrabold">Trending</span>}
                    </div>
                  </td>

                  {/* ACTIONS */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => setModal(p)}
                        className="p-2 rounded-xl hover:bg-brand-smoke text-black/70 hover:text-brand-black transition-colors"
                        title="Edit Poster"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => remove(p._id)}
                        className="p-2 rounded-xl hover:bg-red-50 text-red-500 transition-colors"
                        title="Delete Poster"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <ProductModal
          product={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={save}
        />
      )}
    </AdminLayout>
  )
}
