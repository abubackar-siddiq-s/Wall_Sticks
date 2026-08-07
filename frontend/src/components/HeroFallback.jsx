import { useMemo } from 'react'
import { useTrendingProducts, useProducts } from '../hooks/useProducts'
import { imgSrc } from '../lib/imageUrl'

const posterConfig = [
  { top: '8%', left: '10%', rotate: -8, w: 150, delay: '0s' },
  { top: '38%', left: '32%', rotate: 4, w: 190, delay: '0.4s' },
  { top: '14%', left: '56%', rotate: -3, w: 200, delay: '0.8s' },
  { top: '48%', left: '76%', rotate: 7, w: 150, delay: '1.2s' },
  { top: '4%', left: '42%', rotate: 2, w: 120, delay: '0.2s' },
]

export default function HeroFallback() {
  const { products: trendingProducts } = useTrendingProducts()
  const { products: allCatalogProducts } = useProducts()

  const defaultSvg = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="533" viewBox="0 0 400 533"><rect width="400" height="533" fill="%23111111"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23FFD000" font-family="sans-serif" font-size="28" font-weight="bold">WALLSTICKS</text></svg>'

  const imageList = useMemo(() => {
    const combined = [...(trendingProducts || []), ...(allCatalogProducts || [])]
    const list = []
    combined.forEach((p) => {
      const mainImg = p.images?.[0]
      if (mainImg) {
        const url = imgSrc(mainImg)
        if (url && !list.includes(url)) {
          list.push(url)
        }
      }
    })
    return list
  }, [trendingProducts, allCatalogProducts])

  return (
    <div className="hidden lg:block absolute top-0 bottom-0 right-0 w-[50%] overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-yellow/10 via-transparent to-transparent opacity-60" />
      {posterConfig.map((p, i) => {
        const imageSrc = imageList.length > 0 ? imageList[i % imageList.length] : defaultSvg
        return (
          <div
            key={i}
            className="absolute rounded-xl shadow-card overflow-hidden border-4 border-brand-black animate-float"
            style={{
              top: p.top, left: p.left, width: p.w, aspectRatio: '3/4',
              transform: `rotate(${p.rotate}deg)`,
              animationDelay: p.delay,
              animationDuration: '5s',
            }}
          >
            <img
              src={imageSrc}
              alt=""
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
        )
      })}
    </div>
  )
}
