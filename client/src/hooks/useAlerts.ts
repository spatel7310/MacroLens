import { useEffect, useRef, useState } from 'react'
import { useAlertStore } from '@/stores/alertStore'
import type { MacroData, MarketData, RealEstateData } from '@/types'

interface MetricValues {
  mortgageRate?: number
  sp500ChangePercent?: number
  vix?: number
  fedRateChange?: number
}

function getMetricValue(metric: string, values: MetricValues): number | undefined {
  return values[metric as keyof MetricValues]
}

function evaluate(value: number, operator: string, threshold: number): boolean {
  switch (operator) {
    case '>': return value > threshold
    case '<': return value < threshold
    case '>=': return value >= threshold
    case '<=': return value <= threshold
    default: return false
  }
}

export function useAlerts(
  macroData?: MacroData,
  marketData?: MarketData,
  _realEstateData?: RealEstateData
) {
  const { rules, triggerAlert, updateRuleCooldown } = useAlertStore()
  const [latestToast, setLatestToast] = useState<{ id: string; message: string } | null>(null)
  const prevValues = useRef<MetricValues>({})

  useEffect(() => {
    const values: MetricValues = {
      mortgageRate: macroData?.mortgageRate ?? _realEstateData?.mortgageRate,
      sp500ChangePercent: macroData?.sp500.changePercent,
      vix: marketData?.vix,
      fedRateChange: macroData ? 0 : undefined, // computed from fed data changes
    }

    const now = Date.now()

    for (const rule of rules) {
      if (!rule.enabled) continue
      const value = getMetricValue(rule.metric, values)
      if (value === undefined) continue

      // Check cooldown
      if (rule.lastTriggered) {
        const cooldownMs = rule.cooldownMinutes * 60_000
        if (now - rule.lastTriggered < cooldownMs) continue
      }

      if (evaluate(value, rule.operator, rule.threshold)) {
        const alertId = `${rule.id}-${now}`
        triggerAlert({
          id: alertId,
          ruleId: rule.id,
          message: `${rule.label}: ${value.toFixed(2)}`,
          timestamp: now,
          dismissed: false,
        })
        updateRuleCooldown(rule.id, now)
        setLatestToast({ id: alertId, message: `${rule.label}: ${value.toFixed(2)}` })
      }
    }

    prevValues.current = values
  }, [macroData, marketData, _realEstateData, rules, triggerAlert, updateRuleCooldown])

  return {
    latestToast,
    dismissToast: () => setLatestToast(null),
  }
}
