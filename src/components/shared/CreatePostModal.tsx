'use client'

import { useEffect, useRef, useState } from 'react'
import { Image, PencilLine, Video, X } from 'lucide-react'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { useProfile } from '@/context/ProfileContext'
import {
  CreateCommunityPost,
  mapCommunityPostToFeedPost,
  UpdateCommunityPost,
  UploadCommunityPostMedia,
  type FeedPost,
} from '@/lib/lib-community-posts'
import { type FilterKey, filters } from '@/types'

interface CreatePostModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPostCreated?: (post: FeedPost) => void
  onPostUpdated?: (post: FeedPost) => void
  editingPost?: FeedPost | null
}

const filterStyles: Record<
  FilterKey,
  { activeClassName: string; inactiveClassName: string }
> = {
  Aprovação: {
    activeClassName:
      'scale-105 border-2 border-destructive bg-destructive text-destructive-foreground shadow-[0_0_0_2px_hsl(347_100%_65%_/_0.45),0_0_20px_hsl(347_100%_65%_/_0.6)] ring-2 ring-destructive/35 ring-offset-1 ring-offset-card',
    inactiveClassName:
      'border border-destructive/20 bg-destructive/5 text-destructive/55 opacity-75 hover:border-destructive/35 hover:bg-destructive/10 hover:text-destructive/80 hover:opacity-100',
  },
  Dicas: {
    activeClassName:
      'scale-105 border-2 border-accent bg-accent text-accent-foreground shadow-[0_0_0_2px_hsl(220_100%_62%_/_0.45),0_0_20px_hsl(220_100%_62%_/_0.6)] ring-2 ring-accent/35 ring-offset-1 ring-offset-card',
    inactiveClassName:
      'border border-accent/20 bg-accent/5 text-accent/55 opacity-75 hover:border-accent/35 hover:bg-accent/10 hover:text-accent/80 hover:opacity-100',
  },
  Editais: {
    activeClassName:
      'scale-105 border-2 border-chart-2 bg-chart-2 text-primary-foreground shadow-[0_0_0_2px_hsl(152_58%_54%_/_0.45),0_0_20px_hsl(152_58%_54%_/_0.6)] ring-2 ring-chart-2/35 ring-offset-1 ring-offset-card',
    inactiveClassName:
      'border border-chart-2/20 bg-chart-2/5 text-chart-2/55 opacity-75 hover:border-chart-2/35 hover:bg-chart-2/10 hover:text-chart-2/80 hover:opacity-100',
  },
  Dúvidas: {
    activeClassName:
      'scale-105 border-2 border-chart-5 bg-chart-5 text-white shadow-[0_0_0_2px_hsl(262_83%_63%_/_0.45),0_0_20px_hsl(262_83%_63%_/_0.6)] ring-2 ring-chart-5/35 ring-offset-1 ring-offset-card',
    inactiveClassName:
      'border border-chart-5/20 bg-chart-5/5 text-chart-5/55 opacity-75 hover:border-chart-5/35 hover:bg-chart-5/10 hover:text-chart-5/80 hover:opacity-100',
  },
}

function isBlobUrl(url: string) {
  return url.startsWith('blob:')
}

