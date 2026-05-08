'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

type ModalFlashcardMode = 'create' | 'edit'

type ModalFlashcardProps = {
  open: boolean
  mode: ModalFlashcardMode
  subjectName?: string
  initialFront?: string
  initialBack?: string
  onClose: () => void
  onSave: (front: string, back: string) => void
}

export function ModalFlashcard({
  open,
  mode,
  subjectName,
  initialFront = '',
  initialBack = '',
  onClose,
  onSave,
}: ModalFlashcardProps) {
  const [front, setFront] = useState(initialFront)
  const [back, setBack] = useState(initialBack)

  useEffect(() => {
    if (!open) return
    setFront(initialFront)
    setBack(initialBack)
  }, [open, initialFront, initialBack])

  const handleSave = () => {
    const trimmedFront = front.trim()
    const trimmedBack = back.trim()
    if (!trimmedFront || !trimmedBack) return
    onSave(trimmedFront, trimmedBack)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-4 md:p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-black text-foreground">
              {mode === 'create' ? 'Criar flashcard' : 'Editar flashcard'}
              {subjectName ? ` — ${subjectName}` : ''}
            </h3>
            <p className="text-sm text-muted-foreground">
              Preencha a frente e o verso do flashcard.
            </p>
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

        <div className="grid grid-cols-1 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-muted-foreground">
              Frente <span className="text-destructive">*</span>
            </span>
            <textarea
              value={front}
              onChange={(event) => setFront(event.target.value)}
              rows={4}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50"
              placeholder="Digite o conteúdo da frente"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-muted-foreground">
              Verso <span className="text-destructive">*</span>
            </span>
            <textarea
              value={back}
              onChange={(event) => setBack(event.target.value)}
              rows={4}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50"
              placeholder="Digite o conteúdo do verso"
            />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={!front.trim() || !back.trim()}
            className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-50"
          >
            {mode === 'create' ? 'Criar flashcard' : 'Salvar alterações'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
