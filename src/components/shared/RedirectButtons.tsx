import Link from 'next/link'
import type { MouseEvent } from 'react'
import {
  ClipboardCheck,
  Lightbulb,
  MessageCircle,
  type LucideIcon,
} from 'lucide-react'

type RedirectButtonItem = {
  label: string
  href: string
  Icon: LucideIcon
  colorToken: '--color-accent' | '--color-chart-2' | '--color-chart-5' | '--color-gold' | '--color-sidebar-primary' | '--color-chart-1' | '--color-destructive' | '--color-chart-3'
}

const redirectButtonItems: RedirectButtonItem[] = [
  { label: 'Estudo Inteligente', href: '/study', Icon: Lightbulb, colorToken: '--color-chart-2' },
  { label: 'Simulador de Prova', href: '/simulado', Icon: ClipboardCheck, colorToken: '--color-accent' },
]

type RedirectButtonsProps = {
  isAuthenticated: boolean
  onRequireSignup: () => void
}

export function RedirectButtons({
  isAuthenticated,
  onRequireSignup,
}: RedirectButtonsProps) {
  const handleFeatureClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (isAuthenticated) return
    event.preventDefault()
    onRequireSignup()
  }

  return (
    <section>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {redirectButtonItems.map(({ label, href, Icon, colorToken }) => (
          <Link
            key={label}
            href={href}
            onClick={handleFeatureClick}
            className="group relative flex-shrink-0 flex items-center gap-2 rounded-full px-4 py-2.5 transition-opacity hover:opacity-90"
            style={{
              background: `var(${colorToken})`,
            }}
          >
            <Icon className="h-4 w-4 flex-shrink-0 text-white" />
            <span className="whitespace-nowrap text-[11px] font-black uppercase tracking-widest text-white">
              {label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
