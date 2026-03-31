import { useState, useEffect, useRef, useCallback } from 'react'
import { TypingText } from '../ui/TypingText'

export function Header() {
  const [glitchActive, setGlitchActive] = useState(false)
  const titleRef = useRef<HTMLHeadingElement>(null)

  const playGlitch = useCallback(() => {
    setGlitchActive(true)
    // Re-trigger CSS animation by removing and re-adding the class
    const el = titleRef.current
    if (el) {
      el.classList.remove('glitch-active')
      void el.offsetWidth // force reflow
      el.classList.add('glitch-active')
    }
    setTimeout(() => setGlitchActive(false), 300)
  }, [])

  // Auto-play glitch a couple seconds after load
  useEffect(() => {
    const timer = setTimeout(playGlitch, 2000)
    return () => clearTimeout(timer)
  }, [playGlitch])

  const handleClick = () => {
    playGlitch()
    setTimeout(() => window.location.reload(), 400)
  }

  return (
    <header className="flex items-center justify-between py-3">
      <div
        className="cursor-pointer"
        onClick={handleClick}
      >
        <h1
          ref={titleRef}
          className={`text-lg font-bold text-cyan glow-cyan glitch ${glitchActive ? 'glitch-active' : ''}`}
          data-text="MacroLens"
        >
          <TypingText text="MacroLens" speed={60} />
        </h1>
        <p className="text-[10px] text-chrome/60 uppercase tracking-[0.3em]">
          macro intelligence terminal
        </p>
      </div>
      <div className="text-[10px] text-chrome/40 text-right">
        <div>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
        <div className="text-cyan/60">v1.0</div>
      </div>
    </header>
  )
}
