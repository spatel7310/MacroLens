import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'

export function NumberTicker({
  value,
  format = (n: number) => n.toFixed(2),
  className = '',
}: {
  value: number
  format?: (n: number) => string
  className?: string
}) {
  const motionVal = useMotionValue(value)
  const display = useTransform(motionVal, (v) => format(v))
  const prevRef = useRef(value)

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: 0.6,
      ease: 'easeOut',
    })
    prevRef.current = value
    return controls.stop
  }, [value, motionVal])

  return <motion.span className={className}>{display}</motion.span>
}
