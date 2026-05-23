'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { Maximize2 } from 'lucide-react'
import { ModalStudyPdf } from '@/components/shared/ModalStudyPdf'
import { StudyMaterials } from '@/types'

const PdfViewer = dynamic(() => import('@/components/shared/PdfViewer'), {
  ssr: false,
  loading: () => (
    <div
      className="flex items-center justify-center bg-muted/20"
      style={{ height: 'min(70vh, 640px)' }}
    >
      <span className="text-sm text-muted-foreground">Carregando PDF...</span>
    </div>
  ),
})

export interface StudyMaterialProps {
  materialsData: StudyMaterials | null
  onContinue: () => void
}

export default function StudyMaterial({
  materialsData,
  onContinue,
}: StudyMaterialProps) {
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false)
  const pdfUrl = materialsData?.file_url ?? ''
  const hasPdf = Boolean(pdfUrl.trim())

  return (
    <div className="flex min-h-0 flex-col gap-4 pb-24">
      {hasPdf ? (
        <button
          type="button"
          onClick={() => setIsFocusModalOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-primary/8 px-4 py-3 text-sm font-bold text-foreground transition-colors hover:border-primary/50 hover:bg-primary/12"
        >
          <Maximize2 className="h-4 w-4 shrink-0 text-primary" aria-hidden />
          Modo foco — estudar sem distrações
        </button>
      ) : null}

      <section className="overflow-hidden rounded-2xl border-2 border-accent/35 bg-card ring-1 ring-accent/15">
        <PdfViewer url={pdfUrl} title="Apostila de Estudo" />
      </section>

      <ModalStudyPdf
        open={isFocusModalOpen}
        url={pdfUrl}
        title="Apostila de Estudo"
        onClose={() => setIsFocusModalOpen(false)}
      />

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-background/95 p-4 backdrop-blur-sm lg:left-[240px]">
        <div className="mx-auto w-full max-w-3xl">
          <button
            type="button"
            onClick={onContinue}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-black text-white transition-all hover:opacity-90"
            style={{
              background: 'linear-gradient(90deg, #3D7FFF, #5A9FFF)',
              boxShadow: '0 6px 20px rgba(61,127,255,0.4)',
            }}
          >
            Continuar para flashcards
          </button>
        </div>
      </div>
    </div>
  )
}
