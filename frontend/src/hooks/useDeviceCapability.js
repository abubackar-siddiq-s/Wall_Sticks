import { useEffect, useState } from 'react'

// Cheap, synchronous-ish heuristics to decide whether to spend the ~150kb+ Three.js/R3F
// bundle and a WebGL canvas on this visitor, or serve a much lighter static hero instead.
// Errs toward the light version when signals are ambiguous — a slightly less flashy hero
// beats a janky one on a low-end phone.
function detectLite() {
  if (typeof window === 'undefined') return true

  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
  if (prefersReducedMotion) return true

  const cores = navigator.hardwareConcurrency || 4
  const memory = navigator.deviceMemory // Chrome/Android only; undefined elsewhere
  if (memory && memory <= 4) return true
  if (cores <= 2) return true

  const saveData = navigator.connection?.saveData
  const slowConnection = ['slow-2g', '2g', '3g'].includes(navigator.connection?.effectiveType)
  if (saveData || slowConnection) return true

  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) return true
  } catch {
    return true
  }

  return false
}

export function useDeviceCapability() {
  const [lite, setLite] = useState(() => detectLite())

  useEffect(() => {
    // Re-check once after mount in case connection info wasn't ready synchronously
    setLite(detectLite())
  }, [])

  return { lite }
}
