'use client'

import type { StudyAgentHtmlVariant } from '@/types'
import { cn } from '@/lib/utils'
import { BookOpen, FileText, NotebookPen, Star, type LucideIcon } from 'lucide-react'

type StudyAgentContentVariantSwitcherProps = {
  value: StudyAgentHtmlVariant
  onChange: (variant: StudyAgentHtmlVariant) => void
  hasFull?: boolean
  hasSummary?: boolean
  className?: string
}

type ViewOption = {
  id: StudyAgentHtmlVariant
  label: string
  description: string
  icon: LucideIcon
  ringClass: string
  iconClass: string
  activeBorderClass: string
  activeGlowStyle?: string
  activeUnderlineClass: string
}

const VIEW_OPTIONS: ViewOption[] = [
  {
    id: 'full',
    label: 'Completo',
    description: 'Estude com todos os detalhes',
    icon: BookOpen,
    ringClass: 'border-chart-4/50',
    iconClass: 'text-chart-4',
    activeBorderClass: 'border-chart-4/60',
    activeGlowStyle: '0 0 20px rgba(201, 168, 76, 0.35)',
    activeUnderlineClass: 'bg-chart-4',
  },
  {
    id: 'summary',
    label: 'Resumido',
    description: 'Veja uma versão resumida do conteúdo',
    icon: FileText,
    ringClass: 'border-accent/50',
    iconClass: 'text-accent',
    activeBorderClass: 'border-accent/60',
    activeGlowStyle: '0 0 20px rgba(61, 127, 255, 0.35)',
    activeUnderlineClass: 'bg-accent',
  },
  {
    id: 'notes',
    label: 'Anotações',
    description: 'Suas anotações deste conteúdo',
    icon: NotebookPen,
    ringClass: 'border-chart-2/50',
    iconClass: 'text-chart-2',
    activeBorderClass: 'border-chart-2/60',
    activeGlowStyle: '0 0 20px rgba(46, 204, 138, 0.35)',
    activeUnderlineClass: 'bg-chart-2',
  },
  {
    id: 'rating',
    label: 'Avaliar conteúdo',
    description: 'Dê uma nota e deixe seu comentário',
    icon: Star,
    ringClass: 'border-chart-5/50',
    iconClass: 'text-chart-5',
    activeBorderClass: 'border-chart-5/60',
    activeGlowStyle: '0 0 20px rgba(168, 85, 247, 0.35)',
    activeUnderlineClass: 'bg-chart-5',
  },
]

function isOptionDisabled(
  id: StudyAgentHtmlVariant,
  hasFull: boolean,
  hasSummary: boolean,
): boolean {
  if (id === 'full') return !hasFull
  if (id === 'summary') return !hasSummary
  return false
}

function OptionIconCircle({
  option,
  active,
  size = 'md',
}: {
  option: ViewOption
  active: boolean
  size?: 'sm' | 'md'
}) {
  const Icon = option.icon
  const dim = size === 'sm' ? 'h-11 w-11' : 'h-12 w-12'
  const iconDim = size === 'sm' ? 'h-5 w-5' : 'h-6 w-6'

  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full border-2 bg-card transition-all',
        dim,
        option.ringClass,
        active && option.activeBorderClass,
      )}
      style={active && option.activeGlowStyle ? { boxShadow: option.activeGlowStyle } : undefined}
    >
      <Icon className={cn(iconDim, option.iconClass)} aria-hidden />
    </span>
  )
}

export function StudyAgentContentVariantSwitcher({
  value,
  onChange,
  hasFull = true,
  hasSummary = true,
  className,
}: StudyAgentContentVariantSwitcherProps) {
  return (
    <div
      className={cn('w-full', className)}
      role="tablist"
      aria-label="Modo de estudo do material"
    >
      {/* Mobile: ícones em círculo */}
      <div className="grid grid-cols-4 gap-1 sm:hidden">
        {VIEW_OPTIONS.map((option) => {
          const active = value === option.id
          const disabled = isOptionDisabled(option.id, hasFull, hasSummary)

          return (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={active}
              disabled={disabled}
              onClick={() => onChange(option.id)}
              className={cn(
                'flex flex-col items-center gap-2 rounded-lg py-1 transition-opacity',
                disabled && 'cursor-not-allowed opacity-40',
              )}
            >
              <OptionIconCircle option={option} active={active} size="sm" />
              <span
                className={cn(
                  'relative px-1 text-center text-[11px] font-bold leading-tight text-foreground',
                  active && 'text-foreground',
                )}
              >
                {option.id === 'rating' ? 'Avaliar' : option.label}
                {active ? (
                  <span
                    className={cn(
                      'absolute -bottom-1 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full',
                      option.activeUnderlineClass,
                    )}
                    aria-hidden
                  />
                ) : null}
              </span>
            </button>
          )
        })}
      </div>

      {/* Desktop: cards horizontais */}
      <div className="hidden gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-4">
        {VIEW_OPTIONS.map((option) => {
          const active = value === option.id
          const disabled = isOptionDisabled(option.id, hasFull, hasSummary)

          return (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={active}
              disabled={disabled}
              onClick={() => onChange(option.id)}
              className={cn(
                'group relative flex w-full items-center gap-3 rounded-xl border bg-card p-3 text-left transition-all',
                active
                  ? cn(option.activeBorderClass, 'ring-1 ring-inset')
                  : 'border-border hover:border-muted-foreground/30',
                disabled && 'cursor-not-allowed opacity-40',
              )}
              style={
                active && option.activeGlowStyle
                  ? { boxShadow: option.activeGlowStyle }
                  : undefined
              }
            >
              <OptionIconCircle option={option} active={active} />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-foreground">
                  {option.label}
                </span>
                <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
                  {option.description}
                </span>
              </span>
              {active ? (
                <span
                  className={cn(
                    'absolute bottom-0 left-3 right-3 h-0.5 rounded-full',
                    option.activeUnderlineClass,
                  )}
                  aria-hidden
                />
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
