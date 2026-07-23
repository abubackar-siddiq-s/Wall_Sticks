import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, Heart, Minus, Plus, Truck, ShieldCheck } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useProduct, useProducts } from '../hooks/useProducts'
import ProductCard from '../components/ProductCard'

const categorySlug = (p) => (typeof p.category === 'string' ? p.category : p.category?.slug)

export default function ProductDetail() {
  const { id } = useParams()
  const { product: fetched } = useProduct(id)
  const product = {
    sizes: ['A5', 'A4', 'A3', '12x18', '18x24', '24x36'],
    finishes: ['Premium Matte', 'Gloss', 'Canvas', 'Framed'],
    borders: ['White', 'Black', 'No Border'],
    images: ['https://picsum.photos/seed/fallback/800/1100'],
    ...fetched,
  }
  const { addToCart } = useCart()
  const { toggleWishlist, isWishlisted } = useWishlist()

  const [activeImage, setActiveImage] = useState(0)
  const [size, setSize] = useState(product.sizes[2])
  const [finish, setFinish] = useState(product.finishes[0])
  const [border, setBorder] = useState('White')
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    setActiveImage(0)
    setSize(product.sizes[2])
    setFinish(product.finishes[0])
    setBorder('White')
    setQuantity(1)
  }, [id, product._id])

  const { products: allProducts } = useProducts()
  const recommended = allProducts.filter((p) => categorySlug(p) === categorySlug(product) && p._id !== product._id).slice(0, 4)

  const handleAddToCart = () => addToCart(product, { size, finish, border, quantity })

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-10">
      <div className="grid md:grid-cols-2 gap-12">
        {/* GALLERY */}
        <div>
          <div className="rounded-xl3 overflow-hidden bg-brand-smoke aspect-[4/5] mb-4">
            <img src={product.images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-3">
            {product.images.map((img, i) => (
              <button key={i} onClick={() => setActiveImage(i)} className={`w-20 h-20 rounded-xl overflow-hidden border-2 ${activeImage === i ? 'border-brand-yellow' : 'border-transparent'}`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* INFO */}
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">{product.name}</h1>
          <div className="flex items-center gap-2 mb-5">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={15} fill={i < Math.round(product.rating) ? '#FFD000' : 'none'} stroke={i < Math.round(product.rating) ? '#FFD000' : '#ccc'} />
              ))}
            </div>
            <span className="text-sm text-black/50">{product.rating} · {product.reviewsCount} reviews</span>
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-extrabold">₹{product.price}</span>
            {product.mrp > product.price && <span className="text-lg text-black/35 line-through">₹{product.mrp}</span>}
            {product.mrp > product.price && (
              <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded-full">
                {Math.round((1 - product.price / product.mrp) * 100)}% off
              </span>
            )}
          </div>

          <p className="text-black/55 leading-relaxed mb-8">{product.description}</p>

          {/* SIZE */}
          <div className="mb-6">
            <p className="font-semibold text-sm mb-3">Size</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button key={s} onClick={() => setSize(s)} className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-colors ${size === s ? 'bg-brand-black text-brand-yellow border-brand-black' : 'border-black/10 hover:border-black/30'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* FINISH */}
          <div className="mb-6">
            <p className="font-semibold text-sm mb-3">Finish</p>
            <div className="flex flex-wrap gap-2">
              {product.finishes.map((f) => (
                <button key={f} onClick={() => setFinish(f)} className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-colors ${finish === f ? 'bg-brand-black text-brand-yellow border-brand-black' : 'border-black/10 hover:border-black/30'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* BORDER */}
          <div className="mb-8">
            <p className="font-semibold text-sm mb-3">Border</p>
            <div className="flex flex-wrap gap-2">
              {product.borders.map((b) => (
                <button key={b} onClick={() => setBorder(b)} className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-colors ${border === b ? 'bg-brand-black text-brand-yellow border-brand-black' : 'border-black/10 hover:border-black/30'}`}>
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* QUANTITY + ACTIONS */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border-2 border-black/10 rounded-full">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="p-3" aria-label="Decrease quantity"><Minus size={16} /></button>
              <span className="w-8 text-center font-semibold">{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)} className="p-3" aria-label="Increase quantity"><Plus size={16} /></button>
            </div>
            <button
              onClick={() => toggleWishlist(product)}
              className={`p-3.5 rounded-full border-2 ${isWishlisted(product._id) ? 'bg-brand-yellow border-brand-yellow' : 'border-black/10 hover:border-black/30'}`}
              aria-label="Toggle wishlist"
            >
              <Heart size={18} fill={isWishlisted(product._id) ? '#0A0A0A' : 'none'} />
            </button>
          </div>

          <div className="flex gap-3 mb-8">
            <button onClick={handleAddToCart} className="flex-1 border-2 border-brand-black font-bold py-4 rounded-full hover:bg-brand-smoke transition-colors">
              Add to Cart
            </button>
            <Link to="/checkout" onClick={handleAddToCart} className="flex-1 bg-brand-black text-brand-yellow font-bold py-4 rounded-full text-center hover:shadow-glow transition-shadow">
              Buy Now
            </Link>
          </div>

          <div className="flex flex-col gap-3 text-sm text-black/55 border-t border-black/5 pt-6">
            <div className="flex items-center gap-2"><Truck size={16} /> Dispatched in 24–48 hours, delivered in 3–6 days</div>
            <div className="flex items-center gap-2"><ShieldCheck size={16} /> 250gsm archival paper, fade-resistant inks</div>
          </div>
        </div>
      </div>

      {recommended.length > 0 && (
        <div className="mt-24">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-8">You might also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {recommended.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  )
}
