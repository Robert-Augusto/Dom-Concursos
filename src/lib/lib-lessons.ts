import { createClient } from "./supabase/client";
import type { LessonMaterials } from '@/types'

//-------------------------------------------------------| LESSONS |-------------------------------------------------------
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
export async function GetLessonMaterials(lessonId: string) {
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
// create
export async function CreateLessonNote(profileId: string, lessonId: string, content: string){
    const supabase = createClient()
    const {error} = await supabase
        .from('lessons_notes')
        .insert({
            profile_id: profileId,
            lessons_id: lessonId,
            content: content
        })
    return {error}
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