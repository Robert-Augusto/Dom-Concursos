'use client'

import Image from 'next/image'
import { useMemo, useRef, useState, type FormEvent } from 'react'
import {
  ChevronDown,
  Clapperboard,
  FileUp,
  HelpCircle,
  ImagePlus,
  Lightbulb,
  Pencil,
  Play,
  Upload,
  Video,
} from 'lucide-react'
import { AccessLevel, Subjects, VideoType } from '@/types'
import { ModalSubjectPicker } from '@/components/shared/ModalSubjectPicker'
import { CreateLesson } from '@/lib/lib-lessons'

const DESCRIPTION_MAX = 300
const MAX_ATTACHMENTS = 10

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

const fieldLabelClass =
  'text-[11px] font-bold uppercase tracking-wider text-muted-foreground'

const inputClass =
  'w-full rounded-lg border border-border bg-primary-foreground px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50'

type AdminLessonsProps = {
  subjectsData?: Subjects[] | null
}

export default function AdminLessons({ subjectsData }: AdminLessonsProps) {
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

  const embedUrl = useMemo(() => {
    if (!videoUrl.trim()) return null
    return videoType === 'youtube'
      ? getYoutubeEmbedUrl(videoUrl)
      : getPandaEmbedUrl(videoUrl)
  }, [videoUrl, videoType])

  const isVideoLinkValid = useMemo(() => {
    if (!videoUrl.trim()) return false
    return videoType === 'youtube'
      ? isYoutubeLinkValid(videoUrl)
      : isPandaLinkValid(videoUrl)
  }, [videoUrl, videoType])

  const thumbnailPreviewUrl = useMemo(() => {
    if (!thumbnailFile) return null
    return URL.createObjectURL(thumbnailFile)
  }, [thumbnailFile])

  const linkLabel =
    videoType === 'youtube' ? 'Link do YouTube' : 'Link do Panda Vídeos'

  function handleDescriptionChange(value: string) {
    if (value.length <= DESCRIPTION_MAX) setDescription(value)
  }

  function handleThumbnailChange(files: FileList | null) {
    if (!files?.[0]) return
    setThumbnailFile(files[0])
  }

  function handleAttachmentsChange(files: FileList | null) {
    if (!files) return
    const next = [...attachmentFiles, ...Array.from(files)].slice(0, MAX_ATTACHMENTS)
    setAttachmentFiles(next)
  }

  function removeAttachment(index: number) {
    setAttachmentFiles((prev) => prev.filter((_, i) => i !== index))
  }

  function handlePublish(event: FormEvent) {
    event.preventDefault()
  }

  async function handleCreateLesson() {

  }

  return (
    <section className="flex flex-col gap-8">
      <form onSubmit={handlePublish} className="flex flex-col gap-8">
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
            Nível de acesso
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
            {linkLabel}
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
              ) : thumbnailPreviewUrl ? (
                <Image
                  src={thumbnailPreviewUrl}
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
        {isVideoLinkValid ? (
        <div className="rounded-xl border-1 border-foreground/25 p-px">
          <div className="flex flex-col gap-4 rounded-[calc(var(--radius-lg)-1px)] bg-card p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <Pencil className="h-4 w-4 text-foreground" aria-hidden />
              <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
                Informações do vídeo
              </h3>
            </div>

            <div className="flex flex-col gap-2">
              <span className={fieldLabelClass}>Matéria</span>
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
                Título
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
                Descrição
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
          <span className="text-sm font-semibold text-foreground">Thumbnail</span>
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
            {thumbnailPreviewUrl ? (
              <Image
                src={thumbnailPreviewUrl}
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
            <span className="text-sm font-semibold text-foreground">Anexos</span>
            <p className="text-xs text-muted-foreground">
              Você pode anexar até {MAX_ATTACHMENTS} arquivos
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
            disabled={attachmentFiles.length >= MAX_ATTACHMENTS}
            className="flex min-h-[160px] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-4 py-6 transition-colors hover:border-primary/40 hover:bg-muted/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Upload className="h-8 w-8 text-muted-foreground" aria-hidden />
            <p className="text-center text-sm text-muted-foreground">
              Solte aqui ou{' '}
              <span className="font-semibold text-accent">selecione do computador</span>
            </p>
            <p className="max-w-md text-center text-[11px] leading-relaxed text-muted-foreground">
              jpg, gif, png, bmp, pdf, zip, rar, epub, xls, xlsx, mp3, doc, docx, ppt,
              pptx — até {MAX_ATTACHMENTS} arquivos de 100 MB cada
            </p>
          </button>

          {attachmentFiles.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {attachmentFiles.map((file, index) => (
                <li
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2"
                >
                  <span className="flex min-w-0 items-center gap-2 text-sm text-foreground">
                    <FileUp className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                    <span className="truncate">{file.name}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="shrink-0 text-xs font-semibold text-destructive hover:underline"
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
          className="w-full rounded-xl border border-primary bg-primary py-3.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
          onClick={handleCreateLesson}
        >
          Publicar
        </button>
      </form>

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
