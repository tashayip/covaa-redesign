import { motion, AnimatePresence } from 'framer-motion'
import { useLetterboxStore } from '@/store/letterbox-store'
import { useShallow } from 'zustand/react/shallow'
import { StampSVGSmall } from '@/components/stamps/StampSVG'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import type { FeedbackLetter } from '@/types'

// ─── mock data ───────────────────────────────────────────────────────────────

const MOCK_LETTERS: FeedbackLetter[] = [
  {
    id: 1,
    lesson: 'Year 5 Maths – Fractions',
    stamp: 'preparation',
    recipients: ['STP Feedback AI', 'Marcus'],
    sentAt: '2 hours ago',
    status: 'in_transit',
    isNew: false,
    personName: 'STP Feedback AI',
    sourceType: 'ai',
    schoolOrRole: 'Singapore Teaching Practice',
    avatarLabel: '✦',
    avatarColor: '#7C3AED',
    relationship: 'sent',
  },
  {
    id: 2,
    lesson: 'P3 Science – Living Things',
    stamp: 'culture',
    recipients: ['Sarah'],
    sentAt: '3 days ago',
    status: 'replied',
    isNew: false,
    personName: 'Sarah',
    sourceType: 'teacher',
    schoolOrRole: 'Greenridge Primary',
    avatarLabel: 'S',
    avatarColor: '#0D9488',
    relationship: 'shared',
  },
  {
    id: 3,
    lesson: 'P4 English – Descriptive Writing',
    stamp: 'enactment',
    recipients: ['STP Feedback AI', 'Marcus', 'James'],
    sentAt: '1 week ago',
    status: 'replied',
    isNew: false,
    personName: 'STP Feedback AI',
    sourceType: 'ai',
    schoolOrRole: 'Singapore Teaching Practice',
    avatarLabel: '✦',
    avatarColor: '#7C3AED',
    relationship: 'shared',
  },
  {
    id: 4,
    lesson: 'P5 Science – Forces Audio Reflection',
    stamp: 'assessment',
    recipients: ['STP Feedback AI'],
    sentAt: 'Yesterday',
    status: 'replied',
    isNew: false,
    personName: 'STP Feedback AI',
    sourceType: 'ai',
    schoolOrRole: 'Singapore Teaching Practice',
    avatarLabel: '✦',
    avatarColor: '#7C3AED',
    relationship: 'shared',
  },
  {
    id: 200,
    lesson: 'P4 Mathematics - Word Problems',
    stamp: 'assessment',
    recipients: ['Marcus'],
    sentAt: 'This morning',
    status: 'sent',
    isNew: false,
    personName: 'Marcus',
    sourceType: 'teacher',
    schoolOrRole: 'North View Primary',
    avatarLabel: 'M',
    avatarColor: '#2563EB',
    relationship: 'toRespond',
  },
  {
    id: 201,
    lesson: 'P2 English - Guided Reading',
    stamp: 'culture',
    recipients: ['Sarah'],
    sentAt: 'Yesterday',
    status: 'sent',
    isNew: false,
    personName: 'Sarah',
    sourceType: 'teacher',
    schoolOrRole: 'Greenridge Primary',
    avatarLabel: 'S',
    avatarColor: '#0D9488',
    relationship: 'toRespond',
  },
  {
    id: 202,
    lesson: 'P5 Science – Circuits',
    stamp: 'enactment',
    recipients: ['James'],
    sentAt: 'Last week',
    status: 'sent',
    isNew: false,
    personName: 'James',
    sourceType: 'teacher',
    schoolOrRole: 'Riverside Primary',
    avatarLabel: 'J',
    avatarColor: '#D97706',
    relationship: 'sent',
  },
]

