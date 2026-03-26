'use client'

import { useEffect, useState } from 'react'

interface Props {
  message: string
  action?: { label: string; onClick: () => void }
  duration?: number
  onDismiss: () => void
}

export default function Toast({ message, action, duration = 5000, onDismiss }: Props) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDismiss, 300)
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onDismiss])

  return (
    <div
      className={`
        fixed bottom-[140px] left-4 right-4 z-[60] max-w-lg mx-auto
        bg-[#212124] rounded-2xl px-4 py-3.5
        flex items-center justify-between gap-3
        shadow-[0_4px_20px_rgba(0,0,0,0.15)]
        transition-all duration-300 ease-out
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
    >
      <span className="text-[13px] font-medium text-white">{message}</span>
      {action && (
        <button
          onClick={action.onClick}
          className="text-[13px] font-bold text-[var(--color-primary)] shrink-0 active:opacity-70"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
