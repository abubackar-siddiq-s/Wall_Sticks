/**
 * Utility to calculate exact unit price for cart items and posters based on Admin Size Pricing settings.
 * Prevents baseline schema price (e.g. 399) from polluting cart calculations or rehydrating on page refresh.
 */
export function getItemUnitPrice(item, sizePrices) {
  if (!item) return 0

  // 1. Custom poster: use custom uploaded price
  if (item.isCustom || item.product?.isCustom) {
    return Number(item.product?.price ?? item.priceAtAdd ?? item.price ?? 399)
  }

  // 2. Exact match from Admin sizePrices matrix (e.g. A5 -> 25, A4 -> 50)
  if (sizePrices && typeof sizePrices === 'object' && item.size && sizePrices[item.size] !== undefined) {
    return Number(sizePrices[item.size])
  }

  // 3. Explicit priceAtAdd saved when added to cart
  if (item.priceAtAdd !== undefined && item.priceAtAdd !== null && Number(item.priceAtAdd) !== 399) {
    return Number(item.priceAtAdd)
  }

  if (item.price !== undefined && item.price !== null && Number(item.price) !== 399) {
    return Number(item.price)
  }

  // 4. Default size fallback
  if (item.size === 'A5') return 25
  if (item.size === 'A4') return 50

  // 5. Fallback to product price if reasonable or default 50
  const prodPrice = Number(item.product?.price)
  return (prodPrice && prodPrice !== 399) ? prodPrice : 50
}
