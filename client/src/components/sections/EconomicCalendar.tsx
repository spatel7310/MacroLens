import { SectionCard } from '../ui/SectionCard'
import { Skeleton } from '../ui/Skeleton'
import { CollapsibleDescription } from '../ui/CollapsibleDescription'
import { useCalendarData } from '@/hooks/useMarketData'
import { useDescriptionToggle } from '@/hooks/useDescriptionToggle'

function ImpactDot({ impact }: { impact: string }) {
  const color = impact === 'high' ? 'bg-magenta' : impact === 'medium' ? 'bg-yellow' : 'bg-chrome/40'
  return <span className={`inline-block h-2 w-2 rounded-full ${color}`} />
}

const eventDescriptions: [RegExp, string][] = [
  [/\bcpi\b/i, 'Tracks consumer inflation — drives Fed rate decisions'],
  [/\bpce\b/i, "The Fed's preferred inflation gauge"],
  [/\bfomc\b|federal funds rate/i, 'Fed sets interest rates — moves all markets'],
  [/\bnfp\b|non.?farm payroll/i, 'Jobs added last month — key labor health signal'],
  [/\bgdp\b/i, 'Total economic output — signals growth or contraction'],
  [/\bunemployment rate\b/i, 'Share of labor force without work'],
  [/\bjobless claims\b|initial claims/i, 'Weekly layoff filings — early recession signal'],
  [/\bretail sales\b/i, 'Consumer spending strength — drives ~70% of GDP'],
  [/\bppi\b|producer price/i, 'Wholesale inflation — leads consumer prices'],
  [/\bism\b|manufacturing pmi/i, 'Factory activity gauge — above 50 = expansion'],
  [/\bconsumer (confidence|sentiment)\b/i, 'How optimistic consumers feel about spending'],
  [/\bhousing starts\b|building permits/i, 'New construction activity — rate-sensitive'],
  [/\bexisting home/i, 'Resale pace — reflects mortgage rate impact'],
  [/\bnew home/i, 'New home demand — builder confidence signal'],
  [/\bdurable goods\b/i, 'Big-ticket orders — signals business investment'],
  [/\btrade balance\b/i, 'Exports minus imports — affects dollar strength'],
  [/\bpayroll\b/i, 'Employment growth — key labor market indicator'],
  [/\bjolts\b|job openings/i, 'Open positions — shows labor demand'],
  [/\bbeige book\b/i, 'Fed survey of regional economic conditions'],
  [/\btreasury\b|bond auction/i, 'Debt sale — signals yield direction'],
  [/\bmichigan\b/i, 'UMich consumer outlook — spending predictor'],
]

function getEventDescription(name: string): string | null {
  for (const [pattern, desc] of eventDescriptions) {
    if (pattern.test(name)) return desc
  }
  return null
}

export function EconomicCalendar() {
  const { data, isLoading } = useCalendarData()
  const [descVisible, toggleDesc] = useDescriptionToggle('economic-calendar')

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
    <SectionCard title="Economic Calendar" accent="cyan" onClick={toggleDesc}>
      <div className="space-y-2">
        {data.map((event, i) => {
          const eventDate = new Date(event.date)
          const isNear = eventDate <= threeDaysOut && eventDate >= now
          const desc = getEventDescription(event.name)
          return (
            <div key={i}>
              <div
                className={`flex items-center gap-3 text-xs py-1 ${isNear ? 'text-cyan' : 'text-chrome/70'}`}
              >
                <span className="w-16 shrink-0 text-chrome/40">
                  {eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <ImpactDot impact={event.impact} />
                <span className="flex-1 truncate">{event.name}</span>
              </div>
              {desc && (
                <CollapsibleDescription visible={descVisible}>
                  <p className="text-[10px] text-chrome/35 leading-relaxed ml-[calc(4rem+0.75rem+0.5rem+0.5rem)] mt-0.5">
                    {desc}
                  </p>
                </CollapsibleDescription>
              )}
            </div>
          )
        })}
      </div>
    </SectionCard>
  )
}
