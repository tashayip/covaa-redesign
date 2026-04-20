import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLetterboxStore } from '@/store/letterbox-store'
import { useShallow } from 'zustand/react/shallow'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Lightbulb, Eye, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

// ─── STP framework data ──────────────────────────────────────────────────────

const STP_PROCESSES = [
  {
    id: 'culture',
    title: 'Positive Classroom Culture',
    areas: [
      'Establishing Interaction and Rapport',
      'Maintaining Positive Discipline',
      'Setting Expectations and Routines',
      'Building Trust',
      'Empowering Learners',
    ],
  },
  {
    id: 'preparation',
    title: 'Lesson Preparation',
    areas: [
      'Determining Lesson Objectives',
      "Considering Learners' Profile",
      'Selecting and Sequencing Content',
      'Planning Key Questions',
      'Sequencing Learning',
      'Deciding on Instructional Strategies',
      'Deciding on Teaching Aids and Learning Resources',
    ],
  },
  {
    id: 'enactment',
    title: 'Lesson Enactment',
    areas: [
      'Activating Prior Knowledge',
      'Arousing Interest',
      'Encouraging Learner Engagement',
      'Exercising Flexibility',
      'Providing Clear Explanation',
      'Pacing and Maintaining Momentum',
      'Facilitating Collaborative Learning',
      'Using Questions to Deepen Learning',
      'Concluding the Lesson',
    ],
  },
  {
    id: 'assessment',
    title: 'Assessment and Feedback',
    areas: [
      'Checking for Understanding and Providing Feedback',
      'Supporting Self-Directed Learning',
      'Setting Meaningful Assignments',
    ],
  },
]

// ─── mock data ────────────────────────────────────────────────────────────────

type Recording =
  | { type: 'video'; title: string; youtubeId: string }
  | { type: 'audio'; title: string; src: string }

function createDemoAudioSrc() {
  const sampleRate = 8000
  const duration = 4
  const numSamples = sampleRate * duration
  const dataSize = numSamples * 2
  const buffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(buffer)

  function writeString(offset: number, value: string) {
    for (let i = 0; i < value.length; i += 1) {
      view.setUint8(offset + i, value.charCodeAt(i))
    }
  }

  writeString(0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeString(36, 'data')
  view.setUint32(40, dataSize, true)

  for (let i = 0; i < numSamples; i += 1) {
    const fade = Math.min(1, i / 1200, (numSamples - i) / 1200)
    const sample = Math.sin((i / sampleRate) * Math.PI * 2 * 220) * 0.12 * fade
    view.setInt16(44 + i * 2, sample * 32767, true)
  }

  let binary = ''
  const bytes = new Uint8Array(buffer)
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i])
  }

  return `data:audio/wav;base64,${btoa(binary)}`
}

const DEMO_AUDIO_SRC = createDemoAudioSrc()

interface MockLetterData {
  id: number
  lesson: string
  date: string
  recording: Recording
  context: string
  ask: string
  status: 'in_transit' | 'replied'
  from: string
  sourceType?: 'ai' | 'teacher'
  schoolOrRole?: string
  avatarLabel?: string
  avatarColor?: string
  relationship?: 'shared' | 'toRespond' | 'sent'
  requestedFor?: string
  hasAiFeedback?: boolean
  letter?: {
    greeting: string
    wellDone: string[]
    tryNext: string[]
    reflect: string[]
    teachingActions: string[]
    closing: string
    signature: string
  }
}

