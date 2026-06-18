'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { MouseEvent } from 'react'
import { toast } from 'sonner'
import {
  ChevronRight,
  GraduationCap,
  Info,
  type LucideIcon,
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
  backgroundImage: string
  liveBadge?: boolean
  comingSoon?: boolean
  comingSoonMessage?: string
}

const redirectButtonItems: RedirectButtonItem[] = [
  {
    label: 'Cursos',
    description: 'Continue seus estudos.',
    href: '/courses',
    Icon: GraduationCap,
    colorToken: '--color-chart-5',
    backgroundImage:
      'https://tzrcebhmkivfflfosstq.supabase.co/storage/v1/object/public/study_materials_images/WhatsApp%20Image%202026-06-16%20at%2010.33.59.jpeg',
  },
  {
    label: 'Aula ao Vivo',
    description: 'Participe das transmissões.',
    href: '/live',
    Icon: Video,
    colorToken: '--color-destructive',
    backgroundImage:
      'https://tzrcebhmkivfflfosstq.supabase.co/storage/v1/object/public/study_materials_images/WhatsApp%20Image%202026-06-16%20at%2010.34.36.jpeg',
    liveBadge: true,
  },
  {
    label: 'Informações',
    description: 'Novidades e avisos importantes.',
    href: '/doubts',
    Icon: Info,
    colorToken: '--color-accent',
    backgroundImage:
      'https://tzrcebhmkivfflfosstq.supabase.co/storage/v1/object/public/study_materials_images/WhatsApp%20Image%202026-06-16%20at%2010.37.19.jpeg',
  },
]

type RedirectButtonsIconProps = {
  isAuthenticated: boolean
  onRequireSignup: () => void
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
    background: `linear-gradient(
      145deg,
      color-mix(in oklab, var(${colorToken}) 70%, white 10%),
      color-mix(in oklab, var(${colorToken}) 90%, black 8%)
    )`,
    boxShadow: `0 4px 14px color-mix(in oklab, var(${colorToken}) 30%, transparent)`,
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
      <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
        {redirectButtonItems.map((item) => {
          const {
            label,
            description,
            href,
            Icon,
            colorToken,
            backgroundImage,
            liveBadge,
            comingSoon,
          } = item

          return (
            <Link
              key={label}
              href={href}
              onClick={(event) => handleFeatureClick(event, item)}
              aria-disabled={comingSoon ? true : undefined}
              className={`group relative h-[130px] min-w-0 w-full overflow-hidden rounded-2xl border transition-all duration-300 lg:aspect-square lg:h-[200px] lg:rounded-3xl ${
                comingSoon
                  ? 'cursor-default opacity-90'
                  : 'hover:-translate-y-1 hover:shadow-lg'
              }`}
              style={{
                borderColor: `color-mix(in oklab, var(${colorToken}) 45%, transparent)`,
                boxShadow: `0 0 28px color-mix(in oklab, var(${colorToken}) 12%, transparent)`,
              }}
            >
              <Image
                src={backgroundImage}
                alt=""
                fill
                sizes="(max-width: 1023px) 33vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />

              <div
                className="absolute inset-0 bg-black/55"
                aria-hidden
              />

              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(
                    180deg,
                    rgba(0,0,0,0.45) 0%,
                    rgba(0,0,0,0.62) 50%,
                    rgba(0,0,0,0.88) 100%
                  )`,
                }}
                aria-hidden
              />

              {comingSoon ? (
                <span className="absolute right-3 top-3 z-10 rounded-full border border-primary/40 bg-black/50 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide text-primary backdrop-blur-sm">
                  Em breve
                </span>
              ) : null}

              {liveBadge ? (
                <span
                  className="absolute right-1.5 top-1.5 z-20 flex items-center gap-1 rounded-full border px-1.5 py-1 text-[9px] font-bold uppercase tracking-wide text-white lg:right-3 lg:top-3 lg:px-2 lg:py-0.5"
                  style={{
                    borderColor: `color-mix(in oklab, var(${colorToken}) 55%, transparent)`,
                    background: `color-mix(in oklab, var(${colorToken}) 25%, rgba(0,0,0,0.55))`,
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: `var(${colorToken})` }}
                  />
                  <span className='text-[8px]'>Ao vivo</span>
                </span>
              ) : null}

              <div className="relative z-10 flex h-full flex-col p-2 lg:p-5">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-105 lg:h-11 lg:w-11"
                  style={iconStyle(colorToken)}
                >
                  <Icon className="h-3.5 w-3.5 text-white lg:h-5 lg:w-5" strokeWidth={2.2} />
                </span>

                <div className="mt-2 min-w-0 pr-1 lg:mt-3">
                  <p className="font-heading line-clamp-2 text-left text-[11px] font-black leading-tight tracking-tight text-white lg:text-[17px]">
                    {label}
                  </p>
                  <p className="mt-1 line-clamp-2 text-left text-[9px] leading-snug text-white/80 lg:text-xs lg:leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>

              <span
                className="absolute bottom-2 right-2 z-20 flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 group-hover:translate-x-0.5 group-hover:scale-105 lg:bottom-4 lg:right-4 lg:h-11 lg:w-11"
                style={actionStyle(colorToken)}
              >
                <ChevronRight className="h-3.5 w-3.5 text-white lg:h-5 lg:w-5" strokeWidth={2.5} />
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
