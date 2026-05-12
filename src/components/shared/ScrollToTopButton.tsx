'use client'

import { useEffect, useState } from 'react'
import { ChevronUp } from 'lucide-react'

const scrollThresholdPx = 240

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > scrollThresholdPx)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!visible) return null

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className="fixed bottom-24 right-4 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-primary text-primary-foreground shadow-lg transition-opacity hover:opacity-90 active:scale-95 lg:bottom-8 lg:right-6"
      aria-label="Voltar ao topo"
    >
      <ChevronUp className="h-5 w-5" aria-hidden />
    </button>
  )
}
