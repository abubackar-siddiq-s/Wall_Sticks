import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Eye, ShoppingBag, Star } from 'lucide-react'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { responsiveImgProps } from '../lib/imageUrl'

export default function ProductCard({ product, onQuickView }) {
  const { toggleWishlist, isWishlisted } = useWishlist()
  const { addToCart } = useCart()
  const wishlisted = isWishlisted(product._id)

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="group relative bg-white rounded-xl2 overflow-hidden shadow-soft hover:shadow-card transition-shadow"
    >
      <Link to={`/product/${product._id}`} className="block relative aspect-[4/5] overflow-hidden bg-brand-smoke">
        <img
          {...responsiveImgProps(product.images?.[0], { sizes: '(max-width: 640px) 50vw, 25vw' })}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.bestSeller && (
          <span className="absolute top-3 left-3 bg-brand-yellow text-brand-black text-[11px] font-bold px-2.5 py-1 rounded-full">Best Seller</span>
        )}
        <button
          onClick={(e) => { e.preventDefault(); toggleWishlist(product) }}
          aria-label="Toggle wishlist"
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-colors ${wishlisted ? 'bg-brand-yellow text-brand-black' : 'bg-white/90 text-black hover:bg-white'}`}
        >
          <Heart size={16} fill={wishlisted ? '#0A0A0A' : 'none'} />
        </button>

        <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <button
            onClick={(e) => { e.preventDefault(); onQuickView?.(product) }}
            className="flex-1 bg-white/95 text-black text-xs font-semibold py-2.5 rounded-full flex items-center justify-center gap-1.5 hover:bg-white"
          >
            <Eye size={14} /> Quick View
          </button>
          <button
            onClick={(e) => { e.preventDefault(); addToCart(product) }}
            className="flex-1 bg-brand-black text-brand-yellow text-xs font-semibold py-2.5 rounded-full flex items-center justify-center gap-1.5"
          >
            <ShoppingBag size={14} /> Add
          </button>
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/product/${product._id}`}>
          <h3 className="font-semibold text-sm text-black/90 line-clamp-1 mb-1">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-1 mb-2">
          <Star size={13} fill="#FFD000" stroke="#FFD000" />
          <span className="text-xs font-medium text-black/60">{product.rating} ({product.reviewsCount})</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-base">₹{product.price}</span>
          {product.mrp > product.price && (
            <span className="text-xs text-black/40 line-through">₹{product.mrp}</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
