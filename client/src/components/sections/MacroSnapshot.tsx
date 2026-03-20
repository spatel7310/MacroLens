import { SectionCard } from '../ui/SectionCard'
import { NumberTicker } from '../ui/NumberTicker'
import { TrendArrow } from '../ui/TrendArrow'
import { GlowBadge } from '../ui/GlowBadge'
import { Skeleton } from '../ui/Skeleton'
import { useMacroData } from '@/hooks/useMarketData'
import { useRealtimeStore } from '@/stores/realtimeStore'
import { formatPrice, formatPercent, formatRate } from '@/lib/formatters'

function MetricCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] text-chrome/50 uppercase tracking-wider">{label}</span>
      <div className="text-sm font-bold">{children}</div>
    </div>
  )
}

export function MacroSnapshot() {
  const { data, isLoading } = useMacroData()
  const spyQuote = useRealtimeStore((s) => s.quotes['SPY'])

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

        <MetricCell label="10Y Treasury">
          <NumberTicker value={data.treasury10Y} format={(n) => formatRate(n)} className="text-chrome" />
        </MetricCell>

        <MetricCell label="30Y Mortgage">
          <NumberTicker value={data.mortgageRate} format={(n) => formatRate(n)} className="text-chrome" />
        </MetricCell>

        <MetricCell label="Fed Funds Rate">
          <span className="text-chrome">
            {formatRate(data.fedRate.lower)} – {formatRate(data.fedRate.upper)}
          </span>
        </MetricCell>

        <MetricCell label="CPI YoY">
          <div className="flex items-center gap-2">
            <NumberTicker value={data.cpiYoY} format={(n) => formatPercent(n)} className="text-chrome" />
            <GlowBadge variant={data.cpiYoY > 3 ? 'alert' : data.cpiYoY > 2 ? 'neutral' : 'bullish'}>
              {data.cpiYoY > 3 ? 'Hot' : data.cpiYoY > 2 ? 'Warm' : 'Cool'}
            </GlowBadge>
          </div>
        </MetricCell>
      </div>
    </SectionCard>
  )
}
