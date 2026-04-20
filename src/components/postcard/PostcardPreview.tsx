import { useLetterboxStore } from '@/store/letterbox-store'
import { useShallow } from 'zustand/react/shallow'
import { StampSVG } from '@/components/stamps/StampSVG'
import { CassetteTape } from './CassetteTape'
import type { StampId } from '@/types'

// ── flat stamp stack ─────────────────────────────────────────────────────────
function StampStack({ ids, maskPrefix }: { ids: StampId[]; maskPrefix: string }) {
  const visible = ids.slice(0, 4)
  return (
    <div className="relative" style={{ width: 54, height: 68 + (visible.length - 1) * 4 }}>
      {visible.map((id, i) => (
        <div
          key={id}
          className="absolute"
          style={{
            top: (visible.length - 1 - i) * 3,
            left: i * 1.5,
            zIndex: i + 1,
            transform: `rotate(${(i % 2 === 0 ? 1 : -1) * (1.5 + i * 0.7)}deg)`,
            filter: i < visible.length - 1
              ? 'drop-shadow(0 1px 3px rgba(0,0,0,0.20))'
              : 'drop-shadow(0 2px 6px rgba(0,0,0,0.12))',
          }}
        >
          <StampSVG id={id} W={54} H={68} maskSuffix={`${maskPrefix}-${i}`} />
        </div>
      ))}
    </div>
  )
}

interface PostcardPreviewProps {
  sending?: boolean
  isEmpty?: boolean
}

