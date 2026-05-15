'use client'

import { useEffect, useState } from 'react'
import { Loader2, X } from 'lucide-react'
import { UpdateQuestion } from '@/lib/lib-questions'
import {
  BANCA_OPTIONS,
  QuestionOptions,
  Questions,
  QuestionsBanca,
  QuestionsDifficulty,
} from '@/types'
import { toast } from 'sonner'

const OPTION_KEYS = ['A', 'B', 'C', 'D'] as const
type OptionKey = (typeof OPTION_KEYS)[number]

const DIFFICULTY_SELECT: QuestionsDifficulty[] = ['Fácil', 'Médio', 'Difícil']

type ModalQuestionProps = {
  open: boolean
  question: Questions | null
  onClose: () => void
}

function emptyOptions(): QuestionOptions {
  return { A: '', B: '', C: '', D: '' }
}

export function ModalQuestion({ open, question, onClose }: ModalQuestionProps) {
  const [questionText, setQuestionText] = useState('')
  const [optionA, setOptionA] = useState('')
  const [optionB, setOptionB] = useState('')
  const [optionC, setOptionC] = useState('')
  const [optionD, setOptionD] = useState('')
  const [correctOption, setCorrectOption] = useState<OptionKey>('A')
  const [explanation, setExplanation] = useState('')
  const [difficulty, setDifficulty] =
    useState<QuestionsDifficulty>('Médio')
  const [banca, setBanca] = useState<QuestionsBanca>('CESPE/CEBRASPE')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!open || !question) return

    setIsSaving(false)
    const opts = question.options ?? emptyOptions()
    setQuestionText(question.question ?? '')
    setOptionA(opts.A ?? '')
    setOptionB(opts.B ?? '')
    setOptionC(opts.C ?? '')
    setOptionD(opts.D ?? '')

    const co = (question.correct_option ?? 'A').toUpperCase().trim()
    const key = OPTION_KEYS.includes(co as OptionKey)
      ? (co as OptionKey)
      : 'A'
    setCorrectOption(key)

    setExplanation(question.explanation ?? '')
    setDifficulty(question.difficulty ?? 'Médio')
    setBanca(question.banca ?? 'CESPE')
  }, [open, question])

  const optionsAsJsonb = (): QuestionOptions => ({
    A: optionA,
    B: optionB,
    C: optionC,
    D: optionD,
  })

  const handleSave = async () => {
    if (!question) return

    const trimmedQuestion = questionText.trim()
    if (!trimmedQuestion) {
      toast.error('Preencha o enunciado da questão.')
      return
    }

    const opts = optionsAsJsonb()
    if (!opts.A.trim() || !opts.B.trim() || !opts.C.trim() || !opts.D.trim()) {
      toast.error('Preencha o texto das quatro alternativas.')
      return
    }

    if(!explanation){
      toast.error("Preencha a explicatão da opção correta.")
      return
    }

    setIsSaving(true)
    try {
      const { error } = await UpdateQuestion(question.id, {
        question: trimmedQuestion,
        options: opts,
        correct_option: correctOption,
        explanation: explanation.trim(),
        difficulty,
        banca,
      })

      if (error) {
        toast.error('Não foi possível salvar a questão.', {
          description: error.message,
        })
        return
      }

      toast.success('Questão atualizada.')
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  if (!open || !question) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-border bg-card">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border p-4 md:p-5">
          <div>
            <h3 className="text-lg font-black text-foreground font-heading">
              Questão
            </h3>
            <p className="text-sm text-muted-foreground">
              Edite os campos e salve para atualizar no banco de dados.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-50"
            aria-label="Fechar modal"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-5">
          <div className="flex flex-col gap-5">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground">
                Enunciado
              </span>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                rows={4}
                disabled={isSaving}
                className="resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 disabled:opacity-60"
                placeholder="Texto da questão"
              />
            </label>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-muted-foreground">
                Alternativas (salvas como JSON no campo options)
              </span>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    A
                  </span>
                  <textarea
                    value={optionA}
                    onChange={(e) => setOptionA(e.target.value)}
                    rows={3}
                    disabled={isSaving}
                    className="resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/50 disabled:opacity-60"
                    placeholder="Texto da alternativa A"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    B
                  </span>
                  <textarea
                    value={optionB}
                    onChange={(e) => setOptionB(e.target.value)}
                    rows={3}
                    disabled={isSaving}
                    className="resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/50 disabled:opacity-60"
                    placeholder="Texto da alternativa B"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    C
                  </span>
                  <textarea
                    value={optionC}
                    onChange={(e) => setOptionC(e.target.value)}
                    rows={3}
                    disabled={isSaving}
                    className="resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/50 disabled:opacity-60"
                    placeholder="Texto da alternativa C"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    D
                  </span>
                  <textarea
                    value={optionD}
                    onChange={(e) => setOptionD(e.target.value)}
                    rows={3}
                    disabled={isSaving}
                    className="resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/50 disabled:opacity-60"
                    placeholder="Texto da alternativa D"
                  />
                </label>
              </div>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground">
                Alternativa correta
              </span>
              <select
                value={correctOption}
                onChange={(e) =>
                  setCorrectOption(e.target.value as OptionKey)
                }
                disabled={isSaving}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/50 disabled:opacity-60"
              >
                {OPTION_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground">
                Explicação do gabarito
              </span>
              <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                rows={5}
                disabled={isSaving}
                className="resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 disabled:opacity-60"
                placeholder="Justificativa / comentário da questão"
              />
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground">
                  Dificuldade
                </span>
                <select
                  value={difficulty}
                  onChange={(e) =>
                    setDifficulty(e.target.value as QuestionsDifficulty)
                  }
                  disabled={isSaving}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/50 disabled:opacity-60"
                >
                  {DIFFICULTY_SELECT.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-muted-foreground">
                  Banca
                </span>
                <select
                  value={banca}
                  onChange={(e) =>
                    setBanca(e.target.value as QuestionsBanca)
                  }
                  disabled={isSaving}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/50 disabled:opacity-60"
                >
                  {BANCA_OPTIONS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <details className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              <summary className="cursor-pointer font-semibold text-foreground">
                Pré-visualização JSON (options)
              </summary>
              <pre className="mt-2 max-h-32 overflow-auto rounded-md bg-background p-2 font-mono text-[11px] leading-relaxed">
                {JSON.stringify(optionsAsJsonb(), null, 2)}
              </pre>
            </details>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-border p-4 md:p-5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-50"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-full border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Salvando…
              </>
            ) : (
              'Salvar alterações'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
