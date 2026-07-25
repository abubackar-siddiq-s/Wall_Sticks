import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import ProductCard from '../components/ProductCard'
import QuickViewModal from '../components/QuickViewModal'
import ProductGridSkeleton from '../components/ProductGridSkeleton'
import { useProducts } from '../hooks/useProducts'

export default function Shop() {
  const [quickView, setQuickView] = useState(null)
  const { products, loading } = useProducts()

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-10">
      <div className="mb-8">
        <p className="text-brand-gold font-bold text-xs tracking-widest uppercase mb-2">{products.length} posters</p>
        <h1 className="text-3xl md:text-5xl font-extrabold">Shop all posters</h1>
      </div>

      <div>
        {loading ? (
          <ProductGridSkeleton count={9} />
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-black/40">No posters available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((p) => <ProductCard key={p._id} product={p} onQuickView={setQuickView} />)}
          </div>
        )}
      </div>

      <AnimatePresence>
        {quickView && <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />}
      </AnimatePresence>
    </div>
  )
}

