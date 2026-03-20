import { motion, AnimatePresence } from 'framer-motion'

export function AlertToast({
  message,
  visible,
  onDismiss,
}: {
  message: string
  visible: boolean
  onDismiss: () => void
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          className="fixed top-16 right-4 z-50 max-w-xs rounded border border-yellow/40 bg-void/95 px-4 py-3 text-xs text-yellow box-glow-cyan backdrop-blur"
        >
          <div className="flex items-start gap-2">
            <span className="glow-yellow">⚠</span>
            <p className="flex-1">{message}</p>
            <button onClick={onDismiss} className="text-chrome hover:text-white">
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
