import { createClient } from "./supabase/client";

// CREATE
export async function CreateStudySession(profileId: string, subjectId: string, startedAt: Date){
    const supabase = createClient()
    const {data, error} = await supabase
        .from('study_session')
        .insert({
            profile_id: profileId,
            subject_id: subjectId,
            started_at: startedAt
        })
        .select('id')
        .single()
    return {data, error}
}

// UPDATE: finish
export async function UpdateStudySession(studySessionId: string, endAt: Date){
    const supabase = createClient()
    const {error} = await supabase
        .from('study_session')
        .update({
            end_at: endAt
        })
        .eq('id', studySessionId)
    return {error}
}

// SELECT
export async function GetStudySession(studySessionId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('study_session')
        .select('id, started_at, end_at')
        .eq('id', studySessionId)
        .single()
    return { data, error }
}
