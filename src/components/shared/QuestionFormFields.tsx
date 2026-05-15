'use client'

import {
  OptionKey,
  OPTION_KEYS,
  QuestionsBanca,
  QuestionsDifficulty,
  Anos
} from '@/types'
import { FormEvent, useState } from 'react'
import { toast } from 'sonner'
import { CreateQuestion, UpdateQuestion } from '@/lib/lib-questions'

type QuestionFormFieldsProps = {
  banca: QuestionsBanca
  difficulty: QuestionsDifficulty
  subjectsId: string
}

export function QuestionFormFields({ banca, difficulty, subjectsId }: QuestionFormFieldsProps) {
  const [text, setText] = useState('')
  const [optionA, setOptionA] = useState('')
  const [optionB, setOptionB] = useState('')
  const [optionC, setOptionC] = useState('')
  const [optionD, setOptionD] = useState('')
  const [optionE, setOptionE] = useState('')
  const [correctOption, setCorrectOption] = useState<OptionKey>('A')
  const [explanation, setExplanation] = useState('')
  const [ano, setAno] = useState('')
  const [instituicao, setInstituicao] = useState('')

  async function handleCreateQuestion(event: FormEvent){
    event.preventDefault()
    
    if (!text) {
      toast.error("Preencha o texto da questão.")
      return
    }

    if (!optionA || !optionB || !optionC || !optionD) {
      toast.error("Preencha todas as alternativas.")
      return
    }

    if (!explanation) {
      toast.error("Preencha a explicação da alternativa correta.")
      return
    }

    if (!instituicao) {
      toast.error("Preencha a instituição.")
      return
    }

    const optionsJson = {
      A: optionA,
      B: optionB,
      C: optionC,
      D: optionD,
      E: optionE
    }
    const {error} = await CreateQuestion(Number(subjectsId), text, optionsJson, correctOption, explanation, banca, difficulty, ano, instituicao)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success("Questão criada com sucesso.")
    setAno('2026')
    setCorrectOption('A')
    setExplanation('')
    setInstituicao('')
    setOptionA('')
    setOptionB('')
    setOptionC('')
    setOptionD('')
    setOptionE('')
    setText('')
  }

  return (
    <div className="flex flex-col gap-5">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-muted-foreground">
          Enunciado
        </span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 disabled:opacity-60"
          placeholder="Texto da questão"
        />
      </label>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-muted-foreground">
          Alternativas
        </span>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(
            [
              ['A', optionA, (v: string) => setOptionA(v)],
              ['B', optionB, (v: string) => setOptionB(v)],
              ['C', optionC, (v: string) => setOptionC(v)],
              ['D', optionD, (v: string) => setOptionD(v)],
              ['E', optionE, (v: string) => setOptionE(v)]
            ] as const
          ).map(([key, value, setValue]) => (
            <label key={key} className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {key}
              </span>
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                rows={3}
                className="resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/50 disabled:opacity-60"
                placeholder={`Texto da alternativa ${key}`}
              />
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="flex min-w-0 flex-col gap-1.5">
          <span className="text-xs font-semibold text-muted-foreground">
            Alternativa correta
          </span>
          <select
            value={correctOption}
            onChange={(e) => setCorrectOption(e.target.value as OptionKey)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/50 disabled:opacity-60"
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
            Ano
          </span>
          <select
            value={ano}
            onChange={(e) => setAno(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/50 disabled:opacity-60"
          >
            {Anos.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-0 flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
          <span className="text-xs font-semibold text-muted-foreground">
            Instituição
          </span>
          <input
            type="text"
            value={instituicao}
            onChange={(e) => setInstituicao(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 disabled:opacity-60"
            placeholder="Ex.: TRT, TJ, MP"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-muted-foreground">
          Explicação do gabarito
        </span>
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          rows={5}
          className="resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 disabled:opacity-60"
          placeholder="Justificativa / comentário da questão"
        />
      </label>
      <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
        <button
          type="button"
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          Limpar
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          onClick={handleCreateQuestion}
        >
          Criar questão
        </button>
      </div>
    </div>
  )
}
