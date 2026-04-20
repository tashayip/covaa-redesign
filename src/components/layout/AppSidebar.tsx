import type React from 'react'
import { useLetterboxStore } from '@/store/letterbox-store'
import { useShallow } from 'zustand/react/shallow'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Mail, Globe, CircleHelp, Info, Sparkles, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FlowState } from '@/types'

type NavItem = { state: FlowState; label: string; Icon: React.ElementType; description: string }

const NAV_ITEMS: NavItem[] = [
  { state: 'transit',  label: 'Feedback Letters', Icon: Mail,   description: 'Sent and received letters' },
  { state: 'discover', label: 'Community',        Icon: Globe,  description: 'Community letters' },
  { state: 'settings', label: 'Learning Goals', Icon: Target, description: 'Default feedback areas' },
]

export function AppSidebar() {
  const { flow, setFlow, setWizardStep, setSelectedLetter, newLetterCount } = useLetterboxStore(
    useShallow((s) => ({
      flow: s.flow,
      setFlow: s.setFlow,
      setWizardStep: s.setWizardStep,
      setSelectedLetter: s.setSelectedLetter,
      newLetterCount: s.newLetterCount,
    }))
  )

  function goHome() {
    setSelectedLetter(null)
    setWizardStep(1)
    setFlow('transit')
  }

  return (
    <Sidebar collapsible="icon">
      {/* Brand header */}
      <SidebarHeader className="px-4 py-5">
        <button
          type="button"
          onClick={goHome}
          className="flex w-full items-center gap-2.5 rounded-lg text-left outline-hidden transition-colors hover:bg-sidebar-accent/70 focus-visible:ring-2 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:justify-center"
          aria-label="Go to Feedback Letters"
          title="Go to Feedback Letters"
        >
          <div className="w-6 h-6 rounded-full bg-sidebar-primary flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-sidebar-primary-foreground">L</span>
          </div>
          <div className="flex w-[126px] flex-col leading-none group-data-[collapsible=icon]:hidden">
            <span className="font-semibold text-[13px] text-sidebar-foreground [letter-spacing:0.22em]">
              Letterbox
            </span>
            <span className="mt-1 text-[9px] font-medium text-sidebar-foreground/55 [letter-spacing:0.18em]">
              for teachers
            </span>
          </div>
        </button>
      </SidebarHeader>

      <SidebarSeparator />

      {/* Primary CTA */}
      <div className="px-3 py-3 group-data-[collapsible=icon]:px-2">
        <button
          onClick={() => setFlow('write')}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:rounded-full"
          title="Share a Lesson"
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span className="group-data-[collapsible=icon]:hidden">Get Feedback</span>
        </button>
      </div>

      <SidebarContent>
        {/* Main navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[9px] tracking-[2px] uppercase">
            Letters
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const isActive = flow === item.state
                return (
                  <SidebarMenuItem key={item.state}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.label}
                      onClick={() => setFlow(item.state)}
                      className={cn(
                        'cursor-pointer',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-foreground font-medium'
                          : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60'
                      )}
                    >
                      <item.Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                      {item.state === 'transit' && newLetterCount > 0 && (
                        <span className="ml-auto min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center px-1">
                          {newLetterCount}
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Help & resources */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[9px] tracking-[2px] uppercase">
            Support
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Guidelines"
                  className="text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 cursor-pointer"
                >
                  <CircleHelp className="w-4 h-4 shrink-0" />
                  <span>Writing Guidelines</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="About"
                  className="text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 cursor-pointer"
                >
                  <Info className="w-4 h-4 shrink-0" />
                  <span>About CoVAA</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer — profile */}
      <SidebarFooter className="px-3 pb-4">
        <SidebarSeparator className="mb-3" />
        <div className="flex items-center gap-2.5 px-1 group-data-[collapsible=icon]:justify-center">
          <div className="w-7 h-7 rounded-full bg-sidebar-accent border border-sidebar-border flex items-center justify-center shrink-0">
            <span className="text-xs text-sidebar-foreground/70">T</span>
          </div>
          <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="text-xs font-medium text-sidebar-foreground truncate">My Profile</p>
            <p className="text-[10px] text-sidebar-foreground/50 truncate">teacher@covaa.edu.sg</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

export { SidebarTrigger }
