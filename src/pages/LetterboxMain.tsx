import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useLetterboxStore } from '@/store/letterbox-store'
import { useShallow } from 'zustand/react/shallow'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { PostcardPreview } from '@/components/postcard/PostcardPreview'
import { DomainRow } from '@/components/stamps/StampChooser'
import { MyLetters } from '@/components/transit/TransitMap'
import { DiscoverFeed } from '@/components/discover/DiscoverFeed'
import { cn } from '@/lib/utils'
import type { StampId } from '@/types'
import { STAMP_ORDER } from '@/components/stamps/StampSVG'

// ─── helpers ────────────────────────────────────────────────────────────────

function FormLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <span className="block text-[10px] font-semibold uppercase tracking-[2.2px] text-muted-foreground mb-1.5">
      {children}{required && <span className="text-red-600 font-bold text-base ml-1 leading-none">*</span>}
    </span>
  )
}

function IconInput({
  icon, type = 'text', placeholder, value, onChange, className, hasError,
}: {
  icon: React.ReactNode
  type?: string
  placeholder?: string
  value: string
  onChange: (v: string) => void
  className?: string
  hasError?: boolean
}) {
  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-base pointer-events-none select-none">
        {icon}
      </span>
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn('pl-10', hasError && 'border-red-400 focus-visible:ring-red-300', className)}
      />
    </div>
  )
}

// ─── address-book contact selector ──────────────────────────────────────────

