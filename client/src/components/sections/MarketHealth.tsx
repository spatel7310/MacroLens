import { SectionCard } from '../ui/SectionCard'
import { NumberTicker } from '../ui/NumberTicker'
import { GlowBadge } from '../ui/GlowBadge'
import { Skeleton } from '../ui/Skeleton'
import { useMarketData } from '@/hooks/useMarketData'

export function MarketHealth() {
  const { data, isLoading } = useMarketData()

  if (isLoading) {
    return (
      <SectionCard title="Market Health" accent="cyan">
        <Skeleton className="h-14" />
      </SectionCard>
    )
  }

  if (!data) return null

  const trendVariant = data.trend === 'Risk-On' ? 'bullish' : data.trend === 'Risk-Off' ? 'bearish' : 'alert'
  const vixColor = data.vix < 16 ? 'text-green' : data.vix < 25 ? 'text-yellow' : 'text-magenta'

  return (
    <SectionCard title="Market Health" accent="cyan">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] text-chrome/50 uppercase tracking-wider">VIX</div>
          <NumberTicker
            value={data.vix}
            format={(n) => n.toFixed(2)}
            className={`text-2xl font-bold ${vixColor}`}
          />
        </div>
        <GlowBadge variant={trendVariant}>{data.trend}</GlowBadge>
      </div>
    </SectionCard>
  )
}
