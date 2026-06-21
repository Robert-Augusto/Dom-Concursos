'use client'

import { useProfile } from '@/context/ProfileContext'
import { DEFAULT_COURSE_TITLE, GetCourses } from '@/lib/lib-courses'
import type { AccessLevel, Courses } from '@/types'
import { BookOpen, ChevronsRight, Loader2, Play } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

function accessLevelLabel(level: AccessLevel | null): string {
  switch (level) {
    case 'free':
      return 'Gratuito'
    case 'plus':
      return 'Plus'
    case 'premium':
      return 'Premium'
    default:
      return 'Sem acesso'
  }
}

function accessLevelBadgeClass(level: AccessLevel | null): string {
  switch (level) {
    case 'free':
      return 'bg-chart-2/20 text-chart-2'
    case 'plus':
      return 'bg-accent/20 text-accent'
    case 'premium':
      return 'bg-primary/20 text-primary'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

function getCourseTitle(course: Courses): string {
  return course.title?.trim() || DEFAULT_COURSE_TITLE
}

const COURSE_THUMBNAIL_WIDTH = 768
const COURSE_THUMBNAIL_HEIGHT = 432
const COURSE_CARD_WIDTH_DESKTOP = '384px'
const COURSE_CARD_IMAGE_HEIGHT_DESKTOP = '216px'
const COURSE_CARD_WIDTH_MOBILE = '340px'
const COURSE_CARD_IMAGE_HEIGHT_MOBILE = '191px'

function getCourseCardStyle(isCompact: boolean) {
  const width = isCompact ? COURSE_CARD_WIDTH_MOBILE : COURSE_CARD_WIDTH_DESKTOP

  return {
    width,
    minWidth: width,
  }
}

function getCourseImageStyle(isCompact: boolean) {
  const height = isCompact
    ? COURSE_CARD_IMAGE_HEIGHT_MOBILE
    : COURSE_CARD_IMAGE_HEIGHT_DESKTOP

  return {
    width: '100%',
    height,
    aspectRatio: `${COURSE_THUMBNAIL_WIDTH} / ${COURSE_THUMBNAIL_HEIGHT}`,
  }
}

type CourseScrollRowProps = {
  children: ReactNode
  showPeekHint?: boolean
}

function CourseScrollRow({
  children,
  showPeekHint = false,
}: CourseScrollRowProps) {
  return (
    <div className="relative">
      <div
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-none md:gap-4"
        style={{ scrollPaddingRight: '1rem' }}
      >
        {children}
      </div>
      {showPeekHint ? (
        <div
          className="pointer-events-none absolute right-3 top-1/2 z-20 flex -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card p-1.5 shadow-sm"
          aria-hidden
        >
          <ChevronsRight className="h-4 w-4 text-accent" />
        </div>
      ) : null}
    </div>
  )
}

export default function GridCourses() {
  const { loading: profileLoading } = useProfile()
  const [isCompactCard, setIsCompactCard] = useState(false)

  const [courses, setCourses] = useState<Courses[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)')
    const updateCompactCard = () => setIsCompactCard(mediaQuery.matches)

    updateCompactCard()
    mediaQuery.addEventListener('change', updateCompactCard)

    return () => mediaQuery.removeEventListener('change', updateCompactCard)
  }, [])

  const loadCourses = useCallback(async (options?: { silent?: boolean }) => {
    if (profileLoading) return

    if (!options?.silent) setIsLoading(true)
    const { data, error } = await GetCourses()

    if (error) {
      if (!options?.silent) toast.error(error.message)
      setCourses([])
    } else {
      setCourses(
        data.filter(
          (course) =>
            course.is_published &&
            (course.access_level === 'plus' || course.access_level === 'premium'),
        ),
      )
    }

    if (!options?.silent) setIsLoading(false)
  }, [profileLoading])

  useEffect(() => {
    void loadCourses()
  }, [loadCourses])

  useEffect(() => {
    if (profileLoading) return

    const supabase = createClient()
    const channel = supabase
      .channel('grid_courses')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'courses' },
        () => {
          void loadCourses({ silent: true })
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [loadCourses, profileLoading])

  function renderScrollHint() {
    return (
      <div className="flex flex-col items-center gap-1 pt-1">
        <div className="flex items-center justify-center gap-1.5">
          <div className="h-1 w-6 rounded-full bg-primary" />
          <div className="h-1 w-3 rounded-full bg-muted" />
          <div className="h-1 w-3 rounded-full bg-muted" />
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <ChevronsRight className="h-3.5 w-3.5 shrink-0 text-accent" />
          <span>Deslize para ver mais cursos</span>
        </div>
      </div>
    )
  }

  function renderCourseCard(course: Courses) {
    const title = getCourseTitle(course)
    const thumbnailFallbackClass =
      course.access_level === 'free'
        ? 'bg-gradient-to-br from-accent/30 to-background'
        : 'bg-gradient-to-br from-primary/25 to-background'

    return (
      <div
        key={course.id}
        className="group flex-shrink-0 overflow-hidden rounded-2xl border border-border bg-card text-left transition-colors hover:border-primary/30"
        style={getCourseCardStyle(isCompactCard)}
      >
        <div
          className="relative overflow-hidden bg-muted"
          style={getCourseImageStyle(isCompactCard)}
        >
          {course.thumbnail_url ? (
            <Image
              src={course.thumbnail_url}
              alt={title}
              fill
              sizes="(max-width: 767px) 340px, 384px"
              className="object-cover transition-transform group-hover:scale-[1.02]"
            />
          ) : (
            <>
              <div className={`absolute inset-0 ${thumbnailFallbackClass}`} />
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-muted-foreground/50" />
              </div>
            </>
          )}
          <span
            className={`absolute top-2 left-2 rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${accessLevelBadgeClass(course.access_level)}`}
          >
            {accessLevelLabel(course.access_level)}
          </span>
        </div>

        <div className="space-y-1.5 p-3 pb-2 md:space-y-2 md:p-4 md:pb-3">
          <h3 className="line-clamp-2 font-heading text-xs font-black leading-snug text-foreground md:text-sm">
            {title}
          </h3>

          <div>
            <div className="mb-1 flex justify-between text-[10px] text-muted-foreground">
              <span>Progresso</span>
              <span>0%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-0 rounded-full bg-chart-2" />
            </div>
          </div>
        </div>

        <div className="px-3 pb-3 md:px-4 md:pb-4">
          <Link
            href={`/courses/${course.id}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90 md:py-2.5"
          >
            <Play className="h-3.5 w-3.5 shrink-0 fill-current" />
            Acessar
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="font-heading text-lg font-black text-foreground">
            Meus cursos
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Cursos que você adquiriu ou está estudando
          </p>
        </div>

        <CourseScrollRow>
          <div
            className="flex shrink-0 flex-col overflow-hidden rounded-2xl border border-dashed border-border bg-muted/30"
            style={getCourseCardStyle(isCompactCard)}
          >
            <div
              className="flex items-center justify-center bg-muted/20"
              style={getCourseImageStyle(isCompactCard)}
            >
              <span className="px-6 text-center text-xs text-muted-foreground">
                Nenhum curso nesta seção
              </span>
            </div>
          </div>
        </CourseScrollRow>
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="font-heading text-lg font-black text-foreground">
            Cursos Exclusivos
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Conteúdo exclusivo para assinantes
          </p>
        </div>

        {isLoading || profileLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <CourseScrollRow showPeekHint={courses.length > 1}>
              {courses.length > 0 ? (
                courses.map((course) => renderCourseCard(course))
              ) : (
                <div
                  className="flex shrink-0 flex-col overflow-hidden rounded-2xl border border-dashed border-border bg-muted/30"
                  style={getCourseCardStyle(isCompactCard)}
                >
                  <div
                    className="flex items-center justify-center bg-muted/20"
                    style={getCourseImageStyle(isCompactCard)}
                  >
                    <span className="px-6 text-center text-xs text-muted-foreground">
                      Nenhum curso nesta seção
                    </span>
                  </div>
                </div>
              )}
            </CourseScrollRow>

            {courses.length > 1 ? renderScrollHint() : null}
          </>
        )}
      </section>
    </div>
  )
}
