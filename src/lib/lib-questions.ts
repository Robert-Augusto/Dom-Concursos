import { createClient } from '@/lib/supabase/client'
import {
  OPTION_KEYS,
  type OptionKey,
  type QuestionOptions,
  type QuestionsDifficulty,
  type Questions,
} from '@/types'

export function hasOptionText(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0
}

export function getFilledOptionKeys(
  options: QuestionOptions | Record<string, unknown> | null | undefined,
): OptionKey[] {
  return OPTION_KEYS.filter((key) => hasOptionText(options?.[key]))
}

/** Join `banca` FK for question rows (alias avoids column name clash). */
export const QUESTIONS_WITH_BANCA_SELECT = '*, banca_info:banca ( name )'

type QuestionRowWithBanca = Questions & {
  banca_info?: { name: string } | null
}

export function mapQuestionWithBanca(row: QuestionRowWithBanca): Questions {
  const { banca_info, ...rest } = row
  return {
    ...rest,
    banca_name: banca_info?.name?.trim() || undefined,
  }
}

// create
export async function CreateQuestion(subjects_id: number, question: string, options: QuestionOptions, correct: string, explanation: string, banca: string, difficulty: string, ano: string, instituicao: string, subjectRootId: number){
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
      instituicao: instituicao,
      subject_root_id: subjectRootId
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

/** Two questions per difficulty for the study session flow. */
export async function GetStudyQuestionsBySubject(subjectId: string) {
  const supabase = createClient()
  const [easy, medium, hard] = await Promise.all([
    supabase
      .from('subjects_questions')
      .select(QUESTIONS_WITH_BANCA_SELECT)
      .eq('subjects_id', subjectId)
      .eq('difficulty', 'Fácil')
      .limit(2),
    supabase
      .from('subjects_questions')
      .select(QUESTIONS_WITH_BANCA_SELECT)
      .eq('subjects_id', subjectId)
      .eq('difficulty', 'Médio')
      .limit(2),
    supabase
      .from('subjects_questions')
      .select(QUESTIONS_WITH_BANCA_SELECT)
      .eq('subjects_id', subjectId)
      .eq('difficulty', 'Difícil')
      .limit(2),
  ])

  const error = easy.error ?? medium.error ?? hard.error
  if (error) {
    return { data: [] as Questions[], error }
  }

  const data = [
    ...(easy.data ?? []).map((row) =>
      mapQuestionWithBanca(row as QuestionRowWithBanca),
    ),
    ...(medium.data ?? []).map((row) =>
      mapQuestionWithBanca(row as QuestionRowWithBanca),
    ),
    ...(hard.data ?? []).map((row) =>
      mapQuestionWithBanca(row as QuestionRowWithBanca),
    ),
  ]

  return { data, error: null }
}