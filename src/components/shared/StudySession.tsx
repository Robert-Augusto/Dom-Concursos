'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, CheckCircle, FileText, Info, X } from 'lucide-react'
import { StudyFlowLoading } from '@/components/shared/StudyFlowLoading'
import { cn } from '@/lib/utils'
import type { Questions } from '@/types'
import { GetBancas } from '@/lib/lib-banca'
import { getFilledOptionKeys } from '@/lib/lib-questions'
import { CreateStudySessionAnswears } from '@/lib/lib-study-session-answears'
import { toast } from 'sonner'

function formatMetaTag(value: string | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : '—'
}

function resolveBancaName(
  question: Questions,
  bancaNamesById: Record<string, string>,
) {
  return (
    question.banca_name?.trim() ||
    bancaNamesById[String(question.banca)] ||
    '—'
  )
}

function QuestionMetaTags({
  bancaName,
  ano,
  instituicao,
}: {
  bancaName: string
  ano: string
  instituicao: string
}) {
  const tags = [
    { key: 'banca', label: 'Banca', value: bancaName },
    { key: 'ano', label: 'Ano', value: ano },
    { key: 'instituicao', label: 'Instituição', value: instituicao },
  ] as const

  return (
    <div className="mb-3 flex flex-wrap gap-2">
      {tags.map(({ key, label, value }) => (
        <span
          key={key}
          className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-muted/30 px-2.5 py-1 text-[10px] font-semibold text-foreground"
        >
          <span className="shrink-0 font-black uppercase tracking-wide text-[9px] text-muted-foreground">
            {label}
          </span>
          <span className="truncate">{value}</span>
        </span>
      ))}
    </div>
  )
}

export interface StudySessionProps {
  subjectName: string
  studySessionId: string
  questionsData: Questions[]
  isLoading?: boolean
  onFinish: () => void | Promise<void>
  onBack: () => void
}

