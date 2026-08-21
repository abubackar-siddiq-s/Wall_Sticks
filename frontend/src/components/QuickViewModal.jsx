import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { X, Star, Heart, ShoppingBag, Minus, Plus } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { imgSrc } from '../lib/imageUrl'

export default function QuickViewModal({ product, onClose, showPrice = false }) {
  const { addToCart } = useCart()
  const { toggleWishlist, isWishlisted } = useWishlist()
  const [quantity, setQuantity] = useState(1)
  const [selectedImgIndex, setSelectedImgIndex] = useState(0)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  if (!product) return null

  const imagesList = Array.isArray(product.images) && product.images.length > 0 ? product.images : []

  return typeof document !== 'undefined' && createPortal(
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Quick view for ${product.name}`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
        className="bg-white rounded-xl3 w-full max-w-3xl max-h-[90vh] overflow-y-auto grid sm:grid-cols-2 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className="w-full aspect-[3/4] overflow-hidden relative"
          style={{ 
            aspectRatio: '3 / 4',
            backgroundImage: "url('/transparent-background.avif')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <img 
            src={imgSrc(product.images?.[0])} 
            alt={product.name} 
            className="w-full h-full object-contain" 
          />
        </div>

        <div className="p-6 sm:p-8 relative">
          <button onClick={onClose} aria-label="Close" className="absolute top-5 right-5 p-2 rounded-full hover:bg-brand-smoke transition-colors">
            <X size={18} />
          </button>

          <h2 className="text-2xl font-extrabold mb-2 pr-8">{product.name}</h2>
          {product.reviewsCount > 0 ? (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={13} fill={i < Math.round(product.rating || 0) ? '#FFD000' : 'none'} stroke={i < Math.round(product.rating || 0) ? '#FFD000' : '#ccc'} />
                ))}
              </div>
              <span className="text-xs text-black/50">{product.rating} · {product.reviewsCount} {product.reviewsCount === 1 ? 'review' : 'reviews'}</span>
            </div>
          ) : (
            <p className="text-xs text-black/40 italic mb-4">No reviews yet</p>
          )}

          {showPrice && (
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-2xl font-extrabold">₹{product.price}</span>
              {product.mrp > product.price && <span className="text-sm text-black/35 line-through">₹{product.mrp}</span>}
            </div>
          )}

          {product.description && (
            <p className="text-sm text-black/55 leading-relaxed mb-6 line-clamp-4">{product.description}</p>
          )}

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border-2 border-black/10 rounded-full">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="p-2.5" aria-label="Decrease quantity"><Minus size={14} /></button>
              <span className="w-7 text-center text-sm font-semibold">{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)} className="p-2.5" aria-label="Increase quantity"><Plus size={14} /></button>
            </div>
            <button
              onClick={() => toggleWishlist(product)}
              className={`p-3 rounded-full border-2 ${isWishlisted(product._id) ? 'bg-brand-yellow border-brand-yellow' : 'border-black/10 hover:border-black/30'}`}
              aria-label="Toggle wishlist"
            >
              <Heart size={16} fill={isWishlisted(product._id) ? '#0A0A0A' : 'none'} />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => { addToCart(product, { quantity }); onClose() }}
              className="bg-brand-black text-brand-yellow font-bold py-3.5 rounded-full flex items-center justify-center gap-2 hover:shadow-glow transition-all"
            >
              <ShoppingBag size={16} /> Add to Cart
            </button>
            <Link
              to={`/product/${product._id}`}
              onClick={onClose}
              className="text-center font-semibold text-sm underline text-black/60 hover:text-black"
            >
              View full details & options
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  )
}

