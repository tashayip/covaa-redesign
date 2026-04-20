import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PostcardPreview } from '@/components/postcard/PostcardPreview'
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
  isOpenLetter?: boolean
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
        "**Experience before labels — and it worked.** The plant observation at 14 min gave students the concept before the word. Unprompted note-taking suggests genuine attention, not compliance. [Rosenshine, 2012]",
        "**The opening was deliberately unhurried.** You gave students time to settle before any academic demand — a transition that's easy to rush. The effect was visible in how they entered the categorisation task.",
        "**The leap from observation to classification was scaffolded, not assumed.** Moving from 'look at this plant' to 'what makes something living?' is a non-trivial cognitive step. A task sequence got most students there.",
      ],
      tryNext: [
        "**Voluntary hand-raising over-represents confident students.** At 17 min, three students in the back showed uncertainty but didn't raise their hands — a well-documented Checking for Understanding and Providing Feedback gap. A whole-class 1–5 finger rating surfaces that in real time. [Dylan Wiliam, 2011]",
        "**Your cold-calling favoured the front rows all lesson.** Who you call on signals to the whole class whose thinking you value. A simple seating grid — tracking who you've called on over a week — redistributes that equitably.",
      ],
      reflect: [
        "You asked 'does everyone understand?' several times. Research consistently shows it produces false positives — students who are confused often stay silent, and those who say yes may have only surface understanding. [Wiliam, 2011] What would you replace it with to make understanding visible rather than assumed?",
        "The group task transition at the end was noticeably faster than the rest of the lesson. What would one minute of consolidation — a think-pair-share, a one-sentence exit note — tell you about who actually reached the objective before they leave?",
      ],
      teachingActions: [
        "Encouraging Learner Engagement — direct sensory experience before labelling produced unprompted student attention",
        "Pacing and Maintaining Momentum — deliberate opening pace gave students time to orient before academic demand",
        "Selecting and Sequencing Content — concrete-to-abstract sequence supported most students to reach classification",
        "Checking for Understanding and Providing Feedback — structured check needed to surface real confusion beyond voluntary signals",
        "Establishing Interaction and Rapport — cold-calling distribution to be widened beyond front rows",
      ],
      closing: "This lesson has a clear logic — sensation before abstraction, observation before classification. That sequencing is deliberate and it works. The main area to grow is making understanding visible at the points where you move on. You clearly care about this class. Trust that.",
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
        "**The unplanned discussion at 8 min produced the best thinking in the lesson.** Students were building on each other's language — elaborating, not just listing. That kind of dialogic exchange is associated with deeper cognitive processing of writing concepts. [Alexander, 2008]",
        "**Using the mentor text twice gave students two different cognitive encounters.** Once for immersive reading, once for structural annotation — holistic then analytical. This dual-exposure approach is well-supported for reading-to-write instruction. [Myhill, 2012]",
        "**Student writing showed measurable vocabulary gain.** Sensory language at the end was noticeably richer than the opening responses — the most direct evidence the lesson's goal was achieved.",
      ],
      tryNext: [
        "**Your wait time after open questions averaged 2 seconds — try extending to five.** Rowe's research showed 3–5 seconds increases response quality and draws in students who process more slowly. The silence feels uncomfortable, but the evidence is consistent. [Rowe, 1986]",
        "**The transition at 28 min didn't give students time to close their thinking.** Students deep in composition need a warning before mode-switching. 'Two minutes — bring your paragraph to a close' followed by a brief pause would smooth this considerably.",
      ],
      reflect: [
        "Of your 14 questions, 11 were recall or comprehension level — 3 were analytical or evaluative. [Bloom, 1956] Those 3 produced your richest student thinking. Which of them would you move earlier in the sequence next time, and why?",
        "The pre-writing discussion was actually a principled real-time decision — you read the room and responded to it. That's Exercising Flexibility in action, and it's genuinely difficult to teach. What specifically did you notice that told you to change course?",
      ],
      teachingActions: [
        "Facilitating Collaborative Learning — unplanned pre-writing discussion produced the lesson's highest-quality student talk",
        "Exercising Flexibility — real-time curriculum adjustment in response to student energy; worth developing as a conscious skill",
        "Selecting and Sequencing Content — dual-exposure use of mentor text aligned with reading-to-write pedagogy",
        "Using Questions to Deepen Learning — wait time is the main technical area to develop; higher-order question ratio to increase",
        "Pacing and Maintaining Momentum — transition at 28 min needs a closure signal before switching mode",
      ],
      closing: "The structure here is sound. What's harder to teach — reading a room and responding to it in real time — you already do. The technical adjustments are all learnable with practice. I'd bring the unplanned discussion to your mentor conversation. It tells you something important about how you teach.",
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
        "**The audio reflection was specific enough to be genuinely useful.** You named the decision points clearly — especially the quieter groups — and noted your own uncertainty. That metacognitive specificity is what makes reflection productive rather than merely retrospective. [Schön, 1983]",
        "**The recap question was a well-constructed causal probe.** 'What changed when the push got stronger?' requires students to move from describing observation to explaining relationship — the conceptual distinction that actually matters in this topic.",
        "**Not intervening with the quieter groups was a genuine judgement call.** Premature intervention often interrupts emerging thinking. Your restraint gave you information — it just needs a follow-up structure to act on.",
      ],
      tryNext: [
        "**The quieter groups left without surfacing their understanding.** Their silence left you without evidence of whether they understood or were stuck. A brief pair-share before whole-group reporting gives them a lower-stakes route in — a 'rehearsal structure' well-supported in Facilitating Collaborative Learning research. [Cohen, 1994]",
        "**Narrate a timestamp in your next audio reflection.** 'At approximately 12 minutes, the group near the window…' — that habit makes reflections far more useful for revisiting or sharing in lesson study.",
      ],
      reflect: [
        "Which students left able to explain the force-direction-movement relationship, and which could only describe what they observed? That distinction is the core of Using Questions to Deepen Learning in science. What question in your next lesson's opening would make that gap visible?",
        "When a group is quiet during a task, what distinguishes productive thinking from confusion that's gone social? This is one of the harder diagnostic problems in group work. What signals do you currently rely on, and how reliable are they?",
      ],
      teachingActions: [
        "Checking for Understanding and Providing Feedback — recap question well-pitched; quieter groups left without evidence of understanding",
        "Using Questions to Deepen Learning — causal question structure moved students from observation to explanation",
        "Facilitating Collaborative Learning — quieter groups need a rehearsal structure before whole-group reporting",
        "Establishing Interaction and Rapport — restraint during group work is appropriate; pair it with a low-stakes follow-up structure",
      ],
      closing: "The strongest move was the recap question — right conceptual distinction, right moment. Closing the evidence gap with the quieter groups doesn't require changing your approach; it requires adding a small structure that gives those students a route into the conversation. You read the room well. This audio note is evidence of it.",
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
        "**Thinking aloud while writing is the hardest thing to model — you did it well.** Narrating your choices as you composed made the invisible writing process visible. Several students shifted from single-word notes to fuller character intentions after watching you think. [Pearson & Gallagher, 1983]",
        "**Pair rehearsal before independent writing is well-supported by research.** Students pre-solved their planning problems through talk before committing to the page — reducing the cognitive load of composition at the moment it matters. [Bereiter & Scardamalia, 1987]",
        "**One focused success criterion outperforms many.** 'Make the character want something' gave students a single target to hold in mind while writing. Single-criterion tasks consistently produce stronger first drafts. [Hattie, 2009]",
      ],
      tryNext: [
        "**There was no check that the model had transferred at 22 min.** Asking two students to restate the success criterion in their own words takes under a minute — it reveals whether they understood the goal or are working from a surface interpretation. This is the Checking for Understanding and Providing Feedback moment that determines draft quality.",
        "**You circulated during pair talk but didn't use what you heard.** Spotlighting one pair's exchange — 'listen to what they did: they changed scared to worried because…' — gives the class a live example of improvement as decision-making, not talent.",
      ],
      reflect: [
        "As you read the drafts, notice the difference between students who made independent choices and those who reproduced your structure because they didn't know how else to begin. That distinction is diagnostic — it shapes Planning Key Questions for next time. What would you do differently for each group?",
        "What would a 60-second whole-class share — two pairs stating their character's motivation aloud — contribute to readiness before independent writing? This 'public rehearsal' functions differently from the private pair discussion that preceded it. [Nystrand, 1997]",
      ],
      teachingActions: [
        "Providing Clear Explanation — think-aloud modelling made the writing process visible and transferable",
        "Facilitating Collaborative Learning — pair rehearsal before independent writing aligned with gradual release of responsibility",
        "Checking for Understanding and Providing Feedback — success criterion check at handover point (22 min) was missing",
        "Encouraging Learner Engagement — spotlighting a strong pair exchange would extend the model to the whole class",
      ],
      closing: "The pedagogical logic here is coherent — model, rehearse, write. That sequence is well-founded. The gap is in the handover: a brief check at 22 min and a 'model in the moment' during pair time would make the transfer to independent writing more robust. You've got real craft in the modelling — that's the hardest part.",
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

