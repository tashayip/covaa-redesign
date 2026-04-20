import { TooltipProvider } from '@/components/ui/tooltip'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar, SidebarTrigger } from '@/components/layout/AppSidebar'
import { LetterboxMain } from '@/pages/LetterboxMain'
import { LearningGoals } from '@/pages/LearningGoals'
import { LetterDetail } from '@/pages/LetterDetail'
import { useLetterboxStore } from '@/store/letterbox-store'
import { useShallow } from 'zustand/react/shallow'
import { Toaster } from '@/components/ui/sonner'

const FLOW_LABELS: Record<string, string> = {
  write:           'Get Feedback',
  transit:         'All Feedback',
  discover:        'Community',
  settings:        'Learning Goals',
  'letter-detail': 'Letter',
}

function StickyHeader() {
  const { flow, setFlow, wizardStep, setWizardStep, setSelectedLetter } = useLetterboxStore(
    useShallow((s) => ({
      flow: s.flow,
      setFlow: s.setFlow,
      wizardStep: s.wizardStep,
      setWizardStep: s.setWizardStep,
      setSelectedLetter: s.setSelectedLetter,
    }))
  )

  function goHome() {
    setSelectedLetter(null)
    setWizardStep(1)
    setFlow('transit')
  }

  return (
    <div className="sticky top-0 z-40">
      {/* Top nav bar */}
      <header className="flex items-center gap-3 px-6 h-14 border-b border-border backdrop-blur-sm bg-background/95">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={goHome}
            className="text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            Letterbox
          </button>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium text-foreground">{FLOW_LABELS[flow] ?? 'Write'}</span>
        </div>
      </header>
      {/* Progress bar — write flow only */}
      {flow === 'write' && (
        <div className="h-1 bg-muted overflow-hidden">
          <div
            className="h-full bg-emerald-600 transition-all duration-500 ease-in-out"
            style={{ width: `${(wizardStep / 4) * 100}%` }}
          />
        </div>
      )}
    </div>
  )
}

export default function App() {
  const flow = useLetterboxStore((s) => s.flow)

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="min-h-screen bg-muted">
          <StickyHeader />
          {flow === 'settings'      ? <LearningGoals /> :
           flow === 'letter-detail' ? <LetterDetail /> :
                                      <LetterboxMain />}
        </SidebarInset>
        <Toaster position="top-right" richColors closeButton />
      </SidebarProvider>
    </TooltipProvider>
  )
}
