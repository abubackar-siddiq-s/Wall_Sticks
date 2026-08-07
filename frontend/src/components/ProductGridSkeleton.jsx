// Shimmering placeholder cards shown while product data is loading, so the layout doesn't
// jump from "empty" to "full" — matches ProductCard's proportions exactly.
export default function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl2 overflow-hidden bg-white shadow-soft">
          <div className="aspect-[3/4] bg-gradient-to-r from-brand-smoke via-black/5 to-brand-smoke bg-[length:400%_100%] animate-shimmer" />
          <div className="p-4 space-y-2">
            <div className="h-3.5 w-3/4 rounded bg-brand-smoke" />
            <div className="h-3 w-1/2 rounded bg-brand-smoke" />
            <div className="h-4 w-1/3 rounded bg-brand-smoke" />
          </div>
        </div>
      ))}
    </div>
  )
}
