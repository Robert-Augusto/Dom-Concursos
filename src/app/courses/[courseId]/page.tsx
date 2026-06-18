import { BottomNav } from '@/components/layout/BottomNav'
import { Sidebar } from '@/components/layout/Sidebar'
import GridModules from '@/components/shared/GridModules'
import { CourseBannerEditor } from '@/components/shared/CourseBannerEditor'
import { NotificationsDropdown } from '@/components/shared/NotificationsDropdown'
import { formatLessonDuration } from '@/lib/lesson-duration'
import { GetLastWatchedLessonForCourse } from '@/lib/lib-lessons-server'
import { createClient } from '@/lib/supabase/server'
import { ChevronLeft, ChevronRight, FileText, Play } from 'lucide-react'
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
    .select('thumbnail_url')
    .eq('id', parsedCourseId)
    .maybeSingle()

  if (error || !course) {
    notFound()
  }

  const { data: lastWatchedLesson } = await GetLastWatchedLessonForCourse(
    parsedCourseId,
  )

  const hasVideoUrl = Boolean(lastWatchedLesson?.video_url?.trim())
  const LessonIcon = hasVideoUrl ? Play : FileText

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="min-h-screen pb-20 lg:ml-[240px] lg:pb-0">

      <header className="sticky top-0 z-30 mb-3 flex items-center justify-between border-b border-border bg-background px-4 py-3 sm:px-6">
        <Link
          href="/courses"
          className="flex h-12 shrink-0 items-center gap-2 rounded-lg border border-border bg-sidebar-accent px-3 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ChevronLeft className="h-6 w-6 shrink-0" />
          <span className="font-heading text-base font-medium text-foreground">
            Voltar
          </span>
        </Link>

        <NotificationsDropdown />
      </header>

        <main className="p-6 max-w-[1210px] mx-auto">
          <div className="flex flex-col gap-8">
            <CourseBannerEditor
              courseId={parsedCourseId}
              initialThumbnailUrl={course.thumbnail_url}
            />
            {lastWatchedLesson ? (
              <Link
                href={`/courses/lesson/${lastWatchedLesson.id}`}
                className="group flex items-center gap-4 rounded-2xl border border-primary/30 bg-card p-4 transition-colors hover:border-primary/50 hover:bg-muted/20 md:p-5"
              >
                <div className="relative flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted md:h-20 md:w-28">
                  <div
                    className={`absolute inset-0 ${
                      hasVideoUrl
                        ? 'bg-gradient-to-br from-primary/25 to-accent/20'
                        : 'bg-gradient-to-br from-muted to-card'
                    }`}
                  />
                  <LessonIcon className="relative h-5 w-5 text-foreground/80" />
                  <span className="absolute bottom-1 left-1 rounded bg-black/80 px-1 text-[9px] text-white">
                    {formatLessonDuration(lastWatchedLesson.duration_seconds)}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                    Continuar assistindo
                  </p>
                  <p className="mt-1 line-clamp-2 font-heading text-base font-semibold text-foreground md:text-lg">
                    {lastWatchedLesson.title ?? 'Aula sem título'}
                  </p>
                  {lastWatchedLesson.description ? (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {lastWatchedLesson.description}
                    </p>
                  ) : null}
                </div>

                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
              </Link>
            ) : null}

            <GridModules courseId={parsedCourseId} />
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
