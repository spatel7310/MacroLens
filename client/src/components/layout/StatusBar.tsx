import { PulseIndicator } from '../ui/PulseIndicator'
import { useRealtimeStore } from '@/stores/realtimeStore'

export function StatusBar() {
  const connected = useRealtimeStore((s) => s.connected)

  return (
    <div className="sticky bottom-0 z-40 flex items-center justify-between border-t border-cyan/10 bg-void/95 backdrop-blur px-4 py-2 text-[10px]"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-center gap-2 text-chrome/50">
        <PulseIndicator active={connected} />
        <span>{connected ? 'LIVE' : 'OFFLINE'}</span>
      </div>
      <div className="text-chrome/30">
        MacroLens &middot; Data delayed
      </div>
    </div>
  )
}
