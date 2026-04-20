export type StampId = 'culture' | 'preparation' | 'enactment' | 'assessment' | 'other'
export type FlowState = 'write' | 'transit' | 'discover' | 'settings' | 'letter-detail'
export type ContactType = 'mentor' | 'ai' | 'peer'
export type FeedbackLettersTab = 'shared' | 'toRespond' | 'sent'

export interface Contact {
  id: string
  name: string
  role: string
  type: ContactType
  color: string
}

export interface StampConfig {
  id: StampId
  label: string
  short: string
  bg: string
  fg: string
  denom: string
}

export interface LetterDraft {
  lesson: string
  body: string
  ask: string
  signAs: string
  stampId: StampId        // primary stamp (backward compat)
  stampIds: StampId[]     // all selected domains
  customStampLabel: string
  isOpenLetter: boolean
  attachmentName: string | null
  youtubeLink: string | null
}

export interface DiscoverCard {
  id: number
  cat: string
  eyebrow: string
  body: string
  who: string
  time: string
  stamp: StampId
  school?: string
  teacherName?: string
  avatarLabel?: string
  avatarColor?: string
}

export interface FeedbackLetter {
  id: number
  lesson: string
  stamp: StampId
  recipients: string[]
  sentAt: string
  status: 'in_transit' | 'replied' | 'sent'
  isNew: boolean
  personName: string
  sourceType: 'ai' | 'teacher'
  schoolOrRole: string
  avatarLabel: string
  avatarColor?: string
  relationship: 'shared' | 'toRespond' | 'sent'
}
