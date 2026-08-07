import { useRef, useState, useEffect, useCallback } from 'react'
import ProductCard from './ProductCard'

export default function ProductSlider({ products = [], onQuickView, autoPlay = true, autoPlayInterval = 3500 }) {
  const sliderRef = useRef(null)
  const [isMouseDown, setIsMouseDown] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeftPos, setScrollLeftPos] = useState(0)

  // Repeat items for infinite circular looping if enough items exist
  const shouldLoop = products && products.length >= 3
  const circularProducts = shouldLoop ? [...products, ...products, ...products] : products

  // Set initial scroll position to middle set for seamless infinite scroll in both directions
  useEffect(() => {
    if (sliderRef.current && shouldLoop) {
      const container = sliderRef.current
      const setWidth = container.scrollWidth / 3
      container.scrollLeft = setWidth
    }
  }, [products, shouldLoop])

  // Handle continuous silent loop reset during scrolling
  const handleScroll = useCallback(() => {
    if (!sliderRef.current || !shouldLoop) return
    const container = sliderRef.current
    const setWidth = container.scrollWidth / 3

    // If scrolled past 2 sets, jump back to middle set silently
    if (container.scrollLeft >= setWidth * 2) {
      container.style.scrollBehavior = 'auto'
      container.scrollLeft -= setWidth
      container.style.scrollBehavior = 'smooth'
    }
    // If scrolled near start of 1st set, jump forward to middle set silently
    else if (container.scrollLeft <= 10) {
      container.style.scrollBehavior = 'auto'
      container.scrollLeft += setWidth
      container.style.scrollBehavior = 'smooth'
    }
  }, [shouldLoop])

  const scrollRight = useCallback(() => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 300, behavior: 'smooth' })
    }
  }, [])

  // Auto carousel effect
  useEffect(() => {
    if (!autoPlay || isHovered || isMouseDown || !products || products.length <= 1) return

    const timer = setInterval(() => {
      scrollRight()
    }, autoPlayInterval)

    return () => clearInterval(timer)
  }, [autoPlay, isHovered, isMouseDown, products, autoPlayInterval, scrollRight])

  const handleMouseDown = (e) => {
    if (!sliderRef.current) return
    setIsMouseDown(true)
    setStartX(e.pageX - sliderRef.current.offsetLeft)
    setScrollLeftPos(sliderRef.current.scrollLeft)
  }

  const handleMouseLeave = () => {
    setIsMouseDown(false)
    setIsHovered(false)
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
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
    <div
      className="relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Swipable / scrollable container */}
      <div
        ref={sliderRef}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className={`flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 pt-2 px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
          isMouseDown ? 'cursor-grabbing select-none' : 'cursor-grab'
        }`}
      >
        {circularProducts.map((product, idx) => (
          <div key={`${product._id}-${idx}`} className="w-[220px] sm:w-[260px] md:w-[280px] shrink-0 snap-start">
            <ProductCard product={product} onQuickView={onQuickView} />
          </div>
        ))}
      </div>
    </div>
  )
}

