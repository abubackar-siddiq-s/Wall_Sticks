import { useEffect, useState } from 'react'
import { useApiData } from './useApiData'

const SETTINGS_CACHE_KEY = 'pw_settings_cache'

const defaultSettings = {
  businessName: 'WallSticks',
  ownerName: 'Palani Kumar',
  phone: '+91 88705 58436',
  whatsapp: '+91 88705 58436',
  email: 'wallsticks0319@gmail.com',
  instagram: '@wall_sticks_official',
  instagramUrl: 'https://www.instagram.com/wall_sticks_official',
  address: 'Perundurai, Erode, Tamil Nadu, India',
  upiId: 'wallsticks@okhdfcbank',
  courierCharge: 79,
  gstPercent: 0,
  pickupAddress: 'Perundurai, Erode, Tamil Nadu',
}

function getInitialSettings() {
  try {
    const cached = localStorage.getItem(SETTINGS_CACHE_KEY)
    if (cached) {
      const parsed = JSON.parse(cached)
      if (parsed && typeof parsed === 'object' && parsed.sizePrices) {
        return parsed
      }
    }
  } catch {}
  return defaultSettings
}

export function useSettings() {
  const [initial] = useState(getInitialSettings)
  const { data, loading, error, refetch } = useApiData('/settings', initial)

  useEffect(() => {
    if (data) {
      try {
        localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(data))
      } catch {}
    }
  }, [data])

  useEffect(() => {
    const handleUpdate = () => refetch()
    window.addEventListener('settingsUpdated', handleUpdate)
    return () => window.removeEventListener('settingsUpdated', handleUpdate)
  }, [refetch])

  const settings = data || initial || defaultSettings
  return { settings, loading: loading && !settings?.sizePrices, error, refetch }
}
