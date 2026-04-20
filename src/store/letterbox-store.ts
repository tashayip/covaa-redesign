import { create } from 'zustand'
import type { Contact, DiscoverCard, FeedbackLetter, FeedbackLettersTab, FlowState, LetterDraft, StampId } from '@/types'

const DEFAULT_CONTACTS: Contact[] = [
  { id: 'orchid', name: 'STP Feedback AI', role: 'AI · STP Teaching Framework', type: 'ai',    color: '#7C3AED' },
  { id: 'marcus', name: 'Marcus',    role: 'Your Mentor',                  type: 'mentor', color: '#2563EB' },
  { id: 'sarah',  name: 'Sarah',     role: 'Peer · P3 Teacher',            type: 'peer',   color: '#0D9488' },
  { id: 'james',  name: 'James',     role: 'HOD · Primary',                type: 'peer',   color: '#D97706' },
]

const DEMO_SENT_LETTER: FeedbackLetter = {
  id: 300,
  lesson: 'P4 English - Creative Writing',
  stamp: 'enactment',
  recipients: ['STP Feedback AI'],
  sentAt: 'Just now',
  status: 'in_transit',
  isNew: false,
}

const DEMO_RECEIVED_LETTER: FeedbackLetter = {
  id: 301,
  lesson: 'P4 English - Creative Writing',
  stamp: 'enactment',
  recipients: ['STP Feedback AI'],
  sentAt: 'Just now',
  status: 'replied',
  isNew: true,
}

const DISCOVER_CARDS: DiscoverCard[] = [
  { id: 1, cat: 'pacing',      eyebrow: 'YEAR 4 · MATHEMATICS', body: 'I tried something new with transitions this week — moving from whole-class to pairs, then back again. I want to know if the rhythm felt right from the outside.', who: 'A teacher in Tampines',    time: '2 hours ago',  stamp: 'preparation' },
  { id: 2, cat: 'questioning', eyebrow: 'YEAR 8 · ENGLISH',     body: "There's a student in the back who never puts her hand up. I asked her directly and it landed — but I'm not sure if I handled the follow-up well.",              who: 'A teacher in Bedok',       time: '5 hours ago',  stamp: 'assessment' },
  { id: 3, cat: 'structure',   eyebrow: 'YEAR 6 · SCIENCE',     body: 'My lesson had a strong opening and a strong close but the middle felt loose. I could feel it slipping but didn\'t know how to pull it back. Thoughts?',         who: 'A teacher in Jurong West', time: 'Yesterday',    stamp: 'culture' },
  { id: 4, cat: 'group-work',  eyebrow: 'PRIMARY 3 · ENGLISH',  body: "First time trying structured group roles in my class. Three groups worked beautifully. One didn't. I'd love a second view on what I missed.",                    who: 'A teacher in Woodlands',   time: 'Yesterday',    stamp: 'other' },
  { id: 5, cat: 'pacing',      eyebrow: 'YEAR 10 · HISTORY',    body: 'I knew I was running out of time at the 35-minute mark but kept pushing. Is there a graceful way to cut a lesson short without it feeling like a failure?',    who: 'A teacher in Buona Vista', time: '2 days ago',   stamp: 'enactment' },
  { id: 6, cat: 'questioning', eyebrow: 'PRIMARY 5 · MATHEMATICS', body: 'I asked "does everyone understand?" twelve times. I counted. I know it\'s the wrong question. What do you actually ask instead?',                          who: 'A teacher in Ang Mo Kio',  time: '2 days ago',   stamp: 'preparation' },
]

interface LetterboxStore {
  flow: FlowState
  wizardStep: 1 | 2 | 3 | 4
  draft: LetterDraft
  contacts: Contact[]
  selectedIds: string[]
  discoverCards: DiscoverCard[]
  defaultStampIds: StampId[]
  selectedLetterId: number | null
  newLetterCount: number
  myLettersTab: FeedbackLettersTab
  sentDemoLetter: FeedbackLetter | null
  receivedDemoLetter: FeedbackLetter | null
  demoReplyTimerStarted: boolean

