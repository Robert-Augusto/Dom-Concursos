'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { StudyAgentContentVariantSwitcher } from '@/components/shared/StudyAgentContentVariantSwitcher'
import { StudyFlowLoading } from '@/components/shared/StudyFlowLoading'
import { GetStudyQuestionsBySubject } from '@/lib/lib-questions'
import {
  getDefaultStudyAgentVariant,
  getStudyAgentHtml,
  GetStudyMaterialsAgentBySubject,
  hasStudyAgentContent,
  wrapAgentHtmlForIframe,
} from '@/lib/study_material'
import type { Questions, StudyAgentHtmlVariant, StudyMaterialsAgent } from '@/types'
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
  const [agentContent, setAgentContent] = useState<StudyMaterialsAgent | null>(
    null,
  )
  const [contentVariant, setContentVariant] =
    useState<StudyAgentHtmlVariant>('full')
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)

  const hasFullContent = Boolean(agentContent?.html_full?.trim())
  const hasSummaryContent = Boolean(agentContent?.html_summary?.trim())
  const activeHtml = getStudyAgentHtml(agentContent, contentVariant)

  useEffect(() => {
    let cancelled = false

    async function loadMaterial() {
      if (!subjectId) {
        setAgentContent(null)
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      const { data, error } = await GetStudyMaterialsAgentBySubject(subjectId)

      if (cancelled) return

      if (error) {
        toast.error(error.message)
        setAgentContent(null)
      } else {
        setAgentContent(data)
        const defaultVariant = getDefaultStudyAgentVariant(data)
        if (defaultVariant) setContentVariant(defaultVariant)
      }

      setIsLoading(false)
    }

    void loadMaterial()
    return () => {
      cancelled = true
    }
  }, [subjectId])

  useEffect(() => {
    if (!activeHtml && contentVariant === 'full' && hasSummaryContent) {
      setContentVariant('summary')
    } else if (!activeHtml && contentVariant === 'summary' && hasFullContent) {
      setContentVariant('full')
    }
  }, [activeHtml, contentVariant, hasFullContent, hasSummaryContent])

  const previewSrcDoc = useMemo(
    () =>
      activeHtml ? wrapAgentHtmlForIframe(activeHtml, { compactMobile: true }) : '',
    [activeHtml],
  )

  const hasContent = hasStudyAgentContent(agentContent) && Boolean(activeHtml)

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
    <div className="flex min-h-0 flex-col gap-4 pb-24">
      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center rounded-2xl border border-border bg-card">
          <StudyFlowLoading label="Carregando material de estudo..." />
        </div>
      ) : hasContent ? (
        <section className="flex flex-col gap-3 overflow-hidden rounded-xl border border-accent/35 bg-card ring-1 ring-accent/15 sm:gap-4 sm:rounded-2xl sm:border-2 sm:p-5">
          <div className="flex flex-col gap-2 px-0.5 sm:px-0 mt-3 mx-3">
            <p className="text-sm font-bold text-foreground">
              Escolha como estudar
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Alterne entre a versão completa (mais detalhes) e a resumida.
            </p>
            <StudyAgentContentVariantSwitcher
              value={contentVariant}
              onChange={setContentVariant}
              hasFull={hasFullContent}
              hasSummary={hasSummaryContent}
            />
          </div>

          <div className="-mx-2 overflow-hidden rounded-lg border border-border bg-muted/20 sm:mx-0 sm:rounded-xl">
            <iframe
              title="Material de estudo"
              srcDoc={previewSrcDoc}
              className="block w-full border-0 bg-transparent"
              style={{ height: 'min(70vh, 640px)' }}
              sandbox="allow-popups allow-scripts"
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
