import { createClient } from "./supabase/client";

// create
export async function CreateLesson(title: string, description: string, videoType: string, accessLevel: string, url: string, subject: string, isPublished: string){
    const supabase = createClient()
    const {error} = await supabase
        .from('lessons')
        .insert({
            title: title,
            description: description,
            video_type: videoType,
            video_url: url,
            access_level: accessLevel,
            is_published: isPublished,
            is_searchable: 'true',
            subject_id: subject
        })
    return {error}
}

// update
export async function UpdateLesson(id: string, title: string, description: string, videoType: string, accessLevel: string, url: string, subject: string, isPublished: string){
    const supabase = createClient()
    const {error} = await supabase
        .from('lessons')
        .update({
            title: title,
            description: description,
            video_type: videoType,
            video_url: url,
            access_level: accessLevel,
            is_published: isPublished,
            subject_id: subject
        })
        .eq('id',id)
    return {error}
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