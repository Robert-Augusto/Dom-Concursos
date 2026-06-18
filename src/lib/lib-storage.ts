import { createClient } from './supabase/client'
import { CreateLessonMaterials } from '@/lib/lib-lessons'

const THUMBNAIL_BUCKET = 'lesson_thumbnails'
const MATERIALS_BUCKET = 'lessons_materials'
const USER_AVATAR_BUCKET = 'user_avatar'
const COURSES_FILES_BUCKET = 'courses_files'

export function getLessonMaterialStoragePath(fileUrl: string): string | null {
  const trimmed = fileUrl.trim()
  if (!trimmed) return null

  try {
    const url = new URL(trimmed)
    const markers = [
      `/object/public/${MATERIALS_BUCKET}/`,
      `/object/sign/${MATERIALS_BUCKET}/`,
      `/object/authenticated/${MATERIALS_BUCKET}/`,
      `/object/${MATERIALS_BUCKET}/`,
    ]

    for (const marker of markers) {
      const idx = url.pathname.indexOf(marker)
      if (idx !== -1) {
        return decodeURIComponent(url.pathname.slice(idx + marker.length))
      }
    }

    return null
  } catch {
    return trimmed.replace(/^\//, '')
  }
}

export async function GetLessonMaterialSignedUrl(
  fileUrl: string,
  expiresIn = 3600,
) {
  const path = getLessonMaterialStoragePath(fileUrl)
  if (!path) {
    return {
      signedUrl: null,
      error: { message: 'Não foi possível localizar o material no storage.' },
    }
  }

  const supabase = createClient()
  const { data, error } = await supabase.storage
    .from(MATERIALS_BUCKET)
    .createSignedUrl(path, expiresIn)

  return { signedUrl: data?.signedUrl ?? null, error }
}

export function getThumbnailStoragePath(publicUrl: string): string | null {
  try {
    const url = new URL(publicUrl)
    const marker = `/object/public/${THUMBNAIL_BUCKET}/`
    const idx = url.pathname.indexOf(marker)
    if (idx === -1) return null
    return decodeURIComponent(url.pathname.slice(idx + marker.length))
  } catch {
    return null
  }
}

export async function UploadLessonThumbnail(file: File, path: string) {
  const supabase = createClient()

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(THUMBNAIL_BUCKET)
    .upload(path, file)

  if (uploadError) return { uploadError }

  const { data } = supabase.storage
    .from(THUMBNAIL_BUCKET)
    .getPublicUrl(uploadData.path)

  return { publicUrl: data.publicUrl, storagePath: uploadData.path }
}

export async function DeleteLessonThumbnail(publicUrl: string) {
  const path = getThumbnailStoragePath(publicUrl)
  if (!path) {
    return { error: { message: 'Não foi possível localizar a thumbnail no storage.' } }
  }

  const supabase = createClient()
  const { error } = await supabase.storage.from(THUMBNAIL_BUCKET).remove([path])
  return { error }
}

export async function DeleteLessonMaterialFile(storagePath: string) {
  const supabase = createClient()
  const { error } = await supabase.storage
    .from(MATERIALS_BUCKET)
    .remove([storagePath])
  return { error }
}

export function getUserAvatarStoragePath(publicUrl: string): string | null {
  const trimmed = publicUrl.trim()
  if (!trimmed) return null

  try {
    const url = new URL(trimmed)
    const marker = `/object/public/${USER_AVATAR_BUCKET}/`
    const idx = url.pathname.indexOf(marker)
    if (idx === -1) return null
    return decodeURIComponent(url.pathname.slice(idx + marker.length))
  } catch {
    return null
  }
}

export async function UploadUserAvatar(file: File, userId: string) {
  const supabase = createClient()
  const path = `${userId}/${Date.now()}-${file.name}`

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(USER_AVATAR_BUCKET)
    .upload(path, file, { upsert: false })

  if (uploadError) return { uploadError }

  const { data } = supabase.storage
    .from(USER_AVATAR_BUCKET)
    .getPublicUrl(uploadData.path)

  return { publicUrl: data.publicUrl, storagePath: uploadData.path }
}

export async function DeleteUserAvatar(publicUrl: string) {
  const path = getUserAvatarStoragePath(publicUrl)
  if (!path) {
    return { error: { message: 'Não foi possível localizar o avatar no storage.' } }
  }

  const supabase = createClient()
  const { error } = await supabase.storage.from(USER_AVATAR_BUCKET).remove([path])
  return { error }
}

export function getCourseThumbnailStoragePath(publicUrl: string): string | null {
  try {
    const url = new URL(publicUrl)
    const marker = `/object/public/${COURSES_FILES_BUCKET}/`
    const idx = url.pathname.indexOf(marker)
    if (idx === -1) return null
    return decodeURIComponent(url.pathname.slice(idx + marker.length))
  } catch {
    return null
  }
}

export async function UploadCourseThumbnail(file: File, courseId: number) {
  const supabase = createClient()
  const safeName = file.name.replace(/[^\w.-]/g, '_')
  const path = `courses/${courseId}/${Date.now()}-${safeName}`

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(COURSES_FILES_BUCKET)
    .upload(path, file, { contentType: file.type })

  if (uploadError) return { uploadError }

  const { data } = supabase.storage
    .from(COURSES_FILES_BUCKET)
    .getPublicUrl(uploadData.path)

  return { publicUrl: data.publicUrl, storagePath: uploadData.path }
}

export async function UploadCourseModuleThumbnail(
  file: File,
  courseId: number,
  sectionId: number,
) {
  const supabase = createClient()
  const safeName = file.name.replace(/[^\w.-]/g, '_')
  const path = `courses/${courseId}/sections/${sectionId}/modules/${Date.now()}-${safeName}`

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(COURSES_FILES_BUCKET)
    .upload(path, file, { contentType: file.type })

  if (uploadError) return { uploadError }

  const { data } = supabase.storage
    .from(COURSES_FILES_BUCKET)
    .getPublicUrl(uploadData.path)

  return { publicUrl: data.publicUrl, storagePath: uploadData.path }
}

export async function DeleteCourseThumbnail(publicUrl: string) {
  const path = getCourseThumbnailStoragePath(publicUrl)
  if (!path) {
    return {
      error: {
        message: 'Não foi possível localizar a thumbnail do curso no storage.',
      },
    }
  }

  const supabase = createClient()
  const { error } = await supabase.storage
    .from(COURSES_FILES_BUCKET)
    .remove([path])
  return { error }
}

export async function UploadLessonMaterials(files: File[], lessonId: number) {
  const supabase = createClient()

  try {
    const records = await Promise.all(
      files.map(async (file) => {
        const path = `lessons/${lessonId}/${Date.now()}-${file.name}`

        const { data, error } = await supabase.storage
          .from(MATERIALS_BUCKET)
          .upload(path, file)

        if (error) throw error

        return {
          lessons_id: lessonId,
          title: file.name,
          file_url: data.path,
          file_type: file.type,
        }
      }),
    )

    const { error } = await CreateLessonMaterials(records)
    return { error }
  } catch (err) {
    return {
      error: {
        message:
          err instanceof Error ? err.message : 'Erro ao enviar os materiais.',
      },
    }
  }
}
