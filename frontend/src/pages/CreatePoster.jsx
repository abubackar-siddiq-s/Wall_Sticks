import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'

const sizes = ['A5', 'A4', 'A3', '12x18', '18x24', '24x36']
const finishes = ['Premium Matte', 'Gloss', 'Canvas', 'Framed']
const borders = ['White', 'Black', 'No Border']
const orientations = ['Portrait', 'Landscape', 'Square']

export default function CreatePoster() {
  const [preview, setPreview] = useState(null)
  const [fileName, setFileName] = useState('')
  const [size, setSize] = useState(sizes[2])
  const [finish, setFinish] = useState(finishes[0])
  const [border, setBorder] = useState('White')
  const [orientation, setOrientation] = useState('Portrait')
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState('')
  const fileInput = useRef()
  const { addToCart } = useCart()
  const navigate = useNavigate()

  const handleFile = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('Please upload an image file')
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(file)
  }

  const customProduct = {
    _id: `custom-${Date.now()}`,
    name: `Custom Poster (${fileName || 'your upload'})`,
    price: { A5: 299, A4: 399, A3: 549, '12x18': 649, '18x24': 899, '24x36': 1199 }[size],
    images: [preview || 'https://picsum.photos/seed/customplaceholder/800/1100'],
    isCustom: true,
  }

  const handleAdd = (buyNow) => {
    if (!preview) return toast.error('Upload an image first')
    addToCart(customProduct, { size, finish, border, orientation, quantity, notes })
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
            onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInput.current.click()}
            className="aspect-[4/5] rounded-xl3 border-2 border-dashed border-black/15 hover:border-brand-yellow bg-brand-smoke flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors"
          >
            {preview ? (
              <img src={preview} alt="Uploaded preview" className="w-full h-full object-cover" />
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
          {preview && (
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
              {sizes.map((s) => (
                <button key={s} onClick={() => setSize(s)} className={`px-4 py-2 rounded-full text-sm font-medium border-2 ${size === s ? 'bg-brand-black text-brand-yellow border-brand-black' : 'border-black/10'}`}>{s}</button>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <p className="font-semibold text-sm mb-3">Poster Finish</p>
            <div className="flex flex-wrap gap-2">
              {finishes.map((f) => (
                <button key={f} onClick={() => setFinish(f)} className={`px-4 py-2 rounded-full text-sm font-medium border-2 ${finish === f ? 'bg-brand-black text-brand-yellow border-brand-black' : 'border-black/10'}`}>{f}</button>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <p className="font-semibold text-sm mb-3">Border</p>
            <div className="flex flex-wrap gap-2">
              {borders.map((b) => (
                <button key={b} onClick={() => setBorder(b)} className={`px-4 py-2 rounded-full text-sm font-medium border-2 ${border === b ? 'bg-brand-black text-brand-yellow border-brand-black' : 'border-black/10'}`}>{b}</button>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <p className="font-semibold text-sm mb-3">Orientation</p>
            <div className="flex flex-wrap gap-2">
              {orientations.map((o) => (
                <button key={o} onClick={() => setOrientation(o)} className={`px-4 py-2 rounded-full text-sm font-medium border-2 ${orientation === o ? 'bg-brand-black text-brand-yellow border-brand-black' : 'border-black/10'}`}>{o}</button>
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

          <p className="text-2xl font-extrabold mb-6">₹{customProduct.price}</p>

          <div className="flex gap-3">
            <button onClick={() => handleAdd(false)} className="flex-1 border-2 border-brand-black font-bold py-4 rounded-full hover:bg-brand-smoke">Add to Cart</button>
            <button onClick={() => handleAdd(true)} className="flex-1 bg-brand-black text-brand-yellow font-bold py-4 rounded-full hover:shadow-glow">Buy Now</button>
          </div>
        </div>
      </div>
    </div>
  )
}
