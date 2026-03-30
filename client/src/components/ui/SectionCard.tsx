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
  children,
}: {
  title: string
  accent?: Accent
  children: ReactNode
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`rounded-lg border ${borderColors[accent]} ${glowClasses[accent]} bg-void/80 backdrop-blur-sm p-4`}
    >
      <h2
        className={`text-xs font-bold uppercase tracking-[0.2em] mb-3 text-${accent} glow-${accent}`}
        data-text={title}
      >
        {title}
      </h2>
      {children}
    </motion.section>
  )
}