  setFlow: (f: FlowState) => void
  setWizardStep: (s: 1 | 2 | 3 | 4) => void
  updateDraft: (patch: Partial<LetterDraft>) => void
  toggleContact: (id: string) => void
  addCustomContact: (email: string) => void
  removeContact: (id: string) => void
  setStamp: (id: StampId) => void
  setDefaultStamps: (ids: StampId[]) => void
  setSelectedLetter: (id: number | null) => void
  decrementNewLetterCount: () => void
  setMyLettersTab: (tab: FeedbackLettersTab) => void
  sendDemoLetter: () => void
  receiveDemoReply: () => void
  markReplySeen: (id: number) => void
}

export const useLetterboxStore = create<LetterboxStore>((set) => ({
  flow: 'transit',
  wizardStep: 1,

  draft: {
    lesson: '',
    body: '',
    ask: '',
    signAs: '',
    stampId: 'culture',
    stampIds: ['culture'],
    customStampLabel: '',
    isOpenLetter: false,
    attachmentName: null,
    youtubeLink: null,
  },

  contacts: DEFAULT_CONTACTS,
  selectedIds: ['orchid'],
  discoverCards: DISCOVER_CARDS,
  defaultStampIds: ['culture'],
  selectedLetterId: null,
  newLetterCount: 0,
  myLettersTab: 'received',
  sentDemoLetter: null,
  receivedDemoLetter: null,
  demoReplyTimerStarted: false,

  setFlow: (f) => set({ flow: f }),
  setWizardStep: (s) => set({ wizardStep: s }),

  updateDraft: (patch) =>
    set((s) => ({ draft: { ...s.draft, ...patch } })),

  toggleContact: (id) =>
    set((s) => ({
      selectedIds: s.selectedIds.includes(id)
        ? s.selectedIds.filter((x) => x !== id)
        : [...s.selectedIds, id],
    })),

  addCustomContact: (email) => {
    const name = email
      .split('@')[0]
      .replace(/[._-]/g, ' ')
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
    const id = `custom_${Date.now()}`
    const contact: Contact = { id, name, role: 'Colleague', type: 'peer', color: '#64748B' }
    set((s) => ({
      contacts: [...s.contacts, contact],
      selectedIds: [...s.selectedIds, id],
    }))
  },

  removeContact: (id) =>
    set((s) => ({ selectedIds: s.selectedIds.filter((x) => x !== id) })),

  setStamp: (id) =>
    set((s) => ({ draft: { ...s.draft, stampId: id } })),

  setDefaultStamps: (ids) => set({ defaultStampIds: ids }),

  setSelectedLetter: (id) => set({ selectedLetterId: id }),

  decrementNewLetterCount: () =>
    set((s) => ({ newLetterCount: Math.max(0, s.newLetterCount - 1) })),

  setMyLettersTab: (tab) => set({ myLettersTab: tab }),

  sendDemoLetter: () =>
    set((s) => ({
      sentDemoLetter: { ...DEMO_SENT_LETTER },
      receivedDemoLetter: null,
      demoReplyTimerStarted: true,
      newLetterCount: 0,
      myLettersTab: 'sent',
      draft: {
        ...s.draft,
        lesson: 'P4 English - Creative Writing',
        stampId: 'enactment',
        stampIds: ['enactment'],
      },
    })),

  receiveDemoReply: () =>
    set(() => ({
      sentDemoLetter: null,
      receivedDemoLetter: { ...DEMO_RECEIVED_LETTER },
      newLetterCount: 1,
      myLettersTab: 'received',
    })),

  markReplySeen: (id) =>
    set((s) => ({
      receivedDemoLetter: s.receivedDemoLetter?.id === id
        ? { ...s.receivedDemoLetter, isNew: false }
        : s.receivedDemoLetter,
      newLetterCount: s.receivedDemoLetter?.id === id ? 0 : s.newLetterCount,
    })),
}))
