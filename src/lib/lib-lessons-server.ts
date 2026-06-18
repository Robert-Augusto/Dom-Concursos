import { createClient } from './supabase/server'

export type LastWatchedCourseLesson = {
  id: number
  title: string | null
  description: string | null
  duration_seconds: string | null
  video_url: string | null
  courses_modules_id: number | null
  last_watched_at: string
}

type ProgressLessonRow = {
  id: number
  title: string | null
  description: string | null
  duration_seconds: string | null
  video_url: string | null
  courses_modules_id: number | null
}

export async function GetLastWatchedLessonForCourse(courseId: number) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) {
    return { data: null, error: authError }
  }

  if (!user) {
    return { data: null, error: null }
  }

  const { data: sections, error: sectionsError } = await supabase
    .from('courses_sections')
    .select('id')
    .eq('courses_id', courseId)

  if (sectionsError) {
    return { data: null, error: sectionsError }
  }

  const sectionIds = (sections ?? []).map((section) => section.id)
  if (sectionIds.length === 0) {
    return { data: null, error: null }
  }

  const { data: modules, error: modulesError } = await supabase
    .from('courses_modules')
    .select('id')
    .in('courses_sections_id', sectionIds)
    .eq('is_published', true)

  if (modulesError) {
    return { data: null, error: modulesError }
  }

  const moduleIds = (modules ?? []).map((module) => module.id)
  if (moduleIds.length === 0) {
    return { data: null, error: null }
  }

  const { data: lessons, error: lessonsError } = await supabase
    .from('lessons')
    .select('id')
    .in('courses_modules_id', moduleIds)
    .eq('is_published', true)

  if (lessonsError) {
    return { data: null, error: lessonsError }
  }

  const lessonIds = (lessons ?? []).map((lesson) => lesson.id)
  if (lessonIds.length === 0) {
    return { data: null, error: null }
  }

  const { data: progress, error: progressError } = await supabase
    .from('lessons_progress')
    .select('last_watched_at, lessons_id, lessons(id, title, description, duration_seconds, video_url, courses_modules_id)')
    .eq('profile_id', user.id)
    .in('lessons_id', lessonIds)
    .not('last_watched_at', 'is', null)
    .order('last_watched_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (progressError) {
    return { data: null, error: progressError }
  }

  if (!progress?.last_watched_at) {
    return { data: null, error: null }
  }

  const lessonData = progress.lessons as ProgressLessonRow | ProgressLessonRow[] | null
  const lesson = Array.isArray(lessonData) ? lessonData[0] : lessonData

  if (!lesson) {
    return { data: null, error: null }
  }

  return {
    data: {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      duration_seconds: lesson.duration_seconds,
      video_url: lesson.video_url,
      courses_modules_id: lesson.courses_modules_id,
      last_watched_at: progress.last_watched_at,
    } satisfies LastWatchedCourseLesson,
    error: null,
  }
}
