import { createClient } from './supabase/client'
import { CreateLessonMaterials } from '@/lib/lib-lessons'

const THUMBNAIL_BUCKET = 'lesson_thumbnails'
const MATERIALS_BUCKET = 'lessons_materials'

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
