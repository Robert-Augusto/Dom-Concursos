'use client'

import { TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Fixed share per step; must sum to 100. */
const STUDY_STEP_WEIGHTS = {
  material: 33,
  flashcard: 33,
  session: 34,
} as const

export type StudyContentProgressStep = keyof typeof STUDY_STEP_WEIGHTS

/** Cumulative progress (0–100) for material → flashcard → session. */
export function getStudyContentProgressForStep(step: StudyContentProgressStep): number {
  if (step === 'material') return STUDY_STEP_WEIGHTS.material
  if (step === 'flashcard') {
    return STUDY_STEP_WEIGHTS.material + STUDY_STEP_WEIGHTS.flashcard
  }
  return 100
}

export interface StudyContentProgressProps {
  /** Study step; progress is fixed from step weights (no user interaction). */
  step: StudyContentProgressStep
  title?: string
  className?: string
}

export default function StudyContentProgress({
  step,
  title,
  className,
}: StudyContentProgressProps) {
  const isFlashcardGold = step === 'flashcard'
  const isSessionGold = step === 'session'
  const clamped = getStudyContentProgressForStep(step)
  const resolvedTitle =
    title ??
    (isFlashcardGold || isSessionGold
      ? 'Progresso na etapa'
      : 'Progresso no conteúdo')

  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-2xl border bg-card p-4',
        isFlashcardGold && 'border-primary/25',
        isSessionGold && 'border-amber-500/30',
        !isFlashcardGold && !isSessionGold && 'border-border',
        className,
      )}
      role="group"
      aria-label={resolvedTitle}
    >
      <span
        className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-full border bg-popover',
          isFlashcardGold && 'border-primary/40',
          isSessionGold && 'border-amber-500/40',
          !isFlashcardGold && !isSessionGold && 'border-accent/35',
        )}
      >
        <TrendingUp
          className={cn(
            'h-5 w-5',
            isFlashcardGold && 'text-primary',
            isSessionGold && 'text-amber-500',
            !isFlashcardGold && !isSessionGold && 'text-accent',
          )}
          strokeWidth={2.25}
          aria-hidden
        />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{resolvedTitle}</p>
        <div className="mt-2.5 flex items-center gap-3">
          <div
            className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted/50"
            aria-hidden
          >
            <div
              className={cn(
                'h-full rounded-full',
                isFlashcardGold && 'bg-primary',
                isSessionGold && 'bg-amber-500',
                !isFlashcardGold && !isSessionGold && 'bg-accent',
              )}
              style={{ width: `${clamped}%` }}
              role="progressbar"
              aria-valuenow={clamped}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${clamped}% concluído`}
            />
          </div>
          <span
            className={cn(
              'shrink-0 text-sm font-bold tabular-nums',
              isFlashcardGold && 'text-primary',
              isSessionGold && 'text-amber-500',
              !isFlashcardGold && !isSessionGold && 'text-accent',
            )}
          >
            {clamped}%
          </span>
        </div>
      </div>
    </div>
  )
}
