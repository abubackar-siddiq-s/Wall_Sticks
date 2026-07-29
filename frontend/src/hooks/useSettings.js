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
}

export function useSettings() {
  const { data, loading, error } = useApiData('/settings', null)
  return { settings: data || defaultSettings, loading, error }
}
