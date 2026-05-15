import { createClient } from '@/lib/supabase/client'
import type {
  QuestionOptions,
  QuestionsBanca,
  QuestionsDifficulty,
} from '@/types'

export type UpdateQuestionPayload = {
  question: string
  options: QuestionOptions
  correct_option: string
  explanation: string
  difficulty: QuestionsDifficulty
  banca: QuestionsBanca
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
    })
    .eq('id', questionId)

  return { error }
}