function RecordingPlayer({ recording, iframeRef }: { recording: Recording; iframeRef?: React.RefObject<HTMLIFrameElement | null> }) {
  if (recording.type === 'video') {
    return (
      <div className="aspect-video rounded-xl overflow-hidden border border-border bg-black">
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${recording.youtubeId}?rel=0&modestbranding=1&enablejsapi=1`}
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

function FeedbackAccordion({
  title, icon, items, renderItem,
}: {
  title: string
  icon?: React.ReactNode
  items: string[]
  renderItem?: (item: string, i: number) => React.ReactNode
}) {
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
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {renderItem ? renderItem(item, i) : item}
                  </p>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ReflectionPromptText({
  text,
  onTimestampClick,
  onSTPClick,
}: {
  text: string
  onTimestampClick?: (seconds: number) => void
  onSTPClick?: () => void
}) {
  const questionMatches = [...text.matchAll(/(?:^|[.!?]\s+)([^.!?]*\?)/g)]
  const lastQuestion = questionMatches[questionMatches.length - 1]
  const questionStart = lastQuestion?.index === undefined
    ? -1
    : lastQuestion.index + lastQuestion[0].length - lastQuestion[1].length

  if (questionStart < 0) {
    return <RichFeedbackText text={text} onTimestampClick={onTimestampClick} onSTPClick={onSTPClick} />
  }

  const context = text.slice(0, questionStart).trimEnd()
  const questionEnd = questionStart + lastQuestion[1].length
  const question = text.slice(questionStart, questionEnd)
  const tail = text.slice(questionEnd)

  return (
    <>
      {context && (
        <>
          <RichFeedbackText text={context} onTimestampClick={onTimestampClick} onSTPClick={onSTPClick} />{' '}
        </>
      )}
      <span className="font-semibold text-foreground/85">
        <RichFeedbackText text={question} onTimestampClick={onTimestampClick} onSTPClick={onSTPClick} />
      </span>
      {tail && (
        <RichFeedbackText text={tail} onTimestampClick={onTimestampClick} onSTPClick={onSTPClick} />
      )}
    </>
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

function PendingReplyState({
  from,
  sourceType,
  onAlternativeClick,
}: {
  from: string
  sourceType?: 'ai' | 'teacher'
  onAlternativeClick?: () => void
}) {
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
        Sent — reply pending
      </div>
      {sourceType && onAlternativeClick && (
        <div className="mt-8 max-w-xs w-full rounded-xl border border-border bg-background p-4 text-left space-y-2">
          <p className="text-xs font-semibold text-foreground">While you wait…</p>
          {sourceType === 'ai' ? (
            <p className="text-xs text-muted-foreground leading-relaxed">
              You've sent this to STP Feedback AI. A peer's perspective can add something different — send it to a colleague too.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground leading-relaxed">
              You've sent this to a peer. Get instant structured feedback from STP Feedback AI using the STP Framework as well.
            </p>
          )}
          <button
            onClick={onAlternativeClick}
            className={`mt-1 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              sourceType === 'ai'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-violet-600 text-white hover:bg-violet-700'
            }`}
          >
            {sourceType === 'ai' ? 'Send to a colleague →' : 'Get AI feedback →'}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── rich feedback text ───────────────────────────────────────────────────────

const STP_AREAS_FLAT: string[] = STP_PROCESSES.flatMap((p) => p.areas)

function toSentenceCase(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

function parseMinutes(minStr: string, secStr?: string): number {
  return parseInt(minStr, 10) * 60 + (secStr ? parseInt(secStr, 10) : 0)
}

interface RichFeedbackTextProps {
  text: string
  onTimestampClick?: (seconds: number) => void
  onSTPClick?: () => void
}

function RichFeedbackText({ text, onTimestampClick, onSTPClick }: RichFeedbackTextProps) {
  type Segment =
    | { type: 'text'; value: string }
    | { type: 'bold'; value: string }
    | { type: 'citation'; value: string }
    | { type: 'timestamp'; label: string; seconds: number }
    | { type: 'stp'; area: string }

  // ── Stage 1: split by bold markers and citation markers ──────────────────
  type RawSeg = { type: 'raw'; value: string } | { type: 'bold'; value: string } | { type: 'citation'; value: string }
  const rawSegs: RawSeg[] = []
  const stage1 = /(\*\*(.+?)\*\*|\[([A-Z][^\[\]]+,\s*\d{4}[^\[\]]*)\])/g
  let s1last = 0
  let s1m: RegExpExecArray | null
  while ((s1m = stage1.exec(text)) !== null) {
    if (s1m.index > s1last) rawSegs.push({ type: 'raw', value: text.slice(s1last, s1m.index) })
    if (s1m[0].startsWith('**')) rawSegs.push({ type: 'bold', value: s1m[2] })
    else rawSegs.push({ type: 'citation', value: s1m[3] })
    s1last = s1m.index + s1m[0].length
  }
  if (s1last < text.length) rawSegs.push({ type: 'raw', value: text.slice(s1last) })

  // ── Stage 2: within raw segments, detect STP areas and timestamps ────────
  const sortedAreas = [...STP_AREAS_FLAT].sort((a, b) => b.length - a.length)
  const stpPattern = sortedAreas.map((a) => a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
  const tsPattern = '(?:at (?:the )?)?\\b(\\d+)(?::(\\d{2}))?[\\s\\-]?min(?:ute)?s?(?:\\s+mark)?'
  const combined = new RegExp(`(${stpPattern})|(${tsPattern})`, 'gi')

  const segments: Segment[] = []
  for (const raw of rawSegs) {
    if (raw.type === 'bold') { segments.push({ type: 'bold', value: raw.value }); continue }
    if (raw.type === 'citation') { segments.push({ type: 'citation', value: raw.value }); continue }
    // raw text — scan for STP / timestamps
    combined.lastIndex = 0
    let last = 0
    let match: RegExpExecArray | null
    while ((match = combined.exec(raw.value)) !== null) {
      if (match.index > last) segments.push({ type: 'text', value: raw.value.slice(last, match.index) })
      if (match[1]) {
        segments.push({ type: 'stp', area: match[1] })
      } else {
        const secs = parseMinutes(match[3], match[4])
        const label = match[4] ? `${match[3]}:${match[4]}` : `${match[3]} min`
        segments.push({ type: 'timestamp', label, seconds: secs })
      }
      last = match.index + match[0].length
    }
    if (last < raw.value.length) segments.push({ type: 'text', value: raw.value.slice(last) })
  }

  return (
    <>
      {segments.map((seg, i) => {
        if (seg.type === 'text') return <span key={i}>{seg.value}</span>
        if (seg.type === 'bold') return <strong key={i} className="font-semibold text-foreground">{seg.value}</strong>
        if (seg.type === 'citation') return (
          <button
            key={i}
            type="button"
            onClick={() => window.open(`https://scholar.google.com/scholar?q=${encodeURIComponent(seg.value)}`, '_blank', 'noopener')}
            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-500 border border-stone-200 hover:bg-stone-200 hover:text-stone-700 mx-0.5 align-baseline transition-colors cursor-pointer"
            title={`Search: ${seg.value}`}
          >
            ↗ {seg.value}
          </button>
        )
        if (seg.type === 'timestamp') {
          return (
            <button
              key={i}
              type="button"
              onClick={() => onTimestampClick?.(seg.seconds)}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 mx-0.5 transition-colors"
            >
              ⏱ {seg.label}
            </button>
          )
        }
        // STP citation
        const areaLower = seg.area.toLowerCase()
        const label = `STP: ${toSentenceCase(areaLower)}`
        return (
          <button
            key={i}
            type="button"
            onClick={() => onSTPClick?.()}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 mx-0.5 transition-colors"
            title="View in STP Framework"
          >
            {label}
          </button>
        )
      })}
    </>
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
    receivedDemoLetter,
    markReplySeen,
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
      receivedDemoLetter: s.receivedDemoLetter,
      markReplySeen: s.markReplySeen,
    }))
  )

  const [stpOpen, setStpOpen] = useState(false)
  const [copyDone, setCopyDone] = useState(false)
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [showPostcardOverlay, setShowPostcardOverlay] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  useEffect(() => {
    if (selectedLetterId && receivedDemoLetter?.id === selectedLetterId && receivedDemoLetter.isNew) {
      setShowPostcardOverlay(true)
    }
  }, [selectedLetterId])

  function seekVideo(seconds: number) {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func: 'seekTo', args: [seconds, true] }),
      '*'
    )
  }
  const [annTimeStart, setAnnTimeStart] = useState('')
  const [annTimeEnd, setAnnTimeEnd] = useState('')
  const [annNote, setAnnNote] = useState('')

  const data = selectedLetterId ? MOCK_LETTERS[selectedLetterId] : null

  function handleBack() {
    setSelectedLetter(null)
    setFlow('transit')
  }

  function handleCopy() {
    navigator.clipboard.writeText(window.location.href).catch(() => {})
    setCopyDone(true)
    setTimeout(() => setCopyDone(false), 2000)
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
    toast.success('Feedback sent', {
      description: `Your feedback for ${targetName} has been sent.`,
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
  const hasSentMyFeedback = data.relationship === 'toRespond' && sentFeedbackIds.includes(data.id)
  const feedbackOwner = data.requestedFor ?? data.from
  const humanDraft = humanFeedbackDrafts[data.id] ?? { wentWell: '', improve: '' }
  const sourceLabel = isFeedbackRequest ? 'Feedback request from' : wasSentByMe ? 'Feedback sent to' : 'Feedback from'
  const canRequestAiFeedback = wasSentByMe && sourceType === 'teacher' && (!data.letter || !hasAiFeedback)

  return (
    <>
      <STPPanel open={stpOpen} onClose={() => setStpOpen(false)} />

      {/* First-visit postcard overlay */}
      <AnimatePresence>
        {showPostcardOverlay && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 px-6"
            style={{ background: 'rgba(15,10,5,0.82)', backdropFilter: 'blur(8px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 32, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.97 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              className="w-full max-w-[500px]"
            >
              <PostcardPreview entryAnimation={true} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.55 }}
              className="flex flex-col items-center gap-3"
            >
              <p className="text-white/70 text-sm font-light tracking-wide">Your feedback has arrived</p>
              <button
                onClick={() => {
                  setShowPostcardOverlay(false)
                  if (selectedLetterId) markReplySeen(selectedLetterId)
                }}
                className="px-7 py-3 rounded-xl bg-white text-gray-900 text-sm font-semibold hover:bg-gray-100 transition-colors shadow-lg"
              >
                Start reading →
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="w-full px-8 xl:px-12 py-8">

        {/* Top nav */}
        <div className="flex items-center justify-between mb-8 mx-auto max-w-6xl px-4 xl:px-6">
          <button onClick={handleBack} className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
            ← All Feedback
          </button>
          {!isPending && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 bg-white border border-border text-foreground font-semibold px-4 py-1.5 rounded-lg text-sm shadow-sm hover:bg-muted transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                {copyDone ? 'Link copied!' : data.isOpenLetter ? 'Share to edit' : 'Share letter'}
              </button>
              <button
                onClick={() => setStpOpen(true)}
                className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground border border-border rounded-lg px-4 py-1.5 transition-colors hover:bg-muted"
              >
                STP Framework ≡
              </button>
            </div>
          )}
        </div>

        {/* Two-column grid */}
        <div className="mx-auto max-w-6xl px-4 xl:px-6 grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-16 items-start">

          {/* ── Left: lesson info (sticky) ── */}
          <div className="space-y-5 sticky top-8">
            {/* Lesson title — highest hierarchy */}
            <div>
              <h2 className="text-3xl font-bold text-foreground leading-tight">{data.lesson}</h2>
            </div>

            <RecordingPlayer recording={data.recording} iframeRef={iframeRef} />

            {/* Cluster: who + date — below video */}
            <div className="flex items-center gap-3 pt-1">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm"
                style={{ backgroundColor: avatarColor }}
              >
                {avatarLabel}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase text-muted-foreground [letter-spacing:0.14em]">{sourceLabel}</p>
                <p className="truncate text-sm font-semibold text-foreground">{sourceType === 'ai' ? 'STP Feedback AI' : data.from}</p>
                {schoolOrRole && <p className="truncate text-xs text-muted-foreground">{schoolOrRole}</p>}
              </div>
              <p className="ml-auto text-[11px] text-muted-foreground whitespace-nowrap">📅 {data.date}</p>
            </div>

            {/* Cluster: context + ask */}
            <div className="space-y-4 pt-1">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-[2px] text-muted-foreground">Lesson context</p>
                <p className="font-serif italic text-sm text-foreground/75 leading-relaxed">{data.context}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-[2px] text-muted-foreground">Feedback needed</p>
                <p className="font-serif italic text-sm text-foreground/80 leading-relaxed">{data.ask}</p>
              </div>
            </div>
          </div>

          {/* ── Right: feedback ── */}
          <div>
            {isPending ? (
              <PendingReplyState
                from={data.from}
                sourceType={sourceType}
                onAlternativeClick={() => setFlow('write')}
              />
            ) : (
              <Tabs defaultValue="feedback">
                <TabsList className="w-full bg-black/[0.07] mb-6">
                  <TabsTrigger value="feedback" className="flex-1 text-xs">Feedback</TabsTrigger>
                  <TabsTrigger value="annotations" className="flex-1 text-xs">Annotations</TabsTrigger>
                </TabsList>

                <TabsContent value="feedback" className="space-y-4">
                  {/* State (iv): received from peer — pending my response */}
                  {isFeedbackRequest ? (
                    <HumanFeedbackForm
                      userName={feedbackOwner}
                      draft={humanDraft}
                      onChange={(patch) => updateHumanFeedbackDraft(data.id, patch)}
                      onSend={() => handleSendHumanFeedback(feedbackOwner)}
                    />
                  ) : hasSentMyFeedback ? (
                    /* State (v): received from peer — sent my response */
                    <div
                      className="rounded-none overflow-hidden relative"
                      style={{
                        background: '#FFFFFF',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.09), 0 1px 2px rgba(0,0,0,0.04)',
                        border: '1px solid rgba(0,0,0,0.07)',
                      }}
                    >
                      {/* Hole punches */}
                      <div
                        className="absolute left-0 top-0 bottom-0 flex flex-col justify-around items-center py-16"
                        style={{ width: 32, background: 'rgba(0,0,0,0.015)', borderRight: '1px solid rgba(0,0,0,0.05)' }}
                        aria-hidden="true"
                      >
                        {[0, 1, 2].map((i) => (
                          <div key={i} style={{ width: 14, height: 14, borderRadius: '50%', background: '#f4f4f4', border: '1px solid rgba(0,0,0,0.13)', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.12)' }} />
                        ))}
                      </div>
                      <div className="ml-8">
                        <div className="px-8 pt-7 pb-5 border-b border-border/20 flex items-center justify-between">
                          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[1.8px]">Your feedback for {feedbackOwner}</p>
                          <span className="text-[11px] text-green-600 font-semibold flex items-center gap-1">✓ Sent</span>
                        </div>
                        <div className="px-8 py-6 space-y-4">
                          <div className="rounded-xl border border-green-200 bg-green-50/60 overflow-hidden">
                            <div className="px-5 py-3 border-b border-green-200/60 flex items-center gap-2">
                              <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white text-[9px] font-bold shrink-0">✓</span>
                              <p className="text-sm font-semibold text-green-800">What went well</p>
                            </div>
                            <div className="px-5 py-4">
                              <p className="text-sm text-green-900 leading-relaxed whitespace-pre-wrap">{humanDraft.wentWell || '—'}</p>
                            </div>
                          </div>
                          <div className="rounded-xl border border-amber-200 bg-amber-50/60 overflow-hidden">
                            <div className="px-5 py-3 border-b border-amber-200/60 flex items-center gap-2">
                              <span className="text-amber-600 text-base leading-none">→</span>
                              <p className="text-sm font-semibold text-amber-800">Areas to work on</p>
                            </div>
                            <div className="px-5 py-4">
                              <p className="text-sm text-amber-900 leading-relaxed whitespace-pre-wrap">{humanDraft.improve || '—'}</p>
                            </div>
                          </div>
                        </div>
                        <div className="px-8 pt-3 pb-6 border-t border-border/20">
                          <p className="font-serif text-sm text-foreground/50 italic">— You</p>
                        </div>
                      </div>
                    </div>
                  ) : !data.letter || !hasAiFeedback ? (
                    /* No feedback yet */
                    <div className="flex flex-col items-center gap-4 py-16 text-center">
                      {canRequestAiFeedback ? (
                        <>
                          <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-violet-500" />
                          </div>
                          <div className="space-y-1.5">
                            <p className="font-semibold text-foreground">No AI feedback yet</p>
                            <p className="text-sm text-muted-foreground max-w-xs">
                              Send this to STP Feedback AI to get structured feedback using the STP Framework too.
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
                            <p className="text-sm text-muted-foreground max-w-xs">This letter is waiting for feedback.</p>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    /* State (ii)/(iii): feedback received */
                    <div
                      className="rounded-none overflow-hidden relative"
                      style={{
                        background: '#FFFFFF',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.09), 0 1px 2px rgba(0,0,0,0.04)',
                        border: '1px solid rgba(0,0,0,0.07)',
                      }}
                    >
                      {/* Hole punches — left gutter */}
                      <div
                        className="absolute left-0 top-0 bottom-0 flex flex-col justify-around items-center py-16"
                        style={{ width: 32, background: 'rgba(0,0,0,0.015)', borderRight: '1px solid rgba(0,0,0,0.05)' }}
                        aria-hidden="true"
                      >
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            style={{
                              width: 14, height: 14,
                              borderRadius: '50%',
                              background: '#f4f4f4',
                              border: '1px solid rgba(0,0,0,0.13)',
                              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.12)',
                            }}
                          />
                        ))}
                      </div>

                      {/* Content shifted right to clear hole-punch gutter */}
                      <div className="ml-8">

                      {/* Paper header — greeting */}
                      <div className="px-8 pt-7 pb-3 border-b border-border/20">
                        {sourceType === 'ai' && (
                          <p className="w-full text-[11px] text-muted-foreground/70 leading-relaxed mb-5">
                            <strong className="font-semibold text-muted-foreground">AI-generated feedback</strong> grounded in the STP Framework. Discuss with a mentor or peer — they know your context best.
                          </p>
                        )}
                        <p className="font-serif text-xl text-foreground/90 leading-snug">{data.letter.greeting}</p>
                      </div>

                      <div className="px-8 pt-4 pb-6 space-y-4">
                        {/* What went well */}
                        <div className="rounded-xl border border-green-200 bg-green-50/70 overflow-hidden">
                          <div className="px-5 py-3 border-b border-green-200/60 flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white text-[9px] font-bold shrink-0">✓</span>
                            <p className="text-sm font-semibold text-green-800">What went well</p>
                          </div>
                          <ul className="px-5 py-4 space-y-3">
                            {data.letter.wellDone.map((item, i) => (
                              <li key={i} className="flex items-start gap-3">
                                <span className="text-green-400 text-[11px] mt-0.5 shrink-0">•</span>
                                <p className="text-sm text-green-900 leading-relaxed">
                                  <RichFeedbackText text={item} onTimestampClick={seekVideo} onSTPClick={() => setStpOpen(true)} />
                                </p>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Try this next time */}
                        {sourceType === 'ai' ? (
                          <FeedbackAccordion
                            title="Try this next time"
                            icon={<span className="text-amber-600 text-base leading-none">→</span>}
                            items={data.letter.tryNext}
                            renderItem={(item) => <RichFeedbackText text={item} onTimestampClick={seekVideo} onSTPClick={() => setStpOpen(true)} />}
                          />
                        ) : (
                          <div className="rounded-xl border border-amber-200 bg-amber-50/70 overflow-hidden">
                            <div className="px-5 py-3 border-b border-amber-200/60 flex items-center gap-2">
                              <span className="text-amber-600 text-base leading-none">→</span>
                              <p className="text-sm font-semibold text-amber-800">Try this next time</p>
                            </div>
                            <ul className="px-5 py-4 space-y-3">
                              {data.letter.tryNext.map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                  <span className="text-amber-400 text-[11px] mt-0.5 shrink-0">•</span>
                                  <p className="text-sm text-amber-900 leading-relaxed">
                                    <RichFeedbackText text={item} onTimestampClick={seekVideo} onSTPClick={() => setStpOpen(true)} />
                                  </p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Collapsible sections */}
                        {sourceType === 'ai' && (
                          <>
                            <FeedbackAccordion
                              title="What caught my attention"
                              icon={<Eye className="w-4 h-4 text-sky-500 shrink-0" />}
                              items={data.letter.teachingActions}
                              renderItem={(item) => <RichFeedbackText text={item} onTimestampClick={seekVideo} onSTPClick={() => setStpOpen(true)} />}
                            />
                            <FeedbackAccordion
                              title="Before you move on…"
                              icon={<Lightbulb className="w-4 h-4 text-violet-500 shrink-0" />}
                              items={data.letter.reflect}
                              renderItem={(item) => <ReflectionPromptText text={item} onTimestampClick={seekVideo} onSTPClick={() => setStpOpen(true)} />}
                            />
                          </>
                        )}
                      </div>

                      {/* Paper footer — closing + signature */}
                      <div className="px-8 pt-4 pb-8 border-t border-border/30 space-y-1">
                        <p className="font-serif text-sm italic text-foreground/60 leading-relaxed">{data.letter.closing}</p>
                        <p className="font-serif text-sm text-foreground/50 pt-1">{data.letter.signature}</p>
                      </div>

                      </div>{/* end ml-8 */}
                    </div>
                  )}
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
