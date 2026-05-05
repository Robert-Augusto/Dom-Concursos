'use client'

import { TriangleAlert, X } from 'lucide-react'
import { DeleteLesson } from '@/lib/lessons'
import { toast } from 'sonner'

type ModalLessonDeleteProps = {
  open: boolean
  lessonName: string
  lessonId: string
  onClose: () => void
}

export function ModalLessonDelete({
  open,
  lessonName,
  lessonId,
  onClose,
}: ModalLessonDeleteProps) {
  
  async function handleDeleteLesson(){
    const {error} = await DeleteLesson(lessonId)

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success("Aula deletada com sucesso !!")
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-4 md:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-destructive/15 text-destructive">
              <TriangleAlert className="h-4 w-4" aria-hidden />
            </div>
            <div>
              <h3 className="text-base font-black text-foreground md:text-lg">
                Confirmar exclusão
              </h3>
              <p className="text-sm text-muted-foreground">
                Esta ação remove a aula da lista.
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

        <div className="rounded-xl border border-border bg-background p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Aula selecionada
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {lessonName || 'Sem título'}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="rounded-full border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/20"
            onClick={handleDeleteLesson}
          >
            Confirmar exclusão
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
