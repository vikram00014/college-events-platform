export function PulseLoader() {
  return (
    <div className="flex space-x-2 justify-center items-center">
      <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce"></div>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="bg-gradient-to-r from-slate-200 via-slate-50 to-slate-200 h-48 rounded-t-xl"></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-slate-200 rounded"></div>
          <div className="h-3 bg-slate-200 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  )
}