export default function CreatePostModal({
  open,
  onOpenChange,
  onPostCreated,
  onPostUpdated,
  editingPost = null,
}: CreatePostModalProps) {
  const { profile, loading: profileLoading } = useProfile()
  const [selectedCategory, setSelectedCategory] = useState<FilterKey>(filters[0].label)
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const isEditing = !!editingPost

  const resetMediaState = () => {
    setImageFile(null)
    setVideoFile(null)
    setImagePreview(null)
    setVideoPreview(null)
    if (imageInputRef.current) {
      imageInputRef.current.value = ''
    }
    if (videoInputRef.current) {
      videoInputRef.current.value = ''
    }
  }

  useEffect(() => {
    if (!open) {
      return
    }

    if (editingPost) {
      setSelectedCategory(editingPost.category)
      setContent(editingPost.content)
      setImageFile(null)
      setVideoFile(null)
      setImagePreview(editingPost.imageUrl)
      setVideoPreview(editingPost.videoUrl)
      if (imageInputRef.current) {
        imageInputRef.current.value = ''
      }
      if (videoInputRef.current) {
        videoInputRef.current.value = ''
      }
      return
    }

    setSelectedCategory(filters[0].label)
    setContent('')
    resetMediaState()
  }, [open, editingPost])

  useEffect(() => {
    return () => {
      if (imagePreview && isBlobUrl(imagePreview)) {
        URL.revokeObjectURL(imagePreview)
      }
      if (videoPreview && isBlobUrl(videoPreview)) {
        URL.revokeObjectURL(videoPreview)
      }
    }
  }, [imagePreview, videoPreview])

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen)
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Selecione um arquivo de imagem válido.')
      event.target.value = ''
      return
    }

    if (imagePreview && isBlobUrl(imagePreview)) {
      URL.revokeObjectURL(imagePreview)
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleVideoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    if (!file.type.startsWith('video/')) {
      toast.error('Selecione um arquivo de vídeo válido.')
      event.target.value = ''
      return
    }

    if (videoPreview && isBlobUrl(videoPreview)) {
      URL.revokeObjectURL(videoPreview)
    }

    setVideoFile(file)
    setVideoPreview(URL.createObjectURL(file))
  }

  const handleRemoveImage = () => {
    if (imagePreview && isBlobUrl(imagePreview)) {
      URL.revokeObjectURL(imagePreview)
    }
    setImageFile(null)
    setImagePreview(null)
    if (imageInputRef.current) {
      imageInputRef.current.value = ''
    }
  }

  const handleRemoveVideo = () => {
    if (videoPreview && isBlobUrl(videoPreview)) {
      URL.revokeObjectURL(videoPreview)
    }
    setVideoFile(null)
    setVideoPreview(null)
    if (videoInputRef.current) {
      videoInputRef.current.value = ''
    }
  }

  const resolveMediaUrls = async (profileId: string) => {
    let imageUrl: string | null = imagePreview
    let videoUrl: string | null = videoPreview

    if (imageFile) {
      const { publicUrl, error } = await UploadCommunityPostMedia(
        profileId,
        imageFile,
        'image'
      )

      if (error || !publicUrl) {
        throw new Error(error?.message ?? 'Erro ao enviar a imagem.')
      }

      imageUrl = publicUrl
    }

    if (videoFile) {
      const { publicUrl, error } = await UploadCommunityPostMedia(
        profileId,
        videoFile,
        'video'
      )

      if (error || !publicUrl) {
        throw new Error(error?.message ?? 'Erro ao enviar o vídeo.')
      }

      videoUrl = publicUrl
    }

    return { imageUrl, videoUrl }
  }

  const handleSubmit = async () => {
    const trimmedContent = content.trim()

    if (!trimmedContent) {
      toast.error('Escreva algo antes de publicar.')
      return
    }

    if (profileLoading) {
      return
    }

    if (!profile?.id) {
      toast.error(
        isEditing
          ? 'Faça login para editar a publicação.'
          : 'Faça login para criar uma publicação.'
      )
      return
    }

    setIsSubmitting(true)

    try {
      const { imageUrl, videoUrl } = await resolveMediaUrls(profile.id)

      if (isEditing && editingPost) {
        const { data, error } = await UpdateCommunityPost(
          editingPost.id,
          profile.id,
          trimmedContent,
          selectedCategory,
          { imageUrl, videoUrl }
        )

        if (error || !data) {
          toast.error(error?.message ?? 'Erro ao salvar. Tente novamente.')
          return
        }

        onPostUpdated?.(mapCommunityPostToFeedPost(data))
        toast.success('Publicação atualizada com sucesso!')
        handleOpenChange(false)
        return
      }

      const { data, error } = await CreateCommunityPost(
        profile.id,
        trimmedContent,
        selectedCategory,
        { imageUrl, videoUrl }
      )

      if (error || !data) {
        toast.error(error?.message ?? 'Erro ao publicar. Tente novamente.')
        return
      }

      onPostCreated?.(mapCommunityPostToFeedPost(data))
      toast.success('Publicação criada com sucesso!')
      handleOpenChange(false)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Erro ao enviar os arquivos.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md flex-col gap-5 overflow-hidden p-5 bg-card border-border sm:max-w-md"
      >
        <div className="flex min-h-0 w-full min-w-0 flex-col gap-5 overflow-y-auto">
          <div className="flex w-full min-w-0 flex-col gap-1">
            <DialogTitle className="flex items-center gap-2 text-base font-black text-foreground">
              <PencilLine className="h-5 w-5 shrink-0 text-primary" />
              <span>{isEditing ? 'Editar publicação' : 'Criar publicação'}</span>
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Sobre o que é sua postagem?
            </p>
          </div>

          <div className="w-full min-w-0">
            <div className="overflow-x-auto scrollbar-none">
              <div className="flex w-max min-w-full flex-nowrap items-center gap-0.5 px-4 py-3">
                {filters.map((filter) => {
                  const isActive = selectedCategory === filter.label
                  const Icon = filter.icon
                  const styles = filterStyles[filter.label]

                  return (
                    <div key={filter.label} className="shrink-0 p-2">
                      <button
                        type="button"
                        onClick={() => setSelectedCategory(filter.label)}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-black whitespace-nowrap transition-all duration-200 ${
                          isActive
                            ? styles.activeClassName
                            : styles.inactiveClassName
                        }`}
                      >
                        <Icon
                          className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'drop-shadow-sm' : ''}`}
                        />
                        <span>{filter.label}</span>
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Compartilhe algo com a comunidade..."
            rows={4}
            className="box-border w-full min-w-0 resize-none rounded-xl border border-primary/30 bg-primary-foreground px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/50"
          />

          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleImageSelect}
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={handleVideoSelect}
          />

          {(imagePreview || videoPreview) && (
            <div className="flex w-full min-w-0 flex-col gap-2">
              {imagePreview ? (
                <div className="relative overflow-hidden rounded-xl border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Pré-visualização da imagem"
                    className="block h-auto max-h-64 w-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-sm transition-colors hover:bg-background"
                    aria-label="Remover imagem"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : null}

              {videoPreview ? (
                <div className="relative overflow-hidden rounded-xl border border-border">
                  <video
                    src={videoPreview}
                    controls
                    className="max-h-48 w-full bg-black object-contain"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveVideo}
                    className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-sm transition-colors hover:bg-background"
                    aria-label="Remover vídeo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
            </div>
          )}

          <div className="grid w-full min-w-0 grid-cols-2 gap-2">
            <button
              type="button"
              disabled={!!imagePreview || isSubmitting}
              onClick={() => imageInputRef.current?.click()}
              className="flex min-w-0 items-center justify-center gap-1.5 rounded-xl border border-chart-2/30 bg-chart-2/10 px-2 py-2.5 text-xs font-bold text-chart-2 transition-colors hover:bg-chart-2/15 disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:px-3 sm:py-3 sm:text-sm"
            >
              <Image className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {imagePreview ? '1 foto' : 'Adicionar foto'}
              </span>
            </button>

            <button
              type="button"
              disabled={!!videoPreview || isSubmitting}
              onClick={() => videoInputRef.current?.click()}
              className="flex min-w-0 items-center justify-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/10 px-2 py-2.5 text-xs font-bold text-destructive transition-colors hover:bg-destructive/15 disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:px-3 sm:py-3 sm:text-sm"
            >
              <Video className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {videoPreview ? '1 vídeo' : 'Adicionar vídeo'}
              </span>
            </button>
          </div>

          <div className="flex w-full min-w-0 flex-col gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || profileLoading}
              className="box-border w-full min-w-0 rounded-xl bg-accent py-3 text-sm font-black text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? isEditing
                  ? 'Salvando...'
                  : 'Publicando...'
                : isEditing
                  ? 'Salvar alterações'
                  : 'Publicar'}
            </button>

            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
              className="text-center text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
