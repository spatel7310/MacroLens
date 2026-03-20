import { SectionCard } from '../ui/SectionCard'
import { Skeleton } from '../ui/Skeleton'
import { useCalendarData } from '@/hooks/useMarketData'

function ImpactDot({ impact }: { impact: string }) {
  const color = impact === 'high' ? 'bg-magenta' : impact === 'medium' ? 'bg-yellow' : 'bg-chrome/40'
  return <span className={`inline-block h-2 w-2 rounded-full ${color}`} />
}

export function EconomicCalendar() {
  const { data, isLoading } = useCalendarData()

  if (isLoading) {
    return (
      <SectionCard title="Economic Calendar" accent="cyan">
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-6" />
          ))}
        </div>
      </SectionCard>
    )
  }

  if (!data?.length) {
    return (
      <SectionCard title="Economic Calendar" accent="cyan">
        <p className="text-xs text-chrome/40">No upcoming events</p>
      </SectionCard>
    )
  }

  const now = new Date()
  const threeDaysOut = new Date(now.getTime() + 3 * 86_400_000)

  return (
    <SectionCard title="Economic Calendar" accent="cyan">
      <div className="space-y-2">
        {data.map((event, i) => {
          const eventDate = new Date(event.date)
          const isNear = eventDate <= threeDaysOut && eventDate >= now
          return (
            <div
              key={i}
              className={`flex items-center gap-3 text-xs py-1 ${isNear ? 'text-cyan' : 'text-chrome/70'}`}
            >
              <span className="w-16 shrink-0 text-chrome/40">
                {eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <ImpactDot impact={event.impact} />
              <span className="flex-1 truncate">{event.name}</span>
            </div>
          )
        })}
      </div>
    </SectionCard>
  )
}
