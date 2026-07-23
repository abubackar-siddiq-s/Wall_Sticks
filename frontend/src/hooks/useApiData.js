import { useState, useEffect } from 'react'
import api from '../lib/api'

// Generic "try the live API, fall back to demo data" hook.
// This lets every page work immediately with mock data (no backend needed to demo),
// but automatically switches to real data the moment VITE_API_URL points at a running backend.
export function useApiData(endpoint, fallbackData, deps = []) {
  const [data, setData] = useState(fallbackData)
  const [loading, setLoading] = useState(true)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api.get(endpoint)
      .then((res) => {
        if (cancelled) return
        setData(res.data)
        setIsLive(true)
      })
      .catch(() => {
        if (cancelled) return
        setData(fallbackData)
        setIsLive(false)
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, isLive }
}
