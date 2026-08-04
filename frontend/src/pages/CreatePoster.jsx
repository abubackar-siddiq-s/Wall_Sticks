import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, ImageIcon, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'
import { useSettings } from '../hooks/useSettings'
import api from '../lib/api'
import ImageCropperModal from '../components/ImageCropperModal'

const defaultSizes = ['A5', 'A4', 'A3', '12x18', '18x24', '24x36']

export default function CreatePoster() {
  const [preview, setPreview] = useState(null)
  const [fileName, setFileName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [customImageInfo, setCustomImageInfo] = useState(null)
  const [pendingFile, setPendingFile] = useState(null)
  const [isLandscape, setIsLandscape] = useState(false)
  const { settings } = useSettings()
  const availableSizes = settings?.sizePrices && typeof settings.sizePrices === 'object' ? Object.keys(settings.sizePrices) : defaultSizes

  const [selectedSize, setSelectedSize] = useState('A3')
  const size = availableSizes.includes(selectedSize) ? selectedSize : availableSizes[0]

  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const fileInput = useRef()
  const { addToCart } = useCart()
  const navigate = useNavigate()

  const handleFile = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('Please upload an image file')
    setPendingFile(file)
  }

  const uploadFile = async (file) => {
    setUploading(true)
    const formData = new FormData()
    formData.append('customImage', file)

    try {
      const { data } = await api.post('/orders/upload-custom', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setCustomImageInfo({ url: data.url, publicId: data.publicId })
      toast.success('Image uploaded successfully')
    } catch (err) {
      toast.error('Failed to upload image. Please try again.')
      setPreview(null)
      setFileName('')
      setCustomImageInfo(null)
    } finally {
      setUploading(false)
    }
  }

  const handleCropped = (croppedFile, croppedPreviewUrl) => {
    setPendingFile(null)
    setFileName(croppedFile.name)
    setPreview(croppedPreviewUrl)
    uploadFile(croppedFile)
  }

  const customPrice = settings?.sizePrices?.[size] || { A5: 259, A4: 319, A3: 399, '12x18': 499, '18x24': 699, '24x36': 997 }[size] || 399

  const handleAdd = (buyNow) => {
    if (uploading) return toast.error('Please wait for the image to finish uploading')
    if (!customImageInfo) return toast.error('Upload an image first')

    const customProduct = {
      _id: `custom-${Date.now()}`,
      name: `Custom Poster (${fileName || 'your upload'})`,
      price: customPrice,
      images: [customImageInfo.url],
      isCustom: true,
      customImage: customImageInfo,
    }

    addToCart(customProduct, { size, quantity, notes })
    if (buyNow) navigate('/checkout')
  }

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 py-10">
      <div className="mb-10 text-center">
        <p className="text-brand-gold font-bold text-xs tracking-widest uppercase mb-2">Made by you</p>
        <h1 className="text-3xl md:text-5xl font-extrabold">Create your own poster</h1>
        <p className="text-black/50 mt-3 max-w-md mx-auto">Upload any image — a photo, artwork, or design — and we'll print it museum-grade.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        {/* LEFT: UPLOAD / PREVIEW */}
        <div>
          <div
            onDrop={(e) => { e.preventDefault(); !uploading && handleFile(e.dataTransfer.files[0]) }}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => !uploading && fileInput.current.click()}
            className="aspect-[4/5] rounded-xl3 border-2 border-dashed border-black/15 hover:border-brand-yellow flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all bg-white"
          >
            {uploading ? (
              <div className="text-center px-8 animate-pulse">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-4 shadow-soft">
                  <Loader2 size={24} className="text-brand-gold animate-spin" />
                </div>
                <p className="font-semibold mb-1">Uploading image...</p>
                <p className="text-xs text-black/40">Storing original quality on cloud</p>
              </div>
            ) : preview ? (
              <img 
                src={preview} 
                alt="Uploaded preview" 
                className="w-full h-full object-contain" 
              />
            ) : (
              <div className="text-center px-8">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-4 shadow-soft">
                  <Upload size={24} className="text-brand-gold" />
                </div>
                <p className="font-semibold mb-1">Click or drag an image to upload</p>
                <p className="text-xs text-black/40">JPG, PNG — up to 20MB, higher resolution prints sharper</p>
              </div>
            )}
            <input ref={fileInput} type="file" accept="image/*" hidden onChange={(e) => handleFile(e.target.files[0])} />
          </div>
          {preview && !uploading && (
            <button onClick={() => fileInput.current.click()} className="mt-4 text-sm font-semibold underline flex items-center gap-1.5">
              <ImageIcon size={14} /> Replace image
            </button>
          )}
        </div>

        {/* RIGHT: CONFIG */}
        <div>
          <div className="mb-6">
            <p className="font-semibold text-sm mb-3">Poster Size</p>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((s) => (
                <button key={s} onClick={() => setSelectedSize(s)} className={`px-4 py-2 rounded-full text-sm font-medium border-2 ${size === s ? 'bg-brand-black text-brand-yellow border-brand-black' : 'border-black/10'}`}>{s}</button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <p className="font-semibold text-sm mb-3">Special Instructions</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="e.g. crop tighter on the left, brighten slightly..."
              className="w-full px-4 py-3 rounded-xl bg-brand-smoke border border-transparent focus:border-brand-yellow outline-none text-sm resize-none"
            />
          </div>

          <p className="text-2xl font-extrabold mb-6">₹{customPrice}</p>

          <div className="flex gap-3">
            <button onClick={() => handleAdd(false)} className="flex-1 border-2 border-brand-black font-bold py-4 rounded-full hover:bg-brand-smoke">Add to Cart</button>
            <button onClick={() => handleAdd(true)} className="flex-1 bg-brand-black text-brand-yellow font-bold py-4 rounded-full hover:shadow-glow">Buy Now</button>
          </div>
      </div>
    </div>

      {pendingFile && (
        <ImageCropperModal
          file={pendingFile}
          size={size}
          onClose={() => setPendingFile(null)}
          onCropped={handleCropped}
        />
      )}
    </div>
  )
}
