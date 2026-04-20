import { useState, useRef, useEffect, useCallback } from 'react'
import { useLetterboxStore } from '@/store/letterbox-store'
import { useShallow } from 'zustand/react/shallow'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { StampSVGSmall } from '@/components/stamps/StampSVG'
import { WriteBackModal } from './WriteBackModal'
import { cn } from '@/lib/utils'

const FILTERS = [
  { cat: 'all',         label: 'All' },
  { cat: 'pacing',      label: 'Pacing' },
  { cat: 'questioning', label: 'Questioning' },
  { cat: 'structure',   label: 'Lesson structure' },
  { cat: 'group-work',  label: 'Group work' },
]

const PAGE_SIZE = 6

export function DiscoverFeed({ onGoWrite }: { onGoWrite: () => void }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [modalTo,   setModalTo]   = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [page, setPage] = useState(1)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const { discoverCards, setFlow, setSelectedLetter } = useLetterboxStore(
    useShallow((s) => ({ discoverCards: s.discoverCards, setFlow: s.setFlow, setSelectedLetter: s.setSelectedLetter }))
  )

  const filtered = activeFilter === 'all'
    ? discoverCards
    : discoverCards.filter((c) => c.cat === activeFilter)

  // Simulate more cards by cycling mock data with unique keys
  const allCards = Array.from({ length: Math.max(filtered.length * 3, 12) }, (_, i) => ({
    ...filtered[i % filtered.length],
    _key: `${i}`,
  }))

  const visible = allCards.slice(0, page * PAGE_SIZE)
  const hasMore = visible.length < allCards.length

  // Reset page when filter changes
  useEffect(() => { setPage(1) }, [activeFilter])

  // IntersectionObserver for infinite scroll
  const loadMore = useCallback(() => {
    if (hasMore) setPage((p) => p + 1)
  }, [hasMore])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore() },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore])

  return (
    <>
      <div className="space-y-6 animate-fade-up">
        {/* Filter bar */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <p className="text-sm text-muted-foreground">{filtered.length} letter{filtered.length !== 1 ? 's' : ''}</p>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.cat}
                onClick={() => setActiveFilter(f.cat)}
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors',
                  activeFilter === f.cat
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-transparent border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Card grid — two columns max to keep the community scan lighter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visible.map((card) => {
            const teacherName = card.teacherName ?? card.who
            return (
            <Card
              key={card._key}
              className="relative cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all duration-150 overflow-visible shadow-sm"
              style={{ background: 'oklch(1 0 0)' }}
              onClick={() => { setSelectedLetter(card.id + 100); setFlow('letter-detail') }}
            >
              <div className="absolute top-4 right-4" style={{ transform: 'rotate(1.5deg)', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.09))' }}>
                <StampSVGSmall id={card.stamp} maskSuffix={`-card-${card._key}`} />
              </div>

              <CardContent className="pt-4 pb-3 pr-14">
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm"
                    style={{ backgroundColor: card.avatarColor ?? '#64748B' }}
                  >
                    {card.avatarLabel ?? 'T'}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{teacherName}</p>
                    <p className="truncate text-xs text-muted-foreground">{card.school}</p>
                  </div>
                </div>
                <p className="text-[9px] font-semibold uppercase tracking-[2px] text-muted-foreground mb-2">{card.eyebrow}</p>
                <p className="font-serif text-sm italic leading-relaxed text-foreground mb-4">
                  {card.body}
                </p>
                <Separator className="mb-3" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{teacherName} · {card.time}</span>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto text-primary text-xs font-semibold"
                    onClick={(e) => {
                      e.stopPropagation()
                      setModalTo(`Writing back to ${teacherName} about their ${card.eyebrow.toLowerCase()} lesson.`)
                      setModalOpen(true)
                    }}
                  >
                    Write back →
                  </Button>
                </div>
              </CardContent>
            </Card>
            )
          })}
        </div>

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="flex justify-center py-4">
          {hasMore ? (
            <span className="text-xs text-muted-foreground animate-pulse">Loading more letters…</span>
          ) : (
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">You've seen them all.</p>
              <p className="text-xs text-muted-foreground">
                Have something to share?{' '}
                <button className="text-primary underline-offset-2 hover:underline font-medium" onClick={onGoWrite}>
                  Write your own →
                </button>
              </p>
            </div>
          )}
        </div>
      </div>

      <WriteBackModal isOpen={modalOpen} to={modalTo} onClose={() => setModalOpen(false)} />
    </>
  )
}
