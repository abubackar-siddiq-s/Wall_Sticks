import { useState, useRef, useEffect } from 'react'
import { X, ZoomIn, RefreshCw, Loader2, Frame } from 'lucide-react'

export default function ImageCropperModal({ file, size, onClose, onCropped }) {
  const [orientation, setOrientation] = useState('portrait') // 'portrait' or 'landscape'
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 })
  const [isInteracting, setIsInteracting] = useState(false) // Trigger gridlines fade-in

  const dragStart = useRef({ x: 0, y: 0 })
  const containerRef = useRef(null)
  const imgRef = useRef(null)
  const [imgUrl, setImgUrl] = useState('')
  const touchStartDist = useRef(0)
  const lastScale = useRef(1)

  useEffect(() => {
    if (!file) return
    const url = URL.createObjectURL(file)
    setImgUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  // Reset scale and offset when orientation or file changes
  useEffect(() => {
    setScale(1)
    setOffset({ x: 0, y: 0 })
  }, [orientation, file])

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.currentTarget
    setNaturalSize({ width: naturalWidth, height: naturalHeight })
  }

  // Calculate dynamic aspect ratio based on selected poster size
  const getBaseAspect = () => {
    if (!size) return 3 / 4 // Default to standard 3:4 portrait
    const s = size.toLowerCase()
    if (s.includes('a5') || s.includes('a4') || s.includes('a3')) {
      return 1 / 1.4142 // A-series standard aspect ratio
    }
    if (s.includes('12x18') || s.includes('24x36') || s.includes('2x3')) {
      return 2 / 3 // 2:3 aspect ratio
    }
    if (s.includes('18x24') || s.includes('3x4')) {
      return 3 / 4 // 3:4 aspect ratio
    }
    return 3 / 4
  }

  const baseAspect = getBaseAspect()
  const targetAspect = orientation === 'portrait' ? baseAspect : 1 / baseAspect

  // Fit the crop box within a standard max 250px viewport on screen
  const maxBoundingSize = 250
  let boxW = maxBoundingSize
  let boxH = maxBoundingSize

  if (targetAspect < 1) {
    boxH = maxBoundingSize
    boxW = maxBoundingSize * targetAspect
  } else {
    boxW = maxBoundingSize
    boxH = maxBoundingSize / targetAspect
  }

  // Calculate base dimensions (fit cover at scale = 1)
  let W_base = 0
  let H_base = 0

  if (naturalSize.width && naturalSize.height) {
    const imageAspect = naturalSize.width / naturalSize.height
    const boxAspect = boxW / boxH

    if (imageAspect > boxAspect) {
      H_base = boxH
      W_base = boxH * imageAspect
    } else {
      W_base = boxW
      H_base = boxW / imageAspect
    }
  }

  // Scaled dimensions and dynamic centered coordinates
  const w = W_base * scale
  const h = H_base * scale
  const x0_curr = (boxW - w) / 2
  const y0_curr = (boxH - h) / 2

  const limitOffset = (x, y, currentScale) => {
    if (!naturalSize.width) return { x: 0, y: 0 }
    const currentW = W_base * currentScale
    const currentH = H_base * currentScale
    
    const x0_val = (boxW - currentW) / 2
    const y0_val = (boxH - currentH) / 2

    const minX = boxW - currentW - x0_val
    const maxX = -x0_val
    const minY = boxH - currentH - y0_val
    const maxY = -y0_val

    return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y))
    }
  }

  const handleMouseDown = (e) => {
    e.preventDefault()
    if (!naturalSize.width) return
    setIsDragging(true)
    setIsInteracting(true)
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y }
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    const nextX = e.clientX - dragStart.current.x
    const nextY = e.clientY - dragStart.current.y
    setOffset(limitOffset(nextX, nextY, scale))
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsInteracting(false)
  }

  // Touch handlers with Pinch-to-Zoom
  const handleTouchStart = (e) => {
    if (!naturalSize.width) return
    setIsInteracting(true)

    if (e.touches.length === 1) {
      setIsDragging(true)
      const touch = e.touches[0]
      dragStart.current = { x: touch.clientX - offset.x, y: touch.clientY - offset.y }
    } else if (e.touches.length === 2) {
      setIsDragging(false)
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      touchStartDist.current = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY)
      lastScale.current = scale
    }
  }

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0]
      const nextX = touch.clientX - dragStart.current.x
      const nextY = touch.clientY - dragStart.current.y
      setOffset(limitOffset(nextX, nextY, scale))
    } else if (e.touches.length === 2) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const currentDist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY)
      const factor = currentDist / touchStartDist.current
      const nextScale = Math.max(1, Math.min(3, lastScale.current * factor))
      setScale(nextScale)
      setOffset(limitOffset(offset.x, offset.y, nextScale))
    }
  }

  const handleWheel = (e) => {
    e.preventDefault()
    if (!naturalSize.width) return
    
    // Zoom sensitivity factor
    const zoomIntensity = 0.05
    const delta = e.deltaY < 0 ? 1 : -1
    const nextScale = Math.max(1, Math.min(3, scale + delta * zoomIntensity))
    
    setScale(nextScale)
    setOffset(limitOffset(offset.x, offset.y, nextScale))
    
    // Fade in grid guides briefly during wheel zoom
    setIsInteracting(true)
    clearTimeout(window.wheelTimer)
    window.wheelTimer = setTimeout(() => setIsInteracting(false), 500)
  }

  const handleScaleChange = (newScale) => {
    setScale(newScale)
    setOffset(limitOffset(offset.x, offset.y, newScale))
  }

  const handleDoubleClick = () => {
    setScale(1)
    setOffset({ x: 0, y: 0 })
  }

  const handleSave = () => {
    if (!naturalSize.width || !naturalSize.height) return

    const canvas = document.createElement('canvas')
    const targetWidth = 1500
    const targetHeight = Math.round(targetWidth / targetAspect)
    canvas.width = targetWidth
    canvas.height = targetHeight
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, targetWidth, targetHeight)

    const left = x0_curr + offset.x
    const top = y0_curr + offset.y

    const scaleFactor = naturalSize.width / w

    const sx = -left * scaleFactor
    const sy = -top * scaleFactor
    const sWidth = boxW * scaleFactor
    const sHeight = boxH * scaleFactor

    ctx.drawImage(
      imgRef.current,
      sx, sy, sWidth, sHeight,
      0, 0, targetWidth, targetHeight
    )

    canvas.toBlob((blob) => {
      if (blob) {
        const croppedFile = new File([blob], file.name || 'cropped-poster.jpg', {
          type: 'image/jpeg',
          lastModified: Date.now()
        })
        onCropped(croppedFile, URL.createObjectURL(croppedFile))
      }
    }, 'image/jpeg', 0.95)
  }

  return (
    <div 
      className="fixed inset-0 bg-black/85 backdrop-blur-md z-[60] flex items-center justify-center p-4"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-brand-black/90 border border-white/10 rounded-3xl p-5 w-full max-w-md shadow-2xl text-white flex flex-col max-h-[95vh]">
        
        {/* Viewfinder Header */}
        <div className="flex justify-between items-start mb-5 pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-yellow animate-pulse" />
              <h3 className="font-extrabold text-base tracking-wide uppercase">Crop & Edit</h3>
            </div>
            <p className="text-[11px] text-white/50 mt-1">Adjust position and framing using the guides below</p>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-white/80 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Viewfinder Body */}
        <div className="flex-1 flex flex-col min-h-0 space-y-3.5">
          
          {/* Orientation Picker */}
          <div className="flex justify-center gap-3">
            {[
              { id: 'portrait', label: 'Portrait' },
              { id: 'landscape', label: 'Landscape' }
            ].map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setOrientation(o.id)}
                className={`flex-1 py-3 rounded-xl text-xs font-bold border-2 transition-all flex items-center justify-center gap-2 ${
                  orientation === o.id
                    ? 'bg-brand-yellow text-brand-black border-brand-yellow font-extrabold shadow-glow'
                    : 'bg-white/5 border-transparent text-white/60 hover:border-white/10'
                }`}
              >
                <Frame size={13} className={orientation === o.id ? 'rotate-0' : 'rotate-90'} />
                <span>{o.label}</span>
              </button>
            ))}
          </div>

          {/* Viewfinder Lens Area */}
          <div className="flex-1 bg-black/60 rounded-2xl flex items-center justify-center overflow-hidden p-3 relative border border-white/5 min-h-[250px] max-h-[270px]">
            
            {/* Viewfinder Crop Box */}
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUp}
              onWheel={handleWheel}
              onDoubleClick={handleDoubleClick}
              className="relative overflow-hidden bg-neutral-950 border border-white/20 shadow-2xl cursor-move transition-shadow duration-300"
              style={{ width: boxW, height: boxH }}
            >
              {imgUrl && (
                <img
                  ref={imgRef}
                  src={imgUrl}
                  onLoad={handleImageLoad}
                  alt="Crop preview"
                  draggable={false}
                  className="absolute pointer-events-none select-none max-w-none max-h-none origin-top-left"
                  style={{
                    width: w,
                    height: h,
                    left: x0_curr + offset.x,
                    top: y0_curr + offset.y,
                    transition: isDragging ? 'none' : 'left 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94), top 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94), width 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94), height 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                  }}
                />
              )}

              {/* Viewfinder Centering Reticle */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-4 h-4 border border-brand-yellow/40 rounded-full flex items-center justify-center">
                  <div className="w-1 h-1 bg-brand-yellow rounded-full" />
                </div>
              </div>

              {/* Corner Tick Marks */}
              <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-brand-yellow/60 pointer-events-none" />
              <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-brand-yellow/60 pointer-events-none" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-brand-yellow/60 pointer-events-none" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-brand-yellow/60 pointer-events-none" />

              {!naturalSize.width && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white text-xs font-semibold gap-2">
                  <Loader2 size={16} className="animate-spin text-brand-yellow" /> Loading Lens...
                </div>
              )}
              
              {/* Leica-style Rule-of-Thirds Gridlines */}
              <div 
                className={`absolute inset-0 pointer-events-none border border-brand-yellow/20 flex transition-opacity duration-300 ${
                  isInteracting ? 'opacity-100' : 'opacity-20'
                }`}
              >
                <div className="w-1/3 h-full border-r border-dashed border-white/20" />
                <div className="w-1/3 h-full border-r border-dashed border-white/20" />
              </div>
              <div 
                className={`absolute inset-0 pointer-events-none flex flex-col transition-opacity duration-300 ${
                  isInteracting ? 'opacity-100' : 'opacity-20'
                }`}
              >
                <div className="h-1/3 w-full border-b border-dashed border-white/20" />
                <div className="h-1/3 w-full border-b border-dashed border-white/20" />
              </div>
            </div>
            
            {/* Viewfinder Subtext Overlay */}
            <div className="absolute bottom-1 right-2 text-[9px] font-mono tracking-widest text-white/30 uppercase pointer-events-none select-none">
              Focal length: 50mm
            </div>
          </div>

          {/* Precision Zoom HUD Slider */}
          <div className="space-y-1.5 bg-white/5 border border-white/5 rounded-2xl p-4">
            <div className="flex justify-between items-center text-xs font-bold text-white/60">
              <span className="flex items-center gap-2"><ZoomIn size={14} className="text-brand-yellow" /> Zoom Magnification</span>
              <span className="font-mono">{Math.round(scale * 100)}%</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="3"
                step="0.01"
                value={scale}
                onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
                className="flex-1 accent-brand-yellow h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
              <button
                type="button"
                onClick={handleDoubleClick}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors"
                title="Reset Frame"
              >
                <RefreshCw size={13} />
              </button>
            </div>
          </div>

        </div>

        {/* Viewfinder Actions */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold tracking-wider uppercase transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-4 rounded-2xl bg-brand-yellow hover:bg-brand-yellow/90 text-brand-black text-xs font-extrabold tracking-wider uppercase shadow-glow transition-all"
          >
            Export Crop
          </button>
        </div>

      </div>
    </div>
  )
}
