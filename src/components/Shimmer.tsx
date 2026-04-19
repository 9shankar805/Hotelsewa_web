export function HotelCardShimmer() {
  return (
    <div className="card overflow-hidden">
      <div className="shimmer h-52 w-full" />
      <div className="p-4 space-y-3">
        <div className="shimmer h-5 w-3/4 rounded-lg" />
        <div className="shimmer h-3 w-1/2 rounded-lg" />
        <div className="flex gap-2">
          <div className="shimmer h-6 w-14 rounded-lg" />
          <div className="shimmer h-6 w-14 rounded-lg" />
          <div className="shimmer h-6 w-14 rounded-lg" />
        </div>
        <div className="flex justify-between items-center">
          <div className="shimmer h-7 w-24 rounded-lg" />
          <div className="shimmer h-9 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function StatCardShimmer() {
  return (
    <div className="card p-4 space-y-3">
      <div className="flex justify-between">
        <div className="shimmer w-9 h-9 rounded-xl" />
        <div className="shimmer w-14 h-5 rounded-full" />
      </div>
      <div className="shimmer h-7 w-20 rounded-lg" />
      <div className="shimmer h-3 w-16 rounded-lg" />
    </div>
  )
}

export function TableRowShimmer({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="shimmer h-4 rounded-lg" style={{ width: `${60 + Math.random() * 40}%` }} />
        </td>
      ))}
    </tr>
  )
}
