import type { ReactNode } from 'react'
import { Header } from './Header'
import { StatusBar } from './StatusBar'
import { usePullToRefresh } from '@/hooks/usePullToRefresh'

function PullIndicator({ distance, ready }: { distance: number; ready: boolean }) {
  if (distance <= 0) return null
  const rotation = Math.min(distance / 80 * 360, 360)
  const opacity = Math.min(distance / 40, 1)
  const scale = ready ? 1 : Math.min(distance / 80, 1)

  return (
    <div
      className="flex items-center justify-center overflow-hidden"
      style={{ height: distance }}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        className={ready ? 'animate-spin' : ''}
        style={{
          opacity,
          transform: ready ? undefined : `rotate(${rotation}deg) scale(${scale})`,
          color: ready ? '#00f0ff' : '#a0a0b0',
          transition: ready ? undefined : 'color 0.15s',
        }}
      >
        <path
          d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const { pullDistance, ready } = usePullToRefresh()

  return (
    <div className="scanlines cyber-grid min-h-dvh flex flex-col">
      <PullIndicator distance={pullDistance} ready={ready} />
      <main
        className="flex-1 px-4 pb-4 max-w-4xl mx-auto w-full"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
      >
        <Header />
        <div className="flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-4">
          {children}
        </div>
      </main>
      <StatusBar />
    </div>
  )
}
