import { Sidebar } from '@/components/layout/Sidebar'
import { CourseBannerActions } from '@/components/shared/CourseBannerActions'
import { CourseBannerEditor } from '@/components/shared/CourseBannerEditor'
import GridModules from '@/components/shared/GridModules'
import { NotificationsDropdown } from '@/components/shared/NotificationsDropdown'
import { formatLessonDuration } from '@/lib/lesson-duration'
import {
  GetLastWatchedLessonsForCourse,
  GetSavedForReviewLessonsForCourse,
} from '@/lib/lib-lessons-server'
import { createClient } from '@/lib/supabase/server'
import { ChevronLeft, ChevronsRight, FileText, Play } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

type CoursePageProps = {
  params: Promise<{ courseId: string }>
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { courseId } = await params
  const parsedCourseId = Number(courseId)

  if (!Number.isFinite(parsedCourseId)) {
    notFound()
  }

  const supabase = await createClient()
  const { data: course, error } = await supabase
    .from('courses')
    .select('banner_url, banner_mobile_url, whatsapp_group')
    .eq('id', parsedCourseId)
    .maybeSingle()

  if (error || !course) {
    notFound()
  }

  const { data: lastWatchedLessons } = await GetLastWatchedLessonsForCourse(
    parsedCourseId,
    3,
  )

  const { data: savedForReviewLessons } = await GetSavedForReviewLessonsForCourse(
    parsedCourseId,
  )

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="min-h-screen pb-20 lg:ml-[240px] lg:pb-0">
        <div className="relative">
          <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-4 py-3 sm:px-6 lg:relative lg:sticky lg:border-b lg:border-border lg:bg-background">
            <Link
              href="/courses"
              className="flex h-11 shrink-0 items-center gap-2 rounded-full border border-white/30 bg-black/60 px-4 text-white shadow-lg backdrop-blur-md transition-colors hover:bg-black/75 lg:h-12 lg:rounded-lg lg:border-border lg:bg-sidebar-accent lg:px-3 lg:text-muted-foreground lg:shadow-none lg:backdrop-blur-none lg:hover:bg-muted lg:hover:text-foreground"
            >
              <ChevronLeft className="h-5 w-5 shrink-0 lg:h-6 lg:w-6" />
              <span className="font-heading text-sm font-semibold text-white lg:text-base lg:font-medium lg:text-foreground">
                Voltar
              </span>
            </Link>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/30 bg-black/60 shadow-lg backdrop-blur-md lg:h-auto lg:w-auto lg:border-0 lg:bg-transparent lg:shadow-none lg:backdrop-blur-none">
              <NotificationsDropdown />
            </div>
          </header>

          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-20 h-28 bg-gradient-to-b from-black/60 via-black/25 to-transparent lg:hidden"
            aria-hidden
          />

          <div className="lg:px-6 lg:pt-3">
            <div className="mx-auto flex max-w-[1210px] flex-col">
              <CourseBannerEditor
                courseId={parsedCourseId}
                initialBannerUrl={course.banner_url}
                initialBannerMobileUrl={course.banner_mobile_url}
                className="rounded-none border-0 lg:rounded-2xl lg:border lg:border-border"
                imageClassName="object-cover lg:object-contain"
              />
              <CourseBannerActions
                savedLessons={savedForReviewLessons}
                whatsappGroupUrl={course.whatsapp_group}
              />
            </div>
          </div>
        </div>

        <main className="mx-auto max-w-[1210px] p-6">
          <div className="flex flex-col gap-8">
            {lastWatchedLessons.length > 0 ? (
              <section>
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      Continuar assistindo
                    </p>
                    <h2 className="mt-1 font-heading text-lg font-semibold text-foreground">
                      Retome de onde parou
                    </h2>
                  </div>
                  {lastWatchedLessons.length > 1 ? (
                    <p className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                      Arraste para ver mais
                    </p>
                  ) : null}
                </div>

                <div className="relative -mx-6 sm:-mx-0">
                  <div
                    className="flex gap-4 overflow-x-auto px-6 pb-2 scrollbar-none sm:px-0"
                    style={{ scrollPaddingLeft: '1.5rem', scrollPaddingRight: '1.5rem' }}
                  >
                    {lastWatchedLessons.map((lesson, index) => {
                      const hasVideoUrl = Boolean(lesson.video_url?.trim())
                      const LessonIcon = hasVideoUrl ? Play : FileText

                      return (
                        <Link
                          key={lesson.id}
                          href={`/courses/lesson/${lesson.id}`}
                          className={`group flex shrink-0 flex-col overflow-hidden rounded-2xl border bg-card transition-colors hover:border-primary/40 hover:bg-muted/20 ${
                            index === 0
                              ? 'border-primary/35 shadow-sm shadow-primary/10'
                              : 'border-border'
                          }`}
                          style={{ width: '280px', minWidth: '280px' }}
                        >
                          <div
                            className="relative overflow-hidden bg-muted"
                            style={{ width: '100%', height: '158px' }}
                          >
                            <div
                              className={`absolute inset-0 ${
                                hasVideoUrl
                                  ? 'bg-gradient-to-br from-primary/30 via-primary/10 to-accent/25'
                                  : 'bg-gradient-to-br from-muted to-card'
                              }`}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-border/60 bg-background/80 backdrop-blur-sm transition-transform group-hover:scale-105">
                                <LessonIcon
                                  className={`h-5 w-5 ${
                                    hasVideoUrl ? 'text-primary' : 'text-foreground/80'
                                  }`}
                                />
                              </div>
                            </div>
                            {index === 0 ? (
                              <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
                                Última
                              </span>
                            ) : null}
                            <span className="absolute bottom-2 right-2 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-medium text-white">
                              {formatLessonDuration(lesson.duration_seconds)}
                            </span>
                          </div>

                          <div className="flex flex-1 flex-col gap-1.5 p-4">
                            <p className="line-clamp-2 font-heading text-base font-semibold leading-snug text-foreground">
                              {lesson.title ?? 'Aula sem título'}
                            </p>
                            {lesson.description ? (
                              <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                                {lesson.description}
                              </p>
                            ) : null}
                          </div>
                        </Link>
                      )
                    })}
                  </div>

                  {lastWatchedLessons.length > 1 ? (
                    <div
                      className="pointer-events-none absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card p-1.5 shadow-sm sm:flex"
                      aria-hidden
                    >
                      <ChevronsRight className="h-4 w-4 text-accent" />
                    </div>
                  ) : null}
                </div>
              </section>
            ) : null}

            <GridModules courseId={parsedCourseId} />
          </div>
        </main>
      </div>
    </div>
  )
}
