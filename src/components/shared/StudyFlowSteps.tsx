'use client'

import { BookOpen, Check, FileText, Layers } from 'lucide-react'
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

  return (
    <nav
      aria-label="Etapas do Estudo Inteligente"
      className={cn('flex w-full justify-center py-2', className)}
    >
      <ol className="flex max-w-full items-start">
        {FLOW_STEPS.map((step, index) => {
          const status = getStatus(index, activeIndex, allCompleted)
          const isLast = index === FLOW_STEPS.length - 1
          const { Icon } = step

          const lineBeforeGreen =
            index > 0 && (allCompleted || index - 1 < activeIndex)
          const lineAfterGreen =
            !isLast && (allCompleted || index < activeIndex)

          return (
            <li key={step.id} className="flex items-start">
              {index > 0 ? (
                <div
                  className={cn(
                    'mt-[13px] h-0.5 w-5 shrink-0 rounded-full transition-colors duration-300 sm:w-7',
                    lineBeforeGreen ? 'bg-chart-2' : 'bg-border',
                  )}
                  aria-hidden
                />
              ) : null}

              <div className="flex w-[4.25rem] shrink-0 flex-col items-center sm:w-[4.75rem] my-2">
                <div
                  className={cn(
                    'relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300 sm:h-8 sm:w-8',
                    status === 'completed' &&
                      'border-chart-2 bg-chart-2 text-white shadow-[0_0_10px_rgba(46,204,138,0.4)]',
                    status === 'active' &&
                      'border-primary bg-primary text-primary-foreground shadow-[0_0_12px_rgba(61,127,255,0.45)]',
                    status === 'pending' &&
                      'border-border/80 bg-muted/30 text-muted-foreground',
                  )}
                >
                  {status === 'completed' ? (
                    <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={3} />
                  ) : (
                    <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  )}
                </div>

                <div className="relative mt-1.5 flex flex-col items-center">
                  <span
                    className={cn(
                      'max-w-full text-center text-[9px] font-bold leading-tight transition-colors sm:text-[10px]',
                      status === 'completed' && 'text-chart-2',
                      status === 'active' && 'text-primary',
                      status === 'pending' && 'text-muted-foreground',
                    )}
                  >
                    {step.label}
                  </span>
                  {status === 'active' && !allCompleted ? (
                    <span
                      className="mt-1 block h-0 w-0 border-x-[4px] border-t-[5px] border-x-transparent border-t-primary"
                      aria-hidden
                    />
                  ) : null}
                </div>
              </div>

              {!isLast ? (
                <div
                  className={cn(
                    'mt-[13px] h-0.5 w-5 shrink-0 rounded-full transition-colors duration-300 sm:w-7',
                    lineAfterGreen ? 'bg-chart-2' : 'bg-border',
                  )}
                  aria-hidden
                />
              ) : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
