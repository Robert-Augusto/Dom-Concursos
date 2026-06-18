'use client'

import { useProfile } from '@/context/ProfileContext'
import { UpdateCourseThumbnail } from '@/lib/lib-courses'
import {
  DeleteCourseThumbnail,
  UploadCourseThumbnail,
} from '@/lib/lib-storage'
import { ImagePlus, Loader2, Pencil, Save, X } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

type CourseBannerEditorProps = {
  courseId: number
  initialThumbnailUrl: string | null
}

export function CourseBannerEditor({
  courseId,
  initialThumbnailUrl,
}: CourseBannerEditorProps) {
  const { profile, loading: profileLoading } = useProfile()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isAdmin = profile?.role === 'admin'

  const [thumbnailUrl, setThumbnailUrl] = useState(initialThumbnailUrl)
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(
    null,
  )
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setThumbnailUrl(initialThumbnailUrl)
  }, [initialThumbnailUrl])

  useEffect(() => {
    return () => {
      if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl)
    }
  }, [pendingPreviewUrl])

  function clearPendingImage() {
    if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl)
    setPendingPreviewUrl(null)
    setPendingFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleImageSelected(file: File | undefined) {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Selecione um arquivo de imagem')
      return
    }

    clearPendingImage()
    setPendingFile(file)
    setPendingPreviewUrl(URL.createObjectURL(file))
  }

  async function handleSaveBanner() {
    if (!pendingFile) return

    setIsSaving(true)

    const previousThumbnailUrl = thumbnailUrl
    const { publicUrl, uploadError } = await UploadCourseThumbnail(
      pendingFile,
      courseId,
    )

    if (uploadError) {
      toast.error(uploadError.message)
      setIsSaving(false)
      return
    }

    if (!publicUrl) {
      toast.error('Não foi possível enviar a imagem')
      setIsSaving(false)
      return
    }

    const { data, error } = await UpdateCourseThumbnail(courseId, publicUrl)

    if (error) {
      toast.error(error.message)
      setIsSaving(false)
      return
    }

    if (previousThumbnailUrl) {
      await DeleteCourseThumbnail(previousThumbnailUrl)
    }

    setThumbnailUrl(data?.thumbnail_url ?? publicUrl)
    clearPendingImage()
    setIsSaving(false)
    toast.success('Banner atualizado')
  }

  const displayUrl = pendingPreviewUrl ?? thumbnailUrl
  const hasPendingImage = Boolean(pendingFile)

  return (
    <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-muted md:h-64">
      {displayUrl ? (
        <Image
          src={displayUrl}
          alt=""
          fill
          unoptimized={displayUrl.startsWith('blob:')}
          className="object-cover"
        />
      ) : null}

      {!profileLoading && isAdmin ? (
        <div className="absolute inset-x-0 bottom-0 bg-black/75 p-3">
          {hasPendingImage ? (
            <div className="space-y-2">
              <p className="text-[10px] text-white/80">
                Nova imagem selecionada — salve para aplicar
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-chart-2 px-3 py-2 text-xs font-bold text-primary-foreground disabled:opacity-50"
                  onClick={() => void handleSaveBanner()}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  Salvar banner
                </button>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-lg border border-border bg-background/90 px-3 py-2 text-xs font-bold text-muted-foreground disabled:opacity-50"
                  onClick={clearPendingImage}
                  disabled={isSaving}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-foreground/25 px-3 py-2 text-xs font-bold text-white/90 transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-50"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSaving}
            >
              {thumbnailUrl ? (
                <Pencil className="h-3.5 w-3.5" />
              ) : (
                <ImagePlus className="h-3.5 w-3.5" />
              )}
              {thumbnailUrl ? 'Editar banner' : 'Enviar banner'}
            </button>
          )}
        </div>
      ) : null}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleImageSelected(e.target.files?.[0])}
      />
    </div>
  )
}
