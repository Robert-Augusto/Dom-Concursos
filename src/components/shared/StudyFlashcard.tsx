'use client'

import { useEffect, useState } from 'react'
import {
  ClipboardList,
  Hand,
  Layers,
  Lightbulb,
  Loader2,
  Sparkles,
} from 'lucide-react'
import StudyContentProgress from '@/components/shared/StudyContentProgress'
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
  onFlippedCountChange?: (flippedCount: number) => void
}

const FLASHCARD_FACE_STYLE = {
  backfaceVisibility: 'hidden' as const,
  WebkitBackfaceVisibility: 'hidden' as const,
}

function FlashcardFaceContent({
  side,
  index,
  total,
  text,
  className,
}: {
  side: 'front' | 'back'
  index: number
  total: number
  text: string
  className?: string
}) {
  const isBack = side === 'back'

  return (
    <div
      className={cn(
        'flex w-full flex-col items-center px-6 py-8 sm:px-8 sm:py-10',
        className,
      )}
    >
      <p
        className={cn(
          'text-[10px] font-black uppercase tracking-[0.2em]',
          isBack ? 'text-primary-foreground/75' : 'text-primary/85',
        )}
      >
        Flashcard {index + 1} de {total}
      </p>

      <span
        className={cn(
          'mt-3 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[10px] font-semibold',
          isBack
            ? 'border-primary-foreground/35 text-primary-foreground'
            : 'border-primary/45 text-primary',
        )}
      >
        <Hand className="h-3.5 w-3.5 shrink-0" aria-hidden />
        {isBack
          ? 'Clique aqui para voltar ao card'
          : 'Clique aqui para virar o card'}
      </span>

      <p
        className={cn(
          'mt-8 w-full max-w-md text-center text-base leading-relaxed sm:text-lg sm:leading-relaxed',
          isBack
            ? 'font-medium text-primary-foreground'
            : 'font-semibold text-foreground',
        )}
      >
        {text}
      </p>
    </div>
  )
}

