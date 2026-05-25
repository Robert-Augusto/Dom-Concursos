'use client'

import { BookOpen, Check, FileText, Layers, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

export type StudyFlowStepId = 'material' | 'flashcard' | 'session'

const FLOW_STEPS: {
  id: StudyFlowStepId
  label: string
  Icon: typeof BookOpen
}[] = [
  { id: 'material', label: 'Estudo Teórico', Icon: BookOpen },
  { id: 'flashcard', label: 'Flashcards', Icon: Layers },
  { id: 'session', label: 'Questões', Icon: FileText },
]

function stepIndex(id: StudyFlowStepId) {
  return FLOW_STEPS.findIndex((s) => s.id === id)
}

type StepStatus = 'completed' | 'active' | 'pending'

function getStatus(
  index: number,
  activeIndex: number,
  allCompleted: boolean,
): StepStatus {
  if (allCompleted) return 'completed'
  if (index < activeIndex) return 'completed'
  if (index === activeIndex) return 'active'
  return 'pending'
}

export interface StudyFlowStepsProps {
  activeStep: StudyFlowStepId
  allCompleted?: boolean
  className?: string
}

export default function StudyFlowSteps({
  activeStep,
  allCompleted = false,
  className,
}: StudyFlowStepsProps) {
  const activeIndex = stepIndex(activeStep)
  const isGoldFlashcardStep = activeStep === 'flashcard' && !allCompleted
  const isAmberSessionStep = activeStep === 'session' && !allCompleted

  const activeColorClass = allCompleted
    ? 'bg-chart-2'
    : isGoldFlashcardStep
      ? 'bg-primary'
      : isAmberSessionStep
        ? 'bg-amber-500'
        : 'bg-accent'

  const gradientClass = isAmberSessionStep
    ? 'bg-gradient-to-r from-amber-500 via-amber-500/45 to-border'
    : isGoldFlashcardStep
      ? 'bg-gradient-to-r from-primary via-primary/45 to-border'
      : null

  function connectorBaseClass(fromIdx: number, toIdx: number): string {
    if (allCompleted) return 'bg-chart-2'
    if (fromIdx < activeIndex && toIdx < activeIndex) return 'bg-chart-2'
    if (fromIdx < activeIndex && toIdx === activeIndex) return activeColorClass
    if (activeIndex === 0 && fromIdx === 0 && toIdx === 1) {
      return activeColorClass
    }
    return 'bg-border'
  }

  function leftConnectorClass(stepIdx: number): string {
    return connectorBaseClass(stepIdx - 1, stepIdx)
  }

  function rightConnectorClass(stepIdx: number): string {
    const fromIdx = stepIdx
    const toIdx = stepIdx + 1
    if (
      fromIdx === activeIndex &&
      toIdx > activeIndex &&
      gradientClass
    ) {
      return gradientClass
    }
    return connectorBaseClass(fromIdx, toIdx)
  }

  return (
    <nav
      aria-label="Etapas do Estudo Inteligente"
      className={cn('flex w-full justify-center py-3', className)}
    >
      <ol className="flex w-full max-w-lg items-start px-1 sm:px-2">
        {FLOW_STEPS.map((step, index) => {
          const status = getStatus(index, activeIndex, allCompleted)
          const isFirst = index === 0
          const isLast = index === FLOW_STEPS.length - 1
          const { Icon } = step

          return (
            <li key={step.id} className="flex min-w-0 flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                <div
                  className={cn(
                    'h-0.5 min-w-0 flex-1 rounded-full transition-colors duration-300',
                    isFirst ? 'invisible' : leftConnectorClass(index),
                  )}
                  aria-hidden
                />

                <div
                  className={cn(
                    'relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-all duration-300 sm:h-12 sm:w-12',
                    status === 'completed' &&
                      'border-2 border-chart-2 bg-popover text-chart-2 shadow-[0_0_0_2px_rgba(46,204,138,0.2),0_0_16px_rgba(46,204,138,0.35)]',
                    status === 'active' &&
                      !isGoldFlashcardStep &&
                      !isAmberSessionStep &&
                      'border-2 border-accent bg-popover text-foreground shadow-[0_0_0_3px_rgba(61,127,255,0.35),0_0_20px_rgba(61,127,255,0.45)]',
                    status === 'active' &&
                      isGoldFlashcardStep &&
                      'border-2 border-primary bg-popover text-primary shadow-[0_0_0_3px_rgba(201,168,76,0.35),0_0_22px_rgba(201,168,76,0.5)]',
                    status === 'active' &&
                      isAmberSessionStep &&
                      'border-2 border-amber-500 bg-popover text-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.35),0_0_22px_rgba(245,158,11,0.5)]',
                    status === 'pending' &&
                      'border border-border/80 bg-muted/25 text-muted-foreground',
                  )}
                >
                  {status === 'completed' ? (
                    <Check className="h-6 w-6 sm:h-[20px] sm:w-[20px]" strokeWidth={2.5} />
                  ) : (
                    <Icon className="h-6 w-6 sm:h-[20px] sm:w-[20px]" strokeWidth={2} />
                  )}
                </div>

                <div
                  className={cn(
                    'h-0.5 min-w-0 flex-1 rounded-full transition-colors duration-300',
                    isLast ? 'invisible' : rightConnectorClass(index),
                  )}
                  aria-hidden
                />
              </div>

              <span
                className={cn(
                  'mt-2 max-w-full text-center text-[11px] font-bold leading-tight transition-colors sm:text-xs',
                  status === 'completed' && 'text-chart-2',
                  status === 'active' &&
                    (isGoldFlashcardStep
                      ? 'text-primary'
                      : isAmberSessionStep
                        ? 'text-amber-500'
                        : 'text-accent'),
                  status === 'pending' && 'text-muted-foreground',
                )}
              >
                {step.label}
              </span>

              {status === 'active' && !allCompleted ? (
                <span
                  className={cn(
                    'mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold',
                    isGoldFlashcardStep
                      ? 'border-primary/35 bg-primary/10 text-primary'
                      : isAmberSessionStep
                        ? 'border-amber-500/35 bg-amber-500/10 text-amber-500'
                        : 'border-accent/30 bg-accent/10 text-accent',
                  )}
                >
                  <span
                    className={cn(
                      'h-1.5 w-1.5 shrink-0 rounded-full',
                      isGoldFlashcardStep
                        ? 'bg-primary'
                        : isAmberSessionStep
                          ? 'bg-amber-500'
                          : 'bg-accent',
                    )}
                    aria-hidden
                  />
                  Em andamento
                </span>
              ) : null}

              {status === 'completed' ? (
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-chart-2/30 bg-chart-2/10 px-2.5 py-1 text-[10px] font-semibold text-chart-2">
                  <Check className="h-3 w-3 shrink-0" aria-hidden />
                  Concluído
                </span>
              ) : null}

              {status === 'pending' ? (
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
                  <Lock className="h-3 w-3 shrink-0 opacity-80" aria-hidden />
                  Próxima etapa
                </span>
              ) : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