const COMMUNITY_REPLY_LETTERS: FeedbackLetter[] = [
  {
    id: 101,
    lesson: 'Year 4 Maths – Transitions',
    stamp: 'preparation',
    recipients: ['Nadia Lim'],
    sentAt: 'Just now',
    status: 'sent',
    isNew: false,
    personName: 'Nadia Lim',
    sourceType: 'teacher',
    schoolOrRole: 'Tampines Primary',
    avatarLabel: 'NL',
    avatarColor: '#2563EB',
    relationship: 'sent',
  },
  {
    id: 102,
    lesson: 'Year 8 English – Cold-calling',
    stamp: 'assessment',
    recipients: ['Farah Tan'],
    sentAt: 'Just now',
    status: 'sent',
    isNew: false,
    personName: 'Farah Tan',
    sourceType: 'teacher',
    schoolOrRole: 'Bedok View School',
    avatarLabel: 'FT',
    avatarColor: '#0D9488',
    relationship: 'sent',
  },
  {
    id: 103,
    lesson: 'Year 6 Science – Lesson Structure',
    stamp: 'culture',
    recipients: ['Chen Wei'],
    sentAt: 'Just now',
    status: 'sent',
    isNew: false,
    personName: 'Chen Wei',
    sourceType: 'teacher',
    schoolOrRole: 'Jurong West Primary',
    avatarLabel: 'CW',
    avatarColor: '#C86948',
    relationship: 'sent',
  },
  {
    id: 104,
    lesson: 'P3 English – Group Roles',
    stamp: 'other',
    recipients: ['Mei Wong'],
    sentAt: 'Just now',
    status: 'sent',
    isNew: false,
    personName: 'Mei Wong',
    sourceType: 'teacher',
    schoolOrRole: 'Woodlands Ring Primary',
    avatarLabel: 'MW',
    avatarColor: '#6B4E7C',
    relationship: 'sent',
  },
  {
    id: 105,
    lesson: 'Year 10 History – Lesson Pacing',
    stamp: 'enactment',
    recipients: ['Arun Raj'],
    sentAt: 'Just now',
    status: 'sent',
    isNew: false,
    personName: 'Arun Raj',
    sourceType: 'teacher',
    schoolOrRole: 'Buona Vista Secondary',
    avatarLabel: 'AR',
    avatarColor: '#D97706',
    relationship: 'sent',
  },
  {
    id: 106,
    lesson: 'P5 Mathematics – Checking Understanding',
    stamp: 'preparation',
    recipients: ['Grace Lee'],
    sentAt: 'Just now',
    status: 'sent',
    isNew: false,
    personName: 'Grace Lee',
    sourceType: 'teacher',
    schoolOrRole: 'Ang Mo Kio Primary',
    avatarLabel: 'GL',
    avatarColor: '#4A7C59',
    relationship: 'sent',
  },
]

// ─── tab config ──────────────────────────────────────────────────────────────

// ─── letter card ─────────────────────────────────────────────────────────────

