'use client'

import { TriangleAlert, X } from 'lucide-react'

type ModalSimuladoExitProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export function ModalSimuladoExit({
  open,
  onClose,
  onConfirm,
}: ModalSimuladoExitProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-simulado-exit-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-4 md:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-destructive/15 text-destructive">
              <TriangleAlert className="h-4 w-4" aria-hidden />
            </div>
            <div>
              <h3
                id="modal-simulado-exit-title"
                className="text-base font-black text-foreground md:text-lg"
              >
                Sair do simulado?
              </h3>
              <p className="text-sm text-muted-foreground">
                Esta ação encerra o simulado em andamento.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            aria-label="Fechar modal"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3">
          <p className="text-sm leading-relaxed text-foreground">
            Se você sair agora, o progresso das questões respondidas será
            mantido, mas você precisará configurar um novo simulado para
            continuar praticando. Tem certeza que deseja sair?
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/20"
          >
            Sair do simulado
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            Continuar respondendo
          </button>
        </div>
      </div>
    </div>
  )
}
