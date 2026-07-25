import { useApiData } from './useApiData'
import { products as mockProducts } from '../data/mockData'

// Backend shape is { products, total, page, pages } — normalize to a plain array either way.
export function useProducts(query = '') {
  const { data, loading, isLive } = useApiData(`/products${query}`, { products: mockProducts }, [query])
  const raw = Array.isArray(data) ? data : (data?.products ?? [])
  const products = raw.length > 0 ? raw : mockProducts
  return { products, loading, isLive }
}

export function useTrendingProducts() {
  const fallback = mockProducts.filter((p) => p.trending).slice(0, 8)
  const { data, loading, isLive } = useApiData('/products/trending', fallback)
  return { products: Array.isArray(data) ? data : fallback, loading, isLive }
}

export function useProduct(id) {
  const fallback = mockProducts.find((p) => p._id === id) || mockProducts[0]
  const { data, loading, isLive } = useApiData(`/products/${id}`, fallback, [id])
  return { product: data, loading, isLive }
}
