export function formatPrice(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function formatPercent(n: number, decimals = 2): string {
  return `${n >= 0 ? '+' : ''}${n.toFixed(decimals)}%`
}

export function formatRate(n: number): string {
  return `${n.toFixed(2)}%`
}

export function relativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function countdown(targetDate: string): string {
  const now = Date.now()
  const target = new Date(targetDate).getTime()
  const diffMs = target - now
  if (diffMs <= 0) return 'Today'
  const days = Math.floor(diffMs / 86_400_000)
  if (days === 0) return 'Tomorrow'
  return `${days}d`
}
