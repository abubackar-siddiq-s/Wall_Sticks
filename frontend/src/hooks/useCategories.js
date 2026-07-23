import { useApiData } from './useApiData'
import { categories as mockCategories } from '../data/mockData'

export function useCategories() {
  const { data, loading, isLive } = useApiData('/categories', mockCategories)
  return { categories: Array.isArray(data) && data.length ? data : mockCategories, loading, isLive }
}
