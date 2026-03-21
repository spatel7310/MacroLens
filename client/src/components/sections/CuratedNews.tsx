import { SectionCard } from '../ui/SectionCard'
import { Skeleton } from '../ui/Skeleton'
import { useNewsData } from '@/hooks/useMarketData'

export function CuratedNews() {
  const { data, isLoading } = useNewsData()

  if (isLoading) {
    return (
      <SectionCard title="Curated News" accent="cyan">
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
      <SectionCard title="Curated News" accent="cyan">
        <p className="text-xs text-chrome/40">No news available</p>
      </SectionCard>
    )
  }

  return (
    <SectionCard title="Curated News" accent="cyan">
      <div className="space-y-2">
        {data.map((item, i) => (
          <a
            key={i}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2 text-xs py-1 group"
          >
            <span className="text-chrome/30 shrink-0 w-12">{item.relativeTime}</span>
            <div className="flex-1 min-w-0">
              <p className="text-chrome group-hover:text-cyan transition-colors">
                {item.title}
              </p>
              <p className="text-chrome/30 text-[10px]">{item.source}</p>
            </div>
          </a>
        ))}
      </div>
    </SectionCard>
  )
}
