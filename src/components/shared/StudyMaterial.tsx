'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  ArrowLeft,
  BookOpen,
  Brain,
  CheckCircle,
  ExternalLink,
  FileText,
  Layers,
  Loader2,
} from 'lucide-react'
import { StudyFlowLoading } from '@/components/shared/StudyFlowLoading'
import { StudyFlashcards, StudyMaterials, Questions } from '@/types'
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
  const [isPdfLoading, setIsPdfLoading] = useState(true)
  const flashcard = flashcardsData

  useEffect(() => {
    setIsPdfLoading(Boolean(materialsData?.file_url))
  }, [materialsData?.file_url])

  async function handleFetchQuestions() {
    setIsLoadingQuestions(true)
    onQuestionsLoadingChange?.(true)

    try {
      const supabase = createClient()
      const [easy, medium, hard] = await Promise.all([
        supabase
          .from('subjects_questions')
          .select('*')
          .eq('subjects_id', subjectId)
          .eq('difficulty', 'Fácil')
          .limit(2),
        supabase
          .from('subjects_questions')
          .select('*')
          .eq('subjects_id', subjectId)
          .eq('difficulty', 'Médio')
          .limit(2),
        supabase
          .from('subjects_questions')
          .select('*')
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
        ...(easy.data ?? []),
        ...(medium.data ?? []),
        ...(hard.data ?? []),
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
          <div
            className="relative w-full bg-muted/20"
            style={{ height: 'min(70vh, 640px)' }}
          >
            {isPdfLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <StudyFlowLoading label="Carregando PDF..." size="sm" />
              </div>
            ) : null}
            {materialsData?.file_url ? (
              <iframe
                src={materialsData.file_url}
                title="Apostila de Estudo"
                onLoad={() => setIsPdfLoading(false)}
                className={cn(
                  'absolute inset-0 h-full w-full border-0 transition-opacity',
                  isPdfLoading ? 'opacity-0' : 'opacity-100',
                )}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-muted-foreground">
                PDF não disponível.
              </div>
            )}
          </div>
          <p className="border-t border-border px-4 py-2.5 text-center text-xs text-muted-foreground">
            Role para ler o PDF. Use os controles do visualizador para zoom e trocar de
            página.
          </p>
        </section>

        <div>
          <div className="mb-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <Layers className="h-3.5 w-3.5" />
            Flashcard de revisão
          </div>
          <p className="mb-3 flex items-center justify-center gap-2 text-xs text-chart-2">
            <span>●</span> Toque no card para revelar <span>●</span>
          </p>
          <div style={{ perspective: '1000px' }}>
            <button
              type="button"
              onClick={() => setFlashcardFlipped((v) => !v)}
              disabled={isLoadingQuestions}
              className="w-full cursor-pointer border-0 bg-transparent p-0 text-left disabled:opacity-60"
            >
              <div
                style={{
                  transition: 'transform 0.6s',
                  transformStyle: 'preserve-3d',
                  transform: flashcardFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  position: 'relative',
                  minHeight: '140px',
                }}
              >
                <div
                  style={{ backfaceVisibility: 'hidden' }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-8"
                >
                  <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-primary">
                    <Brain className="h-3 w-3" />
                    Pergunta
                  </span>
                  <p className="max-w-lg text-center text-sm font-bold leading-snug text-foreground">
                    {flashcard?.front}
                  </p>
                  <span className="text-xl">👆</span>
                </div>
                <div
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    background:
                      'linear-gradient(135deg, rgba(46,204,138,0.08), rgba(46,204,138,0.04))',
                  }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl border border-chart-2/30 p-8"
                >
                  <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-chart-2">
                    <CheckCircle className="h-3 w-3" />
                    Resposta
                  </span>
                  <p className="max-w-lg text-center text-sm leading-relaxed text-foreground">
                    {flashcard?.back}
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
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
