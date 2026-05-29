'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo, useState } from 'react'
import { ModalLesson } from './ModalLesson'
import { ModalLessonDelete } from './ModalLessonDelete'
import {
  LessonRootSubjectPillFilter,
  LESSON_FILTER_QUESTOES_BANCAS,
} from './LessonRootSubjectPillFilter'
import {
  ArrowRight,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { Lessons, Subjects } from '@/types'

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

type SearchVideoProps = {
  lessonsData?: Lessons[] | null
  subjectsData?: Subjects[] | null
  isAuthenticated?: boolean
}

export function SearchVideo({
  lessonsData = [],
  subjectsData = [],
  isAuthenticated = true,
}: SearchVideoProps) {
  const pathname = usePathname()
  const isAdminPage = pathname === '/admin'
  const [search, setSearch] = useState('')
  /** Empty string = "Tudo"; otherwise root subject id */
  const [selectedRootFilter, setSelectedRootFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedVideo, setSelectedVideo] = useState<Lessons | null>(null)
  const [modalSession, setModalSession] = useState(0)

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
      return 'Quest├Áes de Bancas'
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
      const label = 'Quest├Áes de Bancas'
      const ids = new Set<string>()
      for (const s of allSubjects) {
        if (s.name !== label) continue
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

  function openCreateModal() {
    setModalMode('create')
    setSelectedVideo(null)
    setModalSession((prev) => prev + 1)
    setIsModalOpen(true)
  }

  function openEditModal(lesson: Lessons) {
    setModalMode('edit')
    setSelectedVideo(lesson)
    setModalSession((prev) => prev + 1)
    setIsModalOpen(true)
  }

  function openDeleteModal(lesson: Lessons) {
    setSelectedVideo(lesson)
    setIsDeleteModalOpen(true)
  }

  return (
    <section className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          {isAdminPage ? (
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:opacity-90"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
              Criar aula
            </button>
          ) : null}
        </div>
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
          placeholder="Pesquise aulas, quest├Áes..."
          className="w-full rounded-full border border-border bg-card py-3 pl-11 pr-5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50"
        />
      </div>

      <p className="pt-2 text-xs font-bold tracking-widest text-muted-foreground uppercase">
        {activeFilterLabel}
      </p>

      {!isAuthenticated ? (
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
                Crie sua conta em poucos segundos e comece a estudar com v├¡deos,
                filtros por mat├®ria e muito mais.
              </p>
            </div>
            <Link
              href="/auth/signup"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary/90 px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/35 ring-2 ring-primary/25 ring-offset-2 ring-offset-background transition-transform hover:scale-[1.03] hover:shadow-xl hover:shadow-primary/45 active:scale-[0.98]"
            >
              Criar conta gr├ítis
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4">
          {filteredVideos.map((video) => {
          const embedUrl = getYoutubeEmbedUrl(video.video_url)
          const subjectName = subjectNameById.get(video.subject_id) ?? 'Sem mat├®ria'
          return (
          <div
            key={video.id}
            role="button"
            tabIndex={0}
            className="flex cursor-pointer flex-col gap-2 rounded-xl border border-border bg-card p-2.5 transition-colors hover:border-primary/30 md:gap-3 md:p-3"
          >
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
              {embedUrl ? (
                <iframe
                  className="h-full w-full"
                  src={embedUrl}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-muted-foreground">
                  URL do YouTube inv├ílida
                </div>
              )}
              <span className="pointer-events-none absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {formatDuration(video.duration_seconds)}
              </span>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span
                className="inline-flex self-start rounded-full bg-primary/20 px-2 py-0.5 text-[8px] font-black tracking-wider text-primary uppercase md:text-[9px]"
              >
                {subjectName}
              </span>
              <div className="flex items-center gap-3">
                {/* Left ÔÇö title + description */}
                <div className="flex flex-col gap-1 flex-1">
                  <p className="line-clamp-2 text-xs leading-snug font-semibold text-foreground md:text-sm">
                    {video.title}
                  </p>
                  <p className="line-clamp-2 text-[11px] text-muted-foreground md:text-xs">
                    {video.description}
                  </p>
                </div>

                {/* Right ÔÇö button */}
                {isAdminPage ? (
                  <div className='flex'>
                    <button
                      type="button"
                      onClick={() => openEditModal(video)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-bold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground flex-shrink-0"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden />
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => openDeleteModal(video)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-bold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground flex-shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      Deletar
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          )})}
        </div>
      )}
      <ModalLesson
        key={modalSession}
        open={isModalOpen}
        mode={modalMode}
        lessonsData={selectedVideo}
        onClose={() => setIsModalOpen(false)}
        subjectsData={subjectsData}
      />
      <ModalLessonDelete
        open={isDeleteModalOpen}
        lessonName={selectedVideo?.title ?? ''}
        lessonId={selectedVideo?.id ?? ''}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </section>
  )
}
