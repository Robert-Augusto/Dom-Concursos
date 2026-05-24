'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { ClipboardCheck, Lightbulb, type LucideIcon } from 'lucide-react'

type RedirectButtonItem = {
  label: string
  href: string
  Icon: LucideIcon
  colorToken:
    | '--color-accent'
    | '--color-chart-2'
    | '--color-chart-5'
    | '--color-gold'
    | '--color-sidebar-primary'
    | '--color-chart-1'
    | '--color-destructive'
    | '--color-chart-3'
}

const redirectButtonItems: RedirectButtonItem[] = [
  {
    label: 'Estudo Inteligente',
    href: '/study',
    Icon: Lightbulb,
    colorToken: '--color-chart-2',
  },
  {
    label: 'Simulador de Prova',
    href: '/simulado',
    Icon: ClipboardCheck,
    colorToken: '--color-accent',
  },
]

type RedirectButtonsProps = {
  isAuthenticated: boolean
  onRequireSignup: () => void
}

export function RedirectButtons({
  isAuthenticated,
  onRequireSignup,
}: RedirectButtonsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showScrollHint, setShowScrollHint] = useState(false)

  const handleFeatureClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (isAuthenticated) return
    event.preventDefault()
    onRequireSignup()
  }

  useEffect(() => {
    const scrollElement = scrollRef.current
    if (!scrollElement) return

    const updateScrollHint = () => {
      const hasOverflow = scrollElement.scrollWidth > scrollElement.clientWidth + 1
      const isAtEnd =
        scrollElement.scrollLeft + scrollElement.clientWidth >=
        scrollElement.scrollWidth - 8
      setShowScrollHint(hasOverflow && !isAtEnd)
    }

    updateScrollHint()
    scrollElement.addEventListener('scroll', updateScrollHint, { passive: true })
    window.addEventListener('resize', updateScrollHint)

    const resizeObserver = new ResizeObserver(updateScrollHint)
    resizeObserver.observe(scrollElement)

    return () => {
      scrollElement.removeEventListener('scroll', updateScrollHint)
      window.removeEventListener('resize', updateScrollHint)
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <section>
      {showScrollHint ? (
        <div
          className="mb-1.5 flex items-center justify-end gap-0.5 text-muted-foreground"
          aria-hidden
        >
          <span className="text-[10px] font-semibold uppercase tracking-wide">
            Deslize
          </span>
          <ChevronRight className="h-4 w-4 animate-pulse" />
        </div>
      ) : null}

      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-none"
        >
          {redirectButtonItems.map(({ label, href, Icon, colorToken }) => (
            <Link
              key={label}
              href={href}
              onClick={handleFeatureClick}
              className="group relative flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 transition-opacity hover:opacity-90"
              style={{
                background: `var(${colorToken})`,
              }}
            >
              <Icon className="h-4 w-4 shrink-0 text-white" />
              <span className="whitespace-nowrap text-[11px] font-black uppercase tracking-widest text-white">
                {label}
              </span>
            </Link>
          ))}
        </div>

        {showScrollHint ? (
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background via-background/80 to-transparent"
            aria-hidden
          />
        ) : null}
      </div>
    </section>
  )
}
