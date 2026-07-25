import { useApiData } from './useApiData'

export function useProducts(query = '') {
  const { data, loading, error } = useApiData(`/products${query}`, { products: [] }, [query])
  const products = Array.isArray(data) ? data : (data?.products ?? [])
  return { products, loading, error }
}

export function useTrendingProducts() {
  const { data, loading, error } = useApiData('/products/trending', [])
  const products = Array.isArray(data) ? data : []
  return { products, loading, error }
}

export function useProduct(id) {
  const { data, loading, error } = useApiData(`/products/${id}`, null, [id])
  return { product: data, loading, error }
}
