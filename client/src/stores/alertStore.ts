import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AlertRule, TriggeredAlert } from '@/types'
import { DEFAULT_ALERT_RULES } from '@/lib/constants'

interface AlertState {
  rules: AlertRule[]
  triggered: TriggeredAlert[]
  addRule: (rule: AlertRule) => void
  removeRule: (id: string) => void
  toggleRule: (id: string) => void
  triggerAlert: (alert: TriggeredAlert) => void
  dismissAlert: (id: string) => void
  clearDismissed: () => void
  updateRuleCooldown: (ruleId: string, timestamp: number) => void
}

export const useAlertStore = create<AlertState>()(
  persist(
    (set) => ({
      rules: DEFAULT_ALERT_RULES,
      triggered: [],
      addRule: (rule) =>
        set((state) => ({ rules: [...state.rules, rule] })),
      removeRule: (id) =>
        set((state) => ({ rules: state.rules.filter((r) => r.id !== id) })),
      toggleRule: (id) =>
        set((state) => ({
          rules: state.rules.map((r) =>
            r.id === id ? { ...r, enabled: !r.enabled } : r
          ),
        })),
      triggerAlert: (alert) =>
        set((state) => ({ triggered: [alert, ...state.triggered].slice(0, 50) })),
      dismissAlert: (id) =>
        set((state) => ({
          triggered: state.triggered.map((a) =>
            a.id === id ? { ...a, dismissed: true } : a
          ),
        })),
      clearDismissed: () =>
        set((state) => ({
          triggered: state.triggered.filter((a) => !a.dismissed),
        })),
      updateRuleCooldown: (ruleId, timestamp) =>
        set((state) => ({
          rules: state.rules.map((r) =>
            r.id === ruleId ? { ...r, lastTriggered: timestamp } : r
          ),
        })),
    }),
    { name: 'MacroLens-alerts' }
  )
)
