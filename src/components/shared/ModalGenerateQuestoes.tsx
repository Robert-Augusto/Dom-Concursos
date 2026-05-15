'use client'

import { useEffect, useState } from 'react'
import { Loader2, Sparkles, X } from 'lucide-react'
import { BANCA_OPTIONS, Subjects } from '@/types'
import { toast } from 'sonner'

const WEBHOOK_URL =
  'https://n8n-qao4.srv1444382.hstgr.cloud/webhook/3b221980-d986-440a-9159-24cd22163523'

type ModalPhase = 'form' | 'processing'

type ModalGenerateQuestoesProps = {
  open: boolean
  relatedSubject: Subjects | null
  onClose: () => void
}

export function ModalGenerateQuestoes({
  open,
  relatedSubject,
  onClose,
}: ModalGenerateQuestoesProps) {
  const [rawText, setRawText] = useState('')
  const [phase, setPhase] = useState<ModalPhase>('form')
  const [bancaFilter, setBancaFilter] =
    useState<(typeof BANCA_OPTIONS)[number]>('CESPE/CEBRASPE')

  useEffect(() => {
    if (!open) return
    setRawText('')
    setPhase('form')
    setBancaFilter('CESPE/CEBRASPE')
  }, [open])

  const handleGenerate = async () => {
    const trimmed = rawText.trim()

    if (!trimmed) {
      toast.error('Cole o texto com as questões antes de gerar.')
      return
    }

    if (!relatedSubject) {
      toast.error('Selecione uma matéria relacionada antes de gerar.')
      return
    }

    setPhase('processing')

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: trimmed,
          subjectId: relatedSubject.id,
          banca: bancaFilter,
        }),
      })

      if (!response.ok) {
        let detail = `Erro ${response.status}`
        try {
          const body = await response.text()
          if (body) detail = body.slice(0, 200)
        } catch {
          /* ignore */
        }
        onClose()
        toast.error('Não foi possível gerar as questões.', {
          description: detail,
        })
        return
      }

      onClose()
      toast.success('Processo iniciado com sucesso.', {
        description:
          'Suas questões estão sendo criadas. Você receberá uma notificação quando tudo estiver pronto.',
      })
    } catch {
      onClose()
      toast.error(
        'Falha de conexão. Verifique sua internet e tente novamente.',
      )
    }
  }

  if (!open) return null

  const isProcessing = phase === 'processing'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-3xl rounded-2xl border border-border bg-card p-4 md:p-6">
        {phase === 'form' ? (
          <>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-black text-foreground font-heading">
                  Gerar questões por IA
                </h3>
                <p className="text-sm text-muted-foreground">
                  Cole abaixo o texto completo com todas as questões. Nossa IA
                  irá ler e cadastrar automaticamente.
                </p>
                {relatedSubject ? (
                  <p className="mt-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Matéria relacionada:{' '}
                    <span className="text-foreground">
                      {relatedSubject.name}
                    </span>
                  </p>
                ) : null}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                aria-label="Fechar modal"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <div className="mb-3 flex flex-col gap-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  Selecione a banca
                </span>
                <div className="flex flex-wrap gap-2">
                  {BANCA_OPTIONS.map((opt) => {
                    const active = bancaFilter === opt
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setBancaFilter(opt)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
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

              <label
                htmlFor="generate-questoes-raw-text"
                className="text-xs font-semibold text-muted-foreground"
              >
                Texto com as questões{' '}
                <span className="text-destructive">*</span>
              </label>
              <textarea
                id="generate-questoes-raw-text"
                value={rawText}
                onChange={(event) => setRawText(event.target.value)}
                rows={14}
                disabled={isProcessing}
                placeholder={
                  'Cole aqui o texto completo das questões.\n\nExemplo:\n1) Sobre a responsabilidade civil do Estado...\na) ...\nb) ...\nc) ...\nd) ...\nGabarito: C\n\n2) ...'
                }
                className="min-h-[260px] w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 disabled:opacity-60"
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isProcessing}
                className="inline-flex items-center gap-2 rounded-full border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" aria-hidden />
                Gerar Questões
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-6 py-10 md:py-14">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
                <Loader2
                  className="h-8 w-8 animate-spin text-primary"
                  aria-hidden
                />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="text-lg font-black text-foreground font-heading">
                  Criando suas questões
                </h3>
                <p className="text-sm text-muted-foreground">
                  Estamos processando o texto com a IA. Quando o processo
                  terminar, você receberá uma notificação.
                </p>
                {relatedSubject ? (
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Matéria:{' '}
                    <span className="text-foreground">
                      {relatedSubject.name}
                    </span>
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
