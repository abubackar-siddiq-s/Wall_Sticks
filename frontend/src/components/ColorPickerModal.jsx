import { useState, useEffect, useRef } from 'react'
import { X, Check, Pipette, Sparkles, Sliders, Palette, History, Copy, CheckCircle } from 'lucide-react'

// Professional Color Math Conversions
function clamp(val, min, max) {
  const num = Number(val)
  if (isNaN(num)) return min
  return Math.max(min, Math.min(max, num))
}

function hexToRgb(hex) {
  let c = (hex || '').replace('#', '').trim()
  if (c.length === 3) c = c.split('').map((x) => x + x).join('')
  const num = parseInt(c, 16)
  if (isNaN(num) || c.length !== 6) return { r: 193, g: 39, b: 45 } // Default #C1272D
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  }
}

function rgbToHex(r, g, b) {
  const toHex = (v) => clamp(v, 0, 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
}

function rgbToHsb(r, g, b) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0, v = max
  const d = max - min
  s = max === 0 ? 0 : d / max

  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), b: Math.round(v * 100) }
}

function hsbToRgb(h, s, bVal) {
  h = ((h % 360) + 360) % 360 / 360
  s = clamp(s, 0, 100) / 100
  bVal = clamp(bVal, 0, 100) / 100

  let r = 0, g = 0, b = 0
  const i = Math.floor(h * 6)
  const f = h * 6 - i
  const p = bVal * (1 - s)
  const q = bVal * (1 - f * s)
  const t = bVal * (1 - (1 - f) * s)

  switch (i % 6) {
    case 0: r = bVal; g = t; b = p; break
    case 1: r = q; g = bVal; b = p; break
    case 2: r = p; g = bVal; b = t; break
    case 3: r = p; g = q; b = bVal; break
    case 4: r = t; g = p; b = bVal; break
    case 5: r = bVal; g = p; b = q; break
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  }
}

function rgbToCmyk(r, g, b) {
  let c = 1 - (r / 255)
  let m = 1 - (g / 255)
  let y = 1 - (b / 255)
  let k = Math.min(c, m, y)
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 }
  c = Math.round(((c - k) / (1 - k)) * 100)
  m = Math.round(((m - k) / (1 - k)) * 100)
  y = Math.round(((y - k) / (1 - k)) * 100)
  k = Math.round(k * 100)
  return { c, m, y, k }
}

function cmykToRgb(c, m, y, k) {
  c /= 100; m /= 100; y /= 100; k /= 100
  const r = Math.round(255 * (1 - c) * (1 - k))
  const g = Math.round(255 * (1 - m) * (1 - k))
  const b = Math.round(255 * (1 - y) * (1 - k))
  return { r, g, b }
}

// Curated Studio Palettes Categorized
const PALETTE_CATEGORIES = [
  {
    name: 'Museum & Classics',
    colors: ['#FFFFFF', '#F8F8F6', '#F4EBD9', '#E8DCC4', '#34495E', '#111111'],
  },
  {
    name: 'Nordic & Earthy',
    colors: ['#8A9A86', '#C86D51', '#5C768D', '#DCA134', '#6B705C', '#A88B74'],
  },
  {
    name: 'Luxury Metallic',
    colors: ['#D4AF37', '#C5A059', '#B76E79', '#8C6239', '#C0C0C0', '#E5E4E2'],
  },
  {
    name: 'Vibrant & Modern',
    colors: ['#C1272D', '#FF1E42', '#00D2FF', '#FFD700', '#7B2CBF', '#00C853'],
  },
]

