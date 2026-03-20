export function PulseIndicator({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${
        active ? 'bg-green pulse-live' : 'bg-magenta'
      }`}
    />
  )
}
