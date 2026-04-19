export function formatPrice(price: number, currency = '₹'): string {
  if (price >= 100000) return `${currency}${(price / 100000).toFixed(1)}L`
  if (price >= 1000) return `${currency}${(price / 1000).toFixed(1)}K`
  return `${currency}${price.toLocaleString()}`
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    confirmed: 'text-green-600 bg-green-50',
    pending: 'text-yellow-600 bg-yellow-50',
    cancelled: 'text-red-600 bg-red-50',
    completed: 'text-blue-600 bg-blue-50',
    checked_in: 'text-purple-600 bg-purple-50',
    checked_out: 'text-gray-600 bg-gray-50',
  }
  return map[status?.toLowerCase()] || 'text-gray-600 bg-gray-50'
}

export function parseHotelImage(images: unknown): string {
  const fallback = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600'
  if (!images) return fallback
  if (typeof images === 'string') {
    if (images.startsWith('http')) return images
    try {
      const arr = JSON.parse(images)
      if (Array.isArray(arr) && arr[0]) return arr[0]
    } catch { /* ignore */ }
  }
  if (Array.isArray(images) && images[0]) return String(images[0])
  return fallback
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}
