import { TypingText } from '../ui/TypingText'

export function Header() {
  return (
    <header className="flex items-center justify-between py-3">
      <div>
        <h1 className="text-lg font-bold text-cyan glow-cyan glitch" data-text="MacroLens">
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
