/**
 * Utility to calculate exact unit price for cart items and posters based on Admin Size Pricing settings.
 * Prevents baseline schema price (e.g. 399) from polluting cart calculations or rehydrating on page refresh.
 */
export function getItemUnitPrice(item, sizePrices) {
  if (!item) return 0

  // 1. Custom poster artwork
  if (item.isCustom || item.product?.isCustom) {
    return Number(item.product?.price ?? item.priceAtAdd ?? item.price ?? 399)
  }

  // 2. Exact price configured by Admin in Size Pricing Management (/admin/size-pricing)
  if (sizePrices && typeof sizePrices === 'object' && item.size && sizePrices[item.size] !== undefined && sizePrices[item.size] !== null) {
    return Number(sizePrices[item.size])
  }

  // 3. Saved priceAtAdd when item was added to cart
  if (item.priceAtAdd !== undefined && item.priceAtAdd !== null && Number(item.priceAtAdd) > 0 && Number(item.priceAtAdd) !== 399) {
    return Number(item.priceAtAdd)
  }

  // 4. Product explicit price if configured
  if (item.price !== undefined && item.price !== null && Number(item.price) > 0 && Number(item.price) !== 399) {
    return Number(item.price)
  }

  if (item.product?.price && Number(item.product.price) > 0 && Number(item.product.price) !== 399) {
    return Number(item.product.price)
  }

  return 0
}
