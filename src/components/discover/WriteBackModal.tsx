import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface WriteBackModalProps {
  isOpen: boolean
  to: string
  onClose: () => void
}

export function WriteBackModal({ isOpen, to, onClose }: WriteBackModalProps) {
  const [wellDone, setWellDone] = useState('')
  const [tryNext, setTryNext] = useState('')
  const [sent, setSent] = useState(false)

  function handleSend() {
    setSent(true)
    setTimeout(() => {
      setSent(false)
      setWellDone('')
      setTryNext('')
      onClose()
    }, 1200)
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-fade-up"
      style={{ background: 'rgba(26,20,16,0.36)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
    >
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="pb-3 pr-12 relative">
          <p className="font-serif text-lg text-foreground leading-snug">{to || 'Writing back…'}</p>
          <button
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition-colors text-sm"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-xl border border-green-200 bg-green-50/60 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-green-200/60 flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white text-[9px] font-bold shrink-0">✓</span>
              <p className="text-sm font-semibold text-green-800">What went well</p>
            </div>
            <Textarea
              className="border-0 rounded-none bg-transparent font-serif italic text-sm min-h-[80px] resize-none focus-visible:ring-0 focus-visible:ring-offset-0 px-4 py-3"
              placeholder="What you noticed going well..."
              value={wellDone}
              onChange={(e) => setWellDone(e.target.value)}
            />
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/60 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-amber-200/60 flex items-center gap-2">
              <span className="text-amber-600 text-base leading-none">→</span>
              <p className="text-sm font-semibold text-amber-800">Try this next time</p>
            </div>
            <Textarea
              className="border-0 rounded-none bg-transparent font-serif italic text-sm min-h-[80px] resize-none focus-visible:ring-0 focus-visible:ring-offset-0 px-4 py-3"
              placeholder="One thing to try next time..."
              value={tryNext}
              onChange={(e) => setTryNext(e.target.value)}
            />
          </div>

          <Button className="w-full" size="lg" onClick={handleSend} disabled={sent || (!wellDone.trim() && !tryNext.trim())}>
            {sent ? 'Sent ✓' : 'Send your response →'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
