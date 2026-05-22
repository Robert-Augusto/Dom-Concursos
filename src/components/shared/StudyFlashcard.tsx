'use client'

import { useEffect, useState } from 'react'
import {
  Brain,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Layers,
  Loader2,
} from 'lucide-react'
import { StudyFlashcards, Questions } from '@/types'
import {
  mapQuestionWithBanca,
  QUESTIONS_WITH_BANCA_SELECT,
} from '@/lib/lib-questions'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export interface StudyFlashcardProps {
  flashcardsData: StudyFlashcards[]
  subjectId: string
  onContinue: (questions: Questions[]) => void
  onQuestionsLoadingChange?: (loading: boolean) => void
}

const FLASHCARD_FACE_STYLE = {
  backfaceVisibility: 'hidden' as const,
  WebkitBackfaceVisibility: 'hidden' as const,
}

function FlashcardFaceContent({
  side,
  text,
  className,
}: {
  side: 'front' | 'back'
  text: string
  className?: string
}) {
  const isBack = side === 'back'

  return (
    <div
      className={cn(
        'flex w-full flex-col items-center gap-4 p-5 sm:gap-5 sm:p-7',
        className,
      )}
    >
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-sm',
          isBack
            ? 'border-emerald-300/50 text-white'
            : 'border-blue-300/50 text-white',
        )}
        style={
          isBack
            ? {
                background:
                  'linear-gradient(135deg, rgba(46,204,138,0.95) 0%, rgba(16,185,129,0.85) 100%)',
                boxShadow: '0 4px 16px rgba(46,204,138,0.45)',
              }
            : {
                background:
                  'linear-gradient(135deg, #3D7FFF 0%, #6366F1 55%, #5A9FFF 100%)',
                boxShadow: '0 4px 16px rgba(61,127,255,0.5)',
              }
        }
      >
        {isBack ? (
          <>
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Resposta
          </>
        ) : (
          <>
            <Brain className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Pergunta
          </>
        )}
      </span>

      <p
        className={cn(
          'w-full text-center leading-relaxed',
          isBack
            ? 'text-sm text-emerald-50/95 sm:text-base'
            : 'text-sm font-bold text-white sm:text-base',
        )}
      >
        {text}
      </p>
    </div>
  )
}

