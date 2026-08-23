import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Star, X, Sparkles, Check, Upload, Image as ImageIcon, ChevronUp, ChevronDown, GripVertical } from 'lucide-react'
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
  
  // Existing image objects from DB
  const [existingImages, setExistingImages] = useState(
    Array.isArray(product?.images) ? product.images : product?.images?.[0] ? [product.images[0]] : []
  )
  // Newly added image files [{ file, previewUrl }]
  const [newImageFiles, setNewImageFiles] = useState([])
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
    setNewImageFiles((prev) => [...prev, { file: croppedFile, previewUrl: croppedPreviewUrl }])
  }

  const removeExisting = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
  }

  const removeNewFile = (index) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const moveExistingUp = (index) => {
    if (index <= 0) return
    setExistingImages((prev) => {
      const arr = [...prev]
      const temp = arr[index]
      arr[index] = arr[index - 1]
      arr[index - 1] = temp
      return arr
    })
  }

  const moveExistingDown = (index) => {
    setExistingImages((prev) => {
      if (index >= prev.length - 1) return prev
      const arr = [...prev]
      const temp = arr[index]
      arr[index] = arr[index + 1]
      arr[index + 1] = temp
      return arr
    })
  }

  const moveNewUp = (index) => {
    if (index <= 0) return
    setNewImageFiles((prev) => {
      const arr = [...prev]
      const temp = arr[index]
      arr[index] = arr[index - 1]
      arr[index - 1] = temp
      return arr
    })
  }

  const moveNewDown = (index) => {
    setNewImageFiles((prev) => {
      if (index >= prev.length - 1) return prev
      const arr = [...prev]
      const temp = arr[index]
      arr[index] = arr[index + 1]
      arr[index + 1] = temp
      return arr
    })
  }

  const setAsPrimaryExisting = (index) => {
    setExistingImages((prev) => {
      const target = prev[index]
      const rest = prev.filter((_, i) => i !== index)
      return [target, ...rest]
    })
  }

  const setAsPrimaryNew = (index) => {
    setNewImageFiles((prev) => {
      const target = prev[index]
      const rest = prev.filter((_, i) => i !== index)
      return [target, ...rest]
    })
    setExistingImages([])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return toast.error('Please enter a poster name')
    if (existingImages.length === 0 && newImageFiles.length === 0) {
      return toast.error('Please upload at least one poster image')
    }

    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('name', name.trim())
      formData.append('bestSeller', bestSeller)
      formData.append('trending', trending)
      formData.append('featured', featured)
      formData.append('price', product?.price || 399)

      // Append existing images
      existingImages.forEach((img) => {
        formData.append('existingImages', JSON.stringify(img))
      })

      // Append newly uploaded image files
      newImageFiles.forEach((item) => {
        formData.append('images', item.file, 'poster.png')
      })

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
        <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-card max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-black/10">
            <div>
              <h3 className="font-extrabold text-xl text-brand-black">
                {product ? 'Edit Poster' : 'Add New Poster'}
              </h3>
              <p className="text-xs text-black/50 mt-0.5">Upload poster images and manage side pictures</p>
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

            {/* MULTI-IMAGE UPLOADER & THUMBNAIL GALLERY */}
            <div>
              <label className="block text-xs font-bold text-black/70 mb-1.5 uppercase tracking-wider">
                Poster Images ({existingImages.length + newImageFiles.length} Selected)
              </label>

              {/* Upload trigger button */}
              <div className="relative border-2 border-dashed border-black/15 hover:border-brand-black rounded-2xl p-4 transition-colors text-center bg-brand-smoke/50 cursor-pointer mb-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-8 h-8 rounded-full bg-brand-yellow/20 text-brand-gold flex items-center justify-center">
                    <Upload size={16} />
                  </div>
                  <p className="text-xs font-bold text-brand-black">Click to add a picture</p>
                  <p className="text-[11px] text-black/40">Upload main cover or side pictures (PNG, JPG, WEBP)</p>
                </div>
              </div>

              {/* Image Thumbnails List */}
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {/* Existing Images */}
                {existingImages.map((img, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-brand-smoke/60 rounded-xl border border-black/5">
                    {/* Sort buttons */}
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveExistingUp(idx)}
                        className="p-1 rounded text-black/40 hover:text-black hover:bg-black/5 disabled:opacity-20 transition-all"
                        aria-label="Move up"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        disabled={idx === existingImages.length - 1}
                        onClick={() => moveExistingDown(idx)}
                        className="p-1 rounded text-black/40 hover:text-black hover:bg-black/5 disabled:opacity-20 transition-all"
                        aria-label="Move down"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>

                    <div className="w-[42px] h-[56px] rounded overflow-hidden border border-black/10 shrink-0 bg-white relative" style={{ aspectRatio: '3 / 4' }}>
                      <img src={imgSrc(img)} alt="Thumbnail" className="w-full h-full object-contain" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold truncate">Photo #{idx + 1}</span>
                        {idx === 0 && (
                          <span className="text-[10px] bg-brand-yellow text-brand-black font-extrabold px-2 py-0.5 rounded-full">
                            Main Cover
                          </span>
                        )}
                      </div>
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => setAsPrimaryExisting(idx)}
                          className="text-[11px] text-brand-gold font-bold hover:underline mt-0.5"
                        >
                          Set Main Cover
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeExisting(idx)}
                      className="p-1.5 text-black/40 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                      aria-label="Remove image"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                {/* Newly Added Image Files */}
                {newImageFiles.map((item, idx) => {
                  const globalIdx = existingImages.length + idx
                  return (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-brand-smoke/60 rounded-xl border border-black/5">
                      {/* Sort buttons */}
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveNewUp(idx)}
                          className="p-1 rounded text-black/40 hover:text-black hover:bg-black/5 disabled:opacity-20 transition-all"
                          aria-label="Move up"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          type="button"
                          disabled={idx === newImageFiles.length - 1}
                          onClick={() => moveNewDown(idx)}
                          className="p-1 rounded text-black/40 hover:text-black hover:bg-black/5 disabled:opacity-20 transition-all"
                          aria-label="Move down"
                        >
                          <ChevronDown size={14} />
                        </button>
                      </div>

                      <div className="w-[42px] h-[56px] rounded overflow-hidden border border-black/10 shrink-0 bg-white relative" style={{ aspectRatio: '3 / 4' }}>
                        <img src={item.previewUrl} alt="Thumbnail" className="w-full h-full object-contain" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold truncate">New Photo #{idx + 1}</span>
                          {globalIdx === 0 && (
                            <span className="text-[10px] bg-brand-yellow text-brand-black font-extrabold px-2 py-0.5 rounded-full">
                              Main Cover
                            </span>
                          )}
                        </div>
                        {globalIdx !== 0 && (
                          <button
                            type="button"
                            onClick={() => setAsPrimaryNew(idx)}
                            className="text-[11px] text-brand-gold font-bold hover:underline mt-0.5"
                          >
                            Set Main Cover
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeNewFile(idx)}
                        className="p-1.5 text-black/40 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                        aria-label="Remove image"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )
                })}
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
  const [dragIndex, setDragIndex] = useState(null)
  const [savingOrder, setSavingOrder] = useState(false)

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

  const onDragStart = (i) => () => setDragIndex(i)
  const onDragOver = (i) => (e) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === i) return
    setList((prev) => {
      const next = [...prev]
      const [moved] = next.splice(dragIndex, 1)
      next.splice(i, 0, moved)
      return next
    })
    setDragIndex(i)
  }
  const onDragEnd = () => setDragIndex(null)

  const saveOrder = async () => {
    if (list.length === 0) return
    setSavingOrder(true)
    try {
      await api.put('/products/reorder', {
        items: list.map((p, order) => ({ id: p._id, order })),
      })
      toast.success('Catalog poster order saved to database!')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not save poster order')
    } finally {
      setSavingOrder(false)
    }
  }

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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6 bg-white p-5 rounded-2xl shadow-soft border border-black/5">
        <div>
          <h2 className="font-extrabold text-lg text-brand-black">Posters ({list.length})</h2>
          <p className="text-xs text-black/50">Drag rows to reorder catalog display, then click Save Order</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setModal('new')}
            className="border-2 border-black/10 hover:border-brand-black text-brand-black font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-colors shrink-0"
          >
            <Plus size={16} /> Add New Poster
          </button>

          <button
            onClick={saveOrder}
            disabled={savingOrder}
            className="bg-brand-black text-brand-yellow font-extrabold px-5 py-2.5 rounded-xl text-xs hover:shadow-md transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50"
          >
            <Sparkles size={14} /> {savingOrder ? 'Saving...' : 'Save Order'}
          </button>
        </div>
      </div>

      {/* POSTERS TABLE */}
      <div className="bg-white rounded-2xl shadow-soft overflow-hidden border border-black/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/10 text-[11px] uppercase tracking-wider font-extrabold text-black/45 bg-brand-smoke/40">
                <th className="py-4 px-4 w-12 text-center">#</th>
                <th className="py-4 px-4">Poster</th>
                <th className="py-4 px-4">Rating</th>
                <th className="py-4 px-4">Badges</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 text-xs font-medium">
              {list.map((p, idx) => (
                <tr
                  key={p._id}
                  draggable
                  onDragStart={onDragStart(idx)}
                  onDragOver={onDragOver(idx)}
                  onDragEnd={onDragEnd}
                  className={`hover:bg-brand-smoke/40 transition-colors cursor-grab active:cursor-grabbing ${
                    dragIndex === idx ? 'opacity-40 bg-brand-smoke' : ''
                  }`}
                >
                  {/* DRAG HANDLE & NUMBER */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-black/30">
                      <GripVertical size={16} className="shrink-0" />
                      <span className="font-extrabold text-[11px] text-black/60">{idx + 1}</span>
                    </div>
                  </td>

                  {/* POSTER (IMAGE + NAME) */}
                  <td className="py-3.5 px-4 flex items-center gap-3.5">
                    <img
                      src={imgSrc(p.images?.[0])}
                      className="w-10 h-13 object-contain bg-white rounded-xl border border-black/10 shadow-sm shrink-0"
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
