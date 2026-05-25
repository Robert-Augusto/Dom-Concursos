'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, FileText, Info, X } from 'lucide-react'
import StudyContentProgress from '@/components/shared/StudyContentProgress'
import { StudyFlowLoading } from '@/components/shared/StudyFlowLoading'
import { cn } from '@/lib/utils'
import type { Questions } from '@/types'
import { GetBancas } from '@/lib/lib-banca'
import { getFilledOptionKeys } from '@/lib/lib-questions'
import { CreateStudySessionAnswears } from '@/lib/lib-study-session-answears'
import { toast } from 'sonner'
import { QuestionCardActions } from './QuestionCardActions'

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
          className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-amber-500/35 bg-amber-500/5 px-2.5 py-1 text-[10px] font-semibold text-foreground"
        >
          <span className="shrink-0 font-black uppercase tracking-wide text-[9px] text-amber-500">
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
        <p className="py-12 text-center text-sm text-muted-foreground">
          Nenhuma questão disponível para este assunto.
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex flex-col gap-4 pb-24">
        <StudyContentProgress step="session" />

        <div className="flex items-center justify-center gap-2 py-2 text-[14px] font-black uppercase tracking-widest text-amber-500">
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
              className="rounded-2xl border border-amber-500/30 bg-card p-5"
            >
              <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-amber-500">
                Questão {index + 1} de {allQuestions.length}
              </p>
              <QuestionMetaTags
                bancaName={bancaName}
                ano={formatMetaTag(question.ano)}
                instituicao={formatMetaTag(question.instituicao)}
              />
              <p className="mb-4 text-sm font-medium leading-snug text-foreground">
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
                    'border-amber-500/25 bg-background text-foreground hover:border-amber-500/40'
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
                    rowClass =
                      'border-amber-500/60 bg-amber-500/5 text-foreground'
                    badgeClass = 'bg-amber-500 text-black'
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
                      ? 'border-amber-500 bg-amber-500 text-black hover:brightness-110'
                      : 'cursor-not-allowed border-border bg-muted text-muted-foreground',
                  )}
                >
                  {resolvingId === question.id ? 'Salvando...' : 'Resolver'}
                </button>
              ) : (
                <div className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/8 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4 text-amber-500" />
                    <span className="text-[10px] font-black uppercase text-amber-500">
                      {isCorrect ? 'Resposta correta' : 'Resposta incorreta'}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {question.explanation}
                  </p>
                </div>
              )}

              <QuestionCardActions
                questionId={question.id}
              />
            </div>
          )
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-background/95 p-4 backdrop-blur-sm lg:left-[240px]">
        <div className="mx-auto w-full max-w-3xl">
          <button
            type="button"
            disabled={!allResolved}
            onClick={() => void onFinish()}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-black transition-all',
              allResolved
                ? 'bg-amber-500 text-black hover:brightness-110'
                : 'cursor-not-allowed bg-muted text-muted-foreground',
            )}
            style={
              allResolved
                ? { boxShadow: '0 6px 24px rgba(245,158,11,0.4)' }
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
    </div>
  )
}
