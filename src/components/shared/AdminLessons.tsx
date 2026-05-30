'use client'

import Image from 'next/image'
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import {
  ChevronDown,
  Clapperboard,
  FileUp,
  HelpCircle,
  ImagePlus,
  Lightbulb,
  Pencil,
  Play,
  Search,
  Upload,
  Video,
} from 'lucide-react'
import { AccessLevel, LessonMaterials, Lessons, Subjects, VideoType } from '@/types'
import { ModalSubjectPicker } from '@/components/shared/ModalSubjectPicker'
import {
  CreateLesson,
  GetLessonMaterials,
  DeleteLessonMaterials,
  UpdateLesson,
  UpdateLessonPublished,
} from '@/lib/lib-lessons'
import {
  DeleteLessonMaterialFile,
  DeleteLessonThumbnail,
  UploadLessonMaterials,
  UploadLessonThumbnail,
} from '@/lib/lib-storage'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const DESCRIPTION_MAX = 300
const MAX_ATTACHMENTS = 10
const LESSON_PAGE_SIZE = 10

const ACCESS_LEVEL_OPTIONS: { value: AccessLevel; label: string }[] = [
  { value: 'free', label: 'Gratuito' },
  { value: 'plus', label: 'Plus' },
  { value: 'premium', label: 'Premium' },
]

function getYoutubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.replace('/', '')
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
    if (parsed.hostname.includes('youtube.com')) {
      const videoId = parsed.searchParams.get('v')
      if (videoId) return `https://www.youtube.com/embed/${videoId}`
      if (parsed.pathname.includes('/shorts/')) {
        const shortId = parsed.pathname.split('/shorts/')[1]
        return shortId ? `https://www.youtube.com/embed/${shortId}` : null
      }
    }
    return null
  } catch {
    return null
  }
}

function getPandaEmbedUrl(url: string): string | null {
  const trimmed = url.trim()
  if (!trimmed) return null
  try {
    const parsed = new URL(trimmed)
    if (parsed.hostname.includes('pandavideo') || parsed.hostname.includes('panda')) {
      return trimmed
    }
    return trimmed.startsWith('http') ? trimmed : null
  } catch {
    return null
  }
}

function isYoutubeLinkValid(url: string): boolean {
  try {
    const parsed = new URL(url.trim())
    if (!parsed.hostname.includes('youtube.com')) return false
    const videoId = parsed.searchParams.get('v')
    return videoId !== null && videoId.trim() !== ''
  } catch {
    return false
  }
}

function isPandaLinkValid(url: string): boolean {
  return url.trim() !== ''
}

const THUMBNAIL_PLACEHOLDER_COLORS = [
  'bg-accent/30',
  'bg-chart-2/30',
  'bg-chart-5/30',
] as const

function accessLevelLabel(level: AccessLevel): string {
  switch (level) {
    case 'free':
      return 'Gratuito'
    case 'plus':
      return 'Plus'
    case 'premium':
      return 'Premium'
  }
}

function accessLevelBadgeClass(level: AccessLevel): string {
  switch (level) {
    case 'free':
      return 'border-chart-2/40 bg-chart-2/15 text-chart-2'
    case 'plus':
      return 'border-accent/40 bg-accent/15 text-accent'
    case 'premium':
      return 'border-chart-5/40 bg-chart-5/15 text-chart-5'
  }
}

function videoTypeBadgeClass(type: VideoType): string {
  return type === 'youtube'
    ? 'border-destructive/40 bg-destructive/15 text-destructive'
    : 'border-chart-2/40 bg-chart-2/15 text-chart-2'
}

function videoTypeLabel(type: VideoType): string {
  return type === 'youtube' ? 'YouTube' : 'Panda'
}

const fieldLabelClass =
  'text-[11px] font-bold uppercase tracking-wider text-muted-foreground'

const inputClass =
  'w-full rounded-lg border border-border bg-primary-foreground px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50'

