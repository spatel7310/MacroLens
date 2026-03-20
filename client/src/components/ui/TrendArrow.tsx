export function TrendArrow({ direction }: { direction: 'up' | 'down' | 'flat' }) {
  if (direction === 'flat') {
    return <span className="text-chrome text-sm">→</span>
  }
  if (direction === 'up') {
    return (
      <svg width="12" height="12" viewBox="0 0 12 12" className="inline-block">
        <path d="M6 2L10 7H2L6 2Z" fill="#05ffa1" />
      </svg>
    )
  }
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" className="inline-block">
      <path d="M6 10L2 5H10L6 10Z" fill="#ff2a6d" />
    </svg>
  )
}