function LetterCard({
  letter, index, onViewDetail,
}: {
  letter: FeedbackLetter
  index: number
  onViewDetail: (id: number) => void
}) {
  const canOpen = true
  const isNewReply = letter.status === 'replied' && letter.isNew
  const descriptionText = letter.relationship === 'toRespond'
    ? 'Waiting for your feedback'
    : letter.status === 'in_transit'
      ? letter.recipients.includes('STP Feedback AI')
        ? 'STP Feedback AI is drafting a reply'
        : 'Waiting for a reply'
      : `Sent to ${letter.personName}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: index * 0.07, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={canOpen ? { y: -1 } : undefined}
      whileTap={canOpen ? { scale: 0.995 } : undefined}
      className={cn(
        'relative rounded-xl border bg-background overflow-hidden transition-colors',
        isNewReply
          ? 'border-primary/45 bg-primary/[0.035] shadow-[0_8px_24px_rgba(200,105,72,0.10)]'
          : 'border-border hover:border-foreground/20 cursor-pointer'
      )}
      onClick={() => canOpen && onViewDetail(letter.id)}
      role={canOpen ? 'button' : undefined}
      tabIndex={canOpen ? 0 : undefined}
      onKeyDown={(e) => { if (canOpen && (e.key === 'Enter' || e.key === ' ')) onViewDetail(letter.id) }}
    >
      <div className="relative flex items-start gap-4 p-4">
        <motion.div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm"
          style={{ backgroundColor: letter.avatarColor ?? '#64748B' }}
          animate={isNewReply ? { rotate: [0, -8, 6, -3, 0], y: [0, -2, 0] } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.34, 1.3, 0.64, 1] }}
          aria-label={`${letter.personName} avatar`}
        >
          {letter.sourceType === 'ai' ? '✦' : letter.avatarLabel}
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <p className="truncate text-base font-semibold leading-tight text-foreground">{letter.personName}</p>
              </div>
              <p className="truncate text-[11px] text-muted-foreground">{letter.schoolOrRole}</p>
            </div>
            <span className="text-[10px] text-muted-foreground shrink-0 pt-px">{letter.sentAt}</span>
          </div>

          <div className="mt-2 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-snug text-foreground">{letter.lesson}</p>
              {letter.relationship !== 'shared' && (
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                  {descriptionText}
                </p>
              )}
            </div>
              {isNewReply && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.18, duration: 0.2 }}
                  className="shrink-0 rounded-full border border-primary/25 bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-primary [letter-spacing:0.12em]"
                >
                  New
                </motion.span>
              )}
          </div>

        </div>

        {/* Stamp thumbnail */}
        <div className="shrink-0 mt-0.5 opacity-80" style={{ transform: 'rotate(-1.5deg)' }}>
          <StampSVGSmall id={letter.stamp} maskSuffix={`-ml${letter.id}`} />
        </div>

        {/* Arrow for openable letters */}
        {canOpen && (
          <span className="text-[10px] text-muted-foreground shrink-0 mt-1.5 select-none" aria-hidden="true">›</span>
        )}
      </div>
    </motion.div>
  )
}

// ─── empty state ─────────────────────────────────────────────────────────────

function EmptyState({ tab }: { tab: 'shared' | 'toRespond' | 'sent' }) {
  const messages: Record<'shared' | 'toRespond' | 'sent', { icon: string; text: string }> = {
    shared: { icon: '📭', text: "No feedback yet - it'll appear here when someone writes back." },
    toRespond: { icon: '✍️', text: 'No direct feedback requests yet.' },
    sent: { icon: '📤', text: 'No sent feedback requests yet.' },
  }
  const { icon, text } = messages[tab]
  return (
    <motion.div
      key="empty"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center gap-2 py-14 text-center"
    >
      <span className="text-3xl">{icon}</span>
      <p className="text-sm text-muted-foreground max-w-xs">{text}</p>
    </motion.div>
  )
}

// ─── main export ─────────────────────────────────────────────────────────────

export function MyLetters() {
  const {
    setFlow,
    setSelectedLetter,
    sentDemoLetter,
    receivedDemoLetter,
    myLettersTab,
    setMyLettersTab,
    markReplySeen,
    sentFeedbackIds,
  } = useLetterboxStore(
    useShallow((s) => ({
      setFlow: s.setFlow,
      setSelectedLetter: s.setSelectedLetter,
      sentDemoLetter: s.sentDemoLetter,
      receivedDemoLetter: s.receivedDemoLetter,
      myLettersTab: s.myLettersTab,
      setMyLettersTab: s.setMyLettersTab,
      markReplySeen: s.markReplySeen,
      sentFeedbackIds: s.sentFeedbackIds,
    }))
  )

  const demoStarted = !!sentDemoLetter || !!receivedDemoLetter
  const staticShared = MOCK_LETTERS.filter((l) => l.relationship === 'shared')
  const toRespond = MOCK_LETTERS.filter((l) => l.relationship === 'toRespond' && !sentFeedbackIds.includes(l.id))
  const staticSent = MOCK_LETTERS.filter((l) => l.relationship === 'sent')
  const completedResponses = [
    ...MOCK_LETTERS.filter((l) => l.relationship === 'toRespond'),
    ...COMMUNITY_REPLY_LETTERS,
  ]
    .filter((l) => sentFeedbackIds.includes(l.id))
    .map((l) => ({ ...l, relationship: 'sent' as const, status: 'sent' as const, sentAt: 'Just now' }))
  const shared = receivedDemoLetter ? [receivedDemoLetter, ...staticShared] : staticShared
  const sent = demoStarted ? (sentDemoLetter ? [sentDemoLetter] : completedResponses) : [...completedResponses, ...staticSent]

  function handleViewDetail(id: number) {
    markReplySeen(id)
    setSelectedLetter(id)
    setFlow('letter-detail')
  }

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <Tabs value={myLettersTab} onValueChange={(v) => setMyLettersTab(v as 'shared' | 'toRespond' | 'sent')}>
        <TabsList className="w-full bg-black/[0.07]">
          <TabsTrigger value="shared" className="flex-1 text-xs">
            Shared with you
            {shared.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 text-blue-600">{shared.length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="toRespond" className="flex-1 text-xs">
            To respond
            {toRespond.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-primary/10 text-primary">{toRespond.length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex-1 text-xs">
            Sent
            {sent.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-muted-foreground/15 text-muted-foreground">{sent.length}</span>
            )}
          </TabsTrigger>
        </TabsList>

        {(['shared', 'toRespond', 'sent'] as const).map((tabId) => {
          const letters = tabId === 'shared' ? shared : tabId === 'toRespond' ? toRespond : sent
          return (
            <TabsContent key={tabId} value={tabId} className="mt-4">
              <AnimatePresence mode="wait">
                {letters.length === 0 ? (
                  <EmptyState key={`empty-${tabId}`} tab={tabId} />
                ) : (
                  <motion.div
                    key={`list-${tabId}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2"
                  >
                    {letters.map((letter, i) => (
                      <LetterCard
                        key={letter.id}
                        letter={letter}
                        index={i}
                        onViewDetail={handleViewDetail}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>
          )
        })}
      </Tabs>

      {/* Footer CTA */}
      <motion.p
        className="text-xs text-center text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Looking for another letter?{' '}
        <button
          className="text-blue-600 font-medium hover:underline underline-offset-2"
          onClick={() => useLetterboxStore.getState().setFlow('discover')}
        >
          browse Community letters →
        </button>
      </motion.p>
    </div>
  )
}

// Keep old export name for any stale imports
export const TransitMap = MyLetters
