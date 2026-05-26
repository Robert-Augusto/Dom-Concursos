import { createClient } from "./supabase/client";

// CREATE
export async function CreateSimuladoSession(profileId: string, totalQuestions: number, startedAt: Date, bancaId: string, totalScore: number, minimumScore: number){
    const supabase = createClient()
    const {data, error} = await supabase
        .from('simulado_sessions')
        .insert({
            profile_id: profileId,
            total_questions: totalQuestions,
            started_at: startedAt,
            banca_id: bancaId,
            total_score: totalScore,
            minimum_score: minimumScore
        })
        .select('id')
        .single()
    return {data, error}
}

// UPDATE
export async function UpdateSimuladoSession(simuladoSessionId: string, endAt: Date){
    const supabase = createClient()
    const {error} = await supabase
        .from('simulado_sessions')
        .update({
            end_at: endAt
        })
        .eq('id', simuladoSessionId)
    return {error}
}

// SELECT
export async function GetSimuladoSession(simuladoSessionId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('simulado_sessions')
        .select('id, started_at, end_at, total_questions, total_score, minimum_score, banca_id')
        .eq('id', simuladoSessionId)
        .single()
    return { data, error }
}
