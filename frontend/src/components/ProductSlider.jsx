import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard from './ProductCard'

export default function ProductSlider({ products = [], onQuickView }) {
  const sliderRef = useRef(null)
  const [isMouseDown, setIsMouseDown] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeftPos, setScrollLeftPos] = useState(0)

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -320, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 320, behavior: 'smooth' })
    }
  }

  const handleMouseDown = (e) => {
    if (!sliderRef.current) return
    setIsMouseDown(true)
    setStartX(e.pageX - sliderRef.current.offsetLeft)
    setScrollLeftPos(sliderRef.current.scrollLeft)
  }

  const handleMouseLeave = () => {
    setIsMouseDown(false)
  }

  const handleMouseUp = () => {
    setIsMouseDown(false)
  }

  const handleMouseMove = (e) => {
    if (!isMouseDown || !sliderRef.current) return
    e.preventDefault()
    const x = e.pageX - sliderRef.current.offsetLeft
    const walk = (x - startX) * 1.5
    sliderRef.current.scrollLeft = scrollLeftPos - walk
  }

  if (!products || products.length === 0) {
    return null
  }

  return (
    <div className="relative group">
      {/* Left scroll button */}
      <button
        onClick={scrollLeft}
        className="absolute -left-3 md:-left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white shadow-card border border-black/10 flex items-center justify-center text-black hover:bg-brand-yellow hover:border-brand-yellow transition-all opacity-100 hover:scale-105"
        aria-label="Scroll Left"
      >
        <ChevronLeft size={22} />
      </button>

      {/* Swipable / scrollable container */}
      <div
        ref={sliderRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className={`flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 pt-2 px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
          isMouseDown ? 'cursor-grabbing select-none' : 'cursor-grab'
        }`}
      >
        {products.map((product) => (
          <div key={product._id} className="w-[220px] sm:w-[260px] md:w-[280px] shrink-0 snap-start">
            <ProductCard product={product} onQuickView={onQuickView} />
          </div>
        ))}
      </div>

      {/* Right scroll button */}
      <button
        onClick={scrollRight}
        className="absolute -right-3 md:-right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white shadow-card border border-black/10 flex items-center justify-center text-black hover:bg-brand-yellow hover:border-brand-yellow transition-all opacity-100 hover:scale-105"
        aria-label="Scroll Right"
      >
        <ChevronRight size={22} />
      </button>
    </div>
  )
}
