import { useState } from 'react'
import { SectionCard } from '../ui/SectionCard'
import { GlowBadge } from '../ui/GlowBadge'
import { useAlertStore } from '@/stores/alertStore'
import type { AlertRule } from '@/types'

function AddRuleForm({ onAdd }: { onAdd: (rule: AlertRule) => void }) {
  const [label, setLabel] = useState('')
  const [metric, setMetric] = useState('vix')
  const [operator, setOperator] = useState<'>' | '<'>('>')
  const [threshold, setThreshold] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!label || !threshold) return
    onAdd({
      id: `custom-${Date.now()}`,
      label,
      metric,
      operator,
      threshold: parseFloat(threshold),
      enabled: true,
      cooldownMinutes: 60,
    })
    setLabel('')
    setThreshold('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-cyan/10">
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Label"
        className="flex-1 min-w-[100px] bg-void border border-cyan/20 rounded px-2 py-1 text-xs text-chrome focus:border-cyan/50 outline-none"
      />
      <select
        value={metric}
        onChange={(e) => setMetric(e.target.value)}
        className="bg-void border border-cyan/20 rounded px-2 py-1 text-xs text-chrome"
      >
        <option value="vix">VIX</option>
        <option value="mortgageRate">Mortgage Rate</option>
        <option value="sp500ChangePercent">S&P 500 Change %</option>
      </select>
      <select
        value={operator}
        onChange={(e) => setOperator(e.target.value as '>' | '<')}
        className="bg-void border border-cyan/20 rounded px-2 py-1 text-xs text-chrome"
      >
        <option value=">">&gt;</option>
        <option value="<">&lt;</option>
      </select>
      <input
        value={threshold}
        onChange={(e) => setThreshold(e.target.value)}
        placeholder="Value"
        type="number"
        step="any"
        className="w-16 bg-void border border-cyan/20 rounded px-2 py-1 text-xs text-chrome focus:border-cyan/50 outline-none"
      />
      <button
        type="submit"
        className="bg-cyan/10 border border-cyan/30 rounded px-3 py-1 text-xs text-cyan hover:bg-cyan/20 transition-colors"
      >
        Add
      </button>
    </form>
  )
}

export function AlertsPanel() {
  const { rules, triggered, toggleRule, removeRule, addRule, dismissAlert } = useAlertStore()
  const activeAlerts = triggered.filter((a) => !a.dismissed)

  return (
    <SectionCard title="Alerts" accent="yellow">
      {activeAlerts.length > 0 && (
        <div className="space-y-2 mb-3">
          {activeAlerts.slice(0, 5).map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between text-xs py-1 text-yellow"
            >
              <span>⚠ {alert.message}</span>
              <button
                onClick={() => dismissAlert(alert.id)}
                className="text-chrome/40 hover:text-chrome ml-2"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <div className="text-[10px] text-chrome/40 uppercase tracking-wider">Rules</div>
        {rules.map((rule) => (
          <div key={rule.id} className="flex items-center justify-between text-xs py-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleRule(rule.id)}
                className={`h-4 w-4 rounded border text-[10px] flex items-center justify-center ${
                  rule.enabled ? 'border-cyan bg-cyan/20 text-cyan' : 'border-chrome/30 text-chrome/30'
                }`}
              >
                {rule.enabled ? '✓' : ''}
              </button>
              <span className={rule.enabled ? 'text-chrome' : 'text-chrome/40'}>
                {rule.label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <GlowBadge variant={rule.enabled ? 'bullish' : 'neutral'}>
                {rule.operator}{rule.threshold}
              </GlowBadge>
              <button
                onClick={() => removeRule(rule.id)}
                className="text-chrome/30 hover:text-magenta text-xs"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <AddRuleForm onAdd={addRule} />
    </SectionCard>
  )
}
