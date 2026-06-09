import Link from 'next/link'
import type { MouseEvent } from 'react'
import {
  CircleHelp,
  type LucideIcon,
  MonitorPlay,
  Video,
  Settings
} from 'lucide-react'

type RedirectButtonItem = {
  label: string
  description: string
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
  badgeCount?: number
}

const redirectButtonItems: RedirectButtonItem[] = [
  {
    label: 'Cursos',
    description: 'Aulas gravadas e trilhas alinhadas ao seu edital.',
    href: '/courses',
    Icon: MonitorPlay,
    colorToken: '--color-accent',
  },
  {
    label: 'Aula ao Vivo',
    description: 'Participe das transmissões ao vivo com a equipe.',
    href: '/live',
    Icon: Video,
    colorToken: '--color-destructive',
  },
  {
    label: 'Dúvidas',
    description: 'Perguntas frequentes e canal de ajuda rápida.',
    href: '/doubts',
    Icon: CircleHelp,
    colorToken: '--color-gold',
  },
  {
    label: 'Configurações',
    description: 'Gerencie sua conta.',
    href: '/settings',
    Icon: Settings,
    colorToken: '--color-chart-5',
  },
]

type RedirectButtonsIconProps = {
  isAuthenticated: boolean
  onRequireSignup: () => void
}

export function RedirectButtonsIcon({
  isAuthenticated,
  onRequireSignup,
}: RedirectButtonsIconProps) {
  const handleFeatureClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (isAuthenticated) return
    event.preventDefault()
    onRequireSignup()
  }

  return (
    <section>
      <div className="flex gap-4 overflow-x-auto p-2 scrollbar-none lg:grid lg:grid-cols-2 lg:overflow-visible xl:grid-cols-4 lg:gap-4">
        {redirectButtonItems.map(
          ({ label, description, href, Icon, colorToken, badgeCount }) => (
            <Link
              key={label}
              href={href}
              onClick={handleFeatureClick}
              className="group relative flex w-[4.5rem] flex-shrink-0 flex-col items-center gap-1.5 rounded-xl border border-transparent transition-colors hover:opacity-95 lg:w-auto lg:flex-row lg:items-start lg:gap-4 lg:border-border lg:bg-card/60 lg:p-4 lg:shadow-sm lg:hover:bg-card"
            >
              {badgeCount ? (
                <span className="absolute -right-0.5 -top-0.5 z-10 rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-bold leading-none text-destructive-foreground lg:right-3 lg:top-3">
                  {badgeCount}
                </span>
              ) : null}

              <span
                className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl ring-2 ring-white/30 transition-transform duration-200 group-hover:scale-105 lg:h-12 lg:w-12"
                style={{
                  background: `linear-gradient(145deg,
                    color-mix(in oklab, var(${colorToken}) 40%, white 60%),
                    color-mix(in oklab, var(${colorToken}) 75%, white 25%) 50%,
                    color-mix(in oklab, var(${colorToken}) 88%, black 12%)
                  )`,
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -6px 12px color-mix(in oklab, var(${colorToken}) 35%, transparent)`,
                }}
              >
                <Icon className="h-6 w-6 text-white lg:h-5 lg:w-5" />
              </span>

              <div className="flex min-w-0 flex-col items-center gap-0.5 lg:flex-1 lg:items-start lg:gap-1 lg:pr-6">
                <span className="w-16 text-center text-[11px] leading-tight text-muted-foreground lg:w-auto lg:text-left lg:text-sm lg:font-semibold lg:text-foreground">
                  {label}
                </span>
                <p className="hidden text-pretty text-xs leading-snug text-muted-foreground lg:block">
                  {description}
                </p>
              </div>
            </Link>
          ),
        )}
      </div>
    </section>
  )
}