function Pager({
  page,
  totalPages,
  totalItems,
  itemLabel,
  color,
  onPrev,
  onNext,
}: {
  page: number
  totalPages: number
  totalItems: number
  itemLabel: string
  color: 'accent' | 'chart-2'
  onPrev: () => void
  onNext: () => void
}) {
  if (totalItems === 0) return null

  const tone =
    color === 'accent'
      ? 'border-accent/50 bg-accent/10 text-accent hover:bg-accent/20'
      : 'border-chart-2/50 bg-chart-2/10 text-chart-2 hover:bg-chart-2/20'

  if (totalPages <= 1) {
    return (
      <p className="text-right text-sm text-muted-foreground">
        {totalItems} {itemLabel}
      </p>
    )
  }

  return (
    <div className="mt-2 flex items-center justify-between gap-3">
      <span className="text-sm text-muted-foreground">
        {totalItems} {itemLabel} · página {page} de {totalPages}
      </span>
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={onPrev}
          disabled={page <= 1}
          className={cn(
            'min-h-9 min-w-9 rounded-lg border px-3 py-1.5 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:border-border disabled:bg-muted disabled:text-muted-foreground disabled:opacity-70',
            tone,
          )}
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={page >= totalPages}
          className={cn(
            'min-h-9 min-w-9 rounded-lg border px-3 py-1.5 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:border-border disabled:bg-muted disabled:text-muted-foreground disabled:opacity-70',
            tone,
          )}
        >
          Avançar
        </button>
      </div>
    </div>
  )
}

type AdminLessonsProps = {
  subjectsData?: Subjects[] | null
  lessonsData?: Lessons[] | null
}

