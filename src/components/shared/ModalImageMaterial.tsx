'use client'

import Image from 'next/image'
import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { Image as ImageIcon, Upload, X } from 'lucide-react'

type ModalImageMaterialProps = {
  open: boolean
  onClose: () => void
  subjectName?: string
}

export function ModalImageMaterial({
  open,
  onClose,
  subjectName,
}: ModalImageMaterialProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const previewUrl = useMemo(() => {
    if (!selectedFile) return ''
    return URL.createObjectURL(selectedFile)
  }, [selectedFile])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div
        className="w-full max-w-2xl rounded-2xl border border-border bg-card p-4 md:p-6"
        style={{ maxHeight: '85vh' }}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-black text-foreground">
              Imagem de Apoio
              {subjectName ? ` — ${subjectName}` : ''}
            </h3>
            <p className="text-sm text-muted-foreground">
              Envie uma imagem relacionada com a matéria selecionada.
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

        <div className="space-y-3">
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background px-4 py-4 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
            <Upload className="h-4 w-4" aria-hidden />
            Selecionar arquivo
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>

          <div
            className="overflow-hidden rounded-lg border border-border bg-background"
            style={{ minHeight: '280px' }}
          >
            {previewUrl ? (
              <div className="relative h-full w-full" style={{ minHeight: '280px' }}>
                <Image
                  src={previewUrl}
                  alt="Pré-visualização da imagem selecionada"
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="flex h-full items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
                <ImageIcon className="h-4 w-4" aria-hidden />
                Nenhuma imagem selecionada.
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
