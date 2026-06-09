'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  LessonRootSubjectPillFilter,
  LESSON_FILTER_QUESTOES_BANCAS,
} from './LessonRootSubjectPillFilter'
import { ArrowRight, Play, Search, Sparkles } from 'lucide-react'
import { Lessons, Subjects } from '@/types'

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
  const [search, setSearch] = useState('')
  const [selectedRootFilter, setSelectedRootFilter] = useState('')

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
      ) : filteredVideos.length === 0 ? (
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