export default function AdminLessons({
  subjectsData,
  lessonsData = null,
}: AdminLessonsProps) {
  const thumbnailInputRef = useRef<HTMLInputElement>(null)
  const attachmentsInputRef = useRef<HTMLInputElement>(null)

  const [videoType, setVideoType] = useState<VideoType>('youtube')
  const [accessLevel, setAccessLevel] = useState<AccessLevel | ''>('')
  const [videoUrl, setVideoUrl] = useState('')
  const [selectedSubject, setSelectedSubject] = useState<Subjects | null>(null)
  const [selectedRootSubjectName, setSelectedRootSubjectName] = useState<
    string | null
  >(null)
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null)
  const [loadingEditId, setLoadingEditId] = useState<string | null>(null)
  const [savedThumbnailUrl, setSavedThumbnailUrl] = useState<string | null>(null)
  const [thumbnailRemoved, setThumbnailRemoved] = useState(false)
  const [existingMaterials, setExistingMaterials] = useState<LessonMaterials[]>([])
  const [removedMaterialIds, setRemovedMaterialIds] = useState<Set<string>>(
    () => new Set(),
  )
  const [publishedSearch, setPublishedSearch] = useState('')
  const [publishedPage, setPublishedPage] = useState(1)
  const [publishedState, setPublishedState] = useState<Record<string, boolean>>({})
  const [togglingLessonId, setTogglingLessonId] = useState<string | null>(null)

  useEffect(() => {
    if (!lessonsData) return
    setPublishedState(
      Object.fromEntries(lessonsData.map((lesson) => [lesson.id, lesson.is_published])),
    )
  }, [lessonsData])

  useEffect(() => setPublishedPage(1), [publishedSearch])

  const embedUrl = useMemo(() => {
    if (!videoUrl.trim()) return null
    return videoType === 'youtube'
      ? getYoutubeEmbedUrl(videoUrl)
      : getPandaEmbedUrl(videoUrl)
  }, [videoUrl, videoType])

  const thumbnailPreviewUrl = useMemo(() => {
    if (thumbnailFile) return URL.createObjectURL(thumbnailFile)
    return null
  }, [thumbnailFile])

  const thumbnailDisplayUrl = useMemo(() => {
    if (thumbnailPreviewUrl) return thumbnailPreviewUrl
    if (thumbnailRemoved) return null
    return savedThumbnailUrl
  }, [thumbnailPreviewUrl, thumbnailRemoved, savedThumbnailUrl])

  const keptExistingMaterials = useMemo(
    () => existingMaterials.filter((m) => !removedMaterialIds.has(m.id)),
    [existingMaterials, removedMaterialIds],
  )

  const totalMaterialCount =
    keptExistingMaterials.length + attachmentFiles.length

  const canAddMoreMaterials = totalMaterialCount < MAX_ATTACHMENTS

  const linkLabel =
    videoType === 'youtube' ? 'Link do YouTube' : 'Link do Panda Vídeos'

  const filteredPublishedLessons = useMemo(() => {
    const list = [...(lessonsData ?? [])].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    const query = publishedSearch.trim().toLowerCase()
    if (!query) return list
    return list.filter(
      (lesson) =>
        lesson.title.toLowerCase().includes(query) ||
        lesson.description.toLowerCase().includes(query),
    )
  }, [lessonsData, publishedSearch])

  const publishedTotalPages = Math.max(
    1,
    Math.ceil(filteredPublishedLessons.length / LESSON_PAGE_SIZE),
  )

  const pagedPublishedLessons = useMemo(() => {
    const start = (publishedPage - 1) * LESSON_PAGE_SIZE
    return filteredPublishedLessons.slice(start, start + LESSON_PAGE_SIZE)
  }, [filteredPublishedLessons, publishedPage])

  async function handleTogglePublished(lessonId: string, isPublished: boolean) {
    const previous =
      publishedState[lessonId] ??
      lessonsData?.find((lesson) => lesson.id === lessonId)?.is_published ??
      false

    setPublishedState((prev) => ({ ...prev, [lessonId]: isPublished }))
    setTogglingLessonId(lessonId)

    const { error } = await UpdateLessonPublished(lessonId, isPublished)

    setTogglingLessonId(null)

    if (error) {
      setPublishedState((prev) => ({ ...prev, [lessonId]: previous }))
      toast.error(error.message)
    }
  }

  function resetLessonForm() {
    setEditingLessonId(null)
    setVideoType('youtube')
    setAccessLevel('')
    setVideoUrl('')
    setSelectedSubject(null)
    setSelectedRootSubjectName(null)
    setTitle('')
    setDescription('')
    setThumbnailFile(null)
    setSavedThumbnailUrl(null)
    setThumbnailRemoved(false)
    setAttachmentFiles([])
    setExistingMaterials([])
    setRemovedMaterialIds(new Set())
  }

  async function startEditLesson(lesson: Lessons) {
    setLoadingEditId(lesson.id)
    resetLessonForm()
    setEditingLessonId(lesson.id)

    setVideoType(lesson.video_type)
    setAccessLevel(lesson.access_level)
    setVideoUrl(lesson.video_url)
    setTitle(lesson.title)
    setDescription(lesson.description)
    setSavedThumbnailUrl(lesson.thumbnail ?? null)

    const subject = subjectsData?.find((s) => s.id === lesson.subject_id) ?? null
    if (subject) {
      setSelectedSubject(subject)
      if (subject.subject_id) {
        const root = subjectsData?.find((s) => s.id === subject.subject_id)
        setSelectedRootSubjectName(root?.name ?? null)
      } else {
        setSelectedRootSubjectName(subject.name)
      }
    }

    const { data, error } = await GetLessonMaterials(lesson.id)
    setLoadingEditId(null)

    if (error) {
      toast.error(error.message)
      resetLessonForm()
      return
    }

    setExistingMaterials(data)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    resetLessonForm()
  }

  function handleDescriptionChange(value: string) {
    if (value.length <= DESCRIPTION_MAX) setDescription(value)
  }

  function handleThumbnailChange(files: FileList | null) {
    if (!files?.[0]) return
    setThumbnailFile(files[0])
    setThumbnailRemoved(false)
  }

  function handleRemoveThumbnail() {
    setThumbnailFile(null)
    setThumbnailRemoved(true)
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = ''
  }

  function handleAttachmentsChange(files: FileList | null) {
    if (!files) return
    const remainingSlots = MAX_ATTACHMENTS - totalMaterialCount
    if (remainingSlots <= 0) return
    const incoming = Array.from(files).slice(0, remainingSlots)
    setAttachmentFiles((prev) => [...prev, ...incoming])
  }

  function removePendingAttachment(index: number) {
    setAttachmentFiles((prev) => prev.filter((_, i) => i !== index))
  }

  function markMaterialForRemoval(materialId: string) {
    setRemovedMaterialIds((prev) => new Set(prev).add(materialId))
  }

  function validateLessonForm() {
    if (
      !accessLevel ||
      !videoUrl.trim() ||
      !selectedSubject ||
      !title.trim() ||
      !description.trim()
    ) {
      toast.error('Preencha todas as informações do vídeo.')
      return false
    }

    if (totalMaterialCount === 0) {
      toast.error('Adicione pelo menos um anexo.')
      return false
    }

    return true
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (editingLessonId) {
      await handleUpdateLesson()
    } else {
      await handleCreateLesson()
    }
  }

  async function handleCreateLesson() {
    if (!validateLessonForm()) return

    setIsSaving(true)

    try {
      let thumbnailUrl: string | null = null

      if (thumbnailFile) {
        const { publicUrl, uploadError } = await UploadLessonThumbnail(
          thumbnailFile,
          `lessons/${Date.now()}-${thumbnailFile.name}`,
        )

        if (uploadError || !publicUrl) {
          toast.error('Erro ao salvar a thumbnail do vídeo, tente novamente.')
          return
        }

        thumbnailUrl = publicUrl
      }

      const { data: lessonData, error: lessonError } = await CreateLesson(
        title.trim(),
        description.trim(),
        videoType,
        accessLevel,
        videoUrl.trim(),
        selectedSubject!.id,
        true,
        thumbnailUrl,
      )

      if (lessonError || !lessonData?.id) {
        toast.error(lessonError?.message ?? 'Erro ao criar a aula.')
        return
      }

      const { error: materialsError } = await UploadLessonMaterials(
        attachmentFiles,
        Number(lessonData.id),
      )

      if (materialsError) {
        toast.error(materialsError.message)
        return
      }
      
      resetLessonForm()
      toast.success('Aula publicada com sucesso!')
    } finally {
      setIsSaving(false)
    }
  }

  async function handleUpdateLesson() {
    if (!editingLessonId || !validateLessonForm()) return

    const previousThumbnailUrl = savedThumbnailUrl
    let thumbnailToDelete: string | null = null

    setIsSaving(true)

    try {
      let finalThumbnailUrl: string | null = null

      if (thumbnailRemoved && !thumbnailFile) {
        finalThumbnailUrl = null
        if (previousThumbnailUrl) thumbnailToDelete = previousThumbnailUrl
      } else if (thumbnailFile) {
        const { publicUrl, uploadError } = await UploadLessonThumbnail(
          thumbnailFile,
          `lessons/${Date.now()}-${thumbnailFile.name}`,
        )

        if (uploadError || !publicUrl) {
          toast.error('Erro ao salvar a thumbnail do vídeo, tente novamente.')
          return
        }

        finalThumbnailUrl = publicUrl
        if (previousThumbnailUrl) thumbnailToDelete = previousThumbnailUrl
      } else {
        finalThumbnailUrl = savedThumbnailUrl
      }

      const { error: lessonError } = await UpdateLesson(
        editingLessonId,
        title.trim(),
        description.trim(),
        videoType,
        accessLevel,
        videoUrl.trim(),
        selectedSubject!.id,
        finalThumbnailUrl,
      )

      if (lessonError) {
        toast.error(lessonError.message)
        return
      }

      const materialsToRemove = existingMaterials.filter((m) =>
        removedMaterialIds.has(m.id),
      )

      for (const material of materialsToRemove) {
        const { error: storageError } = await DeleteLessonMaterialFile(
          material.file_url,
        )
        if (storageError) {
          toast.error(storageError.message)
          return
        }

        const { error: deleteError } = await DeleteLessonMaterials(material.id)
        if (deleteError) {
          toast.error(deleteError.message)
          return
        }
      }

      if (attachmentFiles.length > 0) {
        const { error: materialsError } = await UploadLessonMaterials(
          attachmentFiles,
          Number(editingLessonId),
        )

        if (materialsError) {
          toast.error(materialsError.message)
          return
        }
      }

      if (thumbnailToDelete) {
        const { error: thumbDeleteError } =
          await DeleteLessonThumbnail(thumbnailToDelete)
        if (thumbDeleteError) {
          toast.error(thumbDeleteError.message)
          return
        }
      }

      resetLessonForm()
      toast.success('Aula atualizada com sucesso!')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="flex flex-col gap-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {editingLessonId ? (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3">
            <p className="text-sm font-semibold text-foreground">
              Editando aula
            </p>
            <button
              type="button"
              onClick={cancelEdit}
              disabled={isSaving}
              className="text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        ) : null}
        {/* Fonte do vídeo */}
        <div className="flex flex-col gap-2">
          <span className={fieldLabelClass}>Fonte do vídeo</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setVideoType('youtube')}
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors ${
                videoType === 'youtube'
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-foreground/25 bg-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
              }`}
            >
              <Play className="h-4 w-4" aria-hidden />
              YouTube
            </button>
            <button
              type="button"
              onClick={() => setVideoType('panda')}
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors ${
                videoType === 'panda'
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-foreground/25 bg-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
              }`}
            >
              <Video className="h-4 w-4" aria-hidden />
              Panda Vídeos
            </button>
          </div>
        </div>

        {/* Nível de acesso */}
        <div className="flex flex-col gap-2">
          <label htmlFor="access-level" className={fieldLabelClass}>
            Nível de acesso {<span className='text-chart-4 text-[16px] font-medium'>*</span>}
          </label>
          <div className="relative">
            <select
              id="access-level"
              value={accessLevel}
              onChange={(e) => setAccessLevel(e.target.value as AccessLevel)}
              className={`${inputClass} appearance-none pr-10 bg-primary-foreground`}
            >
              <option value="" disabled>
                Escolha o nível de acesso
              </option>
              {ACCESS_LEVEL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
          </div>
        </div>

        {/* Link do vídeo */}
        <div className="flex flex-col gap-2">
          <label htmlFor="video-url" className={fieldLabelClass}>
            {linkLabel} {<span className='text-chart-4 text-[16px] font-medium'>*</span>}
          </label>
          <input
            id="video-url"
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder={
              videoType === 'youtube'
                ? 'https://youtube.com/watch?v=Exemplo123...'
                : 'https://...'
            }
            className={inputClass}
          />
        </div>

        {/* Preview */}
        <div className="flex flex-col gap-2">
          <span className={fieldLabelClass}>Pré-visualização</span>
          <article className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
              {embedUrl ? (
                <iframe
                  className="h-full w-full"
                  src={embedUrl}
                  title={title.trim() || 'Pré-visualização do vídeo'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : thumbnailDisplayUrl ? (
                <Image
                  src={thumbnailDisplayUrl}
                  alt={title.trim() || 'Pré-visualização da aula'}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="100vw"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
                  <Clapperboard
                    className="h-8 w-8 text-accent"
                    aria-hidden
                  />
                  <p className="text-sm text-muted-foreground">
                    Cole o link acima para visualizar o vídeo
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 p-4">
              {selectedRootSubjectName ? (
                <span className="inline-flex self-start rounded-full bg-primary/18 border-primary px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                  {selectedRootSubjectName}
                </span>
              ) : null}

              {title.trim() ? (
                <h3 className="text-base font-bold leading-snug text-foreground">
                  {title}
                </h3>
              ) : (
                <p className="text-sm text-muted-foreground/70">
                  O título da aula aparecerá aqui
                </p>
              )}

              {description.trim() ? (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground/70">
                  A descrição da aula aparecerá aqui
                </p>
              )}
            </div>
          </article>
        </div>

        {/* Informações do vídeo */}
        {videoUrl ? (
        <div className="rounded-xl border-1 border-foreground/25 p-px">
          <div className="flex flex-col gap-4 rounded-[calc(var(--radius-lg)-1px)] bg-card p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <Pencil className="h-4 w-4 text-foreground" aria-hidden />
              <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
                Informações do vídeo
              </h3>
            </div>

            <div className="flex flex-col gap-2">
              <span className={fieldLabelClass}>Matéria {<span className='text-chart-4 text-[16px] font-medium'>*</span>}</span>
              <button
                type="button"
                id="lesson-subject"
                onClick={() => setIsSubjectModalOpen(true)}
                className={`${inputClass} flex items-center justify-between text-left`}
              >
                <span
                  className={
                    selectedSubject ? 'text-foreground' : 'text-muted-foreground'
                  }
                >
                  {selectedSubject
                    ? selectedRootSubjectName
                      ? `${selectedRootSubjectName} · ${selectedSubject.name}`
                      : selectedSubject.name
                    : 'Selecionar matéria'}
                </span>
                <ChevronDown
                  className="h-4 w-4 shrink-0 text-muted-foreground"
                  aria-hidden
                />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="lesson-title" className={fieldLabelClass}>
                Título {<span className='text-chart-4 text-[16px] font-medium'>*</span>}
              </label>
              <input
                id="lesson-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Aula Completa de Concordância"
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="lesson-description" className={fieldLabelClass}>
                Descrição {<span className='text-chart-4 text-[16px] font-medium'>*</span>}
              </label>
              <div className="relative">
                <textarea
                  id="lesson-description"
                  value={description}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  placeholder="Descreva rapidamente o conteúdo da aula..."
                  rows={4}
                  className={`${inputClass} resize-none pb-7`}
                />
                <span className="pointer-events-none absolute bottom-2 right-3 text-[11px] text-muted-foreground">
                  {description.length}/{DESCRIPTION_MAX}
                </span>
              </div>
            </div>
          </div>
        </div>
        ) : null}

        {/* Thumbnail */}
        <div className="flex flex-col gap-3">
          <span className="text-sm font-semibold text-foreground">Thumbnail {'(opcional)'}</span>
          <input
            ref={thumbnailInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            className="sr-only"
            onChange={(e) => handleThumbnailChange(e.target.files)}
          />
          <button
            type="button"
            onClick={() => thumbnailInputRef.current?.click()}
            className="flex min-h-[140px] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-4 py-6 transition-colors hover:border-primary/40 hover:bg-muted/20"
          >
            {thumbnailDisplayUrl ? (
              <Image
                src={thumbnailDisplayUrl}
                alt="Pré-visualização da thumbnail"
                width={320}
                height={180}
                unoptimized
                className="max-h-24 w-auto rounded-lg object-contain"
              />
            ) : (
              <>
                <ImagePlus className="h-6 w-6 text-accent" aria-hidden />
                <p className="text-center text-sm text-muted-foreground">
                  <span className="font-semibold text-accent">
                    Selecione do computador
                  </span>{' '}
                  ou arraste aqui
                </p>
                <p className="text-xs text-muted-foreground">PNG, JPG até 10 MB</p>
              </>
            )}
          </button>

          {thumbnailDisplayUrl ? (
            <button
              type="button"
              onClick={handleRemoveThumbnail}
              disabled={isSaving}
              className="self-start text-xs font-semibold text-destructive transition-colors hover:underline disabled:opacity-50"
            >
              Remover thumbnail
            </button>
          ) : null}

          <div className="flex items-start gap-2 rounded-lg border-l-2 border-primary bg-primary/10 px-3 py-2.5">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <p className="text-xs font-medium text-primary">
              Tamanho recomendado: 1280×720 pixels
            </p>
          </div>

          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            Se você não fizer o upload de uma thumbnail, vamos extrair uma do vídeo
            automaticamente.
          </p>
        </div>

        {/* Anexos */}
        <div className="flex flex-col gap-3">
          <div>
            <span className="text-sm font-semibold text-foreground">Anexos {<span className='text-chart-4 text-[16px] font-medium'>*</span>}</span>
            <p className="text-xs text-muted-foreground">
              Você pode anexar até {MAX_ATTACHMENTS} arquivos
              {editingLessonId
                ? ` (${totalMaterialCount} no total)`
                : null}
            </p>
          </div>
          <input
            ref={attachmentsInputRef}
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.gif,.bmp,.pdf,.zip,.rar,.epub,.xls,.xlsx,.mp3,.doc,.docx,.ppt,.pptx"
            className="sr-only"
            onChange={(e) => {
              handleAttachmentsChange(e.target.files)
              e.target.value = ''
            }}
          />
          <button
            type="button"
            onClick={() => attachmentsInputRef.current?.click()}
            disabled={!canAddMoreMaterials || isSaving}
            className="flex min-h-[160px] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-4 py-6 transition-colors hover:border-primary/40 hover:bg-muted/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Upload className="h-8 w-8 text-muted-foreground" aria-hidden />
            <p className="text-center text-sm text-muted-foreground">
              Solte aqui ou{' '}
              <span className="font-semibold text-accent">selecione do computador</span>
            </p>
            <p className="max-w-md text-center text-[11px] leading-relaxed text-muted-foreground">
              jpg, png, pdf, docx — até {MAX_ATTACHMENTS} arquivos de 50 MB cada
            </p>
          </button>

          {keptExistingMaterials.length > 0 || attachmentFiles.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {keptExistingMaterials.map((material) => (
                <li
                  key={material.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2"
                >
                  <span className="flex min-w-0 items-center gap-2 text-sm text-foreground">
                    <FileUp className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                    <span className="truncate">{material.title}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => markMaterialForRemoval(material.id)}
                    disabled={isSaving}
                    className="shrink-0 text-xs font-semibold text-destructive hover:underline disabled:opacity-50"
                  >
                    Remover
                  </button>
                </li>
              ))}
              {attachmentFiles.map((file, index) => (
                <li
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between gap-2 rounded-lg border border-dashed border-accent/30 bg-accent/5 px-3 py-2"
                >
                  <span className="flex min-w-0 items-center gap-2 text-sm text-foreground">
                    <FileUp className="h-4 w-4 shrink-0 text-accent" aria-hidden />
                    <span className="truncate">{file.name}</span>
                    <span className="shrink-0 text-[10px] font-semibold uppercase text-accent">
                      Novo
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => removePendingAttachment(index)}
                    disabled={isSaving}
                    className="shrink-0 text-xs font-semibold text-destructive hover:underline disabled:opacity-50"
                  >
                    Remover
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full rounded-xl border border-primary bg-primary py-3.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving
            ? editingLessonId
              ? 'Salvando...'
              : 'Publicando...'
            : editingLessonId
              ? 'Salvar'
              : 'Publicar'}
        </button>
      </form>

      <section className="flex flex-col gap-3 mb-15">
        <h2 className="text-base font-bold text-foreground">Vídeos publicados</h2>

        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            value={publishedSearch}
            onChange={(e) => setPublishedSearch(e.target.value)}
            placeholder="Buscar vídeo..."
            className={`${inputClass} pl-10`}
          />
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {lessonsData === null ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              Carregando vídeos...
            </p>
          ) : filteredPublishedLessons.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              {publishedSearch.trim()
                ? 'Nenhum vídeo encontrado para essa busca.'
                : 'Nenhum vídeo publicado ainda.'}
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {pagedPublishedLessons.map((lesson, index) => (
                <li
                  key={lesson.id}
                  className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div
                      className={`relative shrink-0 overflow-hidden rounded-lg ${
                        lesson.thumbnail
                          ? 'bg-muted'
                          : THUMBNAIL_PLACEHOLDER_COLORS[
                              index % THUMBNAIL_PLACEHOLDER_COLORS.length
                            ]
                      }`}
                      style={{ width: '72px', minWidth: '72px', height: '48px' }}
                    >
                      {lesson.thumbnail ? (
                        <Image
                          src={lesson.thumbnail}
                          alt={lesson.title}
                          fill
                          unoptimized
                          className="object-cover"
                          sizes="72px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Play
                            className="h-4 w-4 text-foreground/70"
                            aria-hidden
                          />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-foreground">
                        {lesson.title}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wide ${videoTypeBadgeClass(lesson.video_type)}`}
                        >
                          {lesson.video_type === 'youtube' ? (
                            <Play className="h-2.5 w-2.5" aria-hidden />
                          ) : (
                            <Video className="h-2.5 w-2.5" aria-hidden />
                          )}
                          {videoTypeLabel(lesson.video_type)}
                        </span>
                        <span
                          className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wide ${accessLevelBadgeClass(lesson.access_level)}`}
                        >
                          {accessLevelLabel(lesson.access_level)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center justify-end gap-6 sm:justify-start">
                    <Switch
                      checked={publishedState[lesson.id] ?? lesson.is_published}
                      onCheckedChange={(checked) =>
                        void handleTogglePublished(lesson.id, checked)
                      }
                      disabled={togglingLessonId === lesson.id}
                      aria-label={`Publicado: ${lesson.title}`}
                      className="data-checked:bg-chart-2 scale-150"
                    />
                    <button
                      type="button"
                      onClick={() => void startEditLesson(lesson)}
                      disabled={
                        isSaving ||
                        loadingEditId === lesson.id ||
                        editingLessonId === lesson.id
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent transition-colors hover:bg-accent/15 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden />
                      Editar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lessonsData !== null && filteredPublishedLessons.length > 0 ? (
          <Pager
            page={publishedPage}
            totalPages={publishedTotalPages}
            totalItems={filteredPublishedLessons.length}
            itemLabel={
              filteredPublishedLessons.length === 1 ? 'vídeo' : 'vídeos'
            }
            color="accent"
            onPrev={() => setPublishedPage((p) => Math.max(1, p - 1))}
            onNext={() =>
              setPublishedPage((p) => Math.min(publishedTotalPages, p + 1))
            }
          />
        ) : null}
      </section>

      <ModalSubjectPicker
        open={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        subjectsData={subjectsData}
        selectedSubjectId={selectedSubject?.id}
        onSelect={({ relatedSubject, rootSubjectName }) => {
          setSelectedSubject(relatedSubject)
          setSelectedRootSubjectName(rootSubjectName)
          setIsSubjectModalOpen(false)
        }}
      />
    </section>
  )
}
