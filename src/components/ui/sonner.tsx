import { Toaster as Sonner, type ToasterProps } from 'sonner'
import type React from 'react'

function SuccessIcon() {
  return (
    <span className="lb-toast-success-icon" aria-hidden="true">
      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none">
        <path d="M5 10.4 8.3 13.5 15 6.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

function Toaster({ icons, style, toastOptions, ...props }: ToasterProps) {
  const toastClassNames = toastOptions?.classNames

  return (
    <Sonner
      className="toaster group"
      icons={{
        ...icons,
        success: icons?.success ?? <SuccessIcon />,
      }}
      toastOptions={{
        ...toastOptions,
        classNames: {
          ...toastClassNames,
          toast: ['lb-toast', toastClassNames?.toast].filter(Boolean).join(' '),
          title: ['lb-toast-title', toastClassNames?.title].filter(Boolean).join(' '),
          description: ['lb-toast-description', toastClassNames?.description].filter(Boolean).join(' '),
          icon: ['lb-toast-icon', toastClassNames?.icon].filter(Boolean).join(' '),
        },
      }}
      style={
        {
          '--normal-bg': '#FFFFFF',
          '--normal-text': 'var(--foreground)',
          '--normal-border': 'rgba(21, 128, 61, 0.28)',
          '--success-bg': '#FFFFFF',
          '--success-text': 'var(--foreground)',
          '--success-border': 'rgba(21, 128, 61, 0.32)',
          ...style,
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
