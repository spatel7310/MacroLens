import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

type Accent = 'cyan' | 'green' | 'magenta' | 'yellow'

const borderColors: Record<Accent, string> = {
  cyan: 'border-cyan/30',
  green: 'border-green/30',
  magenta: 'border-magenta/30',
  yellow: 'border-yellow/30',
}

const glowClasses: Record<Accent, string> = {
  cyan: 'box-glow-cyan',
  green: 'box-glow-green',
  magenta: 'box-glow-magenta',
  yellow: 'box-glow-yellow',
}

export function SectionCard({
  title,
  accent = 'cyan',
  onClick,
  headerRight,
  children,
}: {
  title: string
  accent?: Accent
  onClick?: () => void
  headerRight?: ReactNode
  children: ReactNode
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`rounded-lg border ${borderColors[accent]} ${glowClasses[accent]} bg-void/80 backdrop-blur-sm p-4`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <h2
          className={`text-xs font-bold uppercase tracking-[0.2em] text-${accent} glow-${accent}`}
          data-text={title}
        >
          {title}
        </h2>
        {headerRight}
      </div>
      {children}
    </motion.section>
  )
}
