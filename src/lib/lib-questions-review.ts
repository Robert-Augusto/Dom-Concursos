import { createClient } from "./supabase/client";

// create
export async function CreateQuestionReview (subjects_questions_id: string, profile_id: string) {
    const supabase = createClient()
    const {error} = await supabase
        .from('subjects_questions_review')
        .insert({
            subjects_questions_id: subjects_questions_id,
            profile_id: profile_id,
        })
    return {error}
}

// update
export async function DeleteQuestionReview(review_id: number) {
    const supabase = createClient()
    const {error} = await supabase
        .from('subjects_questions_review')
        .delete()
        .eq('id', review_id)
    return {error}
}