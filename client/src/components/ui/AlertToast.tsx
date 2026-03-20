import { motion, AnimatePresence } from 'framer-motion'

interface Toast {
  id: string
  message: string
}

export function AlertToastStack({
  toasts,
  onDismiss,
}: {
  toasts: Toast[]
  onDismiss: (id: string) => void
}) {
  return (
    <div className="fixed top-16 right-4 z-50 flex flex-col gap-2 max-w-xs">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="rounded border border-yellow/40 bg-void/95 px-4 py-3 text-xs text-yellow box-glow-cyan backdrop-blur"
          >
            <div className="flex items-start gap-2">
              <span className="glow-yellow">⚠</span>
              <p className="flex-1">{toast.message}</p>
              <button onClick={() => onDismiss(toast.id)} className="text-chrome hover:text-white">
                ✕
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
