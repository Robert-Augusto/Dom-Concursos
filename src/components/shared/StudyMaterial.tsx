'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  BookOpen,
  Brain,
  CheckCircle2,
  ExternalLink,
  FileText,
  Layers,
  Loader2,
  RotateCw,
  Sparkles,
} from 'lucide-react'
import { StudyFlowLoading } from '@/components/shared/StudyFlowLoading'

const PdfViewer = dynamic(() => import('@/components/shared/PdfViewer'), {
  ssr: false,
  loading: () => (
    <div
      className="flex items-center justify-center bg-muted/20"
      style={{ height: 'min(70vh, 640px)' }}
    >
      <StudyFlowLoading label="Carregando PDF..." size="sm" />
    </div>
  ),
})
import { StudyFlashcards, StudyMaterials, Questions } from '@/types'
import {
  mapQuestionWithBanca,
  QUESTIONS_WITH_BANCA_SELECT,
} from '@/lib/lib-questions'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export interface StudyMaterialProps {
  subjectName: string
  subjectId: string
  rootSubjectName: string
  flashcardsData: StudyFlashcards | null
  materialsData: StudyMaterials | null
  onContinue: (questions: Questions[]) => void
  onBack: () => void
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
          'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest',
          isBack
            ? 'border-chart-2/40 bg-chart-2/15 text-chart-2'
            : 'border-primary/30 bg-primary/10 text-primary',
        )}
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
          'w-full text-center leading-relaxed text-foreground',
          isBack ? 'text-sm sm:text-base' : 'text-sm font-bold sm:text-base',
        )}
      >
        {text}
      </p>

      <span className="inline-flex max-w-full items-center justify-center gap-1.5 rounded-full border border-border bg-background/90 px-3 py-2 text-xs font-semibold text-muted-foreground">
        <RotateCw className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span className="truncate">
          {isBack ? 'Ver pergunta novamente' : 'Revelar resposta'}
        </span>
      </span>
    </div>
  )
}

