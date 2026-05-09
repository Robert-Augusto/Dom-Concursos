'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo, useState } from 'react'
import { ModalLesson } from './ModalLesson'
import { ModalLessonDelete } from './ModalLessonDelete'
import { SubjectFilterGroup } from './SubjectFilterGroup'
import {
  Pencil,
  Plus,
  Search,
  Trash2
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
  const [subjectFilterSearch, setSubjectFilterSearch] = useState('')
  const [selectedRootFilter, setSelectedRootFilter] = useState('')
  const [selectedRelatedFilter, setSelectedRelatedFilter] = useState('')
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
    if (selectedRelatedFilter) {
      return subjectNameById.get(selectedRelatedFilter) ?? 'Tudo'
    }
    return subjectNameById.get(selectedRootFilter) ?? 'Tudo'
  }, [selectedRootFilter, selectedRelatedFilter, subjectNameById])

  const filteredVideos = useMemo(() => {
    const q = search.trim().toLowerCase()
    const relatedIdsFromRoot = selectedRootFilter
      ? new Set(
          (subjectsData ?? [])
            .filter((subject) => subject.subject_id === selectedRootFilter)
            .map((subject) => subject.id)
        )
      : null

    return (lessonsData ?? []).filter((lesson) => {
      const matchesFilter = selectedRelatedFilter
        ? lesson.subject_id === selectedRelatedFilter
        : selectedRootFilter
          ? relatedIdsFromRoot?.has(lesson.subject_id) ?? false
          : true
      const matchesSearch =
        q === '' ||
        lesson.title.toLowerCase().includes(q) ||
        lesson.description.toLowerCase().includes(q)
      return matchesFilter && matchesSearch
    })
  }, [search, lessonsData, subjectsData, selectedRootFilter, selectedRelatedFilter])

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
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-black text-foreground font-heading">
                Buscar Aulas
            </h2>
            <p className="text-sm text-muted-foreground">
                Procure suas aulas de interesse
            </p>
          </div>
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
      <SubjectFilterGroup
        subjectsData={subjectsData}
        subjectFilterSearch={subjectFilterSearch}
        onSubjectFilterSearchChange={setSubjectFilterSearch}
        selectedRootFilter={selectedRootFilter}
        selectedRelatedFilter={selectedRelatedFilter}
        onSelectedRootFilterChange={setSelectedRootFilter}
        onSelectedRelatedFilterChange={setSelectedRelatedFilter}
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
          className="w-full rounded-full border border-border bg-card py-3 pl-11 pr-5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50"
        />
      </div>

      <p className="pt-2 text-xs font-bold tracking-widest text-muted-foreground uppercase">
        {activeFilterLabel}
      </p>

      {!isAuthenticated ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card px-6 py-10 text-center">
          <p className="max-w-md text-sm text-muted-foreground">
            Você precisa criar uma conta para assistir as aulas.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center rounded-full border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Criar conta
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4">
          {filteredVideos.map((video) => {
          const embedUrl = getYoutubeEmbedUrl(video.video_url)
          const subjectName = subjectNameById.get(video.subject_id) ?? 'Sem matéria'
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
                  URL do YouTube inválida
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
                {/* Left — title + description */}
                <div className="flex flex-col gap-1 flex-1">
                  <p className="line-clamp-2 text-xs leading-snug font-semibold text-foreground md:text-sm">
                    {video.title}
                  </p>
                  <p className="line-clamp-2 text-[11px] text-muted-foreground md:text-xs">
                    {video.description}
                  </p>
                </div>

                {/* Right — button */}
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
