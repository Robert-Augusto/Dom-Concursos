import Link from 'next/link'
import {
    MessageCircle,
    Lightbulb,
    ClipboardCheck,
    type LucideIcon
} from 'lucide-react'

type RedirectButtonItem = {
  label: string
  href: string
  Icon: LucideIcon
  colorToken: '--color-accent' | '--color-chart-2' | '--color-chart-5' | '--color-gold' | '--color-sidebar-primary' | '--color-chart-1' | '--color-destructive' | '--color-chart-3'
}

const redirectButtonItems: RedirectButtonItem[] = [
  { label: 'Comunidade', href: '/comunity', Icon: MessageCircle, colorToken: '--color-gold' },
  { label: 'Estudo Inteligente', href: '/study', Icon: Lightbulb, colorToken: '--color-chart-2' },
  { label: 'Simulador de Prova', href: '/simulado', Icon: ClipboardCheck, colorToken: '--color-accent' },
]

export function RedirectButtons() {
  return (
    <section>
  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
    {redirectButtonItems.map(({ label, href, Icon, colorToken }) => (
      <Link
        key={label}
        href={href}
        className="group relative flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full transition-opacity hover:opacity-90"
        style={{
          background: `var(${colorToken})`,
        }}
      >
        <Icon className="h-4 w-4 text-white flex-shrink-0" />
        <span className="text-[11px] font-black tracking-widest uppercase text-white whitespace-nowrap">
          {label}
        </span>
      </Link>
    ))}
  </div>
</section>
  )
}
