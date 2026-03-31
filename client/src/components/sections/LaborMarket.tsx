import { useState } from 'react'
import { SectionCard } from '../ui/SectionCard'
import { NumberTicker } from '../ui/NumberTicker'
import { TrendArrow } from '../ui/TrendArrow'
import { GlowBadge } from '../ui/GlowBadge'
import { Skeleton } from '../ui/Skeleton'
import { ChartModal } from '../ui/ChartModal'
import { CollapsibleDescription } from '../ui/CollapsibleDescription'
import { useLaborData } from '@/hooks/useMarketData'
import { useDescriptionToggle } from '@/hooks/useDescriptionToggle'
import { formatRate } from '@/lib/formatters'

function formatClaims(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

interface ChartTarget {
  seriesId: string
  label: string
  color: string
  formatValue?: (v: number) => string
}

export function LaborMarket() {
  const { data, isLoading } = useLaborData()
  const [chart, setChart] = useState<ChartTarget | null>(null)
  const [descVisible, toggleDesc] = useDescriptionToggle('labor-market')

  if (isLoading) {
    return (
      <SectionCard title="Labor Market" accent="cyan">
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
        </div>
      </SectionCard>
    )
  }

  if (!data) return null

  const signalVariant =
    data.signal === 'Strong' ? 'bullish' : data.signal === 'Weakening' ? 'bearish' : 'neutral'

  const unemploymentDirection =
    data.unemployment.trend === 'Rising' ? 'up' : data.unemployment.trend === 'Falling' ? 'down' : 'flat'

  const claimsDirection = data.claims.trend === 'Increasing' ? 'up' : 'down'

  return (
    <>
      <SectionCard title="Labor Market" accent="cyan" onClick={toggleDesc}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] text-chrome/50 uppercase tracking-wider">Labor Signal</span>
          <GlowBadge variant={signalVariant}>{data.signal}</GlowBadge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <div
              className="w-fit active:bg-cyan/5 rounded-md -m-1.5 p-1.5 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                setChart({
                  seriesId: 'UNRATE',
                  label: 'Unemployment Rate',
                  color: '#00f0ff',
                })
              }}
            >
              <span className="text-[10px] text-chrome/50 uppercase tracking-wider">
                Unemployment Rate
                <svg className="inline-block ml-1 -mt-px" width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1 3h4m0 0L3.5 1.5M5 3l-1.5 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <div className="text-sm font-bold flex items-center gap-2">
                <NumberTicker value={data.unemployment.current} format={formatRate} className="text-chrome" />
                <TrendArrow direction={unemploymentDirection} />
                <span className="text-[10px] text-chrome/40">{data.unemployment.trend}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div
              className="w-fit active:bg-cyan/5 rounded-md -m-1.5 p-1.5 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                setChart({
                  seriesId: 'ICSA',
                  label: 'Initial Jobless Claims',
                  color: '#05ffa1',
                  formatValue: (v: number) => v.toLocaleString('en-US', { maximumFractionDigits: 0 }),
                })
              }}
            >
              <span className="text-[10px] text-chrome/50 uppercase tracking-wider">
                Jobless Claims
                <svg className="inline-block ml-1 -mt-px" width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1 3h4m0 0L3.5 1.5M5 3l-1.5 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <div className="text-sm font-bold flex items-center gap-2">
                <NumberTicker value={data.claims.latest} format={formatClaims} className="text-chrome" />
                <TrendArrow direction={claimsDirection} />
                <span className="text-[10px] text-chrome/40">{data.claims.trend}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-chrome/10 flex items-center gap-2 text-[10px] text-chrome/40">
          <span>4wk Avg Claims:</span>
          <span className="text-chrome/60 font-bold">{formatClaims(data.claims.fourWeekAvg)}</span>
          <span className="ml-auto">vs 3mo Unemployment:</span>
          <span className="text-chrome/60 font-bold">{formatRate(data.unemployment.previous)}</span>
        </div>
        <CollapsibleDescription visible={descVisible}>
          <p className="text-[10px] text-chrome/35 leading-relaxed mt-2">
            Rising unemployment and increasing jobless claims signal a weakening economy. The Fed often watches these closely — a sharp rise in claims can foreshadow recession and trigger rate cuts.
          </p>
        </CollapsibleDescription>
      </SectionCard>

      {chart && (
        <ChartModal
          seriesId={chart.seriesId}
          label={chart.label}
          color={chart.color}
          defaultRange="6M"
          formatValue={chart.formatValue}
          onClose={() => setChart(null)}
        />
      )}
    </>
  )
}
