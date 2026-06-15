'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  LessonRootSubjectPillFilter,
  LESSON_FILTER_QUESTOES_BANCAS,
} from './LessonRootSubjectPillFilter'
import {
  ArrowRight,
  Download,
  FileText,
  Play,
  Search,
  Sparkles,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { LessonMaterials, Lessons, Subjects, VideoType } from '@/types'
import {
  CreateLessonNote,
  GetLessonMaterials,
  GetLessonNote,
  UpdateLessonNote,
} from '@/lib/lib-lessons'
import { GetLessonMaterialSignedUrl } from '@/lib/lib-storage'
import { useProfile } from '@/context/ProfileContext'

const THUMBNAIL_PLACEHOLDER_COLORS = [
  'bg-accent/30',
  'bg-chart-2/30',
  'bg-chart-5/30',
] as const

const QUESTOES_BANCAS_LABEL = 'Questões de Bancas'

function formatDuration(secondsValue: string): string {
  const totalSeconds = Number.parseInt(secondsValue, 10)
  if (Number.isNaN(totalSeconds) || totalSeconds <= 0) return '--:--'
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

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

function getLessonEmbedUrl(videoType: VideoType, videoUrl: string): string | null {
  if (videoType === 'youtube') return getYoutubeEmbedUrl(videoUrl)
  return getPandaEmbedUrl(videoUrl)
}

type SearchVideoProps = {
  lessonsData?: Lessons[] | null
  subjectsData?: Subjects[] | null
  isAuthenticated?: boolean
}

function SignupLessonPrompt({ onClose }: { onClose: () => void }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          aria-label="Voltar para a lista de aulas"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/[0.12] via-card to-card px-6 py-12 text-center shadow-lg shadow-primary/10 ring-1 ring-primary/10 md:px-10 md:py-14">
        <div
          className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/25 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 -left-12 h-44 w-44 rounded-full bg-primary/15 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto flex max-w-lg flex-col items-center gap-5">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/30 bg-primary/15 shadow-inner shadow-primary/20">
            <Sparkles
              className="h-7 w-7 text-primary drop-shadow-md"
              aria-hidden
            />
          </div>
          <div className="space-y-2">
            <p className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-xl font-black tracking-tight text-transparent md:text-2xl">
              Desbloqueie todas as aulas
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
              Crie sua conta em poucos segundos e comece a estudar com vídeos,
              filtros por matéria e muito mais.
            </p>
          </div>
          <Link
            href="/auth/signup"
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary/90 px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/35 ring-2 ring-primary/25 ring-offset-2 ring-offset-background transition-transform hover:scale-[1.03] hover:shadow-xl hover:shadow-primary/45 active:scale-[0.98]"
          >
            Criar conta grátis
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        </div>
      </div>
    </section>
  )
}

export function SearchVideo({
  lessonsData = [],
  subjectsData = [],
  isAuthenticated = true,
}: SearchVideoProps) {
  const { profile } = useProfile()
  const [search, setSearch] = useState('')
  const [selectedRootFilter, setSelectedRootFilter] = useState('')
  const [selectedLesson, setSelectedLesson] = useState<Lessons | null>(null)
  const [noteContent, setNoteContent] = useState('')
  const [existingNoteId, setExistingNoteId] = useState<string | null>(null)
  const [materials, setMaterials] = useState<LessonMaterials[]>([])
  const [materialsLoading, setMaterialsLoading] = useState(false)
  const [noteLoading, setNoteLoading] = useState(false)
  const [savingNote, setSavingNote] = useState(false)
  const [openingMaterialId, setOpeningMaterialId] = useState<string | null>(
    null,
  )
  const [showSignupPrompt, setShowSignupPrompt] = useState(false)

  const subjectNameById = useMemo(() => {
    const map = new Map<string, string>()
    ;(subjectsData ?? []).forEach((subject) => {
      map.set(subject.id, subject.name)
    })
    return map
  }, [subjectsData])

  const activeFilterLabel = useMemo(() => {
    if (!selectedRootFilter) return 'Tudo'
    if (selectedRootFilter === LESSON_FILTER_QUESTOES_BANCAS) {
      return QUESTOES_BANCAS_LABEL
    }
    return subjectNameById.get(selectedRootFilter) ?? 'Tudo'
  }, [selectedRootFilter, subjectNameById])

  const filteredVideos = useMemo(() => {
    const q = search.trim().toLowerCase()
    const allSubjects = subjectsData ?? []

    let allowedSubjectIds: Set<string> | null = null
    if (selectedRootFilter === '') {
      allowedSubjectIds = null
    } else if (selectedRootFilter === LESSON_FILTER_QUESTOES_BANCAS) {
      const ids = new Set<string>()
      for (const s of allSubjects) {
        if (s.name !== QUESTOES_BANCAS_LABEL) continue
        ids.add(s.id)
        if (s.subject_id === null) {
          for (const child of allSubjects) {
            if (child.subject_id === s.id) ids.add(child.id)
          }
        }
      }
      allowedSubjectIds = ids
    } else {
      allowedSubjectIds = new Set<string>([
        selectedRootFilter,
        ...allSubjects
          .filter((s) => s.subject_id === selectedRootFilter)
          .map((s) => s.id),
      ])
    }

    return (lessonsData ?? []).filter((lesson) => {
      const matchesFilter =
        allowedSubjectIds === null
          ? true
          : allowedSubjectIds.has(lesson.subject_id)
      const matchesSearch =
        q === '' ||
        lesson.title.toLowerCase().includes(q) ||
        lesson.description.toLowerCase().includes(q)
      return matchesFilter && matchesSearch
    })
  }, [search, lessonsData, subjectsData, selectedRootFilter])

  useEffect(() => {
    const lessonId = selectedLesson?.id
    const profileId = profile?.id

    if (!lessonId) {
      setMaterials([])
      setNoteContent('')
      setExistingNoteId(null)
      return
    }

    let cancelled = false

    async function fetchLessonDetails(id: string) {
      setMaterialsLoading(true)
      setNoteLoading(true)

      const materialsPromise = GetLessonMaterials(id)
      const notePromise = profileId
        ? GetLessonNote(profileId, id)
        : Promise.resolve({ data: null, error: null })

      const [materialsResult, noteResult] = await Promise.all([
        materialsPromise,
        notePromise,
      ])

      if (cancelled) return

      if (materialsResult.error) {
        toast.error(materialsResult.error.message)
        setMaterials([])
      } else {
        setMaterials(materialsResult.data)
      }

      if (noteResult.error) {
        toast.error(noteResult.error.message)
        setNoteContent('')
        setExistingNoteId(null)
      } else if (noteResult.data) {
        setNoteContent(noteResult.data.content ?? '')
        setExistingNoteId(noteResult.data.id)
      } else {
        setNoteContent('')
        setExistingNoteId(null)
      }

      setMaterialsLoading(false)
      setNoteLoading(false)
    }

    void fetchLessonDetails(lessonId)

    return () => {
      cancelled = true
    }
  }, [selectedLesson, profile?.id])

  function handleSelectLesson(lesson: Lessons) {
    if (!isAuthenticated) {
      setShowSignupPrompt(true)
      return
    }
    setSelectedLesson(lesson)
  }

  function handleCloseLesson() {
    setSelectedLesson(null)
    setNoteContent('')
    setExistingNoteId(null)
    setMaterials([])
  }

  async function handleOpenMaterial(materialId: string, fileUrl: string) {
    setOpeningMaterialId(materialId)

    const { signedUrl, error } = await GetLessonMaterialSignedUrl(fileUrl)

    setOpeningMaterialId(null)

    if (error || !signedUrl) {
      toast.error(
        error?.message ?? 'Não foi possível gerar o link do material.',
      )
      return
    }

    window.open(signedUrl, '_blank', 'noopener,noreferrer')
  }

  async function handleSaveNote() {
    if (!selectedLesson) return

    const trimmedNote = noteContent.trim()
    if (!trimmedNote) {
      toast.error('Escreva uma anotação antes de salvar.')
      return
    }

    if (!profile?.id) {
      toast.error('Faça login para salvar anotações.')
      return
    }

    setSavingNote(true)

    if (existingNoteId) {
      const { error } = await UpdateLessonNote(existingNoteId, trimmedNote)
      setSavingNote(false)

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Anotação atualizada com sucesso!')
      return
    }

    const { data, error } = await CreateLessonNote(
      profile.id,
      selectedLesson.id,
      trimmedNote,
    )
    setSavingNote(false)

    if (error) {
      toast.error(error.message)
      return
    }

    if (data?.id) {
      setExistingNoteId(data.id)
    }

    toast.success('Anotação salva com sucesso!')
  }

  const selectedLessonEmbedUrl = selectedLesson
    ? getLessonEmbedUrl(selectedLesson.video_type, selectedLesson.video_url)
    : null

  if (showSignupPrompt) {
    return <SignupLessonPrompt onClose={() => setShowSignupPrompt(false)} />
  }

  if (selectedLesson) {
    const subjectName =
      subjectNameById.get(selectedLesson.subject_id) ?? 'Sem matéria'

    return (
      <section className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="inline-flex rounded-full bg-primary/20 px-2 py-0.5 text-[9px] font-black tracking-wider text-primary uppercase">
              {subjectName}
            </span>
            <h2 className="mt-2 font-heading text-lg font-black leading-tight text-foreground md:text-xl">
              {selectedLesson.title}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {selectedLesson.description}
            </p>
          </div>

          <button
            type="button"
            onClick={handleCloseLesson}
            className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-border text-secondary-foreground transition-colors hover:border-primary/40 hover:text-foreground bg-secondary"
            aria-label="Voltar para a lista de aulas"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black">
          {selectedLessonEmbedUrl ? (
            <iframe
              src={selectedLessonEmbedUrl}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={selectedLesson.title}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
              Não foi possível carregar o player desta aula.
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <label
            htmlFor="lesson-note"
            className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground"
          >
            Minhas anotações
          </label>
          <textarea
            id="lesson-note"
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            rows={5}
            disabled={noteLoading}
            placeholder={
              noteLoading
                ? 'Carregando anotação...'
                : 'Anote os pontos principais desta aula...'
            }
            className="w-full resize-y rounded-xl border border-border bg-primary-foreground px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 disabled:cursor-wait disabled:opacity-60"
          />
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={handleSaveNote}
              disabled={savingNote}
              className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingNote ? 'Salvando...' : 'Salvar anotação'}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Materiais da aula
          </p>

          {materialsLoading ? (
            <p className="text-sm text-muted-foreground">Carregando materiais...</p>
          ) : materials.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum material disponível para esta aula.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {materials.map((material) => (
                <li key={material.id}>
                  <button
                    type="button"
                    onClick={() =>
                      handleOpenMaterial(material.id, material.file_url)
                    }
                    disabled={openingMaterialId === material.id}
                    className="flex w-full items-center gap-3 rounded-xl border border-border bg-background px-3 py-3 text-left transition-colors hover:border-primary/40 hover:bg-muted/30 disabled:cursor-wait disabled:opacity-60"
                  >
                    <span className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <FileText className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-foreground">
                        {openingMaterialId === material.id
                          ? 'Abrindo material...'
                          : material.title || 'Material sem título'}
                      </span>
                      {material.file_type ? (
                        <span className="text-xs text-muted-foreground">
                          {material.file_type}
                        </span>
                      ) : null}
                    </span>
                    <Download className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-4">
      <LessonRootSubjectPillFilter
        subjectsData={subjectsData}
        selectedRootFilter={selectedRootFilter}
        onSelectedRootFilterChange={setSelectedRootFilter}
      />

      <div className="relative max-w-[700px]">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquise aulas, questões..."
          className="w-full rounded-full border border-border bg-primary-foreground py-3 pl-11 pr-5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50"
        />
      </div>

      <p className="pt-2 text-xs font-bold tracking-widest text-muted-foreground uppercase">
        {activeFilterLabel}
      </p>

      {filteredVideos.length === 0 ? (
        <div className="rounded-xl border border-border bg-card px-6 py-10 text-center">
          <p className="text-sm font-semibold text-foreground">
            Nenhuma aula encontrada
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Tente outro termo ou filtro de matéria.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4">
          {filteredVideos.map((video, index) => {
            const subjectName =
              subjectNameById.get(video.subject_id) ?? 'Sem matéria'

            return (
              <div
                key={video.id}
                role="button"
                tabIndex={0}
                onClick={() => handleSelectLesson(video)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    handleSelectLesson(video)
                  }
                }}
                className="flex cursor-pointer flex-col gap-2 rounded-xl border border-border bg-card p-2.5 transition-colors hover:border-primary/30 md:gap-3 md:p-3"
              >
                <div
                  className={`relative aspect-video w-full overflow-hidden rounded-lg ${
                    video.thumbnail
                      ? 'bg-muted'
                      : THUMBNAIL_PLACEHOLDER_COLORS[
                          index % THUMBNAIL_PLACEHOLDER_COLORS.length
                        ]
                  }`}
                >
                  {video.thumbnail ? (
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Play
                        className="h-10 w-10 text-foreground/70"
                        aria-hidden
                      />
                    </div>
                  )}
                  <span className="pointer-events-none absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {formatDuration(video.duration_seconds)}
                  </span>
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="inline-flex self-start rounded-full bg-primary/20 px-2 py-0.5 text-[8px] font-black tracking-wider text-primary uppercase md:text-[9px]">
                    {subjectName}
                  </span>
                  <p className="line-clamp-2 text-xs leading-snug font-semibold text-foreground md:text-sm">
                    {video.title}
                  </p>
                  <p className="line-clamp-2 text-[11px] text-muted-foreground md:text-xs">
                    {video.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
