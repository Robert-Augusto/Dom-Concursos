'use client'

import { UpdateQuestion } from '@/lib/lib-questions'
import {
  Anos,
  Banca,
  DIFFICULTY_SELECT,
  OPTION_KEYS,
  OptionKey,
  QuestionOptions,
  Questions,
  QuestionsDifficulty,
} from '@/types'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

type ModalEditQuestionProps = {
  open: boolean
  question: Questions | null
  bancas: Banca[]
  onClose: () => void
  onSaved?: () => void
}

function emptyOptions(): Record<OptionKey, string> {
  return { A: '', B: '', C: '', D: '', E: '' }
}

export function ModalEditQuestion({
  open,
  question,
  bancas,
  onClose,
  onSaved,
}: ModalEditQuestionProps) {
  const [questionText, setQuestionText] = useState('')
  const [options, setOptions] = useState<Record<OptionKey, string>>(emptyOptions)
  const [correctOption, setCorrectOption] = useState<OptionKey>('A')
  const [explanation, setExplanation] = useState('')
  const [difficulty, setDifficulty] = useState<QuestionsDifficulty>('Médio')
  const [bancaId, setBancaId] = useState('')
  const [ano, setAno] = useState('2025')
  const [instituicao, setInstituicao] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open || !question) return

    setQuestionText(question.question)
    setOptions({
      A: question.options.A ?? '',
      B: question.options.B ?? '',
      C: question.options.C ?? '',
      D: question.options.D ?? '',
      E: question.options.E ?? '',
    })
    setCorrectOption(
      OPTION_KEYS.includes(question.correct_option as OptionKey)
        ? (question.correct_option as OptionKey)
        : 'A',
    )
    setExplanation(question.explanation ?? '')
    setDifficulty(question.difficulty)
    setBancaId(question.banca ?? '')
    setAno(question.ano ?? '2025')
    setInstituicao(question.instituicao ?? '')
  }, [open, question])

  function setOption(key: OptionKey, value: string) {
    setOptions((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    if (!question) return

    const trimmedQuestion = questionText.trim()
    if (!trimmedQuestion) {
      toast.error('Preencha o texto da questão.')
      return
    }

    const trimmedExplanation = explanation.trim()
    if (!trimmedExplanation) {
      toast.error('Preencha a explicação do gabarito.')
      return
    }

    if (!bancaId) {
      toast.error('Selecione uma banca.')
      return
    }

    if (!instituicao.trim()) {
      toast.error('Preencha a instituição.')
      return
    }

    const requiredKeys: OptionKey[] = ['A', 'B', 'C', 'D']
    for (const key of requiredKeys) {
      if (!options[key].trim()) {
        toast.error(`Preencha a alternativa ${key}.`)
        return
      }
    }

    const correctText = options[correctOption].trim()
    if (!correctText) {
      toast.error(`A alternativa correta (${correctOption}) está vazia.`)
      return
    }

    const payloadOptions: QuestionOptions = {
      A: options.A.trim(),
      B: options.B.trim(),
      C: options.C.trim(),
      D: options.D.trim(),
      E: options.E.trim(),
    }

    setSaving(true)
    const { error } = await UpdateQuestion(question.id, {
      question: trimmedQuestion,
      options: payloadOptions,
      correct_option: correctOption,
      explanation: trimmedExplanation,
      difficulty,
      banca: bancaId,
      ano,
      instituicao: instituicao.trim(),
    })
    setSaving(false)

    if (error) {
      toast.error('Não foi possível salvar a questão.', {
        description: error.message,
      })
      return
    }

    toast.success('Questão atualizada.')
    onSaved?.()
    onClose()
  }

  if (!open || !question) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-question-title"
    >
      <div className="flex max-h-[min(90vh,48rem)] w-full max-w-2xl flex-col rounded-2xl border border-border bg-card">
        <div className="shrink-0 border-b border-border p-4 md:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3
                id="edit-question-title"
                className="text-lg font-black text-foreground"
              >
                Editar questão
              </h3>
              <p className="text-sm text-muted-foreground">
                Atualize o enunciado, alternativas, gabarito e demais informações.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-50"
              aria-label="Fechar modal"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-4 md:p-6">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground">
              Enunciado <span className="text-destructive">*</span>
            </span>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              rows={4}
              disabled={saving}
              className="resize-y rounded-lg border border-border bg-primary-foreground px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 disabled:opacity-60"
              placeholder="Texto da questão"
            />
          </label>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold text-muted-foreground">
              Alternativas
            </span>
            <div className="grid grid-cols-1 gap-3">
              {OPTION_KEYS.map((key) => (
                <label key={key} className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-foreground">
                    {key}
                    {key !== 'E' ? (
                      <span className="text-destructive"> *</span>
                    ) : (
                      <span className="font-normal text-muted-foreground">
                        {' '}
                        (opcional)
                      </span>
                    )}
                  </span>
                  <textarea
                    value={options[key]}
                    onChange={(e) => setOption(key, e.target.value)}
                    rows={2}
                    disabled={saving}
                    className="resize-y rounded-lg border border-border bg-primary-foreground px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 disabled:opacity-60"
                    placeholder={`Texto da alternativa ${key}`}
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex min-w-0 flex-col gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground">
                Alternativa correta
              </span>
              <select
                value={correctOption}
                onChange={(e) =>
                  setCorrectOption(e.target.value as OptionKey)
                }
                disabled={saving}
                className="rounded-lg border border-border bg-primary-foreground px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/50 disabled:opacity-60"
              >
                {OPTION_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex min-w-0 flex-col gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground">
                Banca <span className="text-destructive">*</span>
              </span>
              <select
                value={bancaId}
                onChange={(e) => setBancaId(e.target.value)}
                disabled={saving || bancas.length === 0}
                className="rounded-lg border border-border bg-primary-foreground px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/50 disabled:opacity-60"
              >
                {bancas.length === 0 ? (
                  <option value="">Nenhuma banca disponível</option>
                ) : (
                  bancas.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))
                )}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex min-w-0 flex-col gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground">
                Ano
              </span>
              <select
                value={ano}
                onChange={(e) => setAno(e.target.value)}
                disabled={saving}
                className="rounded-lg border border-border bg-primary-foreground px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/50 disabled:opacity-60"
              >
                {Anos.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex min-w-0 flex-col gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground">
                Instituição <span className="text-destructive">*</span>
              </span>
              <input
                type="text"
                value={instituicao}
                onChange={(e) => setInstituicao(e.target.value)}
                disabled={saving}
                className="rounded-lg border border-border bg-primary-foreground px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 disabled:opacity-60"
                placeholder="Ex.: TRT, TJ, MP"
              />
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Dificuldade
            </span>
            <div className="flex flex-wrap gap-2">
              {DIFFICULTY_SELECT.map((opt) => {
                const active = difficulty === opt
                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={saving}
                    onClick={() => setDifficulty(opt)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
                      active
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-transparent text-muted-foreground hover:border-primary/40 hover:text-foreground'
                    }`}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground">
              Explicação do gabarito <span className="text-destructive">*</span>
            </span>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={5}
              disabled={saving}
              className="resize-y rounded-lg border border-border bg-primary-foreground px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 disabled:opacity-60"
              placeholder="Justificativa / comentário da questão"
            />
          </label>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-border p-4 md:p-6">
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Salvando…' : 'Salvar alterações'}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
