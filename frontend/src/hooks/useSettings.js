import { useEffect } from 'react'
import { useApiData } from './useApiData'

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

export function useSettings() {
  const { data, loading, error, refetch } = useApiData('/settings', null)

  useEffect(() => {
    const handleUpdate = () => refetch()
    window.addEventListener('settingsUpdated', handleUpdate)
    return () => window.removeEventListener('settingsUpdated', handleUpdate)
  }, [refetch])

  return { settings: data || defaultSettings, loading, error, refetch }
}
