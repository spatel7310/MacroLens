import { SectionCard } from '../ui/SectionCard'
import { GlowBadge } from '../ui/GlowBadge'
import { Skeleton } from '../ui/Skeleton'
import { useFedData } from '@/hooks/useMarketData'
import { formatRate } from '@/lib/formatters'

export function FedTracker() {
  const { data, isLoading } = useFedData()

  if (isLoading) {
    return (
      <SectionCard title="Fed Tracker" accent="yellow">
        <div className="space-y-3">
          <Skeleton className="h-10" />
          <Skeleton className="h-8" />
        </div>
      </SectionCard>
    )
  }

  if (!data) return null

  const stanceVariant = data.stance === 'Dovish' ? 'bullish' : data.stance === 'Hawkish' ? 'bearish' : 'neutral'
  const decisionVariant = data.lastDecision === 'cut' ? 'bullish' : data.lastDecision === 'hike' ? 'bearish' : 'neutral'

  return (
    <SectionCard title="Fed Tracker" accent="yellow">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-chrome/50 uppercase tracking-wider">Next FOMC</div>
            <div className="text-sm font-bold text-yellow glow-yellow">{data.nextMeeting}</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-yellow glow-yellow">{data.countdown}</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-chrome/50 uppercase tracking-wider">Current Rate</div>
            <div className="text-sm text-chrome">
              {formatRate(data.currentRate.lower)} – {formatRate(data.currentRate.upper)}
            </div>
          </div>
          <div className="flex gap-2">
            <GlowBadge variant={decisionVariant}>
              {data.lastDecision}
            </GlowBadge>
            <GlowBadge variant={stanceVariant}>
              {data.stance}
            </GlowBadge>
          </div>
        </div>
      </div>
    </SectionCard>
  )
}
