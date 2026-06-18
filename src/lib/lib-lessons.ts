import { createClient } from "./supabase/client";
import type { LessonMaterials, VideoType } from '@/types'

export type CourseLesson = {
  id: number
  created_at: string
  title: string | null
  description: string | null
  video_type: VideoType | null
  video_url: string | null
  duration_seconds: string | null
  access_level: string | null
  order: number | null
  is_published: boolean | null
  is_searchable: boolean | null
  subject_id: number | null
  thumbnail: string | null
  courses_modules_id: number | null
}

//-------------------------------------------------------| LESSONS |-------------------------------------------------------
export async function GetLessonById(lessonId: number) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .maybeSingle()

  return { data: data as CourseLesson | null, error }
}

export async function GetLessonsByModuleId(
  moduleId: number,
  options?: { includeUnpublished?: boolean },
) {
  const supabase = createClient()
  let query = supabase
    .from('lessons')
    .select('*')
    .eq('courses_modules_id', moduleId)
    .order('order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true })

  if (!options?.includeUnpublished) {
    query = query.eq('is_published', true)
  }

  const { data, error } = await query
  return { data: (data as CourseLesson[] | null) ?? [], error }
}

async function getNextLessonOrder(moduleId: number) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('lessons')
    .select('order')
    .eq('courses_modules_id', moduleId)

  if (error || !data?.length) {
    return { order: 1, error }
  }

  const maxOrder = data.reduce((max, row) => {
    const value = row.order != null ? Number(row.order) : 0
    return Math.max(max, value)
  }, 0)

  return { order: maxOrder + 1, error: null }
}

export async function ReorderModuleLessons(
  moduleId: number,
  orderedLessonIds: number[],
) {
  const supabase = createClient()

  const results = await Promise.all(
    orderedLessonIds.map((lessonId, index) =>
      supabase
        .from('lessons')
        .update({ order: index + 1 })
        .eq('id', lessonId)
        .eq('courses_modules_id', moduleId),
    ),
  )

  const failed = results.find((result) => result.error)
  return { error: failed?.error ?? null }
}

export async function CreateCourseModuleLesson(
  moduleId: number,
  payload: {
    title: string
    description: string
    videoType: VideoType
    videoUrl: string
    duration: string
  },
) {
  const supabase = createClient()
  const { order: nextOrder, error: orderError } =
    await getNextLessonOrder(moduleId)

  if (orderError) {
    return { data: null, error: orderError }
  }

  const { data, error } = await supabase
    .from('lessons')
    .insert({
      courses_modules_id: moduleId,
      title: payload.title,
      description: payload.description,
      video_type: payload.videoType,
      video_url: payload.videoUrl,
      duration_seconds: payload.duration,
      access_level: null,
      order: nextOrder,
      thumbnail: null,
      subject_id: null,
      is_searchable: false,
      is_published: true,
    })
    .select('*')
    .single()

  return { data: data as CourseLesson | null, error }
}

export async function UpdateCourseModuleLesson(
  lessonId: number,
  payload: {
    title: string
    description: string
    videoType: VideoType
    videoUrl: string
    duration: string
  },
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('lessons')
    .update({
      title: payload.title,
      description: payload.description,
      video_type: payload.videoType,
      video_url: payload.videoUrl || null,
      duration_seconds: payload.duration || null,
    })
    .eq('id', lessonId)
    .select('*')
    .single()

  return { data: data as CourseLesson | null, error }
}

// create
export async function CreateLesson(title: string, description: string, videoType: string, accessLevel: string, url: string, subject: string, isPublished: boolean, thumbnail: string | null){
    const supabase = createClient()
    const {data, error} = await supabase
        .from('lessons')
        .insert({
            title: title,
            description: description,
            video_type: videoType,
            video_url: url,
            access_level: accessLevel,
            is_published: isPublished,
            is_searchable: true,
            subject_id: subject,
            thumbnail: thumbnail
        })
        .select('id')
        .single()
    return {data, error}
}

// update
export async function UpdateLesson(
    id: string,
    title: string,
    description: string,
    videoType: string,
    accessLevel: string,
    url: string,
    subject: string,
    thumbnail: string | null,
){
    const supabase = createClient()
    const {error} = await supabase
        .from('lessons')
        .update({
            title: title,
            description: description,
            video_type: videoType,
            video_url: url,
            access_level: accessLevel,
            subject_id: subject,
            thumbnail: thumbnail,
        })
        .eq('id', id)
    return {error}
}

export async function UpdateLessonPublished(id: string, isPublished: boolean) {
    const supabase = createClient()
    const { error } = await supabase
        .from('lessons')
        .update({ is_published: isPublished })
        .eq('id', id)
    return { error }
}

// delete
export async function DeleteLesson(id: string){
    const supabase = createClient()
    const {error} = await supabase
        .from('lessons')
        .delete()
        .eq('id', id)
    return {error}
}

//-------------------------------------------------------| LESSONS MATERIALS |-------------------------------------------------------
// select
export async function GetLessonMaterials(lessonId: number | string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('lessons_materials')
        .select('*')
        .eq('lessons_id', lessonId)
        .order('created_at', { ascending: true })

    return { data: (data as LessonMaterials[] | null) ?? [], error }
}

// create
export async function CreateLessonMaterials(records: object[]){
    const supabase = createClient()
    const {error} = await supabase
        .from('lessons_materials')
        .insert(records)
    return {error}
}

