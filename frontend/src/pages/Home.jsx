import { useState, Suspense, lazy } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Star, ShieldCheck, Truck, Sparkles } from 'lucide-react'
import HeroFallback from '../components/HeroFallback'
import ProductCard from '../components/ProductCard'
import CategoryChip from '../components/CategoryChip'
import Newsletter from '../components/Newsletter'
import QuickViewModal from '../components/QuickViewModal'
import ProductGridSkeleton from '../components/ProductGridSkeleton'
import { reviews } from '../data/mockData'
import { useProducts, useTrendingProducts } from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'
import { useDeviceCapability } from '../hooks/useDeviceCapability'

// The interactive Three.js/R3F hero is its own chunk — only fetched for visitors whose
// device/connection can actually make good use of it (see useDeviceCapability). Everyone
// else, and everyone during the brief moment this chunk is loading, sees HeroFallback.
const Hero3D = lazy(() => import('../components/Hero3D'))

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export default function Home() {
  const [quickView, setQuickView] = useState(null)
  const { products, loading: productsLoading } = useProducts()
  const { products: trending, loading: trendingLoading } = useTrendingProducts()
  const { categories } = useCategories()
  const { lite } = useDeviceCapability()
  const bestSellers = products.filter((p) => p.bestSeller).slice(0, 4)
  const featured = products.filter((p) => p.featured).slice(0, 6)

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-white">
        {lite ? (
          <HeroFallback />
        ) : (
          <Suspense fallback={<HeroFallback />}>
            <Hero3D />
          </Suspense>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-white pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-5 md:px-8 w-full pointer-events-none">
          <motion.div initial="hidden" animate="show" variants={fadeUp} className="max-w-xl pointer-events-auto">
            <span className="inline-flex items-center gap-2 bg-brand-yellow/15 text-brand-black text-xs font-bold px-3.5 py-1.5 rounded-full mb-6 border border-brand-yellow/30">
              <Sparkles size={13} /> New drops every Friday
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-[0.95] tracking-tight mb-6">
              Walls worth
              <br />
              <span className="text-gradient-gold">looking twice</span> at.
            </h1>
            <p className="text-black/55 text-lg mb-9 max-w-md">
              Museum-grade posters, printed on premium archival paper. Upload your own art, or pick from hundreds of ready-to-hang designs.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/shop" className="group bg-brand-black text-brand-yellow font-bold px-7 py-4 rounded-full flex items-center gap-2 hover:shadow-glow transition-shadow">
                Shop Posters
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/create-your-own" className="font-bold px-7 py-4 rounded-full border-2 border-black/10 hover:border-brand-black transition-colors">
                Create Your Own
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 -mt-4 md:mt-0 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: ShieldCheck, title: 'Archival-grade printing', sub: 'Fade-resistant for 75+ years' },
            { icon: Truck, title: 'Pan-India shipping', sub: 'Dispatched in 24–48 hrs' },
            { icon: Star, title: '4.8/5 from 2,300+ orders', sub: 'Verified customer reviews' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3.5 bg-white rounded-xl2 p-5 shadow-soft">
              <div className="w-11 h-11 rounded-full bg-brand-yellow/15 flex items-center justify-center shrink-0">
                <f.icon size={20} className="text-brand-gold" />
              </div>
              <div>
                <p className="font-semibold text-sm">{f.title}</p>
                <p className="text-xs text-black/45">{f.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 mt-24">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-brand-gold font-bold text-xs tracking-widest uppercase mb-2">Browse</p>
            <h2 className="text-3xl md:text-4xl font-extrabold">Shop by category</h2>
          </div>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((c) => <CategoryChip key={c.slug} category={c} />)}
        </div>
      </section>

      {/* TRENDING */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 mt-24">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-brand-gold font-bold text-xs tracking-widest uppercase mb-2">Admin's picks</p>
            <h2 className="text-3xl md:text-4xl font-extrabold">Trending right now</h2>
          </div>
          <Link to="/shop" className="hidden sm:flex items-center gap-1.5 font-semibold text-sm hover:text-brand-gold transition-colors">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        {trendingLoading ? (
          <ProductGridSkeleton count={8} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {trending.map((p) => <ProductCard key={p._id} product={p} onQuickView={setQuickView} />)}
          </div>
        )}
      </section>

      {/* FEATURED COLLECTION BANNER */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 mt-24">
        <div className="relative rounded-xl3 overflow-hidden bg-brand-smoke grid md:grid-cols-2 items-center">
          <div className="p-10 md:p-16">
            <p className="text-brand-gold font-bold text-xs tracking-widest uppercase mb-3">Featured collection</p>
            <h3 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">The Minimalist Edit</h3>
            <p className="text-black/55 mb-7 max-w-sm">Clean lines, quiet color palettes, and typography built for calm spaces.</p>
            <Link to="/shop?category=minimal" className="inline-flex items-center gap-2 bg-brand-black text-brand-yellow font-bold px-6 py-3.5 rounded-full">
              Explore collection <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 p-6 md:p-10">
            {featured.slice(0, 4).map((p) => (
              <img key={p._id} src={p.images[0]} alt={p.name} className="rounded-xl2 aspect-[3/4] object-cover shadow-card" loading="lazy" />
            ))}
          </div>
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 mt-24">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-brand-gold font-bold text-xs tracking-widest uppercase mb-2">Customer favorites</p>
            <h2 className="text-3xl md:text-4xl font-extrabold">Best sellers</h2>
          </div>
        </div>
        {productsLoading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {bestSellers.map((p) => <ProductCard key={p._id} product={p} onQuickView={setQuickView} />)}
          </div>
        )}
      </section>

      {/* REVIEWS */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 mt-24">
        <div className="mb-8">
          <p className="text-brand-gold font-bold text-xs tracking-widest uppercase mb-2">Word on the wall</p>
          <h2 className="text-3xl md:text-4xl font-extrabold">Customer reviews</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white rounded-xl2 p-6 shadow-soft">
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} fill={i < r.rating ? '#FFD000' : 'none'} stroke={i < r.rating ? '#FFD000' : '#ccc'} />
                ))}
              </div>
              <p className="text-sm text-black/70 mb-4 leading-relaxed">"{r.text}"</p>
              <p className="text-xs font-semibold">{r.name} <span className="text-black/40 font-normal">· {r.product}</span></p>
            </div>
          ))}
        </div>
      </section>

      <Newsletter />
      <AnimatePresence>
        {quickView && <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />}
      </AnimatePresence>
    </div>
  )
}
