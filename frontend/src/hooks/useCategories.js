import { useApiData } from './useApiData'

export function useCategories() {
  const { data, loading, error } = useApiData('/categories', [])
  return { categories: Array.isArray(data) ? data : [], loading, error }
}
