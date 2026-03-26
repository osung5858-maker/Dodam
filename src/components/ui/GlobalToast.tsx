'use client'

import { useState, useEffect } from 'react'

export default function GlobalToast() {
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      const msg = (e as CustomEvent).detail?.message
      if (msg) {
        setMessage(msg)
        setTimeout(() => setMessage(null), 2500)
      }
    }
    window.addEventListener('dodam-toast', handler)
    return () => window.removeEventListener('dodam-toast', handler)
  }, [])

  if (!message) return null

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[100] animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-[#212124]/90 text-white px-5 py-2.5 rounded-xl text-[13px] font-medium shadow-lg backdrop-blur-sm max-w-[320px] text-center">
        {message}
      </div>
    </div>
  )
}
