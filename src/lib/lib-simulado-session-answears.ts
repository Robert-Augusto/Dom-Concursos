import { createClient } from './supabase/client'

// create
export async function CreateSimuladoSessionAnswears(
  simuladoSessionId: string,
  subjectQuestionId: string,
  selectedOption: string,
  isCorrect: boolean,
) {
  const supabase = createClient()
  const { error } = await supabase
    .from('simulado_sessions_answers')
    .insert({
      simulado_sessions_id: simuladoSessionId,
      subject_question_id: subjectQuestionId,
      selected_option: selectedOption,
      is_correct: isCorrect,
    })
  return { error }
}

// select
export async function GetSimuladoSessionAnswers(simuladoSessionId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('simulado_sessions_answers')
    .select('id, is_correct')
    .eq('simulado_sessions_id', simuladoSessionId)
  return { data, error }
}