import { useApiData } from './useApiData'
import { settings as mockSettings } from '../data/mockData'

export function useSettings() {
  const { data, loading, isLive } = useApiData('/settings', mockSettings)
  return { settings: data || mockSettings, loading, isLive }
}
