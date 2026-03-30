import { AppShell } from './components/layout/AppShell'
import { MacroSnapshot } from './components/sections/MacroSnapshot'
import { FedTracker } from './components/sections/FedTracker'
import { MarketHealth } from './components/sections/MarketHealth'
import { RealEstateSignals } from './components/sections/RealEstateSignals'
import { EconomicCalendar } from './components/sections/EconomicCalendar'
import { CuratedNews } from './components/sections/CuratedNews'
import { YieldCurve } from './components/sections/YieldCurve'
import { DealAnalyzer } from './components/sections/DealAnalyzer'
import { LaborMarket } from './components/sections/LaborMarket'
import { AlertsPanel } from './components/sections/AlertsPanel'
import { AlertToastStack } from './components/ui/AlertToast'
import { useWebSocket } from './hooks/useWebSocket'
import { useAlerts } from './hooks/useAlerts'
import { useMacroData, useMarketData, useRealEstateData } from './hooks/useMarketData'

function AlertsProvider() {
  const { data: macroData } = useMacroData()
  const { data: marketData } = useMarketData()
  const { data: realEstateData } = useRealEstateData()
  const { toasts, dismissToast } = useAlerts(macroData, marketData, realEstateData)

  return (
    <AlertToastStack
      toasts={toasts}
      onDismiss={dismissToast}
    />
  )
}

export default function App() {
  useWebSocket()

  return (
    <AppShell>
      <AlertsProvider />
      <div className="md:col-span-2">
        <MacroSnapshot />
      </div>
      <FedTracker />
      <MarketHealth />
      <div className="md:col-span-2">
        <LaborMarket />
      </div>
      <div className="md:col-span-2">
        <YieldCurve />
      </div>
      <div className="md:col-span-2">
        <RealEstateSignals />
      </div>
      <div className="md:col-span-2">
        <DealAnalyzer />
      </div>
      <div className="md:col-span-2">
        <EconomicCalendar />
      </div>
      <div className="md:col-span-2">
        <CuratedNews />
      </div>
      <div className="md:col-span-2">
        <AlertsPanel />
      </div>
    </AppShell>
  )
}
