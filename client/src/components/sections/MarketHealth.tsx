import { SectionCard } from '../ui/SectionCard'
import { NumberTicker } from '../ui/NumberTicker'
import { GlowBadge } from '../ui/GlowBadge'
import { Skeleton } from '../ui/Skeleton'
import { CollapsibleDescription } from '../ui/CollapsibleDescription'
import { useMarketData } from '@/hooks/useMarketData'
import { useDescriptionToggle } from '@/hooks/useDescriptionToggle'

export function MarketHealth() {
  const { data, isLoading } = useMarketData()
  const [descVisible, toggleDesc] = useDescriptionToggle('market-health')

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
    <SectionCard title="Market Health" accent="cyan" onClick={toggleDesc}>
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
      <CollapsibleDescription visible={descVisible}>
        <div className="mt-2 space-y-1">
          <p className="text-[10px] text-chrome/35 leading-relaxed">
            The VIX measures expected market volatility over the next 30 days, often called the "fear gauge."
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-chrome/30">
            <span><span className="text-green/50">0–15</span> Low volatility, complacency</span>
            <span><span className="text-yellow/50">15–25</span> Normal range</span>
            <span><span className="text-magenta/50">25–35</span> Elevated fear</span>
            <span><span className="text-magenta/50">35+</span> Extreme fear / crisis</span>
          </div>
        </div>
      </CollapsibleDescription>
    </SectionCard>
  )
}
