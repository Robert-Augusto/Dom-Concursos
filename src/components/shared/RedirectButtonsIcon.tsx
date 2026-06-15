'use client'

import Link from 'next/link'
import type { MouseEvent } from 'react'
import { toast } from 'sonner'
import {
  ChevronRight,
  CircleHelp,
  type LucideIcon,
  Settings,
  Video,
} from 'lucide-react'

type ColorToken =
  | '--color-accent'
  | '--color-chart-2'
  | '--color-chart-5'
  | '--color-gold'
  | '--color-sidebar-primary'
  | '--color-chart-1'
  | '--color-destructive'
  | '--color-chart-3'

type RedirectButtonItem = {
  label: string
  description: string
  href: string
  Icon: LucideIcon
  colorToken: ColorToken
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
    description: 'Gerencie sua conta e preferências.',
    href: '/settings',
    Icon: Settings,
    colorToken: '--color-chart-5',
  },
]

type RedirectButtonsIconProps = {
  isAuthenticated: boolean
  onRequireSignup: () => void
}

function cardSurfaceStyle(colorToken: ColorToken) {
  return {
    borderColor: `color-mix(in oklab, var(${colorToken}) 42%, transparent)`,
    background: `linear-gradient(
      165deg,
      color-mix(in oklab, var(${colorToken}) 8%, var(--card)) 0%,
      color-mix(in oklab, var(--card) 92%, black 8%) 55%,
      color-mix(in oklab, var(${colorToken}) 14%, var(--card)) 100%
    )`,
    boxShadow: `
      0 0 0 1px color-mix(in oklab, var(${colorToken}) 10%, transparent),
      0 12px 32px color-mix(in oklab, var(${colorToken}) 12%, transparent),
      inset 0 1px 0 color-mix(in oklab, white 12%, transparent)
    `,
  } as const
}

function iconStyle(colorToken: ColorToken) {
  return {
    background: `linear-gradient(
      145deg,
      color-mix(in oklab, var(${colorToken}) 55%, white 20%),
      color-mix(in oklab, var(${colorToken}) 85%, black 8%)
    )`,
    boxShadow: `
      0 0 0 1px color-mix(in oklab, var(${colorToken}) 50%, transparent),
      0 8px 20px color-mix(in oklab, var(${colorToken}) 35%, transparent),
      inset 0 1px 0 color-mix(in oklab, white 35%, transparent)
    `,
  } as const
}

function actionStyle(colorToken: ColorToken) {
  return {
    background: `color-mix(in oklab, var(${colorToken}) 16%, var(--card))`,
    border: `1px solid color-mix(in oklab, var(${colorToken}) 38%, transparent)`,
    boxShadow: `0 4px 14px color-mix(in oklab, var(${colorToken}) 18%, transparent)`,
  } as const
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
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 scrollbar-none lg:grid lg:grid-cols-3 lg:overflow-visible lg:gap-4 lg:pb-0">
        {redirectButtonItems.map((item) => {
          const { label, description, href, Icon, colorToken, badgeCount, comingSoon } =
            item

          return (
            <Link
              key={label}
              href={href}
              onClick={(event) => handleFeatureClick(event, item)}
              aria-disabled={comingSoon ? true : undefined}
              className={`group relative flex min-h-[172px] w-[190px] shrink-0 snap-start flex-col overflow-hidden rounded-3xl border p-4 transition-all duration-300 sm:min-h-[180px] sm:w-[172px] sm:p-[18px] lg:min-h-[192px] lg:w-full lg:max-w-none lg:shrink lg:p-5 ${
                comingSoon
                  ? 'cursor-default opacity-90'
                  : 'hover:-translate-y-1 hover:shadow-lg'
              }`}
              style={cardSurfaceStyle(colorToken)}
            >
              <span
                className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-30"
                style={{
                  background: `radial-gradient(circle, var(${colorToken}) 0%, transparent 70%)`,
                }}
                aria-hidden
              />

              <span
                className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent"
                aria-hidden
              />

              {comingSoon ? (
                <span className="absolute right-3 top-3 z-10 rounded-full border border-primary/40 bg-primary/15 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide text-primary">
                  Em breve
                </span>
              ) : null}

              {badgeCount ? (
                <span className="absolute right-3 top-3 z-10 rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-bold leading-none text-destructive-foreground shadow-sm">
                  {badgeCount}
                </span>
              ) : null}

              <span
                className="relative z-[1] flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-105 sm:h-11 sm:w-11"
                style={iconStyle(colorToken)}
              >
                <Icon className="h-[18px] w-[18px] text-white sm:h-5 sm:w-5" strokeWidth={2.2} />
              </span>

              <div className="relative z-[1] mt-3 flex min-w-0 flex-1 flex-col pb-12 pr-1">
                <p className="font-heading line-clamp-2 text-left text-[15px] font-black leading-[1.12] tracking-tight text-foreground sm:text-base lg:text-[17px]">
                  {label}
                </p>
                <p className="mt-2 line-clamp-2 text-left text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
                  {description}
                </p>
              </div>

              <span
                className="absolute bottom-4 right-4 z-[1] flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 group-hover:translate-x-0.5 group-hover:scale-105 sm:bottom-[18px] sm:right-[18px] sm:h-11 sm:w-11 lg:bottom-5 lg:right-5"
                style={actionStyle(colorToken)}
              >
                <span
                  className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: `linear-gradient(
                      145deg,
                      color-mix(in oklab, var(${colorToken}) 70%, white 10%),
                      var(${colorToken})
                    )`,
                  }}
                  aria-hidden
                />
                <ChevronRight
                  className="relative h-4 w-4 transition-colors duration-300 group-hover:text-white sm:h-5 sm:w-5"
                  style={{ color: `var(${colorToken})` }}
                  strokeWidth={2.5}
                />
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
