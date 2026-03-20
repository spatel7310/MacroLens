import { useState, useEffect } from 'react'

export function TypingText({
  text,
  className = '',
  speed = 50,
}: {
  text: string
  className?: string
  speed?: number
}) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (done) return
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(interval)
        setDone(true)
      }
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed, done])

  return (
    <span className={className}>
      {displayed}
      {!done && <span className="animate-pulse">_</span>}
    </span>
  )
}
