import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SectionCard } from '../ui/SectionCard'
import { Skeleton } from '../ui/Skeleton'
import { useNewsData } from '@/hooks/useMarketData'

const COLLAPSED_COUNT = 5

function useNewsExpanded(): [boolean, () => void] {
  const key = 'macrolens-news-expanded'
  const [expanded, setExpanded] = useState(() => {
    try {
      return localStorage.getItem(key) === 'true'
    } catch {
      return false
    }
  })
  const toggle = useCallback(() => {
    setExpanded((prev) => {
      const next = !prev
      try { localStorage.setItem(key, String(next)) } catch {}
      return next
    })
  }, [])
  return [expanded, toggle]
}

function NewsItem({ item }: { item: { url: string; relativeTime: string; title: string; source: string } }) {
  return (
    <a
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
  )
}

export function CuratedNews() {
  const { data, isLoading } = useNewsData()
  const [expanded, toggleExpanded] = useNewsExpanded()

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

  const collapsedItems = data.slice(0, COLLAPSED_COUNT)
  const extraItems = data.slice(COLLAPSED_COUNT)

  return (
    <SectionCard
      title="Curated News"
      accent="cyan"
      headerRight={
        extraItems.length > 0 ? (
          <button
            onClick={toggleExpanded}
            className="text-chrome/40 hover:text-cyan transition-colors p-1 -m-1"
            aria-label={expanded ? 'Show less news' : 'Show more news'}
          >
            {expanded ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 9L7 5L11 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        ) : undefined
      }
    >
      <div className="space-y-2">
        {collapsedItems.map((item, i) => (
          <NewsItem key={i} item={item} />
        ))}
      </div>

      <AnimatePresence initial={false}>
        {expanded && extraItems.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="space-y-2 mt-2">
              {extraItems.map((item, i) => (
                <NewsItem key={i} item={item} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SectionCard>
  )
}