const MOCK_LETTERS: Record<number, MockLetterData> = {
  1: {
    id: 1,
    lesson: 'Year 5 Maths – Fractions',
    date: '2 hours ago',
    recording: {
      type: 'audio',
      title: 'Fraction area models reflection.m4a',
      src: DEMO_AUDIO_SRC,
    },
    context: 'Year 5 Maths, 35 pupils. Objective: introduce equivalent fractions using area models. I tried a new visual approach at the 12-minute mark and wasn\'t sure it landed.',
    ask: 'Was my pacing right after the group work segment? Did students seem to understand before I moved on?',
    status: 'in_transit',
    from: 'STP Feedback AI',
  },
  2: {
    id: 2,
    lesson: 'P3 Science – Living Things',
    date: '3 days ago',
    recording: {
      type: 'video',
      title: 'Plant observation activity',
      youtubeId: 'lhS6rpMgULM',
    },
    context: "P3 Science, 36 pupils. Objective: categorise living vs non-living things using observable characteristics. The plant observation activity at 14 min was new — I'd never done it before and I wasn't sure students were on track.",
    ask: 'Did the plant observation activity land? Were students genuinely engaged, or just compliant? And did I handle the questioning well after the activity?',
    status: 'replied',
    from: 'Sarah',
    letter: {
      greeting: 'Dear Tasha,',
      wellDone: [
        "The plant observation activity at the 14-minute mark was a genuine highlight. Students were leaning in, touching the leaves, writing notes. That's real curiosity — well earned.",
        "Your pacing in the opening was measured and confident. You gave students time to settle before diving into content, which set a calm tone for the whole lesson.",
        "The categorisation task at the close was well-sequenced: you moved from concrete (observation) to abstract (classification) in a way that felt natural.",
      ],
      tryNext: [
        'When you asked "do plants need sunlight?" at 17 min, three students at the back showed uncertain faces but didn\'t raise their hands. A quick whole-class check — show of fingers, 1 to 5 — takes 20 seconds and catches these moments.',
        'Your cold-calling was warm in tone, but you called only from the front two rows. Widening your gaze to the sides and back signals to those students that they\'re part of the lesson too.',
      ],
      reflect: [
        'At 19 min you said "does everyone understand?" — it\'s the most natural question in the world, but it rarely surfaces genuine confusion. What question could you ask instead that would make a student\'s understanding (or misunderstanding) visible?',
        'The transition out of the group task felt slightly rushed. What would 60 seconds of quiet reflection before pulling them back together look like?',
      ],
      teachingActions: [
        'Getting students actively involved — the observation activity created genuine hands-on participation',
        'Questioning to deepen thinking — targeted questions after the activity had mixed effectiveness',
        'Checking understanding — "does everyone understand?" rarely surfaces real confusion; needs rethinking',
        'Keeping the lesson moving — strong pacing overall, with one transition that felt rushed',
      ],
      closing: "This was a warm and purposeful lesson. You clearly know your students and care about their learning. Keep trusting the slower moments — they're working.",
      signature: '— Sarah',
    },
  },
  3: {
    id: 3,
    lesson: 'P4 English – Descriptive Writing',
    date: '1 week ago',
    recording: {
      type: 'video',
      title: 'Descriptive writing discussion',
      youtubeId: 'xKxrkht7CpY',
    },
    context: "P4 English, 34 pupils. Objective: use sensory details in descriptive writing. The pre-writing discussion at 8 min was unplanned — I went with the energy in the room.",
    ask: 'Was the wait time after questions long enough? Did I ask enough higher-order questions? The transition at 28 min felt rushed — would love a second view.',
    status: 'replied',
    from: 'STP Feedback AI',
    letter: {
      greeting: 'Dear Tasha,',
      wellDone: [
        "The pre-writing discussion at 8 min — the one you said was unplanned — was the best part of the lesson. Students were generating ideas aloud, building on each other's language. That's exactly what effective scaffolding looks like.",
        "Your use of mentor text was well-chosen. Reading the passage twice (once for pleasure, once annotated) gave students two different entry points into the same material.",
        "The descriptive writing samples shared at the end showed genuine progress. The range of sensory vocabulary was noticeably richer.",
      ],
      tryNext: [
        'Your wait time after higher-order questions averaged about 2 seconds. Extending to 4–5 seconds tends to improve the quality and diversity of responses, and invites quieter students in. Try counting silently to five after your next open question.',
        'The transition at 28 min felt abrupt. A deliberate "pause and listen" moment before switching tasks would smooth this considerably.',
      ],
      reflect: [
        'Of your 14 questions in the lesson, 11 were recall or comprehension level. The 3 higher-order questions produced your richest student responses. What would it look like to plan 2–3 of these deliberately before each lesson?',
        "You said the pre-writing discussion was unplanned. What made you decide to go with it in that moment? That instinct is worth examining — it might tell you something about how you read the room.",
      ],
      teachingActions: [
        'Building on each other\'s ideas — the pre-writing discussion sparked genuine peer knowledge-sharing',
        'Scaffolding with a good example — mentor text gave students two entry points into the same material',
        'Questioning to deepen thinking — wait time is the main area to develop',
        'Keeping the lesson moving — transition at 28 min identified for improvement',
        'Reading the room — the unplanned discussion revealed strong situational instinct',
      ],
      closing: 'A thoughtful lesson with a strong arc. The unplanned moments were often the most alive. Trust them more.',
      signature: '— STP Feedback AI, using the STP Framework',
    },
  },
  4: {
    id: 4,
    lesson: 'P5 Science – Forces Audio Reflection',
    date: 'Yesterday',
    recording: {
      type: 'audio',
      title: 'forces-lesson-small-group-reflection.m4a',
      src: DEMO_AUDIO_SRC,
    },
    context: 'P5 Science, 38 pupils. Objective: explain how pushes and pulls affect movement. I uploaded an audio reflection because the lesson recording was unavailable, and I narrated the moments where group talk became difficult to hear.',
    ask: 'Could STP Feedback AI analyse whether my questioning helped students connect force, direction, and movement? I also want to know if my recap was clear enough for the groups that were quieter.',
    status: 'replied',
    from: 'STP Feedback AI',
    letter: {
      greeting: 'Dear Tasha,',
      wellDone: [
        'Your audio reflection gave enough context to understand the lesson flow. Naming the exact moments where group talk became hard to hear helped focus the analysis on teaching decisions instead of missing footage.',
        'The recap question, "what changed when the push got stronger?", was well chosen because it tied observation back to the concept of force.',
        'You noticed the quieter groups without over-correcting them in the moment. That restraint kept the room calm and gave you useful evidence to reflect on after the lesson.',
      ],
      tryNext: [
        'After students describe what happened, ask one more causal question: "what makes you think the force changed?" This nudges them from reporting movement to explaining it.',
        'For audio-only reflections, add two or three quick timestamps before uploading. That would make it easier for a peer or AI reviewer to jump straight to the moments you care about.',
      ],
      reflect: [
        'Which student responses showed a secure link between force and direction, and which responses only described motion?',
        'When a group is quiet, what evidence besides volume could show whether they are thinking productively?',
      ],
      teachingActions: [
        'Checking understanding and providing feedback — the recap surfaced partial understanding that could be developed further',
        'Using questions to deepen learning — follow-up causal questions would strengthen the concept link',
        'Facilitating collaborative learning — the quieter groups needed a light-touch structure for reporting back',
      ],
      closing: 'This audio note worked as a useful reflection artifact. The next step is to pair the same clarity of narration with sharper timestamps so feedback can be even more precise.',
      signature: '— STP Feedback AI, using the STP Framework',
    },
  },
  300: {
    id: 300,
    lesson: 'P4 English - Creative Writing',
    date: 'Just now',
    recording: {
      type: 'video',
      title: 'Creative writing lesson recording',
      youtubeId: 'xKxrkht7CpY',
    },
    context: 'P4 English, 34 pupils. Objective: plan a short creative story with a stronger setting and clearer character motivation. I tried modelling one paragraph, then asked students to continue in pairs.',
    ask: 'Could STP Feedback AI look at whether my modelling gave enough structure without taking away student choice? I also want feedback on whether the pair discussion helped students improve their story ideas.',
    status: 'in_transit',
    from: 'STP Feedback AI',
    sourceType: 'ai',
    schoolOrRole: 'Singapore Teaching Practice',
    avatarLabel: '✦',
    avatarColor: '#7C3AED',
    relationship: 'sent',
  },
  301: {
    id: 301,
    lesson: 'P4 English - Creative Writing',
    date: 'Just now',
    recording: {
      type: 'video',
      title: 'Creative writing lesson recording',
      youtubeId: 'xKxrkht7CpY',
    },
    context: 'P4 English, 34 pupils. Objective: plan a short creative story with a stronger setting and clearer character motivation. I tried modelling one paragraph, then asked students to continue in pairs.',
    ask: 'Could STP Feedback AI look at whether my modelling gave enough structure without taking away student choice? I also want feedback on whether the pair discussion helped students improve their story ideas.',
    status: 'replied',
    from: 'STP Feedback AI',
    sourceType: 'ai',
    schoolOrRole: 'Singapore Teaching Practice',
    avatarLabel: '✦',
    avatarColor: '#7C3AED',
    relationship: 'shared',
    letter: {
      greeting: 'Dear Tasha,',
      wellDone: [
        'Your modelling made the writing choices visible. Naming why you chose a setting detail, instead of only showing the final sentence, helped pupils see the thinking behind the craft.',
        'The pair discussion gave students a low-pressure rehearsal space before writing. Several pupils moved from single-word ideas to fuller character intentions after talking it through.',
        'You kept the feedback focused on one improvement target: make the character want something. That clarity made the writing task feel achievable.',
      ],
      tryNext: [
        'Before releasing pupils to write, ask two students to explain the success criteria in their own words. This would quickly show whether the model has transferred from teacher demonstration to student understanding.',
        'During pair talk, pause one promising conversation and briefly spotlight the move they made: "they changed scared to worried because..." That helps the class hear what improvement sounds like.',
      ],
      reflect: [
        'Which pupils improved because they understood the model, and which pupils copied the model because they needed more scaffolding?',
        'Where could you add one quick check for understanding before independent writing begins?',
      ],
      teachingActions: [
        'Providing clear explanation — the model paragraph made the invisible writing decisions explicit',
        'Facilitating collaborative learning — pair rehearsal helped students develop ideas before committing to writing',
        'Checking understanding and providing feedback — a short success-criteria check would strengthen the handover into independent work',
      ],
      closing: 'This was a warm, purposeful creative writing lesson. The next step is to make the bridge from your model to student independence even more visible.',
      signature: '— STP Feedback AI, using the STP Framework',
    },
  },
  200: {
    id: 200,
    lesson: 'P4 Mathematics - Word Problems',
    date: 'This morning',
    recording: {
      type: 'video',
      title: 'Word problems strategy lesson',
      youtubeId: 'lhS6rpMgULM',
    },
    context: 'Marcus shared a P4 Mathematics lesson where pupils used bar models to unpack two-step word problems. He wants a colleague to look at whether his prompts helped pupils explain their reasoning.',
    ask: 'Please write feedback for Marcus on what supported student reasoning and what he could tighten next time.',
    status: 'replied',
    from: 'Marcus',
    sourceType: 'teacher',
    schoolOrRole: 'North View Primary',
    avatarLabel: 'M',
    avatarColor: '#2563EB',
    relationship: 'toRespond',
    requestedFor: 'Marcus',
    hasAiFeedback: false,
  },
  201: {
    id: 201,
    lesson: 'P2 English - Guided Reading',
    date: 'Yesterday',
    recording: {
      type: 'video',
      title: 'Guided reading group',
      youtubeId: 'xKxrkht7CpY',
    },
    context: 'Sarah shared a guided reading session with a small P2 group. She is looking for feedback on how she prompted quieter pupils and checked comprehension during the reading.',
    ask: 'Please write feedback for Sarah on what helped pupils participate and what she could improve in the next guided reading session.',
    status: 'replied',
    from: 'Sarah',
    sourceType: 'teacher',
    schoolOrRole: 'Greenridge Primary',
    avatarLabel: 'S',
    avatarColor: '#0D9488',
    relationship: 'toRespond',
    requestedFor: 'Sarah',
    hasAiFeedback: false,
  },
  101: {
    id: 101,
    lesson: 'Year 4 Maths – Transitions',
    date: '2 hours ago',
    recording: {
      type: 'video',
      title: 'Transitions between groupings',
      youtubeId: 'lhS6rpMgULM',
    },
    context: 'Year 4 Maths. I tried something new with transitions this week — moving from whole-class to pairs, then back again. I want to know if the rhythm felt right from the outside.',
    ask: 'Did the pacing between transitions feel natural? Were students ready to move each time I shifted the grouping?',
    status: 'replied',
    from: 'Nadia Lim',
    sourceType: 'teacher',
    schoolOrRole: 'Tampines Primary',
    avatarLabel: 'NL',
    avatarColor: '#2563EB',
    relationship: 'toRespond',
    requestedFor: 'Nadia Lim',
    hasAiFeedback: false,
  },
  102: {
    id: 102,
    lesson: 'Year 8 English – Cold-calling',
    date: '5 hours ago',
    recording: {
      type: 'video',
      title: 'Cold-calling follow-up',
      youtubeId: 'xKxrkht7CpY',
    },
    context: "Year 8 English. There's a student in the back who never puts her hand up. I asked her directly and it landed — but I'm not sure if I handled the follow-up well.",
    ask: 'Was my cold-call handled sensitively? Did the follow-up keep her engaged or did it feel like a spotlight?',
    status: 'replied',
    from: 'Farah Tan',
    sourceType: 'teacher',
    schoolOrRole: 'Bedok View School',
    avatarLabel: 'FT',
    avatarColor: '#0D9488',
    relationship: 'toRespond',
    requestedFor: 'Farah Tan',
    hasAiFeedback: false,
  },
  103: {
    id: 103,
    lesson: 'Year 6 Science – Lesson Structure',
    date: 'Yesterday',
    recording: {
      type: 'video',
      title: 'Science lesson structure reflection',
      youtubeId: 'lhS6rpMgULM',
    },
    context: 'Year 6 Science. My lesson had a strong opening and a strong close but the middle felt loose. I could feel it slipping but did not know how to pull it back.',
    ask: 'Was the lesson structure clear enough for students to follow, especially in the middle segment?',
    status: 'replied',
    from: 'Chen Wei',
    sourceType: 'teacher',
    schoolOrRole: 'Jurong West Primary',
    avatarLabel: 'CW',
    avatarColor: '#C86948',
    relationship: 'toRespond',
    requestedFor: 'Chen Wei',
    hasAiFeedback: false,
  },
  104: {
    id: 104,
    lesson: 'P3 English – Group Roles',
    date: 'Yesterday',
    recording: {
      type: 'video',
      title: 'Structured group roles',
      youtubeId: 'xKxrkht7CpY',
    },
    context: "Primary 3 English. First time trying structured group roles in my class. Three groups worked beautifully. One didn't.",
    ask: 'What did I miss in the group setup, and how could I make the roles clearer next time?',
    status: 'replied',
    from: 'Mei Wong',
    sourceType: 'teacher',
    schoolOrRole: 'Woodlands Ring Primary',
    avatarLabel: 'MW',
    avatarColor: '#6B4E7C',
    relationship: 'toRespond',
    requestedFor: 'Mei Wong',
    hasAiFeedback: false,
  },
  105: {
    id: 105,
    lesson: 'Year 10 History – Lesson Pacing',
    date: '2 days ago',
    recording: {
      type: 'video',
      title: 'History source analysis pacing',
      youtubeId: 'lhS6rpMgULM',
    },
    context: 'Year 10 History. I knew I was running out of time at the 35-minute mark but kept pushing. The final discussion felt compressed.',
    ask: 'How could I adjust the pacing without making the lesson feel abruptly cut short?',
    status: 'replied',
    from: 'Arun Raj',
    sourceType: 'teacher',
    schoolOrRole: 'Buona Vista Secondary',
    avatarLabel: 'AR',
    avatarColor: '#D97706',
    relationship: 'toRespond',
    requestedFor: 'Arun Raj',
    hasAiFeedback: false,
  },
  106: {
    id: 106,
    lesson: 'P5 Mathematics – Checking Understanding',
    date: '2 days ago',
    recording: {
      type: 'video',
      title: 'Checking understanding in maths',
      youtubeId: 'xKxrkht7CpY',
    },
    context: 'Primary 5 Mathematics. I asked "does everyone understand?" too many times and want more useful ways to check whether students are actually following.',
    ask: 'What checks for understanding could I use in the moment without slowing the lesson too much?',
    status: 'replied',
    from: 'Grace Lee',
    sourceType: 'teacher',
    schoolOrRole: 'Ang Mo Kio Primary',
    avatarLabel: 'GL',
    avatarColor: '#4A7C59',
    relationship: 'toRespond',
    requestedFor: 'Grace Lee',
    hasAiFeedback: false,
  },
  202: {
    id: 202,
    lesson: 'P5 Science – Circuits',
    date: 'Last week',
    recording: {
      type: 'video',
      title: 'Circuits troubleshooting lesson',
      youtubeId: 'lhS6rpMgULM',
    },
    context: 'James shared a P5 Science lesson on simple circuits. I sent him feedback on how students diagnosed open and closed circuits during the group task.',
    ask: 'I would like STP Feedback AI to review whether my feedback to James is concrete enough for him to act on.',
    status: 'replied',
    from: 'James',
    sourceType: 'teacher',
    schoolOrRole: 'Riverside Primary',
    avatarLabel: 'J',
    avatarColor: '#D97706',
    relationship: 'sent',
    hasAiFeedback: false,
  },
}