export function PostcardPreview({ sending = false, isEmpty = false }: PostcardPreviewProps) {
  const { draft, contacts, selectedIds } = useLetterboxStore(
    useShallow((s) => ({ draft: s.draft, contacts: s.contacts, selectedIds: s.selectedIds }))
  )

  const cardStyle = {
    boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.07), 0 18px 48px rgba(0,0,0,0.08)',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.026'/%3E%3C/svg%3E"), linear-gradient(155deg,#FEFCFA 0%,#F6F2EC 100%)`,
  }

  // ── Empty state (step 2 — no ask written yet) ────────────────────────────
  if (isEmpty) {
    return (
      <div className="sticky top-24 flex flex-col gap-0">
        <div
          className="flex min-h-[260px] rounded-sm border border-[var(--color-cream-3)] bg-[var(--color-letter)]"
          style={cardStyle}
        >
          {/* Left: placeholder */}
          <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="w-10 h-10 rounded-full bg-[var(--color-cream-2)] border border-[var(--color-cream-3)] flex items-center justify-center">
              <span className="text-[var(--color-ink-4)] text-lg leading-none">✉</span>
            </div>
            <p className="font-serif italic text-sm text-[var(--color-ink-4)] leading-relaxed max-w-[180px]">
              Your letter will take shape when you write your ask
            </p>
          </div>

          {/* Divider */}
          <div className="postcard-divider" aria-hidden="true" />

          {/* Right: stamp stack — reflects current stamp choices */}
          <div
            className="w-[152px] shrink-0 flex flex-col items-end py-4 px-[18px]"
            aria-hidden="true"
          >
            <StampStack ids={draft.stampIds.length > 0 ? draft.stampIds : [draft.stampId]} maskPrefix="-empty" />
          </div>
        </div>

        <div className="flex justify-between mt-2 px-0.5">
          <span className="text-[9px] font-medium tracking-[1.8px] uppercase opacity-50" style={{ color: 'var(--color-ink-4)' }}>CoVAA Letterbox</span>
          <span className="text-[9px] font-medium tracking-[1.8px] uppercase opacity-50" style={{ color: 'var(--color-ink-4)' }}>Singapore</span>
        </div>
      </div>
    )
  }

  // ── Full preview (step 3) ────────────────────────────────────────────────
  const names = selectedIds
    .map((id) => contacts.find((c) => c.id === id)?.name)
    .filter(Boolean) as string[]

  let salute = 'Dear…'
  let saluteIsPlaceholder = true
  if (names.length === 1) { salute = `Dear ${names[0]},`; saluteIsPlaceholder = false }
  else if (names.length > 1) {
    const last = names[names.length - 1]
    salute = `Dear ${names.slice(0, -1).join(', ')} & ${last},`
    saluteIsPlaceholder = false
  }

  let bodyContent: React.ReactNode
  if (draft.body) {
    bodyContent = (
      <>
        {draft.lesson && <><strong style={{ fontStyle: 'normal', fontWeight: 500 }}>{draft.lesson}</strong> — </>}
        <span dangerouslySetInnerHTML={{ __html: draft.body.replace(/\n/g, '<br>') }} />
      </>
    )
  } else if (draft.lesson) {
    bodyContent = <>I'm writing about <strong style={{ fontStyle: 'normal', fontWeight: 500 }}>{draft.lesson}</strong>. <span className="text-[var(--color-ink-4)] italic">Continue writing above…</span></>
  } else {
    bodyContent = <span className="text-[var(--color-ink-4)] italic">Your letter will appear here as you write it.</span>
  }

  const askText = draft.ask ? `I'd especially love your thoughts on: ${draft.ask}` : `I'd especially love your thoughts on…`
  const signoff = `— ${draft.signAs || 'with care'}`
  const addrTo  = names[0] ?? 'Dear Friend'
  const showTape    = !!(draft.attachmentName || draft.youtubeLink)
  const tapeLabel   = draft.attachmentName
    ? draft.attachmentName.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ').slice(0, 26)
    : 'YouTube recording'

  return (
    <div className="sticky top-24 flex flex-col gap-0">
      {/* Cassette — floats outside card */}
      <div className="relative">
        <CassetteTape labelText={tapeLabel} visible={showTape} />

        {/* Postcard card */}
        <div
          className={`flex min-h-[310px] rounded-sm border border-[var(--color-cream-3)] bg-[var(--color-letter)] ${sending ? 'animate-tilt' : ''}`}
          style={cardStyle}
          aria-live="polite"
        >
          {/* Left: writing surface */}
          <div className="flex-1 flex flex-col gap-2.5 p-7 min-w-0 overflow-hidden postcard-lines">
            <p
              className="font-serif text-xl leading-tight"
              style={{ color: saluteIsPlaceholder ? 'var(--color-ink-4)' : 'var(--color-ink)', fontStyle: saluteIsPlaceholder ? 'italic' : 'normal' }}
            >
              {salute}
            </p>
            <div
              className="font-serif text-[15px] italic leading-[27px] flex-1 overflow-hidden"
              style={{ color: 'var(--color-ink)' }}
            >
              {bodyContent}
            </div>
            <p
              className="font-serif text-[13px] italic leading-relaxed pl-2.5"
              style={{
                color: draft.ask ? 'var(--color-ink-2)' : 'var(--color-ink-4)',
                borderLeft: '1.5px solid rgba(200,105,72,0.25)',
              }}
            >
              {askText}
            </p>
            <p className="font-serif text-[15px] font-light italic" style={{ color: 'var(--color-ink-2)' }}>
              {signoff}
            </p>
          </div>

          {/* Divider */}
          <div className="postcard-divider" aria-hidden="true" />

          {/* Right: stamp + address */}
          <div
            className="w-[152px] shrink-0 flex flex-col items-center gap-2 py-4 px-[18px] overflow-hidden"
            aria-hidden="true"
          >
            <div style={{ alignSelf: 'flex-end' }}>
              <StampStack ids={draft.stampIds.length > 0 ? draft.stampIds : [draft.stampId]} maskPrefix="-prev" />
            </div>
            {/* Postmark */}
            <div style={{ marginTop: 2, opacity: 0.88 }}>
              <svg width="64" height="64" viewBox="0 0 68 68" xmlns="http://www.w3.org/2000/svg">
                <circle cx="34" cy="34" r="31" fill="none" stroke="rgba(200,105,72,0.18)" strokeWidth="1.5" strokeDasharray="3 4"/>
                <circle cx="34" cy="34" r="24" fill="none" stroke="rgba(200,105,72,0.24)" strokeWidth="1"/>
                <line x1="10" y1="34" x2="58" y2="34" stroke="rgba(200,105,72,0.17)" strokeWidth="0.75"/>
                <text x="34" y="25" textAnchor="middle" fontFamily="Space Grotesk Variable,sans-serif" fontSize="5" fontWeight="600" letterSpacing="2" fill="rgba(200,105,72,0.50)">LETTERBOX</text>
                <text x="34" y="35.5" textAnchor="middle" fontFamily="Space Grotesk Variable,sans-serif" fontSize="7.5" fontWeight="300" fill="rgba(200,105,72,0.40)">APR 2026</text>
                <text x="34" y="45.5" textAnchor="middle" fontFamily="Space Grotesk Variable,sans-serif" fontSize="4.5" fontWeight="600" letterSpacing="1.5" fill="rgba(200,105,72,0.32)">SINGAPORE</text>
              </svg>
            </div>
            {/* Address */}
            <div className="mt-auto w-full">
              <p className="font-serif text-[15px] italic pb-1.5 mb-1.5 border-b border-[var(--color-cream-3)]" style={{ color: 'var(--color-ink)' }}>
                {addrTo}
              </p>
              {['STP Feedback AI', 'CoVAA Platform', 'Singapore'].map((line) => (
                <p key={line} className="text-[9px] pb-0.5 mb-0.5 border-b border-[var(--color-cream-3)] leading-[1.75]" style={{ color: 'var(--color-ink-3)' }}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-2 px-0.5">
          <span className="text-[9px] font-medium tracking-[1.8px] uppercase opacity-50" style={{ color: 'var(--color-ink-4)' }}>CoVAA Letterbox</span>
          <span className="text-[9px] font-medium tracking-[1.8px] uppercase opacity-50" style={{ color: 'var(--color-ink-4)' }}>Singapore · APR 2026</span>
        </div>
      </div>
    </div>
  )
}
