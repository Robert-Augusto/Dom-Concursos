'use client'

import Link from 'next/link'
import {
  ChevronRight,
  ClipboardCheck,
  Lightbulb,
  type LucideIcon,
  Zap,
} from 'lucide-react'
import type { MouseEvent } from 'react'
import { toast } from 'sonner'
import { ModalSignup } from '@/components/shared/ModalSignup'
import { useProfile } from '@/context/ProfileContext'
import { useState } from 'react'

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
  comingSoon?: boolean
  comingSoonMessage?: string
}

const redirectButtonItems: RedirectButtonItem[] = [
  {
    label: 'Estudo Inteligente',
    description: 'Conteúdos personalizados para acelerar seus resultados.',
    href: '/study',
    Icon: Lightbulb,
    colorToken: '--color-chart-2',
  },
  {
    label: 'Simulador de Prova',
    description: 'Teste seus conhecimentos e veja seu desempenho.',
    href: '/simulado',
    Icon: ClipboardCheck,
    colorToken: '--color-accent',
  },
  {
    label: 'Resumo Flash',
    description: 'Resumos objetivos para revisar rápido e fixar o conteúdo.',
    href: '/resumo-flash',
    Icon: Zap,
    colorToken: '--color-gold',
    comingSoon: true,
    comingSoonMessage: 'Resumo Flash estará disponível em breve.',
  },
]

export function RedirectButtons() {
  const [openSignupModal, setOpenSignupModal] = useState(false)
  const { loading, isAuthenticated } = useProfile()

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

    if (loading) {
      event.preventDefault()
      return
    }

    if (!isAuthenticated){
      event.preventDefault()
      setOpenSignupModal(true)
      return
    }

  }

  return (
    <section className="flex flex-col gap-3">
      {redirectButtonItems.map((item) => {
        const { label, description, href, Icon, colorToken, comingSoon } = item
        return (
        <Link
          key={label}
          href={href}
          onClick={(event) => handleFeatureClick(event, item)}
          className="group relative flex min-h-[88px] items-center gap-3 overflow-hidden rounded-2xl border bg-card/40 p-4 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-card/55 sm:min-h-[96px] sm:gap-4 sm:p-5"
          style={{
            borderColor: `color-mix(in oklab, var(${colorToken}) 38%, transparent)`,
            boxShadow: `0 0 28px color-mix(in oklab, var(${colorToken}) 10%, transparent), inset 0 1px 0 color-mix(in oklab, var(${colorToken}) 12%, transparent)`,
          }}
        >
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12"
            style={{
              background: `color-mix(in oklab, var(${colorToken}) 22%, transparent)`,
              border: `1px solid color-mix(in oklab, var(${colorToken}) 45%, transparent)`,
              boxShadow: `0 0 22px color-mix(in oklab, var(${colorToken}) 30%, transparent)`,
            }}
          >
            <Icon
              className="h-5 w-5 sm:h-[22px] sm:w-[22px]"
              style={{ color: `var(${colorToken})` }}
            />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-foreground sm:text-[15px]">{label}</p>
              {comingSoon ? (
                <span className="rounded-full border border-primary/40 bg-primary/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary">
                  Em breve
                </span>
              ) : null}
            </div>
            <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted-foreground sm:line-clamp-1">
              {description}
            </p>
          </div>

          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-transform duration-200 group-hover:translate-x-0.5 sm:h-10 sm:w-10"
            style={{
              background: `color-mix(in oklab, var(${colorToken}) 20%, transparent)`,
              border: `1px solid color-mix(in oklab, var(${colorToken}) 45%, transparent)`,
              boxShadow: `0 0 16px color-mix(in oklab, var(${colorToken}) 25%, transparent)`,
            }}
          >
            <ChevronRight
              className="h-4 w-4 sm:h-5 sm:w-5"
              style={{ color: `var(${colorToken})` }}
            />
          </span>
        </Link>
        )
      })}
      <ModalSignup open={openSignupModal} onClose={() => setOpenSignupModal(false)} />
    </section>
  )
}