// ─── annotation ──────────────────────────────────────────────────────────────

interface Annotation {
  id: number
  timeStart: string
  timeEnd: string
  note: string
  author: string
  createdAt: string
}

// ─── recording player ───────────────────────────────────────────────────────

function RecordingPlayer({ recording }: { recording: Recording }) {
  if (recording.type === 'video') {
    return (
      <div className="aspect-video rounded-xl overflow-hidden border border-border bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${recording.youtubeId}?rel=0&modestbranding=1`}
          title={recording.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">Audio recording</p>
          <p className="truncate text-xs text-muted-foreground">{recording.title}</p>
        </div>
      </div>
      <audio controls preload="metadata" src={recording.src} className="w-full" />
    </div>
  )
}

// ─── STP panel ───────────────────────────────────────────────────────────────

function STPPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [expanded, setExpanded] = useState<string | null>('enactment')

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={onClose}
          />
        )}
      </AnimatePresence>
      <motion.aside
        initial={false}
        animate={{ x: open ? 0 : '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed top-0 right-0 h-full w-80 bg-background border-l border-border z-50 overflow-y-auto"
      >
        <div className="px-5 py-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-foreground">STP Framework</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">Singapore Teaching Practice</p>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">×</button>
          </div>
          <div className="space-y-2">
            {STP_PROCESSES.map((proc) => (
              <div key={proc.id} className="border border-border rounded-lg overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors"
                  onClick={() => setExpanded((p) => p === proc.id ? null : proc.id)}
                >
                  <span className="text-[13px] font-semibold text-foreground">{proc.title}</span>
                  <motion.span animate={{ rotate: expanded === proc.id ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-[10px] text-muted-foreground">▾</motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {expanded === proc.id && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <ul className="px-4 pb-3 space-y-1.5 border-t border-border pt-2.5">
                        {proc.areas.map((area) => (
                          <li key={area} className="flex items-start gap-2">
                            <span className="text-muted-foreground/50 text-[11px] mt-0.5 shrink-0">•</span>
                            <span className="text-[12px] text-muted-foreground leading-snug">{area}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </motion.aside>
    </>
  )
}

// ─── feedback accordion ───────────────────────────────────────────────────────

function FeedbackAccordion({ title, icon, items }: { title: string; icon?: React.ReactNode; items: string[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-background">
      <button
        className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-muted/40 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
          {icon}
          {title}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-white bg-blue-500 rounded-full px-2 py-0.5 leading-tight">{items.length}</span>
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-[10px] text-muted-foreground">▾</motion.span>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
            <ul className="px-5 pb-4 space-y-3 border-t border-border pt-3">
              {items.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-muted-foreground/40 text-[11px] mt-0.5 shrink-0">•</span>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item}</p>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── annotation tab ───────────────────────────────────────────────────────────

function NotesTab({ annotations, annTimeStart, annTimeEnd, annNote, setAnnTimeStart, setAnnTimeEnd, setAnnNote, addAnnotation, removeAnnotation }: {
  annotations: Annotation[]
  annTimeStart: string; annTimeEnd: string; annNote: string
  setAnnTimeStart: (v: string) => void; setAnnTimeEnd: (v: string) => void; setAnnNote: (v: string) => void
  addAnnotation: () => void; removeAnnotation: (id: number) => void
}) {
  const [copyDone, setCopyDone] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(window.location.href).catch(() => {})
    setCopyDone(true)
    setTimeout(() => setCopyDone(false), 2000)
  }

  return (
    <div className="space-y-5">

      {/* Share with colleagues */}
      <div className="rounded-xl border border-border bg-background p-4 space-y-3">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-foreground/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          <p className="text-sm font-semibold text-foreground">Invite a colleague</p>
        </div>
        <p className="text-xs text-muted-foreground">Share this letter and its feedback with a colleague — they can read the replies and add their own annotations.</p>
        <button
          onClick={handleCopy}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          {copyDone ? 'Link copied!' : 'Copy link'}
        </button>
      </div>

      {/* Annotations */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-foreground/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <p className="text-sm font-semibold text-foreground">Annotations</p>
          </div>
          <button
            onClick={addAnnotation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
          >
            + Add Note
          </button>
        </div>

        {/* Add form */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            className="w-[68px] px-2 py-2 text-xs rounded-lg border border-border bg-background outline-none focus:border-foreground/40 transition-colors font-mono placeholder:text-muted-foreground"
            placeholder="0:00"
            value={annTimeStart}
            onChange={(e) => setAnnTimeStart(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addAnnotation()}
          />
          <span className="self-center text-xs text-muted-foreground shrink-0">–</span>
          <input
            type="text"
            className="w-[68px] px-2 py-2 text-xs rounded-lg border border-border bg-background outline-none focus:border-foreground/40 transition-colors font-mono placeholder:text-muted-foreground"
            placeholder="0:00"
            value={annTimeEnd}
            onChange={(e) => setAnnTimeEnd(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addAnnotation()}
          />
          <input
            type="text"
            className="flex-1 px-2.5 py-2 text-xs rounded-lg border border-border bg-background outline-none focus:border-foreground/40 transition-colors placeholder:text-muted-foreground"
            placeholder="Add a note about this moment…"
            value={annNote}
            onChange={(e) => setAnnNote(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addAnnotation()}
          />
        </div>

        <AnimatePresence>
          {annotations.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-2xl mb-2">📝</p>
              <p className="text-xs text-muted-foreground">No notes yet — add timestamps while you watch.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {annotations.map((ann) => (
                <motion.li
                  key={ann.id}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3.5 rounded-xl bg-background border border-border group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-semibold text-primary">
                      {ann.timeStart} – {ann.timeEnd}
                    </span>
                    <button onClick={() => removeAnnotation(ann.id)} className="text-muted-foreground/30 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-base leading-none">×</button>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed mb-2">{ann.note}</p>
                  <p className="text-[11px] text-muted-foreground">{ann.author} · {ann.createdAt}</p>
                </motion.li>
              ))}
            </ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function HumanFeedbackForm({
  userName,
  draft,
  onChange,
  onSend,
}: {
  userName: string
  draft: { wentWell: string; improve: string }
  onChange: (patch: Partial<{ wentWell: string; improve: string }>) => void
  onSend: () => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[2px] text-muted-foreground">
          What went well for {userName}?
        </p>
        <Textarea
          className="min-h-[140px] resize-none"
          placeholder={`Share the specific teacher moves or student responses that worked well for ${userName}.`}
          value={draft.wentWell}
          onChange={(e) => onChange({ wentWell: e.target.value })}
        />
      </div>
      <div>
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[2px] text-muted-foreground">
          What are the areas {userName} could improve on?
        </p>
        <Textarea
          className="min-h-[140px] resize-none"
          placeholder="Offer one or two concrete next steps they could try in the next lesson."
          value={draft.improve}
          onChange={(e) => onChange({ improve: e.target.value })}
        />
      </div>
      <div className="flex justify-end pt-1">
        <Button type="button" onClick={onSend} className="px-5">
          Send feedback
        </Button>
      </div>
    </div>
  )
}

// ─── in-transit empty state ───────────────────────────────────────────────────

function PendingReplyState({ from }: { from: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-3xl">
          📬
        </div>
        <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 border-2 border-background animate-pulse" />
      </div>
      <h3 className="font-semibold text-foreground mb-2">Letter on its way</h3>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
        {from} is reading your lesson and writing back. A letter takes thought — this is a good sign.
      </p>
      <div className="mt-6 flex items-center gap-2 text-[11px] text-muted-foreground">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        Sent - reply pending
      </div>
    </div>
  )
}

// ─── main ─────────────────────────────────────────────────────────────────────

export function LetterDetail() {
  const {
    selectedLetterId,
    setFlow,
    setSelectedLetter,
    draft,
    contacts,
    selectedIds,
    humanFeedbackDrafts,
    updateHumanFeedbackDraft,
    sentFeedbackIds,
    markFeedbackSent,
    setMyLettersTab,
  } = useLetterboxStore(
    useShallow((s) => ({
      selectedLetterId: s.selectedLetterId,
      setFlow: s.setFlow,
      setSelectedLetter: s.setSelectedLetter,
      draft: s.draft,
      contacts: s.contacts,
      selectedIds: s.selectedIds,
      humanFeedbackDrafts: s.humanFeedbackDrafts,
      updateHumanFeedbackDraft: s.updateHumanFeedbackDraft,
      sentFeedbackIds: s.sentFeedbackIds,
      markFeedbackSent: s.markFeedbackSent,
      setMyLettersTab: s.setMyLettersTab,
    }))
  )

  const [stpOpen, setStpOpen] = useState(false)
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [annTimeStart, setAnnTimeStart] = useState('')
  const [annTimeEnd, setAnnTimeEnd] = useState('')
  const [annNote, setAnnNote] = useState('')

  const data = selectedLetterId ? MOCK_LETTERS[selectedLetterId] : null

  function handleBack() {
    setSelectedLetter(null)
    setFlow('transit')
  }

  function addAnnotation() {
    if (!annNote.trim()) return
    const now = new Date()
    const dateStr = now.toLocaleDateString('en-SG', { year: 'numeric', month: 'short', day: 'numeric' })
    setAnnotations((prev) =>
      [...prev, {
        id: Date.now(),
        timeStart: annTimeStart.trim() || '0:00',
        timeEnd: annTimeEnd.trim() || annTimeStart.trim() || '0:00',
        note: annNote.trim(),
        author: 'teacher@covaa.edu.sg',
        createdAt: dateStr,
      }].sort((a, b) => a.timeStart.localeCompare(b.timeStart))
    )
    setAnnTimeStart('')
    setAnnTimeEnd('')
    setAnnNote('')
  }

  function removeAnnotation(id: number) {
    setAnnotations((prev) => prev.filter((a) => a.id !== id))
  }

  function handleSendHumanFeedback(targetName: string) {
    if (!selectedLetterId) return
    markFeedbackSent(selectedLetterId)
    setMyLettersTab('sent')
    setSelectedLetter(null)
    setFlow('transit')
    toast.success('Feedback sent', {
      description: `Your feedback for ${targetName} is now in Sent.`,
    })
  }

  if (!data) {
    // Just-sent letter (id=0) — show pending state using draft info
    if (selectedLetterId === 0 && draft.lesson) {
      const recipientNames = selectedIds
        .map((id) => contacts.find((c) => c.id === id)?.name)
        .filter(Boolean)
        .join(', ') || 'your recipients'
      return (
        <main className="w-full px-8 xl:px-12 py-8">
          <div className="mx-auto max-w-5xl">
            <button onClick={handleBack} className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 flex items-center gap-1.5">← All Feedback</button>
            <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-10 items-start">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-foreground leading-snug">{draft.lesson}</h2>
                <p className="text-[12px] text-muted-foreground">📅 Just now</p>
              </div>
              <PendingReplyState from={recipientNames} />
            </div>
          </div>
        </main>
      )
    }
    return (
      <main className="w-full px-8 xl:px-12 py-8">
        <button onClick={handleBack} className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">← All Feedback</button>
        <p className="text-sm text-muted-foreground">Letter not found.</p>
      </main>
    )
  }

  const isPending = data.status === 'in_transit'
  const hasAiFeedback = data.hasAiFeedback !== false
  const sourceType = data.sourceType ?? (data.from.includes('AI') ? 'ai' : 'teacher')
  const avatarLabel = data.avatarLabel ?? (sourceType === 'ai' ? '✦' : data.from.charAt(0))
  const avatarColor = data.avatarColor ?? (sourceType === 'ai' ? '#7C3AED' : '#64748B')
  const schoolOrRole = data.schoolOrRole ?? (sourceType === 'ai' ? 'Singapore Teaching Practice' : '')
  const wasSentByMe = sentFeedbackIds.includes(data.id) || data.relationship === 'sent'
  const isFeedbackRequest = data.relationship === 'toRespond' && !sentFeedbackIds.includes(data.id)
  const feedbackOwner = data.requestedFor ?? data.from
  const humanDraft = humanFeedbackDrafts[data.id] ?? { wentWell: '', improve: '' }
  const sourceLabel = isFeedbackRequest ? 'Feedback request from' : wasSentByMe ? 'Feedback sent to' : 'Feedback from'
  const canRequestAiFeedback = wasSentByMe && sourceType === 'teacher' && (!data.letter || !hasAiFeedback)

  return (
    <>
      <STPPanel open={stpOpen} onClose={() => setStpOpen(false)} />

      <main className="w-full px-8 xl:px-12 py-8">

        {/* Top nav */}
        <div className="flex items-center justify-between mb-8 mx-auto max-w-5xl">
          <button onClick={handleBack} className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
            ← All Feedback
          </button>
          {!isPending && (
            <button
              onClick={() => setStpOpen(true)}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-1.5 transition-colors hover:bg-muted"
            >
              STP Framework ≡
            </button>
          )}
        </div>

        {/* Two-column grid */}
        <div className="mx-auto max-w-5xl grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-10 items-start">

          {/* ── Left: lesson info ── */}
          <div className="space-y-5">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-base font-bold text-white shadow-sm"
                  style={{ backgroundColor: avatarColor }}
                >
                  {avatarLabel}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase text-muted-foreground [letter-spacing:0.14em]">{sourceLabel}</p>
                  <p className="truncate text-sm font-semibold text-foreground">{sourceType === 'ai' ? 'STP Feedback AI' : data.from}</p>
                  {schoolOrRole && <p className="truncate text-xs text-muted-foreground">{schoolOrRole}</p>}
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-foreground leading-tight mb-1">{data.lesson}</h2>
                <p className="text-[12px] text-muted-foreground">📅 {data.date}</p>
              </div>
            </div>

            <RecordingPlayer recording={data.recording} />

            {/* Lesson context */}
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[2px] text-muted-foreground">Lesson context</p>
              <p className="font-serif italic text-sm text-foreground/75 leading-relaxed">{data.context}</p>
            </div>

            {/* Your ask */}
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[2px] text-muted-foreground">Feedback needed</p>
              <p className="font-serif italic text-sm text-foreground/80 leading-relaxed">{data.ask}</p>
            </div>
          </div>

          {/* ── Right: feedback ── */}
          <div>
            {isPending ? (
              <PendingReplyState from={data.from} />
            ) : (
              <Tabs defaultValue="feedback">
                <TabsList className="w-full bg-black/[0.07] mb-6">
                  <TabsTrigger value="feedback" className="flex-1 text-xs">Feedback</TabsTrigger>
                  <TabsTrigger value="annotations" className="flex-1 text-xs">Annotations</TabsTrigger>
                </TabsList>

                <TabsContent value="feedback" className="space-y-4">
                  {isFeedbackRequest ? (
                    <HumanFeedbackForm
                      userName={feedbackOwner}
                      draft={humanDraft}
                      onChange={(patch) => updateHumanFeedbackDraft(data.id, patch)}
                      onSend={() => handleSendHumanFeedback(feedbackOwner)}
                    />
                  ) : !data.letter || !hasAiFeedback ? (
                    <div className="flex flex-col items-center gap-4 py-16 text-center">
                      {canRequestAiFeedback ? (
                        <>
                          <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-violet-500" />
                          </div>
                          <div className="space-y-1.5">
                            <p className="font-semibold text-foreground">No AI feedback yet</p>
                            <p className="text-sm text-muted-foreground max-w-xs">
                              Send this feedback to STP Feedback AI to get structured feedback using the STP Framework too.
                            </p>
                          </div>
                          <button
                            onClick={() => setFlow('write')}
                            className="px-5 py-2.5 rounded-lg bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors"
                          >
                            Get feedback from STP Feedback AI →
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div className="space-y-1.5">
                            <p className="font-semibold text-foreground">Feedback not ready yet</p>
                            <p className="text-sm text-muted-foreground max-w-xs">
                              This letter is waiting for feedback.
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (<>
                  {/* Greeting — prominent */}
                  <div className="mb-2">
                    <p className="font-serif text-2xl text-foreground leading-tight">{data.letter.greeting}</p>
                  </div>

                  {/* What went well */}
                  <div className="rounded-xl border border-green-200 bg-green-50/60 overflow-hidden">
                    <div className="px-5 py-3 border-b border-green-200/60 flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white text-[9px] font-bold shrink-0">✓</span>
                      <p className="text-sm font-semibold text-green-800">What went well</p>
                    </div>
                    <ul className="px-5 py-4 space-y-3">
                      {data.letter.wellDone.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="text-green-400 text-[11px] mt-0.5 shrink-0">•</span>
                          <p className="text-sm text-green-900 leading-relaxed">{item}</p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Try this next time */}
                  <div className="rounded-xl border border-amber-200 bg-amber-50/60 overflow-hidden">
                    <div className="px-5 py-3 border-b border-amber-200/60 flex items-center gap-2">
                      <span className="text-amber-600 text-base leading-none">→</span>
                      <p className="text-sm font-semibold text-amber-800">Try this next time</p>
                    </div>
                    <ul className="px-5 py-4 space-y-3">
                      {data.letter.tryNext.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="text-amber-400 text-[11px] mt-0.5 shrink-0">•</span>
                          <p className="text-sm text-amber-900 leading-relaxed">{item}</p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Collapsible sections */}
                  <FeedbackAccordion title="Before you move on…" icon={<Lightbulb className="w-4 h-4 text-violet-500 shrink-0" />} items={data.letter.reflect} />
                  <FeedbackAccordion title="What caught my attention" icon={<Eye className="w-4 h-4 text-sky-500 shrink-0" />} items={data.letter.teachingActions} />
                  </>)}
                </TabsContent>

                <TabsContent value="annotations">
                  <NotesTab
                    annotations={annotations}
                    annTimeStart={annTimeStart} annTimeEnd={annTimeEnd} annNote={annNote}
                    setAnnTimeStart={setAnnTimeStart} setAnnTimeEnd={setAnnTimeEnd} setAnnNote={setAnnNote}
                    addAnnotation={addAnnotation} removeAnnotation={removeAnnotation}
                  />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
