import { createClient } from "./supabase/client";

// create
export async function CreateSimuladoSession(profileId: string, totalQuestions: number, startedAt: Date, bancaId: string, difficulty: string){
    const supabase = createClient()
    const {data, error} = await supabase
        .from('simulado_sessions')
        .insert({
            profile_id: profileId,
            total_questions: totalQuestions,
            started_at: startedAt,
            banca_id: bancaId,
            difficulty: difficulty
        })
        .select('id')
        .single()
    return {data, error}
}