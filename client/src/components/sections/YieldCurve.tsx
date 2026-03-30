import { useState } from 'react'
import { SectionCard } from '../ui/SectionCard'
import { NumberTicker } from '../ui/NumberTicker'
import { TrendArrow } from '../ui/TrendArrow'
import { GlowBadge } from '../ui/GlowBadge'
import { Skeleton } from '../ui/Skeleton'
import { ChartModal } from '../ui/ChartModal'
import { useYieldCurveData } from '@/hooks/useMarketData'
import { formatRate } from '@/lib/formatters'

interface ChartTarget {
  seriesId: string
  label: string
  color: string
  formatValue?: (v: number) => string
}

function InfoTip({ text }: { text: string }) {
  return (
    <p className="text-[10px] text-chrome/35 leading-relaxed mt-1">{text}</p>
  )
}

export function YieldCurve() {
  const { data, isLoading } = useYieldCurveData()
  const [chart, setChart] = useState<ChartTarget | null>(null)

  if (isLoading) {
    return (
      <SectionCard title="Yield Curve" accent="yellow">
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
        </div>
      </SectionCard>
    )
  }

  if (!data) return null

  const spreadColor =
    data.spread < 0 ? 'text-magenta' : data.spread <= 0.5 ? 'text-yellow' : 'text-green'

  const curveVariant =
    data.curveStatus === 'Normal' ? 'bullish' : data.curveStatus === 'Inverted' ? 'bearish' : 'alert'

  const recessionVariant =
    data.recessionSignal === 'Normal' ? 'bullish' : data.recessionSignal === 'Inversion (Warning)' ? 'bearish' : 'alert'

  const sentimentDirection =
    data.sentiment.trend === 'Rising' ? 'up' : data.sentiment.trend === 'Falling' ? 'down' : 'flat'

  const sentimentColor =
    data.sentiment.current >= 80 ? 'text-green' : data.sentiment.current >= 60 ? 'text-chrome' : data.sentiment.current >= 50 ? 'text-yellow' : 'text-magenta'

  return (
    <>
      <SectionCard title="Yield Curve" accent="yellow">
        {/* Curve Status + Recession Signal */}
        <div className="flex items-center justify-between mb-3">
          <GlowBadge variant={curveVariant}>{data.curveStatus}</GlowBadge>
          <GlowBadge variant={recessionVariant}>{data.recessionSignal}</GlowBadge>
        </div>

        {/* Treasury Yields + Spread */}
        <div className="grid grid-cols-3 gap-4 mb-1">
          <div
            className="flex flex-col gap-1 active:bg-cyan/5 rounded-md -m-1.5 p-1.5 cursor-pointer"
            onClick={() =>
              setChart({ seriesId: 'DGS10', label: '10Y Treasury Yield', color: '#00f0ff' })
            }
          >
            <span className="text-[10px] text-chrome/50 uppercase tracking-wider">
              10Y Yield
              <svg className="inline-block ml-1 -mt-px" width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M1 3h4m0 0L3.5 1.5M5 3l-1.5 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <NumberTicker value={data.treasury10Y} format={formatRate} className="text-sm font-bold text-chrome" />
          </div>

          <div
            className="flex flex-col gap-1 active:bg-cyan/5 rounded-md -m-1.5 p-1.5 cursor-pointer"
            onClick={() =>
              setChart({ seriesId: 'DGS2', label: '2Y Treasury Yield', color: '#05ffa1' })
            }
          >
            <span className="text-[10px] text-chrome/50 uppercase tracking-wider">
              2Y Yield
              <svg className="inline-block ml-1 -mt-px" width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M1 3h4m0 0L3.5 1.5M5 3l-1.5 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <NumberTicker value={data.treasury2Y} format={formatRate} className="text-sm font-bold text-chrome" />
          </div>

          <div
            className="flex flex-col gap-1 active:bg-cyan/5 rounded-md -m-1.5 p-1.5 cursor-pointer"
            onClick={() =>
              setChart({
                seriesId: 'T10Y2Y',
                label: '10Y-2Y Yield Spread',
                color: data.spread < 0 ? '#ff2a6d' : '#fcee0a',
                formatValue: (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`,
              })
            }
          >
            <span className="text-[10px] text-chrome/50 uppercase tracking-wider">
              Spread
              <svg className="inline-block ml-1 -mt-px" width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M1 3h4m0 0L3.5 1.5M5 3l-1.5 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className={`text-sm font-bold ${spreadColor}`}>
              {data.spread >= 0 ? '+' : ''}{data.spread.toFixed(2)}%
            </span>
          </div>
        </div>

        <InfoTip text="The yield curve compares short-term vs long-term bond rates. When long-term rates fall below short-term (inversion), it has historically preceded every U.S. recession in the past 50 years." />

        {/* Consumer Sentiment */}
        <div className="mt-3 pt-3 border-t border-chrome/10">
          <div
            className="flex items-center justify-between active:bg-cyan/5 rounded-md -m-1.5 p-1.5 cursor-pointer"
            onClick={() =>
              setChart({
                seriesId: 'UMCSENT',
                label: 'Consumer Sentiment Index',
                color: '#fcee0a',
                formatValue: (v: number) => v.toFixed(1),
              })
            }
          >
            <div>
              <span className="text-[10px] text-chrome/50 uppercase tracking-wider">
                Consumer Sentiment
                <svg className="inline-block ml-1 -mt-px" width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1 3h4m0 0L3.5 1.5M5 3l-1.5 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <div className="text-sm font-bold flex items-center gap-2 mt-1">
                <NumberTicker value={data.sentiment.current} format={(n) => n.toFixed(1)} className={sentimentColor} />
                <TrendArrow direction={sentimentDirection} />
                <span className="text-[10px] text-chrome/40">
                  prev {data.sentiment.previous.toFixed(1)}
                </span>
              </div>
            </div>
            <GlowBadge
              variant={data.sentiment.current >= 70 ? 'bullish' : data.sentiment.current >= 55 ? 'neutral' : 'bearish'}
            >
              {data.sentiment.current >= 70 ? 'Optimistic' : data.sentiment.current >= 55 ? 'Cautious' : 'Pessimistic'}
            </GlowBadge>
          </div>
          <InfoTip text="University of Michigan survey measuring how confident consumers feel about the economy. Higher values mean people feel comfortable spending, which drives ~70% of U.S. GDP." />
        </div>
      </SectionCard>

      {chart && (
        <ChartModal
          seriesId={chart.seriesId}
          label={chart.label}
          color={chart.color}
          defaultRange="1Y"
          formatValue={chart.formatValue}
          onClose={() => setChart(null)}
        />
      )}
    </>
  )
}
