import { createClient } from '@/lib/supabase/client'
import type { CoursesModules, CoursesSectionWithModules } from '@/types'

export async function GetCourseSectionsWithModules(
  courseId: number,
  options?: { includeUnpublishedModules?: boolean },
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('courses_sections')
    .select('*, courses_modules(*)')
    .eq('courses_id', courseId)
    .order('order', { ascending: true })

  if (error) {
    return { data: [] as CoursesSectionWithModules[], error }
  }

  const sections = ((data as CoursesSectionWithModules[] | null) ?? []).map(
    (section) => {
      const modules = [...(section.courses_modules ?? [])].sort(
        (a, b) => Number(a.order ?? 0) - Number(b.order ?? 0),
      )

      const visibleModules = options?.includeUnpublishedModules
        ? modules
        : modules.filter((module) => module.is_published)

      return {
        ...section,
        courses_modules: visibleModules,
      }
    },
  )

  return { data: sections, error: null }
}

async function getNextSectionOrder(courseId: number) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('courses_sections')
    .select('order')
    .eq('courses_id', courseId)

  if (error || !data?.length) {
    return { order: 1, error }
  }

  const maxOrder = data.reduce((max, row) => {
    const value = row.order != null ? Number(row.order) : 0
    return Math.max(max, value)
  }, 0)

  return { order: maxOrder + 1, error: null }
}

async function getNextModuleOrder(sectionId: number) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('courses_modules')
    .select('order')
    .eq('courses_sections_id', sectionId)

  if (error || !data?.length) {
    return { order: 1, error }
  }

  const maxOrder = data.reduce((max, row) => {
    const value = row.order != null ? Number(row.order) : 0
    return Math.max(max, value)
  }, 0)

  return { order: maxOrder + 1, error: null }
}

export async function ReorderCourseSections(
  courseId: number,
  orderedSectionIds: number[],
) {
  const supabase = createClient()

  const results = await Promise.all(
    orderedSectionIds.map((sectionId, index) =>
      supabase
        .from('courses_sections')
        .update({ order: index + 1 })
        .eq('id', sectionId)
        .eq('courses_id', courseId),
    ),
  )

  const failed = results.find((result) => result.error)
  return { error: failed?.error ?? null }
}

export async function ReorderSectionModules(
  sectionId: number,
  orderedModuleIds: number[],
) {
  const supabase = createClient()

  const results = await Promise.all(
    orderedModuleIds.map((moduleId, index) =>
      supabase
        .from('courses_modules')
        .update({ order: index + 1 })
        .eq('id', moduleId)
        .eq('courses_sections_id', sectionId),
    ),
  )

  const failed = results.find((result) => result.error)
  return { error: failed?.error ?? null }
}

export async function CreateCourseSection(
  courseId: number,
  title: string,
) {
  const { order: nextOrder, error: orderError } =
    await getNextSectionOrder(courseId)

  if (orderError) {
    return { data: null, error: orderError }
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('courses_sections')
    .insert({
      courses_id: courseId,
      title,
      order: nextOrder,
    })
    .select('*')
    .single()

  return { data, error }
}

export async function CreateCourseModule(
  sectionId: number,
  thumbnailUrl: string,
) {
  const { order: nextOrder, error: orderError } =
    await getNextModuleOrder(sectionId)

  if (orderError) {
    return { data: null, error: orderError }
  }

  const supabase = createClient()
  const { data, error } = await supabase
    .from('courses_modules')
    .insert({
      courses_sections_id: sectionId,
      thumbnail_url: thumbnailUrl,
      title: null,
      order: nextOrder,
      is_published: true,
    })
    .select('*')
    .single()

  return { data: data as CoursesModules | null, error }
}

export async function UpdateCourseModuleThumbnail(
  moduleId: number,
  thumbnailUrl: string,
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('courses_modules')
    .update({ thumbnail_url: thumbnailUrl })
    .eq('id', moduleId)
    .select('*')
    .single()

  return { data: data as CoursesModules | null, error }
}

export async function DeleteCourseModule(moduleId: number) {
  const supabase = createClient()
  const { error } = await supabase
    .from('courses_modules')
    .delete()
    .eq('id', moduleId)

  return { error }
}

export async function GetCourseModuleById(moduleId: number) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('courses_modules')
    .select('id, courses_sections_id, title, thumbnail_url')
    .eq('id', moduleId)
    .maybeSingle()

  return { data, error }
}

export async function GetCourseModuleContext(moduleId: number) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('courses_modules')
    .select(
      'id, courses_sections_id, courses_sections!inner(courses_id)',
    )
    .eq('id', moduleId)
    .maybeSingle()

  if (error || !data) {
    return { courseId: null as number | null, error }
  }

  const sectionData = data.courses_sections as
    | { courses_id: number | null }
    | { courses_id: number | null }[]
    | null

  const section = Array.isArray(sectionData) ? sectionData[0] : sectionData

  return {
    courseId: section?.courses_id ?? null,
    error: null,
  }
}
