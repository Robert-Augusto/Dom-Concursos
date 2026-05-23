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
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          aria-label="Fechar modo foco"
        >
          <X className="h-4 w-4 shrink-0" aria-hidden />
          Fechar
        </button>
      </div>

      <div className="relative min-h-0 flex-1">
        <PdfViewer url={url} title={title} fillContainer className="h-full bg-background" />
      </div>
    </div>
  )
}
