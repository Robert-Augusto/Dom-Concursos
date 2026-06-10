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
      className="fixed bottom-40 right-5 z-50 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-secondary/90 text-muted-foreground backdrop-blur-sm transition-colors hover:bg-muted hover:text-foreground active:scale-95 lg:bottom-24 lg:right-7"
      aria-label="Voltar ao topo"
    >
      <ChevronUp className="h-4 w-4" aria-hidden />
    </button>
  )
}
