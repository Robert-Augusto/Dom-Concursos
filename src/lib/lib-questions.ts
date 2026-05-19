import { createClient } from '@/lib/supabase/client'
import type {
  QuestionOptions,
  QuestionsDifficulty,
  Questions
} from '@/types'

// create
export async function CreateQuestion(subjects_id: number, question: string, options: QuestionOptions, correct: string, explanation: string, banca: string, difficulty: string, ano: string, instituicao: string){
  const supabase = createClient()
  const {error} = await supabase
    .from('subjects_questions')
    .insert({
      subjects_id: subjects_id,
      question: question,
      options: options,
      correct_option: correct,
      explanation: explanation,
      difficulty: difficulty,
      banca: banca,
      ano: ano,
      instituicao: instituicao
    })
  return {error}
}

// update
export type UpdateQuestionPayload = {
  question: string
  options: QuestionOptions
  correct_option: string
  explanation: string
  difficulty: QuestionsDifficulty
  banca: string
  ano: string
  instituicao: string
}

export async function UpdateQuestion(
  questionId: string,
  payload: UpdateQuestionPayload,
) {
  const supabase = createClient()
  const { error } = await supabase
    .from('subjects_questions')
    .update({
      question: payload.question,
      options: payload.options,
      correct_option: payload.correct_option,
      explanation: payload.explanation,
      difficulty: payload.difficulty,
      banca: payload.banca,
      ano: payload.ano,
      instituicao: payload.instituicao
    })
    .eq('id', questionId)
  return { error }
}

// select
export async function GetQuestionsBySubject(subjectId: string){
  const supabase = createClient();
  const { data, error } = await supabase
    .from("subjects_questions")
    .select("*")
    .eq("subjects_id", subjectId)
    .order("created_at", { ascending: false });
  return { data: (data as Questions[] | null) ?? [], error };
}