// update
export async function UpdateLessonMaterials(lessonMaterialId: string ,title: string, fileUrl: string, fileType: string){
    const supabase = createClient()
    const {error} = await supabase
        .from('lessons_materials')
        .update({
            title: title,
            file_url: fileUrl,
            file_type: fileType
        })
        .eq('id', lessonMaterialId)
    return {error}
}

// delete
export async function DeleteLessonMaterials(lessonMaterialId: string){
    const supabase = createClient()
    const {error} = await supabase
        .from('lessons_materials')
        .delete()
        .eq('id', lessonMaterialId)
    return {error}
}

//-------------------------------------------------------| LESSONS PROGRESS |-------------------------------------------------------
export type LessonProgress = {
  id: number
  created_at: string
  profile_id: string | null
  lessons_id: number | null
  completed: boolean | null
  saved_for_review: boolean | null
  last_watched_at: string | null
}

export async function GetLessonProgress(profileId: string, lessonId: number) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('lessons_progress')
    .select('*')
    .eq('profile_id', profileId)
    .eq('lessons_id', lessonId)
    .maybeSingle()

  return { data: data as LessonProgress | null, error }
}

export async function RecordLessonWatch(profileId: string, lessonId: number) {
  const { data: existing, error: fetchError } = await GetLessonProgress(
    profileId,
    lessonId,
  )

  if (fetchError) return { error: fetchError }

  const supabase = createClient()
  const watchedAt = new Date().toISOString()

  if (existing) {
    const { error } = await supabase
      .from('lessons_progress')
      .update({ last_watched_at: watchedAt })
      .eq('id', existing.id)

    return { error }
  }

  const { error } = await supabase.from('lessons_progress').insert({
    profile_id: profileId,
    lessons_id: lessonId,
    completed: false,
    saved_for_review: false,
    last_watched_at: watchedAt,
  })

  return { error }
}

export async function SaveLessonProgress(
  profileId: string,
  lessonId: number,
  updates: { completed: boolean; savedForReview: boolean },
) {
  const { data: existing, error: fetchError } = await GetLessonProgress(
    profileId,
    lessonId,
  )

  if (fetchError) return { data: null, error: fetchError }

  const supabase = createClient()

  if (existing) {
    const { data, error } = await supabase
      .from('lessons_progress')
      .update({
        completed: updates.completed,
        saved_for_review: updates.savedForReview,
      })
      .eq('id', existing.id)
      .select('*')
      .single()

    return { data: data as LessonProgress | null, error }
  }

  const { data, error } = await supabase
    .from('lessons_progress')
    .insert({
      profile_id: profileId,
      lessons_id: lessonId,
      completed: updates.completed,
      saved_for_review: updates.savedForReview,
    })
    .select('*')
    .single()

  return { data: data as LessonProgress | null, error }
}

// create
export async function CreateLessonProgress(profileId: string, lessonId: string, completed: boolean, savedForReview: boolean){
    const supabase = createClient()
    const {error} = await supabase
        .from('lessons_progress')
        .insert({
            profile_id: profileId,
            lessons_id: lessonId,
            completed: completed,
            saved_for_review: savedForReview
        })
    return {error}
}

// update
export async function UpdateLessonProgress(lessonProgressId: string, completed: boolean, savedForReview: boolean){
    const supabase = createClient()
    const {error} = await supabase
        .from('lessons_progress')
        .update({
            completed: completed,
            saved_for_review: savedForReview
        })
        .eq('id', lessonProgressId)
    return {error}
}

// delete
export async function DeleteLessonProgress(lessonProgressId: string){
    const supabase = createClient()
    const {error} = await supabase
        .from('lessons_progress')
        .delete()
        .eq('id', lessonProgressId)
    return {error}
}

//-------------------------------------------------------| LESSONS NOTES |-------------------------------------------------------
export type LessonNote = {
  id: number
  content: string | null
}

export async function GetLessonNote(
  profileId: string,
  lessonId: number | string,
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('lessons_notes')
    .select('id, content')
    .eq('profile_id', profileId)
    .eq('lessons_id', lessonId)
    .maybeSingle()

  return { data: data as LessonNote | null, error }
}

export async function SaveLessonNote(
  profileId: string,
  lessonId: number,
  content: string,
) {
  const { data: existing, error: fetchError } = await GetLessonNote(
    profileId,
    lessonId,
  )

  if (fetchError) return { data: null, error: fetchError }

  const supabase = createClient()

  if (existing) {
    const { data, error } = await supabase
      .from('lessons_notes')
      .update({ content })
      .eq('id', existing.id)
      .select('id, content')
      .single()

    return { data: data as LessonNote | null, error }
  }

  const { data, error } = await supabase
    .from('lessons_notes')
    .insert({
      profile_id: profileId,
      lessons_id: lessonId,
      content,
    })
    .select('id, content')
    .single()

  return { data: data as LessonNote | null, error }
}

// create
export async function CreateLessonNote(profileId: string, lessonId: string, content: string){
    const supabase = createClient()
    const { data, error } = await supabase
        .from('lessons_notes')
        .insert({
            profile_id: profileId,
            lessons_id: lessonId,
            content: content
        })
        .select('id')
        .single()
    return { data, error }
}

// update
export async function UpdateLessonNote(LessonNoteId: string, content: string){
    const supabase = createClient()
    const {error} = await supabase
        .from('lessons_notes')
        .update({
            content: content
        })
        .eq('id', LessonNoteId)
    return {error}
}

// delete
export async function DeleteLessonNote(LessonNoteId: string){
    const supabase = createClient()
    const {error} = await supabase
        .from('lessons_notes')
        .delete()
        .eq('id', LessonNoteId)
    return {error}
}