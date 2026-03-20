import { useState } from 'react'
import { SectionCard } from '../ui/SectionCard'
import { NumberTicker } from '../ui/NumberTicker'
import { TrendArrow } from '../ui/TrendArrow'
import { GlowBadge } from '../ui/GlowBadge'
import { Skeleton } from '../ui/Skeleton'
import { ChartModal } from '../ui/ChartModal'
import { useMacroData } from '@/hooks/useMarketData'
import { useRealtimeStore } from '@/stores/realtimeStore'
import { formatPrice, formatPercent, formatRate } from '@/lib/formatters'

function MetricCell({
  label,
  tappable,
  onTap,
  children,
}: {
  label: string
  tappable?: boolean
  onTap?: () => void
  children: React.ReactNode
}) {
  return (
    <div
      className={`flex flex-col gap-1 ${tappable ? 'active:bg-cyan/5 rounded-md -m-1.5 p-1.5 cursor-pointer' : ''}`}
      onClick={tappable ? onTap : undefined}
    >
      <span className="text-[10px] text-chrome/50 uppercase tracking-wider">
        {label}
        {tappable && (
          <svg className="inline-block ml-1 -mt-px" width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M1 3h4m0 0L3.5 1.5M5 3l-1.5 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <div className="text-sm font-bold">{children}</div>
    </div>
  )
}

interface ChartTarget {
  seriesId: string
  label: string
  color: string
}

export function MacroSnapshot() {
  const { data, isLoading } = useMacroData()
  const spyQuote = useRealtimeStore((s) => s.quotes['SPY'])
  const [chart, setChart] = useState<ChartTarget | null>(null)

  if (isLoading) {
    return (
      <SectionCard title="Macro Snapshot" accent="cyan">
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      </SectionCard>
    )
  }

  if (!data) return null

  const sp500Price = spyQuote?.price ?? data.sp500.price
  const changePct = data.sp500.changePercent

  return (
    <>
      <SectionCard title="Macro Snapshot" accent="cyan">
        <div className="grid grid-cols-2 gap-4">
          <MetricCell label="S&P 500">
            <div className="flex items-center gap-2">
              <NumberTicker value={sp500Price} format={formatPrice} className="text-cyan" />
              <span className={changePct >= 0 ? 'text-green text-xs' : 'text-magenta text-xs'}>
                {formatPercent(changePct)}
              </span>
              <TrendArrow direction={changePct > 0 ? 'up' : changePct < 0 ? 'down' : 'flat'} />
            </div>
          </MetricCell>

          <MetricCell
            label="10Y Treasury"
            tappable
            onTap={() => setChart({ seriesId: 'DGS10', label: '10Y Treasury Yield', color: '#00f0ff' })}
          >
            <div className="flex items-center gap-2">
              <NumberTicker value={data.treasury10Y} format={(n) => formatRate(n)} className="text-chrome" />
              <span className={data.treasury10YChange >= 0 ? 'text-magenta text-xs' : 'text-green text-xs'}>
                {data.treasury10YChange >= 0 ? '+' : ''}{data.treasury10YChange.toFixed(2)}
              </span>
              <TrendArrow direction={data.treasury10YChange > 0 ? 'up' : data.treasury10YChange < 0 ? 'down' : 'flat'} />
            </div>
          </MetricCell>

          <MetricCell
            label="30Y Mortgage"
            tappable
            onTap={() => setChart({ seriesId: 'MORTGAGE30US', label: '30Y Mortgage Rate', color: '#05ffa1' })}
          >
            <NumberTicker value={data.mortgageRate} format={(n) => formatRate(n)} className="text-chrome" />
          </MetricCell>

          <MetricCell label="Fed Funds Rate">
            <span className="text-chrome">
              {formatRate(data.fedRate.lower)} – {formatRate(data.fedRate.upper)}
            </span>
          </MetricCell>

          <MetricCell
            label="CPI YoY"
            tappable
            onTap={() => setChart({ seriesId: 'CPIAUCSL', label: 'CPI (Consumer Price Index)', color: '#fcee0a' })}
          >
            <div className="flex items-center gap-2">
              <NumberTicker value={data.cpiYoY} format={(n) => formatPercent(n)} className="text-chrome" />
              <GlowBadge variant={data.cpiYoY > 3 ? 'alert' : data.cpiYoY > 2 ? 'neutral' : 'bullish'}>
                {data.cpiYoY > 3 ? 'Hot' : data.cpiYoY > 2 ? 'Warm' : 'Cool'}
              </GlowBadge>
            </div>
          </MetricCell>
        </div>
      </SectionCard>

      {chart && (
        <ChartModal
          seriesId={chart.seriesId}
          label={chart.label}
          color={chart.color}
          onClose={() => setChart(null)}
        />
      )}
    </>
  )
}
