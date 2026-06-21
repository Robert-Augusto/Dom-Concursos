import { createClient } from '@/lib/supabase/client'
import type { AccessLevel, Courses } from '@/types'

export const DEFAULT_COURSE_TITLE = 'Novo curso'

export async function GetCourses(options?: { includeUnpublished?: boolean }) {
  const supabase = createClient()
  let query = supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })

  if (!options?.includeUnpublished) {
    query = query.eq('is_published', true)
  }

  const { data, error } = await query
  return { data: (data as Courses[] | null) ?? [], error }
}

export async function CreateCourse(payload?: {
  title?: string
  accessLevel?: AccessLevel
  thumbnailUrl?: string | null
  isPublished?: boolean
}) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('courses')
    .insert({
      title: payload?.title?.trim() || DEFAULT_COURSE_TITLE,
      access_level: payload?.accessLevel ?? 'free',
      is_published: payload?.isPublished ?? false,
      description: null,
      thumbnail_url: payload?.thumbnailUrl ?? null,
    })
    .select('*')
    .single()

  return { data: data as Courses | null, error }
}

export async function UpdateCourseTitle(courseId: number, title: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('courses')
    .update({ title })
    .eq('id', courseId)
    .select('*')
    .single()

  return { data: data as Courses | null, error }
}

export async function UpdateCourseAccessLevel(
  courseId: number,
  accessLevel: AccessLevel,
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('courses')
    .update({ access_level: accessLevel })
    .eq('id', courseId)
    .select('*')
    .single()

  return { data: data as Courses | null, error }
}

export async function UpdateCourseThumbnail(
  courseId: number,
  thumbnailUrl: string | null,
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('courses')
    .update({ thumbnail_url: thumbnailUrl })
    .eq('id', courseId)
    .select('*')
    .single()

  return { data: data as Courses | null, error }
}

export async function UpdateCourseBanner(
  courseId: number,
  bannerUrl: string | null,
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('courses')
    .update({ banner_url: bannerUrl })
    .eq('id', courseId)
    .select('*')
    .single()

  return { data: data as Courses | null, error }
}

export async function UpdateCourseMobileBanner(
  courseId: number,
  bannerMobileUrl: string | null,
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('courses')
    .update({ banner_mobile_url: bannerMobileUrl })
    .eq('id', courseId)
    .select('*')
    .single()

  return { data: data as Courses | null, error }
}

export async function UpdateCourseWhatsappGroup(
  courseId: number,
  whatsappGroup: string | null,
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('courses')
    .update({ whatsapp_group: whatsappGroup })
    .eq('id', courseId)
    .select('*')
    .single()

  return { data: data as Courses | null, error }
}

export async function UpdateCoursePublished(
  courseId: number,
  isPublished: boolean,
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('courses')
    .update({ is_published: isPublished })
    .eq('id', courseId)
    .select('*')
    .single()

  return { data: data as Courses | null, error }
}

export async function DeleteCourse(courseId: number) {
  const supabase = createClient()
  const { error } = await supabase.from('courses').delete().eq('id', courseId)
  return { error }
}
