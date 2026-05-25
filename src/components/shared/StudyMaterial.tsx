'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { Fullscreen } from 'lucide-react'
import StudyContentProgress from '@/components/shared/StudyContentProgress'
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
      <StudyContentProgress step="material" />

      {hasPdf ? (
        <button
          type="button"
          onClick={() => setIsFocusModalOpen(true)}
          aria-label="Abrir apostila em tela cheia"
          className="group relative w-full overflow-hidden rounded-2xl border border-border bg-card p-4 text-left transition-all hover:border-accent/45 hover:shadow-[0_8px_28px_rgba(61,127,255,0.12)]"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-60 transition-opacity group-hover:opacity-100"
            style={{
              background:
                'linear-gradient(105deg, rgba(61,127,255,0.12) 0%, transparent 42%)',
            }}
          />
          <div className="relative flex items-center gap-3.5">
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-md transition-transform group-hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #3D7FFF, #5A9FFF)',
                boxShadow: '0 4px 14px rgba(61,127,255,0.45)',
              }}
            >
              <Fullscreen
                className="size-[22px] text-white"
                strokeWidth={2.25}
                aria-hidden
              />
            </span>

            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  LER EM TELA CHEIA
                </span>
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                Para ver o conteúdo em tela cheia, basta clicar no botão ao lado.
              </span>
            </span>

            <span className="shrink-0 rounded-full border border-accent/40 bg-accent/10 px-3.5 py-2 text-[11px] font-black uppercase tracking-wide text-accent transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-accent-foreground">
              Abrir
            </span>
          </div>
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
            Continuar para os flashcards
          </button>
        </div>
      </div>
    </div>
  )
}