export default function StudyMaterial({
  subjectName,
  subjectId,
  rootSubjectName,
  flashcardsData,
  materialsData,
  onContinue,
  onBack,
  onQuestionsLoadingChange,
}: StudyMaterialProps) {
  const [flashcardFlipped, setFlashcardFlipped] = useState(false)
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)
  const flashcard = flashcardsData

  useEffect(() => {
    setFlashcardFlipped(false)
  }, [flashcard?.id, flashcard?.front])

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
  
  return (
    <div className="flex min-h-0 flex-col">
      <div className="sticky top-0 z-10 flex shrink-0 items-center gap-3 border-b border-border bg-background px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoadingQuestions}
          className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
        >
          <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
          Voltar
        </button>
        <span className="shrink-0 text-border">·</span>
        <span className="truncate text-xs text-muted-foreground">
          {rootSubjectName} → {subjectName}
        </span>
      </div>

      <div className="flex flex-col gap-6 pb-24 pt-4">
        <div className="flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          <BookOpen className="h-3.5 w-3.5" />
          Material de estudo
        </div>

        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" aria-hidden />
              <h2 className="text-sm font-black text-foreground">
                Documento de Estudo
              </h2>
            </div>
            <a
              href={materialsData?.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              Abrir em nova aba
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          </div>
          <PdfViewer url={materialsData?.file_url ?? ''} title="Apostila de Estudo" />
          <p className="border-t border-border px-4 py-2.5 text-center text-xs text-muted-foreground">
            Role para ler o PDF. Use os controles do visualizador para zoom e trocar de
            página.
          </p>
        </section>

        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="relative overflow-hidden border-b border-border px-4 py-3">
            <div
              className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl"
              aria-hidden
            />
            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                    Flashcard de revisão
                  </h2>
                  <p className="text-[10px] text-muted-foreground">
                    Fixe o conceito antes das questões
                  </p>
                </div>
              </div>
              <div
                className="flex shrink-0 items-center gap-1 self-center rounded-full border border-border bg-background/80 p-1 sm:self-auto"
                aria-hidden
              >
                <span
                  className={cn(
                    'rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide transition-colors',
                    !flashcardFlipped
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground',
                  )}
                >
                  Pergunta
                </span>
                <span
                  className={cn(
                    'rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide transition-colors',
                    flashcardFlipped
                      ? 'bg-chart-2 text-white'
                      : 'text-muted-foreground',
                  )}
                >
                  Resposta
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4 px-4 py-4 sm:px-6 sm:py-5">
            <p className="flex items-center justify-center gap-2 text-center text-xs leading-snug text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
              <span>
                Toque no card para{' '}
                {flashcardFlipped ? 'ver a pergunta' : 'revelar a resposta'}
              </span>
              <RotateCw
                className={cn(
                  'h-3.5 w-3.5 shrink-0 text-primary transition-transform duration-300',
                  flashcardFlipped && 'rotate-180',
                )}
                aria-hidden
              />
            </p>

            <div
              className="mx-auto w-full max-w-lg isolate overflow-hidden"
              style={{ perspective: '1200px' }}
            >
              <button
                type="button"
                onClick={() => setFlashcardFlipped((v) => !v)}
                disabled={isLoadingQuestions || !flashcard}
                aria-label={
                  flashcardFlipped
                    ? 'Mostrar pergunta do flashcard'
                    : 'Revelar resposta do flashcard'
                }
                className="group block w-full cursor-pointer border-0 bg-transparent p-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60"
              >
                <div className="grid w-full [grid-template-areas:'stack']">
                  {/* Invisible sizers — grid cell height = max(front, back) */}
                  <FlashcardFaceContent
                    side="front"
                    text={flashcard?.front ?? '—'}
                    className="[grid-area:stack] invisible pointer-events-none select-none"
                  />
                  <FlashcardFaceContent
                    side="back"
                    text={flashcard?.back ?? '—'}
                    className="[grid-area:stack] invisible pointer-events-none select-none"
                  />

                  <div
                    className="[grid-area:stack] relative h-full w-full min-h-[10rem]"
                    style={{
                      transformStyle: 'preserve-3d',
                      transition:
                        'transform 0.65s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: flashcardFlipped
                        ? 'rotateY(180deg)'
                        : 'rotateY(0deg)',
                    }}
                  >
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-primary/25"
                      style={{
                        ...FLASHCARD_FACE_STYLE,
                        background:
                          'linear-gradient(145deg, rgba(61,127,255,0.12) 0%, rgba(61,127,255,0.03) 50%, hsl(var(--card)) 100%)',
                        boxShadow: '0 8px 28px rgba(61,127,255,0.1)',
                      }}
                    >
                      <FlashcardFaceContent
                        side="front"
                        text={flashcard?.front ?? '—'}
                        className="group-hover:[&_span:last-child]:text-primary"
                      />
                    </div>

                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-chart-2/35"
                      style={{
                        ...FLASHCARD_FACE_STYLE,
                        transform: 'rotateY(180deg)',
                        background:
                          'linear-gradient(145deg, rgba(46,204,138,0.14) 0%, rgba(46,204,138,0.04) 50%, hsl(var(--card)) 100%)',
                        boxShadow: '0 8px 28px rgba(46,204,138,0.12)',
                      }}
                    >
                      <FlashcardFaceContent
                        side="back"
                        text={flashcard?.back ?? '—'}
                        className="group-hover:[&_span:last-child]:text-chart-2"
                      />
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <p className="border-t border-border px-4 py-2.5 text-center text-xs text-muted-foreground">
            Revise o flashcard com calma antes de seguir para as questões.
          </p>
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-background/95 p-4 backdrop-blur-sm">
        <button
          type="button"
          disabled={isLoadingQuestions}
          onClick={() => void handleFetchQuestions()}
          className={cn(
            'mx-auto flex w-full max-w-3xl items-center justify-center gap-2 rounded-2xl py-4 text-base font-black transition-all',
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
      </div>
    </div>
  )
}
