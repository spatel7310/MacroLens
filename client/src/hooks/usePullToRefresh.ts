import { useEffect, useRef, useState } from 'react'

const THRESHOLD = 80

export function usePullToRefresh() {
  const [pulling, setPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const startY = useRef(0)
  const active = useRef(false)

  useEffect(() => {
    function onTouchStart(e: TouchEvent) {
      if (window.scrollY > 0) return
      startY.current = e.touches[0].clientY
      active.current = true
    }

    function onTouchMove(e: TouchEvent) {
      if (!active.current) return
      const dy = e.touches[0].clientY - startY.current
      if (dy < 0) {
        active.current = false
        setPullDistance(0)
        setPulling(false)
        return
      }
      if (dy > 10) {
        setPulling(true)
        setPullDistance(Math.min(dy * 0.5, THRESHOLD * 1.5))
      }
    }

    function onTouchEnd() {
      if (!active.current) return
      active.current = false
      if (pullDistance >= THRESHOLD) {
        setPullDistance(THRESHOLD)
        window.location.reload()
      } else {
        setPulling(false)
        setPullDistance(0)
      }
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd)

    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [pullDistance])

  const ready = pullDistance >= THRESHOLD

  return { pulling, pullDistance, ready }
}
