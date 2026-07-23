// A pure-CSS stand-in for the Three.js hero — same "floating posters" feel via
// transforms + keyframes, no WebGL/canvas, no extra JS bundle. Used for:
//   1. Low-end devices / reduced-motion / slow connections (see useDeviceCapability)
//   2. The Suspense fallback while the real Hero3D chunk loads on capable devices
const posters = [
  { seed: 'hero1', top: '8%', left: '4%', rotate: -8, w: 150, delay: '0s' },
  { seed: 'hero2', top: '38%', left: '18%', rotate: 4, w: 190, delay: '0.4s' },
  { seed: 'hero3', top: '14%', left: '58%', rotate: -3, w: 200, delay: '0.8s' },
  { seed: 'hero4', top: '48%', left: '74%', rotate: 7, w: 150, delay: '1.2s' },
  { seed: 'hero5', top: '4%', left: '38%', rotate: 2, w: 120, delay: '0.2s' },
]

export default function HeroFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-yellow/10 via-transparent to-transparent" />
      {posters.map((p, i) => (
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
            src={`https://picsum.photos/seed/${p.seed}/400/533`}
            alt=""
            className="w-full h-full object-cover"
            loading="eager"
          />
        </div>
      ))}
    </div>
  )
}
