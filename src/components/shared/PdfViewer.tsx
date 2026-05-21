'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertCircle, ExternalLink } from 'lucide-react'
import { Document, Page, pdfjs } from 'react-pdf'
import { StudyFlowLoading } from '@/components/shared/StudyFlowLoading'
import { cn } from '@/lib/utils'

import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

export interface PdfViewerProps {
  url: string
  className?: string
  title?: string
}

export default function PdfViewer({
  url,
  className,
  title = 'Apostila de Estudo',
}: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState<number | null>(null)
  const [numPages, setNumPages] = useState<number | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const updateWidth = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const width = Math.floor(el.getBoundingClientRect().width)
    if (width > 0) setContainerWidth(width)
  }, [])

  useEffect(() => {
    setNumPages(null)
    setLoadError(null)
    setIsLoading(true)
  }, [url])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    updateWidth()

    const observer = new ResizeObserver(() => {
      updateWidth()
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [updateWidth])

  function handleLoadSuccess({ numPages: pages }: { numPages: number }) {
    setNumPages(pages)
    setLoadError(null)
    setIsLoading(false)
  }

  function handleLoadError(error: Error) {
    setLoadError(error.message || 'Não foi possível carregar o PDF.')
    setIsLoading(false)
  }

  if (!url?.trim()) {
    return (
      <div
        className={cn(
          'flex min-h-[200px] items-center justify-center p-4 text-center text-sm text-muted-foreground',
          className,
        )}
      >
        PDF não disponível.
      </div>
    )
  }

  if (loadError) {
    return (
      <div
        className={cn(
          'flex min-h-[200px] flex-col items-center justify-center gap-3 p-6 text-center',
          className,
        )}
      >
        <AlertCircle className="h-8 w-8 text-destructive" aria-hidden />
        <p className="text-sm font-semibold text-foreground">
          Não foi possível exibir o PDF neste dispositivo.
        </p>
        <p className="max-w-sm text-xs text-muted-foreground">{loadError}</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/15"
        >
          Abrir PDF em nova aba
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full overflow-y-auto overflow-x-hidden bg-muted/20',
        className,
      )}
      style={{ height: 'min(70vh, 640px)' }}
    >
      {isLoading ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted/20">
          <StudyFlowLoading label="Carregando PDF..." size="sm" />
        </div>
      ) : null}

      {containerWidth ? (
        <Document
          file={url}
          onLoadSuccess={handleLoadSuccess}
          onLoadError={handleLoadError}
          loading={null}
          className="flex flex-col items-center gap-3 py-4"
        >
          {numPages
            ? Array.from({ length: numPages }, (_, index) => (
                <Page
                  key={`page-${index + 1}`}
                  pageNumber={index + 1}
                  width={containerWidth}
                  className="max-w-full shadow-sm"
                  renderTextLayer
                  renderAnnotationLayer
                  loading={
                    <div className="flex min-h-[120px] items-center justify-center">
                      <StudyFlowLoading
                        label={`Página ${index + 1}...`}
                        size="sm"
                      />
                    </div>
                  }
                />
              ))
            : null}
        </Document>
      ) : (
        <div className="flex min-h-[200px] items-center justify-center">
          <StudyFlowLoading label="Preparando visualizador..." size="sm" />
        </div>
      )}
    </div>
  )
}
