import type { ReactNode } from 'react'
import { Header } from './Header'
import { StatusBar } from './StatusBar'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="scanlines cyber-grid min-h-dvh flex flex-col">
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
