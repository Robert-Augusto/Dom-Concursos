'use client'

import Link from 'next/link'
import type { MouseEvent } from 'react'
import { toast } from 'sonner'
import {
  CircleHelp,
  type LucideIcon,
  Settings,
  Video,
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
  comingSoon?: boolean
  comingSoonMessage?: string
}

const redirectButtonItems: RedirectButtonItem[] = [
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
  const handleFeatureClick = (
    event: MouseEvent<HTMLAnchorElement>,
    item: RedirectButtonItem,
  ) => {
    if (item.comingSoon) {
      event.preventDefault()
      toast.info(
        item.comingSoonMessage ??
          'Este recurso estará disponível em breve nas próximas atualizações.',
      )
      return
    }

    if (isAuthenticated) return
    event.preventDefault()
    onRequireSignup()
  }

  return (
    <section>
      <div className="flex gap-4 overflow-x-auto p-2 scrollbar-none lg:grid lg:grid-cols-2 lg:overflow-visible xl:grid-cols-4 lg:gap-4">
        {redirectButtonItems.map((item) => {
          const { label, description, href, Icon, colorToken, badgeCount, comingSoon } =
            item

          return (
            <Link
              key={label}
              href={href}
              onClick={(event) => handleFeatureClick(event, item)}
              aria-disabled={comingSoon ? true : undefined}
              className={`group relative flex w-[4.5rem] flex-shrink-0 flex-col items-center gap-1.5 rounded-xl border border-transparent transition-colors hover:opacity-95 lg:w-auto lg:flex-row lg:items-start lg:gap-4 lg:border-border lg:bg-card/60 lg:p-4 lg:shadow-sm lg:hover:bg-card ${
                comingSoon ? 'cursor-default' : ''
              }`}
            >
              {comingSoon ? (
                <span className="absolute right-3 top-3 z-10 hidden whitespace-nowrap rounded-full border border-primary/40 bg-primary/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary lg:block">
                  Em breve
                </span>
              ) : null}

              {badgeCount ? (
                <span className="absolute -right-0.5 -top-0.5 z-10 rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-bold leading-none text-destructive-foreground lg:right-3 lg:top-3">
                  {badgeCount}
                </span>
              ) : null}

              <span
                className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl ring-2 ring-white/30 transition-transform duration-200 lg:h-12 lg:w-12 ${
                  comingSoon ? 'opacity-80' : 'group-hover:scale-105'
                }`}
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
                {comingSoon ? (
                  <span className="rounded-full border border-primary/40 bg-primary/15 px-1.5 py-px text-[8px] font-bold uppercase tracking-wide text-primary lg:hidden">
                    Em breve
                  </span>
                ) : null}
                <p className="hidden text-pretty text-xs leading-snug text-muted-foreground lg:block">
                  {description}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
