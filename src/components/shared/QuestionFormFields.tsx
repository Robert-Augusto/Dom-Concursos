'use client'

import {
  OptionKey,
  OPTION_KEYS,
  QuestionsDifficulty,
  Anos
} from '@/types'
import { FormEvent, useState } from 'react'
import { toast } from 'sonner'

type QuestionFormFieldsProps = {
  banca: string
  difficulty: QuestionsDifficulty
  subjectsId: string
  subjectRootId: string
}

export function QuestionFormFields({ banca, difficulty, subjectsId, subjectRootId }: QuestionFormFieldsProps) {
  const [text, setText] = useState('')
  const [correctOption, setCorrectOption] = useState<OptionKey>('A')
  const [explanation, setExplanation] = useState('')
  const [ano, setAno] = useState('2025')
  const [instituicao, setInstituicao] = useState('')

  async function handleCreateQuestion(event: FormEvent){
    event.preventDefault()
    
    if (!text) {
      toast.error("Preencha o texto da questão.")
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

    const response = await fetch ('https://n8n-qao4.srv1444382.hstgr.cloud/webhook/3b221980-d986-440a-9159-24cd22163523', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        correctOption: correctOption,
        explanation: explanation,
        ano: ano,
        instituicao: instituicao,
        banca: Number(banca),
        difficulty: difficulty,
        subjectsId: subjectsId,
        subjectRootId: subjectRootId
      })
    })

    if (!response.ok) toast.error("Erro ao cadastrar questão")

    toast.success("A questão está sendo criada.")
    setAno('2026')
    setCorrectOption('A')
    setExplanation('')
    setInstituicao('')
    setText('')
  }

  return (
    <div className="flex flex-col gap-5">
      <label className="flex flex-col gap-1.5">
      subject root: {subjectRootId}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 disabled:opacity-60"
          placeholder="Texto da questão"
        />
      </label>

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
