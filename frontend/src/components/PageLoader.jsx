// Minimal branded loading state shown briefly while a route chunk downloads.
// Code-splitting means this can appear on slow connections/navigations — keeping it
// tiny and dependency-free means it never itself becomes the thing you're waiting on.
export default function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-[3px] border-brand-yellow border-t-transparent animate-spin" />
        <span className="text-xs font-semibold text-black/30 tracking-wide">Loading</span>
      </div>
    </div>
  )
}