export default function StudySession({
  subjectName,
  studySessionId,
  questionsData,
  isLoading = false,
  onFinish,
  onBack,
}: StudySessionProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set())
  const [resolvingId, setResolvingId] = useState<string | null>(null)
  const [bancaNamesById, setBancaNamesById] = useState<Record<string, string>>({})

  useEffect(() => {
    let cancelled = false

    async function loadBancas() {
      const { data, error } = await GetBancas()
      if (cancelled) return
      if (error) return

      setBancaNamesById(
        Object.fromEntries(data.map((b) => [String(b.id), b.name])),
      )
    }

    void loadBancas()
    return () => {
      cancelled = true
    }
  }, [])

  const allQuestions = questionsData
  const allResolved =
    allQuestions.length > 0 &&
    allQuestions.every((q) => resolvedIds.has(q.id))

  const subjectShort =
    subjectName.length > 24 ? `${subjectName.slice(0, 24)}…` : subjectName

  const handleBack = () => {
    if (
      typeof window !== 'undefined' &&
      window.confirm('Voltar ao material? O progresso das questões será perdido.')
    ) {
      onBack()
    }
  }

  async function handleResolve(questionId: string) {
    const selected = answers[questionId]
    if (!selected || resolvedIds.has(questionId) || resolvingId) return

    const question = allQuestions.find((q) => q.id === questionId)
    if (!question) return

    if (!studySessionId) {
      toast.error('Sessão de estudo inválida. Reinicie o estudo.')
      return
    }

    const isCorrect = selected === question.correct_option

    setResolvingId(questionId)
    try {
      const { error } = await CreateStudySessionAnswears(
        String(studySessionId),
        questionId,
        selected,
        isCorrect,
      )

      if (error) {
        toast.error(error.message)
        return
      }

      setResolvedIds((prev) => new Set(prev).add(questionId))
    } finally {
      setResolvingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center">
        <StudyFlowLoading label="Carregando questões..." />
      </div>
    )
  }

  if (allQuestions.length === 0) {
    return (
      <div className="flex min-h-0 flex-col">
        <div className="sticky top-0 z-10 flex shrink-0 items-center gap-3 border-b border-border bg-background px-4 py-3">
          <button
            type="button"
            onClick={onBack}
            className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
            Voltar
          </button>
        </div>
        <p className="py-12 text-center text-sm text-muted-foreground">
          Nenhuma questão disponível para este assunto.
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-col">
      <div className="sticky top-0 z-10 flex shrink-0 items-center gap-3 border-b border-border bg-background px-4 py-3">
        <button
          type="button"
          onClick={handleBack}
          className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
        </button>
        <span className="shrink-0 text-border">·</span>
        <span className="truncate text-xs text-muted-foreground">
          {subjectShort} · Questões
        </span>
      </div>

      <div className="flex flex-col gap-4 pb-24 pt-4">
        <div className="flex items-center justify-center gap-2 py-2 text-[14px] font-black uppercase tracking-widest text-muted-foreground">
          <FileText className="h-3.5 w-3.5" />
          Responda as {allQuestions.length} questões
        </div>

        {allQuestions.map((question, index) => {
          const resolved = resolvedIds.has(question.id)
          const selected = answers[question.id]
          const isCorrect = selected === question.correct_option
          const optionKeys = getFilledOptionKeys(question.options)
          const bancaName = resolveBancaName(question, bancaNamesById)

          return (
            <div
              key={question.id}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Questão {index + 1} de {allQuestions.length}
              </p>
              <QuestionMetaTags
                bancaName={bancaName}
                ano={formatMetaTag(question.ano)}
                instituicao={formatMetaTag(question.instituicao)}
              />
              <p className="mb-4 text-sm font-bold leading-snug text-foreground">
                {question.question}
              </p>

              <div className="flex flex-col gap-2">
                {optionKeys.map((key) => {
                  const optionText = question.options[key]?.trim() ?? ''
                  if (!optionText) return null

                  const isSelected = selected === key
                  const isCorrectOption = key === question.correct_option
                  const isWrongPick = resolved && isSelected && !isCorrect

                  let rowClass =
                    'border-border bg-background text-foreground hover:border-border/80'
                  let badgeClass = 'bg-muted text-muted-foreground'

                  if (resolved) {
                    if (isCorrectOption) {
                      rowClass =
                        'border-chart-2/40 bg-chart-2/10 text-foreground'
                      badgeClass = 'bg-chart-2 text-white'
                    } else if (isWrongPick) {
                      rowClass =
                        'border-destructive/40 bg-destructive/10 text-foreground'
                      badgeClass = 'bg-destructive text-white'
                    } else {
                      rowClass =
                        'border-border/60 bg-muted/20 text-muted-foreground opacity-80'
                    }
                  } else if (isSelected) {
                    rowClass = 'border-primary/50 bg-primary/5 text-foreground'
                    badgeClass = 'bg-primary text-primary-foreground'
                  }

                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={resolved}
                      onClick={() => {
                        if (resolved) return
                        setAnswers((prev) => ({
                          ...prev,
                          [question.id]: key,
                        }))
                      }}
                      className={cn(
                        'flex w-full items-start gap-3 rounded-xl border p-4 text-left text-sm transition-all',
                        rowClass,
                        resolved && 'cursor-default',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-black',
                          badgeClass,
                        )}
                      >
                        {key}
                      </span>
                      <span className="flex-1">{optionText}</span>
                      {resolved && isCorrectOption ? (
                        <CheckCircle className="h-4 w-4 shrink-0 text-chart-2" />
                      ) : null}
                      {resolved && isWrongPick ? (
                        <X className="h-4 w-4 shrink-0 text-destructive" />
                      ) : null}
                    </button>
                  )
                })}
              </div>

              {!resolved ? (
                <button
                  type="button"
                  disabled={!selected || resolvingId === question.id}
                  onClick={() => void handleResolve(question.id)}
                  className={cn(
                    'mt-4 w-full rounded-xl border py-3 text-sm font-bold transition-all',
                    selected && resolvingId !== question.id
                      ? 'border-primary bg-primary text-primary-foreground hover:opacity-90'
                      : 'cursor-not-allowed border-border bg-muted text-muted-foreground',
                  )}
                >
                  {resolvingId === question.id ? 'Salvando...' : 'Resolver'}
                </button>
              ) : (
                <div
                  className="mt-4 rounded-xl p-4"
                  style={{
                    background: 'rgba(61,127,255,0.08)',
                    border: '1px solid rgba(61,127,255,0.2)',
                  }}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-black uppercase text-primary">
                      {isCorrect ? 'Resposta correta' : 'Resposta incorreta'}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {question.explanation}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-background/95 p-4 backdrop-blur-sm">
        <button
          type="button"
          disabled={!allResolved}
          onClick={() => void onFinish()}
          className={cn(
            'mx-auto flex w-full max-w-3xl items-center justify-center gap-2 rounded-2xl py-4 text-base font-black transition-all',
            allResolved
              ? 'text-white hover:opacity-90'
              : 'cursor-not-allowed bg-muted text-muted-foreground',
          )}
          style={
            allResolved
              ? {
                  background: 'linear-gradient(90deg, #3D7FFF, #8B5CF6)',
                  boxShadow: '0 6px 20px rgba(61,127,255,0.4)',
                }
              : undefined
          }
        >
          <CheckCircle className="h-5 w-5" />
          Finalizar e Ver Resultado
        </button>
        {!allResolved ? (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Resolva todas as questões para ver o resultado
          </p>
        ) : null}
      </div>
    </div>
  )
}
