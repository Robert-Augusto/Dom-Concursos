'use client'

import type { StudyAgentHtmlVariant } from '@/types'
import { cn } from '@/lib/utils'

type StudyAgentContentVariantSwitcherProps = {
  value: StudyAgentHtmlVariant
  onChange: (variant: StudyAgentHtmlVariant) => void
  hasFull: boolean
  hasSummary: boolean
  className?: string
}

export function StudyAgentContentVariantSwitcher({
  value,
  onChange,
  hasFull,
  hasSummary,
  className,
}: StudyAgentContentVariantSwitcherProps) {
  if (!hasFull && !hasSummary) return null

  return (
    <div
      className={cn(
        'inline-flex w-fit self-start gap-1 rounded-xl border border-border bg-muted/30 p-1 bg-popover',
        className,
      )}
      role="group"
      aria-label="Versão do material de estudo"
    >
      <button
        type="button"
        onClick={() => onChange('full')}
        disabled={!hasFull}
        className={cn(
          'shrink-0 rounded-lg px-4 py-2 text-xs font-bold transition-colors',
          value === 'full'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:bg-background hover:text-foreground',
          !hasFull && 'cursor-not-allowed opacity-40',
        )}
      >
        Completo
      </button>
      <button
        type="button"
        onClick={() => onChange('summary')}
        disabled={!hasSummary}
        className={cn(
          'shrink-0 rounded-lg px-4 py-2 text-xs font-bold transition-colors',
          value === 'summary'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:bg-background hover:text-foreground',
          !hasSummary && 'cursor-not-allowed opacity-40',
        )}
      >
        Resumido
      </button>
    </div>
  )
}
