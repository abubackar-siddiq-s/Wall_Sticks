import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import ProductCard from '../components/ProductCard'
import QuickViewModal from '../components/QuickViewModal'
import ProductGridSkeleton from '../components/ProductGridSkeleton'
import { useProducts } from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'

// A product's category is a plain slug string in demo data, but a populated
// { _id, name, slug } object once the live API is connected — this reads either shape.
const categorySlug = (p) => (typeof p.category === 'string' ? p.category : p.category?.slug)

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price-low', label: 'Lowest Price' },
]

export default function Shop() {
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [quickView, setQuickView] = useState(null)
  const activeCategory = params.get('category') || 'all'
  const [maxPrice, setMaxPrice] = useState(1500)
  const [sort, setSort] = useState(params.get('sort') || 'newest')
  const { products, loading } = useProducts()
  const { categories } = useCategories()

  const setCategory = (slug) => {
    if (slug === 'all') { params.delete('category') } else { params.set('category', slug) }
    setParams(params)
  }

  const filtered = useMemo(() => {
    let list = products.filter((p) =>
      (activeCategory === 'all' || categorySlug(p) === activeCategory) &&
      p.price <= maxPrice &&
      p.name.toLowerCase().includes(search.toLowerCase())
    )
    if (sort === 'popular') list = [...list].sort((a, b) => b.reviewsCount - a.reviewsCount)
    if (sort === 'rating') list = [...list].sort((a, b) => b.rating - a.rating)
    if (sort === 'price-low') list = [...list].sort((a, b) => a.price - b.price)
    return list
  }, [activeCategory, maxPrice, search, sort])

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-10">
      <div className="mb-8">
        <p className="text-brand-gold font-bold text-xs tracking-widest uppercase mb-2">{filtered.length} posters</p>
        <h1 className="text-3xl md:text-5xl font-extrabold">Shop all posters</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/35" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posters..."
            className="w-full pl-11 pr-4 py-3.5 rounded-full bg-brand-smoke border border-transparent focus:border-brand-yellow outline-none text-sm"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-5 py-3.5 rounded-full bg-brand-smoke border border-transparent focus:border-brand-yellow outline-none text-sm font-medium"
        >
          {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button
          onClick={() => setShowFilters((s) => !s)}
          className="flex items-center gap-2 px-5 py-3.5 rounded-full bg-brand-black text-brand-yellow font-semibold text-sm sm:hidden"
        >
          <SlidersHorizontal size={16} /> Filters
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-8">
        <aside className={`${showFilters ? 'block' : 'hidden'} sm:block`}>
          <div className="sticky top-24 space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm">Category</h3>
                {showFilters && <button onClick={() => setShowFilters(false)} className="sm:hidden"><X size={16} /></button>}
              </div>
              <div className="space-y-1">
                <button onClick={() => setCategory('all')} className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${activeCategory === 'all' ? 'bg-brand-yellow font-semibold' : 'hover:bg-brand-smoke'}`}>All</button>
                {categories.map((c) => (
                  <button key={c.slug} onClick={() => setCategory(c.slug)} className={`block w-full text-left px-3 py-2 rounded-lg text-sm ${activeCategory === c.slug ? 'bg-brand-yellow font-semibold' : 'hover:bg-brand-smoke'}`}>
                    {c.emoji} {c.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-sm mb-4">Max price: ₹{maxPrice}</h3>
              <input
                type="range" min="300" max="1500" step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-black"
              />
            </div>
          </div>
        </aside>

        <div>
          {loading ? (
            <ProductGridSkeleton count={9} />
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-black/40 mb-2">No posters match your filters.</p>
              <button onClick={() => { setSearch(''); setCategory('all'); setMaxPrice(1500) }} className="font-semibold text-sm underline">Clear filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((p) => <ProductCard key={p._id} product={p} onQuickView={setQuickView} />)}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {quickView && <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />}
      </AnimatePresence>
    </div>
  )
}