function FlipFlashcard({
  flashcard,
  isFlipped,
  onToggleFlip,
  disabled,
}: {
  flashcard: StudyFlashcards
  isFlipped: boolean
  onToggleFlip: () => void
  disabled?: boolean
}) {
  return (
    <div
      className="mx-auto w-full max-w-lg isolate overflow-visible"
      style={{ perspective: '1200px' }}
    >
      <button
        type="button"
        onClick={onToggleFlip}
        disabled={disabled}
        aria-label={
          isFlipped
            ? 'Mostrar pergunta do flashcard'
            : 'Revelar resposta do flashcard'
        }
        className="group block w-full cursor-pointer border-0 bg-transparent p-0 text-left outline-none transition-transform duration-300 hover:scale-[1.01] active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60"
      >
        <div className="grid w-full [grid-template-areas:'stack']">
          <FlashcardFaceContent
            side="front"
            text={flashcard.front}
            className="[grid-area:stack] invisible pointer-events-none select-none"
          />
          <FlashcardFaceContent
            side="back"
            text={flashcard.back}
            className="[grid-area:stack] invisible pointer-events-none select-none"
          />

          <div
            className="[grid-area:stack] relative h-full w-full min-h-[10rem]"
            style={{
              transformStyle: 'preserve-3d',
              transition: 'transform 0.65s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            <div
              className="absolute inset-0 overflow-hidden rounded-2xl border-2 border-blue-400/30 ring-1 ring-blue-400/20"
              style={{
                ...FLASHCARD_FACE_STYLE,
                background:
                  'linear-gradient(145deg, rgba(61,127,255,0.35) 0%, rgba(99,102,241,0.22) 35%, rgba(15,23,42,0.92) 100%)',
                boxShadow:
                  '0 0 0 1px rgba(96,165,250,0.15), 0 12px 40px rgba(61,127,255,0.35), 0 4px 24px rgba(99,102,241,0.2)',
              }}
            >
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-blue-400/30 blur-3xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-indigo-500/25 blur-2xl"
                aria-hidden
              />
              <FlashcardFaceContent
                side="front"
                text={flashcard.front}
                className="relative z-10"
              />
            </div>

            <div
              className="absolute inset-0 overflow-hidden rounded-2xl border-2 border-emerald-400/35 ring-1 ring-emerald-400/25"
              style={{
                ...FLASHCARD_FACE_STYLE,
                transform: 'rotateY(180deg)',
                background:
                  'linear-gradient(145deg, rgba(46,204,138,0.38) 0%, rgba(16,185,129,0.25) 40%, rgba(6,78,59,0.92) 100%)',
                boxShadow:
                  '0 0 0 1px rgba(52,211,153,0.2), 0 12px 40px rgba(46,204,138,0.35), 0 4px 24px rgba(16,185,129,0.2)',
              }}
            >
              <div
                className="pointer-events-none absolute -left-10 -top-8 h-32 w-32 rounded-full bg-emerald-400/35 blur-3xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -bottom-10 -right-6 h-28 w-28 rounded-full bg-teal-400/20 blur-2xl"
                aria-hidden
              />
              <FlashcardFaceContent
                side="back"
                text={flashcard.back}
                className="relative z-10"
              />
            </div>
          </div>
        </div>
      </button>
    </div>
  )
}

export default function StudyFlashcard({
  flashcardsData,
  subjectId,
  onContinue,
  onQuestionsLoadingChange,
}: StudyFlashcardProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [flippedById, setFlippedById] = useState<Record<string, boolean>>({})
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)

  const flashcards = flashcardsData
  const total = flashcards.length
  const current = flashcards[activeIndex]
  const isLast = activeIndex >= total - 1
  const isFlipped = current ? Boolean(flippedById[current.id]) : false

  useEffect(() => {
    setActiveIndex(0)
    setFlippedById({})
  }, [flashcardsData])

  function goToIndex(next: number) {
    setActiveIndex(next)
  }

  function toggleFlip() {
    if (!current) return
    setFlippedById((prev) => ({
      ...prev,
      [current.id]: !prev[current.id],
    }))
  }

  async function handleFetchQuestions() {
    setIsLoadingQuestions(true)
    onQuestionsLoadingChange?.(true)

    try {
      const supabase = createClient()
      const [easy, medium, hard] = await Promise.all([
        supabase
          .from('subjects_questions')
          .select(QUESTIONS_WITH_BANCA_SELECT)
          .eq('subjects_id', subjectId)
          .eq('difficulty', 'Fácil')
          .limit(2),
        supabase
          .from('subjects_questions')
          .select(QUESTIONS_WITH_BANCA_SELECT)
          .eq('subjects_id', subjectId)
          .eq('difficulty', 'Médio')
          .limit(2),
        supabase
          .from('subjects_questions')
          .select(QUESTIONS_WITH_BANCA_SELECT)
          .eq('subjects_id', subjectId)
          .eq('difficulty', 'Difícil')
          .limit(2),
      ])

      if (easy.error) {
        toast.error(easy.error.message)
        return
      }
      if (medium.error) {
        toast.error(medium.error.message)
        return
      }
      if (hard.error) {
        toast.error(hard.error.message)
        return
      }

      const fetchedQuestions = [
        ...(easy.data ?? []).map((row) => mapQuestionWithBanca(row)),
        ...(medium.data ?? []).map((row) => mapQuestionWithBanca(row)),
        ...(hard.data ?? []).map((row) => mapQuestionWithBanca(row)),
      ]

      if (fetchedQuestions.length === 0) {
        toast.error('Nenhuma questão cadastrada para este assunto.')
        return
      }

      onContinue(fetchedQuestions)
    } finally {
      setIsLoadingQuestions(false)
      onQuestionsLoadingChange?.(false)
    }
  }

  if (total === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Nenhum flashcard disponível.
      </p>
    )
  }

  return (
    <div className="flex min-h-0 flex-col pb-24">
      <section
        className="overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-[0_12px_40px_rgba(61,127,255,0.08)]"
        style={{
          background:
            'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--card)) 70%, rgba(61,127,255,0.04) 100%)',
        }}
      >
        <div className="relative overflow-hidden border-b border-primary/15 px-4 py-3">
          <div
            className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-primary/25 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-6 left-0 h-20 w-20 rounded-full bg-chart-2/15 blur-2xl"
            aria-hidden
          />
          <div className="relative flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, #3D7FFF, #5A9FFF)',
                  boxShadow: '0 4px 14px rgba(61,127,255,0.35)',
                }}
              >
                <Layers className="h-4 w-4 text-white" aria-hidden />
              </span>
              <div className="min-w-0">
                <h2 className="text-sm font-black text-foreground">
                  Flashcards de revisão
                </h2>
                <p className="text-[10px] text-muted-foreground">
                  {activeIndex + 1} de {total} · Toque no card para virar
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-5 sm:px-6 sm:py-6">
          {current ? (
            <FlipFlashcard
              key={current.id}
              flashcard={current}
              isFlipped={isFlipped}
              onToggleFlip={toggleFlip}
              disabled={isLoadingQuestions}
            />
          ) : null}

          {total > 1 ? (
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={activeIndex === 0 || isLoadingQuestions}
                onClick={() => goToIndex(activeIndex - 1)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                aria-label="Flashcard anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2">
                {flashcards.map((card, index) => (
                  <button
                    key={card.id}
                    type="button"
                    disabled={isLoadingQuestions}
                    onClick={() => goToIndex(index)}
                    aria-label={`Flashcard ${index + 1}`}
                    className={cn(
                      'h-2.5 rounded-full transition-all',
                      index === activeIndex
                        ? 'w-8 bg-primary'
                        : 'w-2.5 bg-muted-foreground/35 hover:bg-muted-foreground/55',
                    )}
                  />
                ))}
              </div>
              <button
                type="button"
                disabled={isLast || isLoadingQuestions}
                onClick={() => goToIndex(activeIndex + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                aria-label="Próximo flashcard"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-background/95 p-4 backdrop-blur-sm lg:left-[240px]">
  <div className="mx-auto w-full max-w-3xl">
    {isLast ? (
      <button
        type="button"
        disabled={isLoadingQuestions}
        onClick={() => void handleFetchQuestions()}
        className={cn(
          'flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-black transition-all',
          isLoadingQuestions
            ? 'cursor-not-allowed bg-muted text-muted-foreground'
            : 'text-white hover:opacity-90',
        )}
        style={
          isLoadingQuestions
            ? undefined
            : {
                background: 'linear-gradient(90deg, #3D7FFF, #5A9FFF)',
                boxShadow: '0 6px 20px rgba(61,127,255,0.4)',
              }
        }
      >
        {isLoadingQuestions ? (
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        ) : null}
        {isLoadingQuestions ? 'Carregando questões...' : 'Responder Questões'}
      </button>
    ) : (
      <button
        type="button"
        disabled={isLoadingQuestions}
        onClick={() => goToIndex(activeIndex + 1)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/40 bg-primary/10 py-4 text-base font-black text-primary transition-colors hover:bg-primary/15"
      >
        Próximo flashcard
        <ChevronRight className="h-5 w-5" />
      </button>
    )}
  </div>
</div>
    </div>
  )
}
