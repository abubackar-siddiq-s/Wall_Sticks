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
  sizePrices: {
    A5: 259,
    A4: 319,
    A3: 399,
    '12x18': 499,
    '18x24': 699,
    '24x36': 997,
  },
  sizeDescriptions: {
    A5: 'Small Compact Desk/Shelf Poster (5.8 x 8.3 in)',
    A4: 'Standard Frame Document Poster (8.3 x 11.7 in)',
    A3: 'Medium Wall Accent Poster (11.7 x 16.5 in)',
    '12x18': 'Large Classic Wall Frame Poster (12 x 18 in)',
    '18x24': 'Extra Large Gallery Wall Poster (18 x 24 in)',
    '24x36': 'Masterpiece Giant Wall Art Poster (24 x 36 in)',
  },
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
