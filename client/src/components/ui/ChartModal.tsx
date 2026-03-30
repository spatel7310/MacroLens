import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'
import { api } from '@/lib/api'

const RANGES = ['1M', '3M', '6M', '1Y', '5Y', '15Y'] as const

interface ChartModalProps {
  seriesId: string
  label: string
  color?: string
  defaultRange?: (typeof RANGES)[number]
  formatValue?: (v: number) => string
  onClose: () => void
}

function formatDateLabel(date: string, range: string): string {
  const d = new Date(date)
  if (range === '5Y' || range === '15Y') {
    return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
  }
  if (range === '1Y') {
    return d.toLocaleDateString('en-US', { month: 'short' })
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const defaultFormatValue = (v: number) => `${v.toFixed(2)}%`

function CustomTooltip({ active, payload, label, formatValue }: any) {
  if (!active || !payload?.length) return null
  const fmt = formatValue || defaultFormatValue
  return (
    <div className="bg-void/95 border border-cyan/30 rounded px-3 py-2 text-xs">
      <p className="text-chrome/50">{label}</p>
      <p className="text-cyan font-bold">{fmt(payload[0].value)}</p>
    </div>
  )
}

export function ChartModal({ seriesId, label, color = '#00f0ff', defaultRange = '3M', formatValue, onClose }: ChartModalProps) {
  const [range, setRange] = useState<(typeof RANGES)[number]>(defaultRange)

  const { data, isLoading } = useQuery({
    queryKey: ['history', seriesId, range],
    queryFn: () => api.history(seriesId, range),
  })

  const chartData = data?.data ?? []
  const values = chartData.map((d) => d.value)
  const min = values.length ? Math.min(...values) : 0
  const max = values.length ? Math.max(...values) : 1
  const padding = (max - min) * 0.1 || 0.1

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[9998] bg-void/95 backdrop-blur-md flex flex-col"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex flex-col h-full safe-area-inset"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-2" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
            <div>
              <h2 className="text-sm font-bold text-cyan glow-cyan uppercase tracking-wider">
                {label}
              </h2>
              {chartData.length > 0 && (
                <p className="text-[10px] text-chrome/40 mt-0.5">
                  {chartData[0].date} — {chartData[chartData.length - 1].date}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded border border-chrome/20 text-chrome/60 active:bg-chrome/10"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Range selector */}
          <div className="flex gap-2 px-4 py-3">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`flex-1 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition-colors ${
                  r === range
                    ? 'bg-cyan/15 text-cyan border border-cyan/40'
                    : 'text-chrome/40 border border-chrome/10 active:bg-chrome/5'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Chart */}
          <div className="flex-1 px-2 pb-4 min-h-0">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <span className="text-xs text-chrome/30 uppercase tracking-wider">Loading…</span>
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <span className="text-xs text-chrome/30 uppercase tracking-wider">No data</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id={`grad-${seriesId}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d: string) => formatDateLabel(d, range)}
                    tick={{ fill: '#a0a0b0', fontSize: 10 }}
                    axisLine={{ stroke: '#a0a0b020' }}
                    tickLine={false}
                    interval="preserveStartEnd"
                    minTickGap={50}
                  />
                  <YAxis
                    domain={[min - padding, max + padding]}
                    tick={{ fill: '#a0a0b0', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                    tickFormatter={(v: number) => v.toFixed(1)}
                  />
                  <Tooltip content={<CustomTooltip formatValue={formatValue} />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    strokeWidth={2}
                    fill={`url(#grad-${seriesId})`}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Current value */}
          {chartData.length > 0 && (() => {
            const fmt = formatValue || defaultFormatValue
            const current = chartData[chartData.length - 1].value
            const change = current - chartData[0].value
            return (
              <div className="px-4 pb-6 flex justify-between text-xs">
                <div>
                  <span className="text-chrome/40">Current </span>
                  <span className="text-cyan font-bold">{fmt(current)}</span>
                </div>
                <div>
                  <span className="text-chrome/40">Change </span>
                  <span
                    className={`font-bold ${change >= 0 ? 'text-magenta' : 'text-green'}`}
                  >
                    {change >= 0 ? '+' : ''}{change.toFixed(2)}
                  </span>
                </div>
              </div>
            )
          })()}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
