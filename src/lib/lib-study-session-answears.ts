import { createClient } from "./supabase/client";

// create
export async function CreateStudySessionAnswears(studySessionId: string, subjectQuestionId: string, selectedOption: string, isCorrect: boolean){
    const supabase = createClient()
    const {error} = await supabase
        .from('study_session_answers')
        .insert({
            study_session_id: studySessionId,
            subject_question_id: subjectQuestionId,
            selected_option: selectedOption,
            is_correct: isCorrect
        })
    return {error}
}

// SELECT
export async function GetStudySessionAnswers(studySessionId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('study_session_answers')
        .select('id, is_correct')
        .eq('study_session_id', studySessionId)
    return { data, error }
}