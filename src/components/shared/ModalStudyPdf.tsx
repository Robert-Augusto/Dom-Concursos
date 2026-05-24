'use client'

import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import { X } from 'lucide-react'

const PdfViewer = dynamic(() => import('@/components/shared/PdfViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[200px] items-center justify-center bg-muted/20">
      <span className="text-sm text-muted-foreground">Carregando PDF...</span>
    </div>
  ),
})

export interface ModalStudyPdfProps {
  open: boolean
  url: string
  title?: string
  onClose: () => void
}

function PdfEndCta({ onClose }: { onClose: () => void }) {
  return (
    <section className="mx-auto w-full max-w-lg px-4 pb-10 pt-6">
      <div className="rounded-2xl border border-primary/25 bg-card p-6 text-center shadow-sm">
        <h2 className="font-heading text-lg font-black text-foreground sm:text-xl">
          🎉 Material estudado!
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Agora é hora de testar sua memória com os flashcards. Revire cada card
          e veja o quanto você absorveu do conteúdo.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black text-white transition-all hover:opacity-90 sm:text-base"
          style={{
            background: 'linear-gradient(90deg, #3D7FFF, #5A9FFF)',
            boxShadow: '0 6px 20px rgba(61,127,255,0.4)',
          }}
        >
          Ir para os Flashcards →
        </button>
      </div>
    </section>
  )
}

export function ModalStudyPdf({
  open,
  url,
  title = 'Apostila de Estudo',
  onClose,
}: ModalStudyPdfProps) {
  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-background"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="flex shrink-0 items-center justify-end border-b border-border px-4 py-3">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-accent px-4 py-2 text-sm font-semibold text-background transition-colors hover:border-primary/40 hover:text-foreground"
          aria-label="Fechar modo foco"
        >
          <X className="h-4 w-4 shrink-0" aria-hidden />
          Fechar
        </button>
      </div>

      <div className="relative min-h-0 flex-1">
        <PdfViewer
          url={url}
          title={title}
          fillContainer
          className="h-full bg-background"
          endContent={<PdfEndCta onClose={onClose} />}
        />
      </div>
    </div>
  )
}