function ContactSelector({ showError }: { showError?: boolean }) {
  const [open, setOpen] = useState(false)
  const [addEmail, setAddEmail] = useState('')
  const panelRef = useRef<HTMLDivElement>(null)

  const { contacts, selectedIds, toggleContact, addCustomContact } = useLetterboxStore(
    useShallow((s) => ({
      contacts: s.contacts, selectedIds: s.selectedIds,
      toggleContact: s.toggleContact, addCustomContact: s.addCustomContact,
    }))
  )

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function handleAddEmail(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && addEmail.trim()) {
      addCustomContact(addEmail.trim())
      setAddEmail('')
    }
  }

  const selectedContacts = contacts.filter((c) => selectedIds.includes(c.id))

  return (
    <div className="relative" ref={panelRef}>
      {/* Trigger row */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'w-full flex flex-wrap items-center gap-1.5 px-3 py-2.5 min-h-[42px] rounded-xl border text-left transition-colors',
          open ? 'border-foreground/40 bg-white' : 'border-border bg-white hover:border-foreground/25',
          showError && selectedIds.length === 0 && 'border-red-400'
        )}
      >
        {selectedContacts.length === 0 ? (
          <>
            <span className="text-sm text-muted-foreground">Add anyone…</span>
            <span className="ml-auto text-muted-foreground text-xs">▾</span>
          </>
        ) : (
          <>
            {selectedContacts.map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold text-white"
                style={{ backgroundColor: c.color }}
              >
                {c.type === 'ai' ? '✦' : c.name[0]} {c.name}
              </span>
            ))}
            <span className="text-xs text-muted-foreground ml-1">▾</span>
          </>
        )}
      </button>

      {/* Error */}
      <AnimatePresence>
        {showError && selectedIds.length === 0 && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-[11px] text-red-500 mt-1"
          >
            Please select at least one recipient before sending.
          </motion.p>
        )}
      </AnimatePresence>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-1.5 left-0 right-0 z-50 rounded-xl border border-border overflow-hidden"
            style={{ background: '#FDFAF6', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
          >
            <div className="py-1">
              {contacts.map((c) => {
                const sel = selectedIds.includes(c.id)
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleContact(c.id)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-foreground/5 transition-colors"
                  >
                    {/* Avatar */}
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-opacity text-white"
                      style={{ backgroundColor: c.color, opacity: sel ? 1 : 0.45 }}
                    >
                      {c.type === 'ai' ? '✦' : c.name[0]}
                    </div>
                    <span className="flex-1 text-sm font-medium text-foreground">{c.name}</span>
                    {sel && (
                      <span className="text-[10px] text-foreground font-bold shrink-0">✓</span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Add by email */}
            <div className="border-t border-border px-4 py-2.5">
              <input
                type="email"
                className="w-full text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                placeholder="Add anyone — name@school.edu.sg, press Enter"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                onKeyDown={handleAddEmail}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── step views ─────────────────────────────────────────────────────────────

const PROCESS_STEPS = [
  { icon: '🎬', label: 'Record', desc: 'Film your lesson — phone on a tripod works fine' },
  { icon: '✉️', label: 'Share with STP Feedback AI or other colleagues',  desc: 'Upload a link or file and write a letter about what you want feedback on' },
  { icon: '💌', label: 'Receive feedback from colleagues or STP Feedback AI', desc: 'Get a thoughtful letter back from another teacher or STP Feedback AI' },
]

function Step1({ onNext }: { onNext: () => void }) {
  return (
    <div className="animate-fade-up space-y-5">
        <div className="space-y-3">
          {PROCESS_STEPS.map((s, i) => (
            <div key={s.label} className="flex items-start gap-4 p-4 rounded-xl bg-white border border-border">
              <div className="w-9 h-9 shrink-0 rounded-full bg-muted flex items-center justify-center text-lg">
                {s.icon}
              </div>
              <div className="pt-0.5">
                <p className="text-sm font-semibold text-foreground">
                  <span className="text-muted-foreground font-normal mr-1.5">{i + 1}.</span>
                  {s.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button size="default" onClick={onNext}>
            Get started →
          </Button>
        </div>
    </div>
  )
}

function Step2SendTo({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { selectedIds } = useLetterboxStore(useShallow((s) => ({ selectedIds: s.selectedIds })))
  const [showError, setShowError] = useState(false)
  const [calloutVisible, setCalloutVisible] = useState(true)

  function handleNext() {
    if (selectedIds.length === 0) { setShowError(true); return }
    onNext()
  }

  return (
    <div className="animate-fade-up space-y-5">
      <div>
        <FormLabel>Get feedback from</FormLabel>
        <ContactSelector showError={showError} />
        <p className="text-[11px] text-muted-foreground mt-1.5">For richer feedback, add another colleague alongside STP Feedback AI.</p>

        <AnimatePresence>
          {calloutVisible && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.22 }}
              className="relative mt-1"
            >
              {/* Arrow pointing up toward the STP AI tag */}
              <div className="absolute -top-1.5 left-5 w-3 h-3 bg-gray-900 rotate-45 z-10" />
              <div className="relative z-20 bg-gray-900 text-white rounded-xl px-4 py-3.5 shadow-xl">
                <div className="flex items-start gap-2.5">
                  <span className="text-violet-400 text-base shrink-0 mt-0.5">✦</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-relaxed text-gray-100">
                      By getting feedback from <span className="font-semibold text-white">STP Feedback AI</span>, you will receive AI-powered feedback grounded in the STP Framework.
                    </p>
                    <button
                      type="button"
                      onClick={() => setCalloutVisible(false)}
                      className="mt-2.5 px-3 py-1 rounded-md bg-white text-gray-900 text-xs font-semibold hover:bg-gray-100 transition-colors"
                    >
                      Got it
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" size="default" onClick={onBack}>← Back</Button>
        <Button size="default" onClick={handleNext}>Continue →</Button>
      </div>
    </div>
  )
}

function Step4Stamps({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { draft, updateDraft, defaultStampIds } = useLetterboxStore(
    useShallow((s) => ({ draft: s.draft, updateDraft: s.updateDraft, defaultStampIds: s.defaultStampIds }))
  )

  // Pre-populate from defaultStampIds on first render
  useEffect(() => {
    if (draft.stampIds.length === 0 && defaultStampIds.length > 0) {
      updateDraft({ stampIds: defaultStampIds, stampId: defaultStampIds[0] })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function toggleDomain(id: StampId) {
    const current = draft.stampIds
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id]
    if (next.length === 0) return
    updateDraft({ stampIds: next, stampId: next[0] })
  }

  const canProceed = draft.stampIds.length > 0
  const mainStamps = STAMP_ORDER.filter((id) => id !== 'other')
  const otherStamp = STAMP_ORDER.find((id) => id === 'other')

  return (
    <div className="animate-fade-up space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {mainStamps.map((id) => (
          <DomainRow
            key={id}
            id={id}
            selected={draft.stampIds.includes(id)}
            onToggle={() => toggleDomain(id)}
            customLabel={draft.customStampLabel}
            onCustomLabel={(label) => updateDraft({ customStampLabel: label })}
          />
        ))}
        {otherStamp && (
          <div className="col-span-2">
            <DomainRow
              id={otherStamp}
              selected={draft.stampIds.includes(otherStamp)}
              onToggle={() => toggleDomain(otherStamp)}
              customLabel={draft.customStampLabel}
              onCustomLabel={(label) => updateDraft({ customStampLabel: label })}
            />
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" size="default" onClick={onBack}>
          ← Back
        </Button>
        <Button size="default" onClick={onNext} disabled={!canProceed}>
          Continue →
        </Button>
      </div>
    </div>
  )
}

function Step3({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { draft, updateDraft } = useLetterboxStore(
    useShallow((s) => ({ draft: s.draft, updateDraft: s.updateDraft }))
  )
  const [fileError, setFileError] = useState<string | null>(null)

  function handleAttach(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileError(null)
    const validTypes = ['video/', 'audio/']
    if (!validTypes.some((t) => file.type.startsWith(t))) {
      setFileError('Please upload a video or audio file (MP4, MOV, M4A, etc.)')
      e.target.value = ''
      return
    }
    if (file.size > 2 * 1024 * 1024 * 1024) {
      setFileError('File is too large. Maximum size is 2 GB.')
      e.target.value = ''
      return
    }
    updateDraft({ attachmentName: file.name, youtubeLink: null })
  }

  function removeVideo() {
    updateDraft({ youtubeLink: null, attachmentName: null })
    setFileError(null)
  }

  const urlValue = draft.youtubeLink || ''
  const urlIsInvalid =
    urlValue.length > 15 &&
    !urlValue.includes('youtube') &&
    !urlValue.includes('youtu.be') &&
    !urlValue.includes('vimeo')

  const hasRecording = !!(draft.youtubeLink || draft.attachmentName)
  const videoLabel = draft.attachmentName
    ? draft.attachmentName.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
    : draft.youtubeLink || ''
  const canContinue = draft.lesson.trim().length > 0 && hasRecording

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Lesson title */}
        <div>
          <FormLabel required>Lesson title</FormLabel>
          <IconInput
            icon="📖"
            placeholder="e.g. P4 English - Creative Writing"
            value={draft.lesson}
            onChange={(v) => updateDraft({ lesson: v })}
            className="bg-white"
          />
        </div>

        {/* Video source */}
        <div>
          <FormLabel required>Video or recording</FormLabel>
          <IconInput
            icon="🎬"
            type="url"
            placeholder="https://youtube.com/watch?v=..."
            value={urlValue}
            onChange={(v) => updateDraft({ youtubeLink: v || null, attachmentName: null })}
            hasError={urlIsInvalid}
            className="bg-white"
          />
          {urlIsInvalid ? (
            <p className="text-[11px] text-red-500 mt-1.5">Please enter a valid YouTube or Vimeo link.</p>
          ) : (
            <p className="text-[11px] text-muted-foreground mt-1.5">Supports YouTube and Vimeo links</p>
          )}

          {/* File upload */}
          {!draft.youtubeLink && (
            <label
              className={cn(
                'mt-2 flex items-center gap-3 px-4 py-2.5 rounded-xl border border-dashed cursor-pointer transition-colors text-sm',
                'border-border hover:border-foreground/20 text-muted-foreground hover:text-foreground'
              )}
              htmlFor="lb-attach-input"
            >
              <span className="text-base">📎</span>
              <span>Or upload a file (MP4, MOV, M4A)</span>
              <input type="file" id="lb-attach-input" accept="video/*,audio/*" className="hidden" onChange={handleAttach} />
            </label>
          )}

          {/* File error */}
          <AnimatePresence>
            {fileError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-[11px] text-red-500 mt-1.5"
              >
                {fileError}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Loaded video chip */}
          <AnimatePresence>
            {hasRecording && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200"
              >
                <span className="text-green-600 shrink-0">✓</span>
                <span className="flex-1 truncate text-sm text-green-800 font-medium min-w-0">
                  {videoLabel}
                </span>
                <button
                  type="button"
                  onClick={removeVideo}
                  aria-label="Remove recording"
                  className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-green-600/50 hover:bg-red-50 hover:text-red-500 transition-colors text-base leading-none"
                >
                  ×
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-between pt-2">
          <Button variant="outline" size="default" onClick={onBack}>← Back</Button>
          <Button size="default" onClick={onNext} disabled={!canContinue}>
            Continue →
          </Button>
        </div>
    </div>
  )
}

function Step5({ onBack, onSend, sending }: { onBack: () => void; onSend: () => void; sending: boolean }) {
  const { draft, updateDraft } = useLetterboxStore(
    useShallow((s) => ({ draft: s.draft, updateDraft: s.updateDraft }))
  )
  const [showHint, setShowHint] = useState(false)

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_440px] gap-20 items-start animate-fade-up">
      {/* Left: form */}
      <div className="space-y-5">

        {/* Context */}
        <div>
          <FormLabel>Lesson context <span className="font-normal normal-case tracking-normal text-[10px]">— optional</span></FormLabel>
          <Textarea
            className="font-serif italic text-[13.5px] leading-[1.75] min-h-[90px] resize-none bg-white"
            placeholder={`e.g. P4 English, 32 pupils — descriptive writing. I tried a cold-call on a quiet student at 18 min and wasn't sure it landed.`}
            value={draft.body}
            onChange={(e) => updateDraft({ body: e.target.value })}
          />
        </div>

        {/* Feedback ask */}
        <div>
          <FormLabel required>What feedback do you need from others?</FormLabel>
          <Textarea
            className="min-h-[120px] resize-none font-serif italic text-[13.5px] leading-[1.75] bg-white"
            placeholder={`e.g. Was my pacing right after the group task? Did students have time to think before I moved on?`}
            value={draft.ask}
            onChange={(e) => updateDraft({ ask: e.target.value })}
          />
          {/* Hint toggle */}
          <button
            type="button"
            onClick={() => setShowHint((v) => !v)}
            className="mt-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            💡 {showHint ? 'Hide' : 'Show'} example questions
          </button>
          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 p-3 rounded-lg bg-muted text-xs space-y-1 text-muted-foreground">
                  <p>• "At 8 min I rushed the transition — was the pace right?"</p>
                  <p>• "Did I check for understanding before moving on?"</p>
                  <p>• "Were my questions cognitively demanding enough?"</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Separator />

        {/* Sign as */}
        <div>
          <FormLabel>Sign as</FormLabel>
          <IconInput
            icon="✏️"
            placeholder="Your preferred name"
            value={draft.signAs}
            onChange={(v) => updateDraft({ signAs: v })}
            className="bg-white"
          />
        </div>

        {/* Post publicly */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <Checkbox
            id="open-letter"
            checked={draft.isOpenLetter}
            onCheckedChange={(v) => updateDraft({ isOpenLetter: !!v })}
            className="mt-0.5"
          />
          <div>
            <p className="text-sm font-medium text-foreground group-hover:text-foreground/80 transition-colors">
              Post publicly to the Community
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Any teacher in the community can read and respond — anonymously if you prefer
            </p>
          </div>
        </label>

        <div className="flex justify-between pt-2">
          <Button variant="outline" size="default" onClick={onBack}>← Back</Button>
          <Button size="default" onClick={onSend} disabled={sending}>
            {sending ? 'Sending…' : 'Send letter →'}
          </Button>
        </div>
      </div>

      {/* Right: live postcard preview — entry animation on step 5 */}
      <div className="hidden xl:block">
        <PostcardPreview sending={sending} entryAnimation={true} />
      </div>
    </div>
  )
}

// ─── main ────────────────────────────────────────────────────────────────────

let demoReplyTimer: ReturnType<typeof setTimeout> | null = null

export function LetterboxMain() {
  const { flow, setFlow, wizardStep, setWizardStep, sendDemoLetter, receiveDemoReply } = useLetterboxStore(
    useShallow((s) => ({
      flow: s.flow, setFlow: s.setFlow,
      wizardStep: s.wizardStep, setWizardStep: s.setWizardStep,
      sendDemoLetter: s.sendDemoLetter,
      receiveDemoReply: s.receiveDemoReply,
    }))
  )
  const [sending, setSending] = useState(false)

  function goToStep(s: 1 | 2 | 3 | 4 | 5) {
    setWizardStep(s)
  }

  function handleSend() {
    setSending(true)
    setTimeout(() => {
      setSending(false)
      sendDemoLetter()
      setFlow('transit')
      setWizardStep(1)
      if (!demoReplyTimer) {
        demoReplyTimer = setTimeout(() => {
          receiveDemoReply()
          toast.success('You have new mail', {
            description: 'STP Feedback AI has replied to P4 English - Creative Writing.',
            duration: 6500,
          })
          demoReplyTimer = null
        }, 10000)
      }
      toast.success('Your letter is sealed and on its way ✉️', {
        description: "You'll hear back soon from STP Feedback AI.",
      })
    }, 700)
  }

  const pageTitle =
    flow === 'transit'  ? 'All Feedback' :
    flow === 'discover' ? 'From the community' :
    wizardStep === 1 ? 'How does this work?' :
    wizardStep === 2 ? 'Who would you like feedback from?' :
    wizardStep === 3 ? 'Describe your lesson' :
    wizardStep === 4 ? 'What would you like feedback on?' :
                       'Can you give more context?'

  const pageSubtitle =
    flow === 'transit'  ? 'Letters you have received and letters you have sent to others or STP Feedback AI.' :
    flow === 'discover' ? "Letters from teachers who'd welcome a second pair of eyes." :
    wizardStep === 1 ? 'Describe your lesson, tell us what you want to know, and send it. Replies come back as letters — like the ones in Community.' :
    wizardStep === 2 ? 'Choose who should receive your lesson and write back with feedback.' :
    wizardStep === 3 ? 'Add your recording and give the lesson a title.' :
    wizardStep === 4 ? 'Choose one or more areas of teaching you want feedback on. You can select multiple.' :
                       'Add any extra context that will help your reviewer give better feedback.'

  const isWideStep = flow === 'write' && wizardStep === 5

  return (
    <main className="w-full px-8 xl:px-12 py-8">

      {/* Page header — centred container */}
      <div className={`mb-6 ${flow === 'discover' ? '' : isWideStep ? 'mx-auto max-w-5xl' : 'mx-auto max-w-2xl'}`}>
        <h1 className="text-[2rem] font-semibold leading-none text-foreground mb-2">
          {pageTitle}
        </h1>
        {pageSubtitle && (
          <p className="text-sm text-muted-foreground max-w-[65ch]">{pageSubtitle}</p>
        )}
      </div>

      {/* ── WRITE: wizard ── */}
      {flow === 'write' && (
        <>
          {wizardStep === 1 && (
            <div className="mx-auto max-w-2xl">
              <Step1 onNext={() => goToStep(2)} />
            </div>
          )}
          {wizardStep === 2 && (
            <div className="mx-auto max-w-2xl">
              <Step2SendTo onNext={() => goToStep(3)} onBack={() => goToStep(1)} />
            </div>
          )}
          {wizardStep === 3 && (
            <div className="mx-auto max-w-2xl">
              <Step3 onNext={() => goToStep(4)} onBack={() => goToStep(2)} />
            </div>
          )}
          {wizardStep === 4 && (
            <div className="mx-auto max-w-2xl">
              <Step4Stamps onNext={() => goToStep(5)} onBack={() => goToStep(3)} />
            </div>
          )}
          {wizardStep === 5 && (
            <div className="mx-auto max-w-5xl">
              <Step5 onBack={() => goToStep(4)} onSend={handleSend} sending={sending} />
            </div>
          )}
        </>
      )}

      {/* ── MY LETTERS ── */}
      {flow === 'transit' && (
        <div className="mx-auto max-w-2xl animate-fade-up">
          <MyLetters />
        </div>
      )}

      {/* ── DISCOVER ── */}
      {flow === 'discover' && (
        <div className="animate-fade-up">
          <DiscoverFeed onGoWrite={() => { setFlow('write'); setWizardStep(1) }} />
        </div>
      )}
    </main>
  )
}
