'use client'

import { formatLessonDuration } from '@/lib/lesson-duration'
import type { SavedForReviewCourseLesson } from '@/lib/lib-lessons-server'
import { Bookmark, FileText, Loader2, Play, X } from 'lucide-react'
import Link from 'next/link'

type ModalSavedForReviewLessonsProps = {
  open: boolean
  onClose: () => void
  lessons: SavedForReviewCourseLesson[]
  isLoading?: boolean
}

export function ModalSavedForReviewLessons({
  open,
  onClose,
  lessons,
  isLoading = false,
}: ModalSavedForReviewLessonsProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div
        className="flex max-h-[85vh] w-full flex-col overflow-hidden rounded-2xl border border-border bg-card"
        style={{ maxWidth: '520px' }}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border p-4 md:p-6">
          <div>
            <h3 className="text-base font-black text-foreground md:text-lg">
              Aulas para revisão
            </h3>
            <p className="text-sm text-muted-foreground">
              Aulas que você marcou para revisar neste curso.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            aria-label="Fechar modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
            </div>
          ) : lessons.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {lessons.map((lesson, index) => {
                const hasVideoUrl = Boolean(lesson.video_url?.trim())
                const LessonIcon = hasVideoUrl ? Play : FileText

                return (
                  <li key={lesson.id}>
                    <Link
                      href={`/courses/lesson/${lesson.id}`}
                      onClick={onClose}
                      className="group flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-3 transition-colors hover:border-primary/40 hover:bg-muted/30"
                    >
                      <span className="shrink-0 text-xs font-bold text-muted-foreground">
                        {index + 1}
                      </span>

                      <div
                        className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted"
                        style={{ width: '64px', height: '40px', minWidth: '64px' }}
                      >
                        <div
                          className={`absolute inset-0 ${
                            hasVideoUrl
                              ? 'bg-gradient-to-br from-primary/25 to-accent/20'
                              : 'bg-gradient-to-br from-muted to-card'
                          }`}
                        />
                        <LessonIcon className="relative h-4 w-4 text-foreground/70" />
                        <span className="absolute bottom-1 left-1 rounded bg-black/80 px-1 text-[9px] text-white">
                          {formatLessonDuration(lesson.duration_seconds)}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
                          {lesson.title ?? 'Aula sem título'}
                        </p>
                        {lesson.description ? (
                          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                            {lesson.description}
                          </p>
                        ) : null}
                      </div>

                      <Bookmark className="h-4 w-4 shrink-0 fill-primary text-primary" />
                    </Link>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Bookmark className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-foreground">
                Nenhuma aula salva para revisão
              </p>
              <p className="max-w-xs text-sm text-muted-foreground">
                Use &quot;Salvar para Revisão&quot; durante uma aula para vê-la
                aqui depois.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
