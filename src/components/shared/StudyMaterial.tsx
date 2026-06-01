'use client'

import { useEffect, useMemo, useState } from 'react'
import { BookOpen, Loader2 } from 'lucide-react'
import StudyContentProgress from '@/components/shared/StudyContentProgress'
import { StudyFlowLoading } from '@/components/shared/StudyFlowLoading'
import { GetStudyQuestionsBySubject } from '@/lib/lib-questions'
import {
  GetStudyMaterialsAgentBySubject,
  wrapAgentHtmlForIframe,
} from '@/lib/study_material'
import type { Questions } from '@/types'
import { toast } from 'sonner'

export interface StudyMaterialProps {
  subjectId: string
  onContinue: (questions: Questions[]) => void
  onQuestionsLoadingChange?: (loading: boolean) => void
}

export default function StudyMaterial({
  subjectId,
  onContinue,
  onQuestionsLoadingChange,
}: StudyMaterialProps) {
  const [html, setHtml] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadMaterial() {
      if (!subjectId) {
        setHtml(null)
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      const { data, error } = await GetStudyMaterialsAgentBySubject(subjectId)

      if (cancelled) return

      if (error) {
        toast.error(error.message)
        setHtml(null)
      } else {
        setHtml(data?.html?.trim() ? data.html : null)
      }

      setIsLoading(false)
    }

    void loadMaterial()
    return () => {
      cancelled = true
    }
  }, [subjectId])

  const previewSrcDoc = useMemo(
    () => (html ? wrapAgentHtmlForIframe(html, { compactMobile: true }) : ''),
    [html],
  )

  const hasContent = Boolean(html?.trim())

  async function handleContinue() {
    setIsLoadingQuestions(true)
    onQuestionsLoadingChange?.(true)

    try {
      const { data, error } = await GetStudyQuestionsBySubject(subjectId)

      if (error) {
        toast.error(error.message)
        return
      }

      if (data.length === 0) {
        toast.error('Nenhuma questão cadastrada para este assunto.')
        return
      }

      onContinue(data)
    } finally {
      setIsLoadingQuestions(false)
      onQuestionsLoadingChange?.(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-col gap-4">
      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center rounded-2xl border border-border bg-card">
          <StudyFlowLoading label="Carregando material de estudo..." />
        </div>
      ) : hasContent ? (
        <section className="flex flex-col gap-3 overflow-hidden rounded-xl border border-accent/35 bg-card ring-1 ring-accent/15 sm:gap-4 sm:rounded-2xl sm:border-2 sm:p-5">
          
          {/*<div className="flex items-start gap-2.5 px-0.5 sm:gap-3 sm:px-0">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/35 bg-accent/10 sm:h-10 sm:w-10 sm:rounded-xl">
              <BookOpen className="h-4 w-4 text-accent sm:h-5 sm:w-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-foreground">
                Material de estudo
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground sm:mt-1">
                Leia com atenção. O que você absorver agora fará diferença nas
                questões.
              </p>
            </div>
          </div>*/}

          <div className="-mx-2 overflow-hidden rounded-lg border border-border bg-muted/20 sm:mx-0 sm:rounded-xl">
            <iframe
              title="Material de estudo"
              srcDoc={previewSrcDoc}
              className="block w-full border-0 bg-transparent"
              style={{ height: 'min(70vh, 640px)' }}
              sandbox="allow-popups"
            />
          </div>
        </section>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-14 text-center">
          <Loader2 className="h-8 w-8 text-muted-foreground opacity-40" aria-hidden />
          <p className="text-sm font-semibold text-foreground">
            Material ainda não disponível
          </p>
          <p className="max-w-sm text-xs text-muted-foreground">
            Não há conteúdo publicado para este assunto. Peça ao administrador
            para gerar o material no painel de Estudo Inteligente.
          </p>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-background/95 px-3 py-3 backdrop-blur-sm sm:p-4 lg:left-[240px]">
        <div className="mx-auto w-full max-w-3xl">
          <button
            type="button"
            onClick={() => void handleContinue()}
            disabled={!hasContent || isLoading || isLoadingQuestions}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-black text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
            style={
              hasContent && !isLoading && !isLoadingQuestions
                ? {
                    background: 'linear-gradient(90deg, #3D7FFF, #5A9FFF)',
                    boxShadow: '0 6px 20px rgba(61,127,255,0.4)',
                  }
                : undefined
            }
          >
            {isLoadingQuestions ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                Carregando questões...
              </>
            ) : (
              'Responder questões'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
