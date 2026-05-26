import { createClient } from '@/lib/supabase/client'
import {
  QUESTIONS_WITH_BANCA_SELECT,
  mapQuestionWithBanca,
} from '@/lib/lib-questions'
import type { Questions, QuestionsDifficulty } from '@/types'

export type SimuladoDistribution = {
  specificCount: number
  basicCount: number
}

/**
 * Distribution rules per total question count:
 * - 20: specific = 10 · each basic = 5  (2 basics)
 * - 40: specific = 10 · each basic = 10 (3 basics)
 * - 60: specific = 20 · each basic = 10 (4 basics)
 */
export function getSimuladoDistribution(
  questionCount: number,
): SimuladoDistribution {
  if (questionCount === 20) return { specificCount: 10, basicCount: 5 }
  if (questionCount === 40) return { specificCount: 10, basicCount: 10 }
  if (questionCount === 60) return { specificCount: 20, basicCount: 10 }
  return { specificCount: 0, basicCount: 0 }
}

export type FetchSimuladoQuestionsParams = {
  questionCount: number
  specificSubjectId: string
  basicSubjectIds: string[]
  bancaId?: string
  difficulty?: QuestionsDifficulty
}

export async function FetchSimuladoQuestions(
  params: FetchSimuladoQuestionsParams,
): Promise<{ data: Questions[]; error: Error | null }> {
  const { specificCount, basicCount } = getSimuladoDistribution(
    params.questionCount,
  )

  if (specificCount === 0 || basicCount === 0) {
    return {
      data: [],
      error: new Error('Quantidade de questões inválida.'),
    }
  }

  const supabase = createClient()

  const buildQuery = (subjectId: string, limit: number) => {
    let query = supabase
      .from('subjects_questions')
      .select(QUESTIONS_WITH_BANCA_SELECT)
      .eq('subject_root_id', subjectId)

    if (params.bancaId) {
      query = query.eq('banca', params.bancaId)
    }

    if (params.difficulty) {
      query = query.eq('difficulty', params.difficulty)
    }

    return query.limit(limit)
  }

  const requests = [
    buildQuery(params.specificSubjectId, specificCount),
    ...params.basicSubjectIds.map((id) => buildQuery(id, basicCount)),
  ]

  const results = await Promise.all(requests)

  const failed = results.find((r) => r.error)
  if (failed?.error) {
    return { data: [], error: new Error(failed.error.message) }
  }

  const questions = results.flatMap((r) =>
    (r.data ?? []).map((row) => mapQuestionWithBanca(row)),
  )

  return { data: questions, error: null }
}
