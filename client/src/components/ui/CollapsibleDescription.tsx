import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'

export function CollapsibleDescription({
  visible,
  children,
}: {
  visible: boolean
  children: ReactNode
}) {
  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          style={{ overflow: 'hidden' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
