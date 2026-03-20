type Variant = 'bullish' | 'bearish' | 'neutral' | 'alert'

const styles: Record<Variant, string> = {
  bullish: 'text-green border-green/40 bg-green/10',
  bearish: 'text-magenta border-magenta/40 bg-magenta/10',
  neutral: 'text-chrome border-chrome/30 bg-chrome/10',
  alert: 'text-yellow border-yellow/40 bg-yellow/10',
}

export function GlowBadge({
  variant,
  children,
}: {
  variant: Variant
  children: React.ReactNode
}) {
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles[variant]}`}
    >
      {children}
    </span>
  )
}
