'use client'

import { useProfile } from '@/context/ProfileContext'
import {
  UpdateCourseBanner,
  UpdateCourseMobileBanner,
} from '@/lib/lib-courses'
import {
  DeleteCourseThumbnail,
  UploadCourseBanner,
  UploadCourseMobileBanner,
} from '@/lib/lib-storage'
import { cn } from '@/lib/utils'
import { ImagePlus, Loader2, Pencil, Save, X } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

const DESKTOP_BANNER_WIDTH = 1600
const DESKTOP_BANNER_HEIGHT = 472
const MOBILE_BANNER_WIDTH = 768
const MOBILE_BANNER_HEIGHT = 432

type BannerVariant = 'desktop' | 'mobile'

type BannerConfig = {
  variant: BannerVariant
  label: string
  width: number
  height: number
  imageClassName: string
}

const BANNER_CONFIG: Record<BannerVariant, BannerConfig> = {
  desktop: {
    variant: 'desktop',
    label: 'Banner desktop',
    width: DESKTOP_BANNER_WIDTH,
    height: DESKTOP_BANNER_HEIGHT,
    imageClassName: 'object-contain',
  },
  mobile: {
    variant: 'mobile',
    label: 'Banner mobile',
    width: MOBILE_BANNER_WIDTH,
    height: MOBILE_BANNER_HEIGHT,
    imageClassName: 'object-cover',
  },
}

type CourseBannerEditorProps = {
  courseId: number
  initialBannerUrl: string | null
  initialBannerMobileUrl: string | null
  className?: string
  imageClassName?: string
}

type BannerUploadFieldProps = {
  courseId: number
  config: BannerConfig
  initialUrl: string | null
  onSaved: (url: string) => void
}

function BannerUploadField({
  courseId,
  config,
  initialUrl,
  onSaved,
}: BannerUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [bannerUrl, setBannerUrl] = useState(initialUrl)
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(
    null,
  )
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setBannerUrl(initialUrl)
  }, [initialUrl])

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

    const previousBannerUrl = bannerUrl
    const uploadFn =
      config.variant === 'desktop'
        ? UploadCourseBanner
        : UploadCourseMobileBanner
    const updateFn =
      config.variant === 'desktop'
        ? UpdateCourseBanner
        : UpdateCourseMobileBanner

    const { publicUrl, uploadError } = await uploadFn(pendingFile, courseId)

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

    const { data, error } = await updateFn(courseId, publicUrl)

    if (error) {
      toast.error(error.message)
      setIsSaving(false)
      return
    }

    if (previousBannerUrl) {
      await DeleteCourseThumbnail(previousBannerUrl)
    }

    const savedUrl =
      config.variant === 'desktop'
        ? (data?.banner_url ?? publicUrl)
        : (data?.banner_mobile_url ?? publicUrl)

    setBannerUrl(savedUrl)
    onSaved(savedUrl)
    clearPendingImage()
    setIsSaving(false)
    toast.success(`${config.label} atualizado`)
  }

  const displayUrl = pendingPreviewUrl ?? bannerUrl
  const hasPendingImage = Boolean(pendingFile)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-foreground">{config.label}</p>
        <p className="text-xs text-muted-foreground">
          {config.width}×{config.height} px
        </p>
      </div>

      <div
        className="relative w-full overflow-hidden rounded-xl border border-border bg-muted"
        style={{ aspectRatio: `${config.width} / ${config.height}` }}
      >
        {displayUrl ? (
          <Image
            src={displayUrl}
            alt=""
            fill
            unoptimized={displayUrl.startsWith('blob:')}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className={config.imageClassName}
          />
        ) : (
          <div className="flex h-full items-center justify-center p-4">
            <p className="text-center text-xs text-muted-foreground">
              Nenhuma imagem enviada
            </p>
          </div>
        )}
      </div>

      {hasPendingImage ? (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Nova imagem selecionada — salve para aplicar
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground disabled:opacity-50"
              onClick={() => void handleSaveBanner()}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Salvar
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-3 py-2 text-xs font-bold text-muted-foreground disabled:opacity-50"
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
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-bold text-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-50"
          onClick={() => fileInputRef.current?.click()}
          disabled={isSaving}
        >
          {bannerUrl ? (
            <Pencil className="h-3.5 w-3.5" />
          ) : (
            <ImagePlus className="h-3.5 w-3.5" />
          )}
          {bannerUrl ? 'Trocar imagem' : 'Enviar imagem'}
        </button>
      )}

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

export function CourseBannerEditor({
  courseId,
  initialBannerUrl,
  initialBannerMobileUrl,
  className,
  imageClassName,
}: CourseBannerEditorProps) {
  const { profile, loading: profileLoading } = useProfile()
  const isAdmin = profile?.role === 'admin'

  const [desktopBannerUrl, setDesktopBannerUrl] = useState(initialBannerUrl)
  const [mobileBannerUrl, setMobileBannerUrl] = useState(
    initialBannerMobileUrl,
  )

  useEffect(() => {
    setDesktopBannerUrl(initialBannerUrl)
  }, [initialBannerUrl])

  useEffect(() => {
    setMobileBannerUrl(initialBannerMobileUrl)
  }, [initialBannerMobileUrl])

  const mobileDisplayUrl = mobileBannerUrl ?? desktopBannerUrl

  return (
    <div className="flex flex-col gap-4">
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-2xl border border-border bg-muted',
          className,
        )}
      >
        <div
          className="relative w-full lg:hidden"
          style={{
            aspectRatio: `${MOBILE_BANNER_WIDTH} / ${MOBILE_BANNER_HEIGHT}`,
          }}
        >
          {mobileDisplayUrl ? (
            <Image
              src={mobileDisplayUrl}
              alt=""
              fill
              sizes="100vw"
              className={cn('object-cover', imageClassName)}
            />
          ) : null}
        </div>

        <div
          className="relative hidden w-full lg:block"
          style={{
            aspectRatio: `${DESKTOP_BANNER_WIDTH} / ${DESKTOP_BANNER_HEIGHT}`,
          }}
        >
          {desktopBannerUrl ? (
            <Image
              src={desktopBannerUrl}
              alt=""
              fill
              sizes="(max-width: 1210px) 100vw, 1210px"
              className={cn('object-contain', imageClassName)}
            />
          ) : null}
        </div>
      </div>

      {!profileLoading && isAdmin ? (
        <div className="mx-4 rounded-2xl border border-border bg-card p-4 lg:mx-0 lg:p-5">
          <p className="mb-4 text-sm font-semibold text-foreground">
            Banners do curso
          </p>
          <div className="grid gap-6 lg:grid-cols-2">
            <BannerUploadField
              courseId={courseId}
              config={BANNER_CONFIG.desktop}
              initialUrl={desktopBannerUrl}
              onSaved={setDesktopBannerUrl}
            />
            <BannerUploadField
              courseId={courseId}
              config={BANNER_CONFIG.mobile}
              initialUrl={mobileBannerUrl}
              onSaved={setMobileBannerUrl}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
