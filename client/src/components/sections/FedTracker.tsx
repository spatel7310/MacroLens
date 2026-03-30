import { useState } from 'react'
import { SectionCard } from '../ui/SectionCard'
import { GlowBadge } from '../ui/GlowBadge'
import { Skeleton } from '../ui/Skeleton'
import { ChartModal } from '../ui/ChartModal'
import { useFedData } from '@/hooks/useMarketData'
import { formatRate } from '@/lib/formatters'

export function FedTracker() {
  const { data, isLoading } = useFedData()
  const [showChart, setShowChart] = useState(false)

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
    <>
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

          <div
            className="flex items-center justify-between active:bg-yellow/5 rounded-md -mx-1.5 px-1.5 -my-1 py-1 cursor-pointer"
            onClick={() => setShowChart(true)}
          >
            <div>
              <div className="text-[10px] text-chrome/50 uppercase tracking-wider">
                Current Rate
                <svg className="inline-block ml-1 -mt-px" width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1 3h4m0 0L3.5 1.5M5 3l-1.5 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
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
        <p className="text-[10px] text-chrome/35 leading-relaxed mt-2">
          The federal funds rate is the interest rate banks charge each other overnight. The Fed raises it to cool inflation and cuts it to stimulate growth — it ripples through mortgages, car loans, and savings rates.
        </p>
      </SectionCard>

      {showChart && (
        <ChartModal
          seriesId="DFEDTARU"
          label="Fed Funds Rate (Upper)"
          color="#fcee0a"
          defaultRange="1Y"
          onClose={() => setShowChart(false)}
        />
      )}
    </>
  )
}