function FlipFlashcard({
  flashcard,
  index,
  total,
  isFlipped,
  onToggleFlip,
  disabled,
}: {
  flashcard: StudyFlashcards
  index: number
  total: number
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
            index={index}
            total={total}
            text={flashcard.front}
            className="[grid-area:stack] invisible pointer-events-none select-none"
          />
          <FlashcardFaceContent
            side="back"
            index={index}
            total={total}
            text={flashcard.back}
            className="[grid-area:stack] invisible pointer-events-none select-none"
          />

          <div
            className="[grid-area:stack] relative h-full w-full"
            style={{
              transformStyle: 'preserve-3d',
              transition: 'transform 0.65s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            <div
              className="absolute inset-0 overflow-hidden rounded-3xl border border-primary/35 shadow-[0_0_0_1px_rgba(201,168,76,0.08),0_8px_32px_rgba(0,0,0,0.45)]"
              style={{
                ...FLASHCARD_FACE_STYLE,
                background:
                  'radial-gradient(circle at 22% 18%, rgba(201,168,76,0.12) 0%, transparent 55%), linear-gradient(155deg, #14110A 0%, #0B0A07 100%)',
              }}
            >
              <FlashcardFaceContent
                side="front"
                index={index}
                total={total}
                text={flashcard.front}
              />
            </div>

            <div
              className="absolute inset-0 overflow-hidden rounded-3xl border border-primary/70 bg-primary shadow-[0_8px_32px_rgba(201,168,76,0.35)]"
              style={{
                ...FLASHCARD_FACE_STYLE,
                transform: 'rotateY(180deg)',
              }}
            >
              <FlashcardFaceContent
                side="back"
                index={index}
                total={total}
                text={flashcard.back}
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
  onFlippedCountChange,
}: StudyFlashcardProps) {
  const [flippedById, setFlippedById] = useState<Record<string, boolean>>({})
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)

  const flashcards = flashcardsData
  const total = flashcards.length
  const flippedCount = Object.values(flippedById).filter(Boolean).length
  const hasFlippedAtLeastOne = flippedCount > 0
  const canContinue = hasFlippedAtLeastOne && !isLoadingQuestions

  useEffect(() => {
    setFlippedById({})
  }, [flashcardsData])

  useEffect(() => {
    onFlippedCountChange?.(flippedCount)
  }, [flippedCount, onFlippedCountChange])

  function toggleFlip(id: string) {
    setFlippedById((prev) => ({
      ...prev,
      [id]: !prev[id],
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
    <div className="flex min-h-0 flex-col gap-4 pb-24">
      <StudyContentProgress step="flashcard" />

      <section
        className="relative overflow-hidden rounded-2xl border border-primary/30 bg-card px-4 py-4 sm:px-5 sm:py-5"
        style={{
          background:
            'linear-gradient(135deg, rgba(201,168,76,0.1) 0%, rgba(201,168,76,0.03) 50%, hsl(var(--card)) 100%)',
        }}
      >
        <div
          className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-primary/20 blur-3xl"
          aria-hidden
        />
        <div className="relative flex items-center gap-3 sm:gap-4">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/35 bg-primary/15"
            style={{ boxShadow: '0 4px 14px rgba(201,168,76,0.25)' }}
          >
            <Layers className="h-5 w-5 text-primary" strokeWidth={2.25} aria-hidden />
          </span>
          <p className="min-w-0 flex-1 text-sm leading-relaxed text-foreground sm:text-[15px]">
            Você está revisando{' '}
            <span className="font-bold text-primary">
              {total} {total === 1 ? 'flashcard' : 'flashcards'}
            </span>
            . Toque em cada card para virar.
          </p>
          <span
            className="hidden shrink-0 sm:flex sm:items-center sm:gap-1"
            aria-hidden
          >
            <span className="flex h-10 w-8 -rotate-6 items-center justify-center rounded-lg border border-primary/40 bg-primary/15">
              <Sparkles className="h-4 w-4 text-primary" />
            </span>
            <span className="flex h-10 w-8 rotate-6 items-center justify-center rounded-lg border border-primary/35 bg-primary/10">
              <Layers className="h-4 w-4 text-primary/80" />
            </span>
          </span>
        </div>
      </section>

      <div className="flex flex-col gap-8">
        {flashcards.map((flashcard, index) => (
          <FlipFlashcard
            key={flashcard.id}
            flashcard={flashcard}
            index={index}
            total={total}
            isFlipped={Boolean(flippedById[flashcard.id])}
            onToggleFlip={() => toggleFlip(flashcard.id)}
            disabled={isLoadingQuestions}
          />
        ))}
      </div>

      <aside
        className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card px-5 py-5 sm:px-6 sm:py-6"
        style={{
          background:
            'linear-gradient(135deg, rgba(201,168,76,0.12) 0%, rgba(201,168,76,0.05) 45%, hsl(var(--card)) 100%)',
        }}
        aria-label="Dica de estudo"
      >
        <div
          className="pointer-events-none absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-primary"
          aria-hidden
        />
        <div className="flex gap-4 sm:gap-5">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-primary/25 sm:h-12 sm:w-12"
            style={{
              background:
                'linear-gradient(145deg, rgba(201,168,76,0.22), rgba(201,168,76,0.08))',
            }}
          >
            <Lightbulb className="h-5 w-5 text-primary sm:h-6 sm:w-6" aria-hidden />
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-primary">
              💡 Dica
            </span>
            <p className="mt-3 text-[15px] leading-[1.8] text-foreground sm:text-base sm:leading-[1.85]">
              Quer fixar de verdade? Escreva os conceitos à mão em papéis ou
              Post-its e cole em lugares visíveis da sua casa como:{' '}
              <span className="font-semibold text-primary">
                espelho, geladeira, porta do banheiro
              </span>
              . Revisar enquanto faz outras coisas é uma das técnicas mais
              poderosas para memorizar.
            </p>
          </div>
        </div>
      </aside>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-background/95 p-4 backdrop-blur-sm lg:left-[240px]">
        <div className="mx-auto w-full max-w-3xl">
          <button
            type="button"
            disabled={!canContinue}
            onClick={() => void handleFetchQuestions()}
            className={cn(
              'flex w-full items-center justify-center gap-2.5 rounded-2xl py-4 text-base font-black transition-all',
              canContinue
                ? 'bg-primary text-primary-foreground hover:brightness-110'
                : 'cursor-not-allowed bg-muted text-muted-foreground',
            )}
            style={
              canContinue
                ? { boxShadow: '0 6px 24px rgba(201,168,76,0.45)' }
                : undefined
            }
          >
            {isLoadingQuestions && (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            )}
            <span className="flex-1 text-center">
              {isLoadingQuestions ? 'Carregando questões...' : 'Responder Questões'}
            </span>
          </button>
          {!hasFlippedAtLeastOne && !isLoadingQuestions ? (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Vire pelo menos um flashcard para continuar
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
