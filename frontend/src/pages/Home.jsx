import { useState, Suspense, lazy } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Star, ShieldCheck, Truck, Sparkles } from 'lucide-react'
import HeroFallback from '../components/HeroFallback'
import ProductCard from '../components/ProductCard'
import ProductSlider from '../components/ProductSlider'
import Newsletter from '../components/Newsletter'
import QuickViewModal from '../components/QuickViewModal'
import ProductGridSkeleton from '../components/ProductGridSkeleton'
import { useApiData } from '../hooks/useApiData'
import { useProducts, useTrendingProducts } from '../hooks/useProducts'
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
  const { data: featuredReviews } = useApiData('/reviews/featured', [])
  const reviews = Array.isArray(featuredReviews) ? featuredReviews : []
  const { lite } = useDeviceCapability()
  const bestSellers = products.filter((p) => p.bestSeller)

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-[80vh] lg:min-h-[92vh] py-16 lg:py-0 flex items-center overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-72 h-72 lg:w-[500px] lg:h-[500px] bg-brand-yellow/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        {lite ? (
          <HeroFallback />
        ) : (
          <Suspense fallback={<HeroFallback />}>
            <Hero3D />
          </Suspense>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-white pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 w-full pointer-events-none">
          <motion.div initial="hidden" animate="show" variants={fadeUp} className="max-w-xl pointer-events-auto">
            <h1 className="text-5xl md:text-7xl font-extrabold leading-[0.95] tracking-tight mb-6">
              Walls worth
              <br />
              <span className="text-gradient-gold">looking twice</span> at.
            </h1>
            <p className="text-black/60 text-lg mb-9 max-w-lg leading-relaxed">
              Give your room an instant upgrade. Choose from hundreds of exclusive poster designs or print your custom art with pan-India fast delivery.
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
      {/* <section className="max-w-7xl mx-auto px-5 md:px-8 -mt-4 md:mt-0 relative z-10">
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
      </section> */}

      {/* TRENDING */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 mt-24">
        <div className="mb-8">
          <p className="text-brand-gold font-bold text-xs tracking-widest uppercase mb-2">Admin's picks</p>
          <h2 className="text-3xl md:text-4xl font-extrabold">Trending right now</h2>
        </div>
        {trendingLoading ? (
          <ProductGridSkeleton count={4} />
        ) : trending.length === 0 ? (
          <p className="text-black/40 text-sm font-medium italic bg-brand-smoke p-8 rounded-xl2 text-center">New trending posters coming soon.</p>
        ) : (
          <ProductSlider products={trending} onQuickView={setQuickView} />
        )}
      </section>

      {/* EXPLORE ALL POSTERS BANNER */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 mt-24">
        <div className="relative rounded-xl3 overflow-hidden bg-brand-black text-white p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 shadow-card">
          <div className="max-w-xl">
            <p className="text-brand-yellow font-bold text-xs tracking-widest uppercase mb-3">Complete Collection</p>
            <h3 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">Explore All Posters</h3>
            <p className="text-white/70 text-base max-w-lg leading-relaxed">
              Discover our full gallery of high-resolution poster prints spanning anime, minimal, gaming, motivational, nature, and custom artwork.
            </p>
          </div>
          <Link
            to="/shop"
            className="group shrink-0 bg-brand-yellow text-brand-black font-extrabold px-8 py-4 rounded-full flex items-center gap-3 hover:shadow-glow transition-all"
          >
            View All Posters
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 mt-24">
        <div className="mb-8">
          <p className="text-brand-gold font-bold text-xs tracking-widest uppercase mb-2">Customer favorites</p>
          <h2 className="text-3xl md:text-4xl font-extrabold">Best sellers</h2>
        </div>
        {productsLoading ? (
          <ProductGridSkeleton count={4} />
        ) : bestSellers.length === 0 ? (
          <p className="text-black/40 text-sm font-medium italic bg-brand-smoke p-8 rounded-xl2 text-center">Our best-selling collection will appear here soon.</p>
        ) : (
          <ProductSlider products={bestSellers} onQuickView={setQuickView} />
        )}
      </section>

      {/* REVIEWS */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 mt-24">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-brand-gold font-bold text-xs tracking-widest uppercase mb-2">Word on the wall</p>
            <h2 className="text-3xl md:text-4xl font-extrabold">Customer reviews</h2>
          </div>
          <Link to="/reviews" className="flex items-center gap-1.5 font-semibold text-sm hover:text-brand-gold transition-colors">
            View all <ArrowRight size={16} />
          </Link>
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

      <AnimatePresence>
        {quickView && <QuickViewModal product={quickView} onClose={() => setQuickView(null)} />}
      </AnimatePresence>
    </div>
  )
}