export default function ColorPickerModal({
  initialColor = '#C1272D',
  posterImage = null,
  posterName = 'Poster',
  onSelectColor,
  onClose,
}) {
  const [activeTab, setActiveTab] = useState('studio') // 'studio' | 'extract' | 'palettes'
  const [colorHex, setColorHex] = useState(initialColor.toUpperCase())
  const [copied, setCopied] = useState(false)

  // Recent Colors from localStorage
  const [recentColors, setRecentColors] = useState(() => {
    try {
      const saved = localStorage.getItem('pw_recent_border_colors')
      return saved ? JSON.parse(saved) : ['#C1272D', '#FFFFFF', '#111111', '#D4AF37']
    } catch {
      return ['#C1272D', '#FFFFFF', '#111111', '#D4AF37']
    }
  })

  // Extracted Colors from Poster Image
  const [extractedColors, setExtractedColors] = useState([])
  const [extracting, setExtracting] = useState(false)

  // Channel Mode ('H' | 'S' | 'B' | 'R' | 'G' | 'B_RGB')
  const [mode, setMode] = useState('H')

  // Inputs String State for typing safety
  const currentRgb = hexToRgb(colorHex)
  const currentHsb = rgbToHsb(currentRgb.r, currentRgb.g, currentRgb.b)
  const currentCmyk = rgbToCmyk(currentRgb.r, currentRgb.g, currentRgb.b)

  const [hStr, setHStr] = useState(String(currentHsb.h))
  const [sStr, setSStr] = useState(String(currentHsb.s))
  const [bStr, setBStr] = useState(String(currentHsb.b))

  const [rStr, setRStr] = useState(String(currentRgb.r))
  const [gStr, setGStr] = useState(String(currentRgb.g))
  const [bRgbStr, setBRgbStr] = useState(String(currentRgb.b))

  const [cStr, setCStr] = useState(String(currentCmyk.c))
  const [mStr, setMStr] = useState(String(currentCmyk.m))
  const [yStr, setYStr] = useState(String(currentCmyk.y))
  const [kStr, setKStr] = useState(String(currentCmyk.k))

  const [hexStr, setHexStr] = useState(colorHex.replace('#', ''))

  const satValRef = useRef(null)
  const hueRef = useRef(null)
  const nativePickerRef = useRef(null)
  const isDraggingSatVal = useRef(false)
  const isDraggingHue = useRef(false)

  // Sync inputs when colorHex changes
  const updateAllFromHex = (newHex) => {
    const formatted = newHex.toUpperCase()
    setColorHex(formatted)
    setHexStr(formatted.replace('#', ''))

    const rgbObj = hexToRgb(formatted)
    const hsbObj = rgbToHsb(rgbObj.r, rgbObj.g, rgbObj.b)
    const cmykObj = rgbToCmyk(rgbObj.r, rgbObj.g, rgbObj.b)

    setHStr(String(hsbObj.h))
    setSStr(String(hsbObj.s))
    setBStr(String(hsbObj.b))

    setRStr(String(rgbObj.r))
    setGStr(String(rgbObj.g))
    setBRgbStr(String(rgbObj.b))

    setCStr(String(cmykObj.c))
    setMStr(String(cmykObj.m))
    setYStr(String(cmykObj.y))
    setKStr(String(cmykObj.k))
  }

  // Extract Colors from Poster Image using Off-Screen Canvas Sampling
  useEffect(() => {
    if (!posterImage) return
    setExtracting(true)

    const img = new Image()
    img.crossOrigin = 'anonymous'
    let imgUrl = typeof posterImage === 'string' ? posterImage : posterImage.url || posterImage.path || ''
    if (!imgUrl) return

    img.src = imgUrl
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = 60
        canvas.height = 60
        ctx.drawImage(img, 0, 0, 60, 60)
        const imgData = ctx.getImageData(0, 0, 60, 60).data

        const colorCounts = {}
        for (let i = 0; i < imgData.length; i += 16) {
          const r = Math.round(imgData[i] / 24) * 24
          const g = Math.round(imgData[i + 1] / 24) * 24
          const b = Math.round(imgData[i + 2] / 24) * 24
          const alpha = imgData[i + 3]
          if (alpha < 128) continue

          const hex = rgbToHex(r, g, b)
          colorCounts[hex] = (colorCounts[hex] || 0) + 1
        }

        const sorted = Object.keys(colorCounts)
          .sort((a, b) => colorCounts[b] - colorCounts[a])
          .slice(0, 8)

        setExtractedColors(sorted.length > 0 ? sorted : ['#34495E', '#D4AF37', '#C1272D', '#F4EBD9'])
      } catch {
        setExtractedColors(['#34495E', '#D4AF37', '#C1272D', '#F4EBD9'])
      } finally {
        setExtracting(false)
      }
    }
    img.onerror = () => setExtracting(false)
  }, [posterImage])

  // Handle HSB inputs
  const handleHsbInput = (hVal, sVal, bVal) => {
    const h = clamp(hVal, 0, 360)
    const s = clamp(sVal, 0, 100)
    const b = clamp(bVal, 0, 100)
    const rgbObj = hsbToRgb(h, s, b)
    updateAllFromHex(rgbToHex(rgbObj.r, rgbObj.g, rgbObj.b))
  }

  // Handle RGB inputs
  const handleRgbInput = (rVal, gVal, bVal) => {
    const r = clamp(rVal, 0, 255)
    const g = clamp(gVal, 0, 255)
    const b = clamp(bVal, 0, 255)
    updateAllFromHex(rgbToHex(r, g, b))
  }

  // Handle CMYK inputs
  const handleCmykInput = (cVal, mVal, yVal, kVal) => {
    const c = clamp(cVal, 0, 100)
    const m = clamp(mVal, 0, 100)
    const y = clamp(yVal, 0, 100)
    const k = clamp(kVal, 0, 100)
    const rgbObj = cmykToRgb(c, m, y, k)
    updateAllFromHex(rgbToHex(rgbObj.r, rgbObj.g, rgbObj.b))
  }

  // Pointer Movement Handlers
  const handleSatValMove = (e) => {
    if (!satValRef.current) return
    const rect = satValRef.current.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY

    let x = Math.max(0, Math.min(rect.width, clientX - rect.left))
    let y = Math.max(0, Math.min(rect.height, clientY - rect.top))

    const newS = Math.round((x / rect.width) * 100)
    const newB = Math.round((1 - y / rect.height) * 100)

    const rgbObj = hsbToRgb(currentHsb.h, newS, newB)
    updateAllFromHex(rgbToHex(rgbObj.r, rgbObj.g, rgbObj.b))
  }

  const handleSatValDown = (e) => {
    isDraggingSatVal.current = true
    handleSatValMove(e)
  }

  const handleHueMove = (e) => {
    if (!hueRef.current) return
    const rect = hueRef.current.getBoundingClientRect()
    const isHorizontal = rect.width > rect.height * 1.5
    let ratio = 0
    if (isHorizontal) {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      let x = Math.max(0, Math.min(rect.width, clientX - rect.left))
      ratio = x / rect.width
    } else {
      const clientY = e.touches ? e.touches[0].clientY : e.clientY
      let y = Math.max(0, Math.min(rect.height, clientY - rect.top))
      ratio = y / rect.height
    }

    const newH = Math.round(ratio * 360)
    const rgbObj = hsbToRgb(newH, currentHsb.s, currentHsb.b)
    updateAllFromHex(rgbToHex(rgbObj.r, rgbObj.g, rgbObj.b))
  }

  const handleHueDown = (e) => {
    isDraggingHue.current = true
    handleHueMove(e)
  }

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (isDraggingSatVal.current) handleSatValMove(e)
      if (isDraggingHue.current) handleHueMove(e)
    }

    const handlePointerUp = () => {
      isDraggingSatVal.current = false
      isDraggingHue.current = false
    }

    window.addEventListener('mousemove', handlePointerMove)
    window.addEventListener('mouseup', handlePointerUp)
    window.addEventListener('touchmove', handlePointerMove)
    window.addEventListener('touchend', handlePointerUp)
    return () => {
      window.removeEventListener('mousemove', handlePointerMove)
      window.removeEventListener('mouseup', handlePointerUp)
      window.removeEventListener('touchmove', handlePointerMove)
      window.removeEventListener('touchend', handlePointerUp)
    }
  }, [currentHsb.h, currentHsb.s, currentHsb.b])

  // Screen Eyedropper
  const handlePickEyedropper = async () => {
    if (window.EyeDropper) {
      try {
        const eyeDropper = new window.EyeDropper()
        const result = await eyeDropper.open()
        if (result?.sRGBHex) {
          updateAllFromHex(result.sRGBHex.toUpperCase())
        }
      } catch {}
    } else if (nativePickerRef.current) {
      nativePickerRef.current.click()
    }
  }

  const handleCopyHex = () => {
    navigator.clipboard.writeText(colorHex).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleApplyColor = () => {
    // Add to recent colors
    try {
      const updated = [colorHex, ...recentColors.filter((c) => c !== colorHex)].slice(0, 10)
      localStorage.setItem('pw_recent_border_colors', JSON.stringify(updated))
    } catch {}

    onSelectColor(colorHex)
    onClose()
  }

  const pureHueRgb = hsbToRgb(currentHsb.h, 100, 100)
  const pureHueCss = `rgb(${pureHueRgb.r}, ${pureHueRgb.g}, ${pureHueRgb.b})`
  const posterImgUrl = typeof posterImage === 'string' ? posterImage : posterImage?.url || posterImage?.path || null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[120] flex items-center justify-center p-3 sm:p-5" onClick={onClose}>
      <div 
        className="bg-[#141416] text-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-white/15 select-none animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER BAR */}
        <div className="flex justify-between items-center px-6 py-4 bg-[#1A1A1E] border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-yellow/20 border border-brand-yellow/40 flex items-center justify-center text-brand-yellow shadow-sm">
              <Palette size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-gray-100 leading-tight">Master Color Studio</h3>
              <p className="text-[11px] text-gray-400 font-medium">Custom Border Color Engine · 100% Print Safe</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyHex}
              className="px-3 py-1.5 rounded-xl bg-[#25252A] hover:bg-[#303038] border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-all text-gray-300 hover:text-white"
            >
              {copied ? <CheckCircle size={14} className="text-green-400" /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : colorHex}</span>
            </button>
            <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center gap-2 px-6 pt-3.5 bg-[#17171A] border-b border-white/10 overflow-x-auto">
          {[
            { id: 'studio', label: 'Photoshop Studio', icon: Sliders },
            ...(posterImgUrl ? [{ id: 'extract', label: 'Match Poster Colors', icon: Sparkles }] : []),
            { id: 'palettes', label: 'Curated Studio Palettes', icon: Palette },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-t-xl text-xs font-extrabold flex items-center gap-2 transition-all border-t border-x ${
                  isActive
                    ? 'bg-[#141416] text-brand-yellow border-white/15 border-b-transparent shadow-sm'
                    : 'bg-transparent text-gray-400 hover:text-white border-transparent'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-brand-yellow' : 'text-gray-400'} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* TAB CONTENTS */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">

          {/* 1. STUDIO VIEW */}
          {activeTab === 'studio' && (
            <div className="grid grid-cols-1 md:grid-cols-[1fr_24px_210px] gap-5 items-stretch">
              
              {/* 2D SPECTRUM BOX */}
              <div 
                ref={satValRef}
                onMouseDown={handleSatValDown}
                onTouchStart={handleSatValDown}
                className="relative w-full aspect-square rounded-2xl overflow-hidden cursor-crosshair shadow-2xl border border-white/15 min-h-[220px]"
                style={{
                  backgroundColor: pureHueCss,
                  backgroundImage: 'linear-gradient(to right, #ffffff, transparent), linear-gradient(to top, #000000, transparent)',
                }}
              >
                <div 
                  className="absolute w-5 h-5 rounded-full border-2 border-white shadow-2xl pointer-events-none -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                  style={{
                    left: `${currentHsb.s}%`,
                    top: `${100 - currentHsb.b}%`,
                    backgroundColor: colorHex,
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-black/40" />
                </div>
              </div>

              {/* HUE BAR (HORIZONTAL ON MOBILE, VERTICAL ON DESKTOP) */}
              <div 
                ref={hueRef}
                onMouseDown={handleHueDown}
                onTouchStart={handleHueDown}
                className="relative w-full h-7 md:h-full min-h-0 md:min-h-[220px] rounded-2xl overflow-hidden cursor-pointer shadow-lg border border-white/15 shrink-0"
              >
                <div 
                  className="w-full h-full block md:hidden"
                  style={{
                    background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
                  }}
                />
                <div 
                  className="w-full h-full hidden md:block"
                  style={{
                    background: 'linear-gradient(to bottom, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
                  }}
                />
                <div 
                  className="absolute hidden md:block left-0 right-0 h-3.5 bg-white rounded-md border border-black/80 shadow-md pointer-events-none -translate-y-1/2"
                  style={{ top: `${(currentHsb.h / 360) * 100}%` }}
                />
                <div 
                  className="absolute md:hidden top-0 bottom-0 w-3.5 bg-white rounded-md border border-black/80 shadow-md pointer-events-none -translate-x-1/2"
                  style={{ left: `${(currentHsb.h / 360) * 100}%` }}
                />
              </div>

              {/* RIGHT CONTROLS PANEL */}
              <div className="flex flex-col justify-between space-y-4 bg-[#1C1C22] p-4 rounded-2xl border border-white/10">
                
                {/* DUAL PREVIEW SWATCH */}
                <div>
                  <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">Color Preview</p>
                  <div className="w-full h-14 rounded-xl overflow-hidden border border-white/20 shadow-inner flex">
                    <div className="flex-1 h-full flex flex-col items-center justify-center text-[10px] font-extrabold text-black/60 shadow-sm" style={{ backgroundColor: colorHex }}>
                      <span>New</span>
                    </div>
                    <div className="flex-1 h-full flex flex-col items-center justify-center text-[10px] font-extrabold text-white/60" style={{ backgroundColor: initialColor }}>
                      <span>Original</span>
                    </div>
                  </div>
                </div>

                {/* HSB / RGB / CMYK NUMERIC EDITABLE INPUTS */}
                <div className="space-y-2 text-xs">
                  {/* HUE */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 cursor-pointer text-gray-300 font-bold">
                      <input type="radio" name="studiomode" checked={mode === 'H'} onChange={() => setMode('H')} className="accent-brand-yellow" />
                      <span>H:</span>
                    </label>
                    <div className="flex items-center bg-[#272730] border border-white/15 rounded-lg px-2 py-1 w-20">
                      <input 
                        type="number" min={0} max={360} value={hStr}
                        onChange={(e) => { setHStr(e.target.value); handleHsbInput(Number(e.target.value), currentHsb.s, currentHsb.b) }}
                        className="w-full bg-transparent text-right font-mono text-white outline-none font-bold text-xs"
                      />
                      <span className="text-gray-400 ml-1 font-bold">°</span>
                    </div>
                  </div>

                  {/* SATURATION */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 cursor-pointer text-gray-300 font-bold">
                      <input type="radio" name="studiomode" checked={mode === 'S'} onChange={() => setMode('S')} className="accent-brand-yellow" />
                      <span>S:</span>
                    </label>
                    <div className="flex items-center bg-[#272730] border border-white/15 rounded-lg px-2 py-1 w-20">
                      <input 
                        type="number" min={0} max={100} value={sStr}
                        onChange={(e) => { setSStr(e.target.value); handleHsbInput(currentHsb.h, Number(e.target.value), currentHsb.b) }}
                        className="w-full bg-transparent text-right font-mono text-white outline-none font-bold text-xs"
                      />
                      <span className="text-gray-400 ml-1 font-bold">%</span>
                    </div>
                  </div>

                  {/* BRIGHTNESS */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 cursor-pointer text-gray-300 font-bold">
                      <input type="radio" name="studiomode" checked={mode === 'B'} onChange={() => setMode('B')} className="accent-brand-yellow" />
                      <span>B:</span>
                    </label>
                    <div className="flex items-center bg-[#272730] border border-white/15 rounded-lg px-2 py-1 w-20">
                      <input 
                        type="number" min={0} max={100} value={bStr}
                        onChange={(e) => { setBStr(e.target.value); handleHsbInput(currentHsb.h, currentHsb.s, Number(e.target.value)) }}
                        className="w-full bg-transparent text-right font-mono text-white outline-none font-bold text-xs"
                      />
                      <span className="text-gray-400 ml-1 font-bold">%</span>
                    </div>
                  </div>

                  <div className="border-t border-white/10 my-1 pt-1" />

                  {/* RED, GREEN, BLUE */}
                  <div className="grid grid-cols-3 gap-1 text-[11px]">
                    <div className="bg-[#272730] border border-white/10 rounded-lg p-1 text-center">
                      <span className="text-gray-400 text-[10px] block">R</span>
                      <input 
                        type="number" min={0} max={255} value={rStr}
                        onChange={(e) => { setRStr(e.target.value); handleRgbInput(Number(e.target.value), currentRgb.g, currentRgb.b) }}
                        className="w-full bg-transparent text-center font-mono text-white font-bold outline-none"
                      />
                    </div>
                    <div className="bg-[#272730] border border-white/10 rounded-lg p-1 text-center">
                      <span className="text-gray-400 text-[10px] block">G</span>
                      <input 
                        type="number" min={0} max={255} value={gStr}
                        onChange={(e) => { setGStr(e.target.value); handleRgbInput(currentRgb.r, Number(e.target.value), currentRgb.b) }}
                        className="w-full bg-transparent text-center font-mono text-white font-bold outline-none"
                      />
                    </div>
                    <div className="bg-[#272730] border border-white/10 rounded-lg p-1 text-center">
                      <span className="text-gray-400 text-[10px] block">B</span>
                      <input 
                        type="number" min={0} max={255} value={bRgbStr}
                        onChange={(e) => { setBRgbStr(e.target.value); handleRgbInput(currentRgb.r, currentRgb.g, Number(e.target.value)) }}
                        className="w-full bg-transparent text-center font-mono text-white font-bold outline-none"
                      />
                    </div>
                  </div>

                  {/* CMYK BREAKDOWN FOR PRODUCTION */}
                  <div className="bg-[#212128] rounded-lg p-1.5 border border-white/5 flex justify-between text-[10px] text-gray-400 font-mono">
                    <span>C: {currentCmyk.c}%</span>
                    <span>M: {currentCmyk.m}%</span>
                    <span>Y: {currentCmyk.y}%</span>
                    <span>K: {currentCmyk.k}%</span>
                  </div>
                </div>

                {/* HEX INPUT & EYEDROPPER */}
                <div className="space-y-1.5 pt-1 border-t border-white/10">
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Hex Code</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center bg-[#272730] border border-white/15 rounded-xl px-3 py-1.5 focus-within:border-brand-yellow">
                      <span className="text-gray-400 text-xs font-bold mr-1">#</span>
                      <input 
                        type="text" value={hexStr}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase().replace(/[^0-9A-F]/g, '').slice(0, 6)
                          setHexStr(val)
                          if (val.length === 6) updateAllFromHex(`#${val}`)
                        }}
                        className="w-full bg-transparent text-xs font-mono text-white outline-none font-extrabold tracking-wider uppercase"
                        maxLength={6}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handlePickEyedropper}
                      className="p-2 bg-[#272730] hover:bg-[#32323E] border border-white/15 rounded-xl text-brand-yellow hover:scale-105 transition-all"
                      title="Pick Color from Screen / Image"
                    >
                      <Pipette size={16} />
                    </button>
                    <input ref={nativePickerRef} type="color" value={colorHex} onChange={(e) => updateAllFromHex(e.target.value)} className="hidden" />
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 2. MATCH POSTER COLORS VIEW */}
          {activeTab === 'extract' && (
            <div className="space-y-5">
              <div className="bg-[#1C1C22] p-4 rounded-2xl border border-white/10 flex items-center gap-4">
                {posterImgUrl && (
                  <img src={posterImgUrl} alt={posterName} className="w-16 h-20 object-contain bg-white/5 rounded-xl border border-white/10 shrink-0" />
                )}
                <div>
                  <h4 className="font-extrabold text-sm text-gray-100 mb-1">Harmonious Poster Palette</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Auto-extracted dominant color tones from <strong>{posterName}</strong>. Select any color below to seamlessly match your custom border.
                  </p>
                </div>
              </div>

              {extracting ? (
                <div className="py-12 text-center text-gray-400 animate-pulse text-xs font-bold">
                  Extracting harmonious colors from poster image...
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                  {extractedColors.map((hex, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => updateAllFromHex(hex)}
                      className={`group flex flex-col items-center gap-2 p-2 rounded-2xl bg-[#1C1C22] border transition-all hover:scale-105 ${
                        colorHex.toUpperCase() === hex.toUpperCase() ? 'border-brand-yellow ring-2 ring-brand-yellow/50 shadow-lg' : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="w-full aspect-square rounded-xl border border-white/20 shadow-md" style={{ backgroundColor: hex }} />
                      <span className="text-[10px] font-mono font-bold text-gray-300 uppercase">{hex}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. CURATED STUDIO PALETTES VIEW */}
          {activeTab === 'palettes' && (
            <div className="space-y-5">
              {PALETTE_CATEGORIES.map((cat, idx) => (
                <div key={idx} className="bg-[#1C1C22] p-4 rounded-2xl border border-white/10 space-y-3">
                  <h4 className="font-extrabold text-xs text-brand-yellow uppercase tracking-wider">{cat.name}</h4>
                  <div className="flex flex-wrap gap-3">
                    {cat.colors.map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => updateAllFromHex(hex)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#25252E] border transition-all hover:scale-105 ${
                          colorHex.toUpperCase() === hex.toUpperCase() ? 'border-brand-yellow ring-2 ring-brand-yellow/50' : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-lg border border-white/20 shrink-0" style={{ backgroundColor: hex }} />
                        <span className="text-xs font-mono font-bold text-gray-200 uppercase">{hex}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* RECENTLY USED COLORS STRIP */}
          {recentColors.length > 0 && (
            <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold shrink-0">
                <History size={14} className="text-brand-yellow" />
                <span>Recent Colors:</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {recentColors.map((hex, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => updateAllFromHex(hex)}
                    className="w-6 h-6 rounded-lg border border-white/20 transition-transform hover:scale-110 shrink-0"
                    style={{ backgroundColor: hex }}
                    title={hex}
                  />
                ))}
              </div>
            </div>
          )}

          {/* LIVE MOCKUP PREVIEW IN FOOTER */}
          {posterImgUrl && (
            <div className="bg-[#19191D] p-3.5 rounded-2xl border border-white/10 flex items-center gap-4">
              <div 
                className="w-12 h-16 rounded-lg overflow-hidden border border-white/20 shrink-0 transition-all flex items-center justify-center"
                style={{ backgroundColor: colorHex, padding: '4px' }}
              >
                <img src={posterImgUrl} alt="Poster" className="w-full h-full object-contain" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-extrabold text-gray-200">Live Framed Border Preview</p>
                <p className="text-[11px] text-gray-400 font-mono">Selected: <strong className="text-brand-yellow">{colorHex}</strong> · Ready for high-res print</p>
              </div>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-[#2D2D35] hover:bg-[#383842] text-gray-200 font-extrabold py-3.5 rounded-2xl text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyColor}
              className="flex-2 bg-brand-yellow text-brand-black hover:bg-yellow-400 font-extrabold py-3.5 px-6 rounded-2xl text-xs transition-all flex items-center justify-center gap-2 shadow-glow"
            >
              <Check size={18} /> Apply Custom Border Color
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
