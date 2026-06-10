import { createClient } from './supabase/server'

export type StudyPerformanceMetrics = {
  totalSessions: number
  totalQuestions: number
  accuracyRate: number
}

export type SimuladoPerformanceMetrics = {
  totalSimulados: number
  averageScore: number
  bestScore: number
}

export async function GetStudyPerformanceMetrics() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) {
    return { data: null, error: authError }
  }

  if (!user) {
    return { data: null, error: { message: 'Usuário não autenticado.' } }
  }

  const { data: sessions, error: sessionsError } = await supabase
    .from('study_session')
    .select('id, study_session_answers(is_correct)')
    .eq('profile_id', user.id)
    .not('end_at', 'is', null)

  if (sessionsError) {
    return { data: null, error: sessionsError }
  }

  const totalSessions = sessions?.length ?? 0
  let correctCount = 0
  let totalQuestions = 0

  for (const session of sessions ?? []) {
    const answers = (session.study_session_answers ?? []) as {
      is_correct: boolean | null
    }[]

    for (const answer of answers) {
      totalQuestions++
      if (answer.is_correct === true) {
        correctCount++
      }
    }
  }

  const accuracyRate =
    totalQuestions > 0
      ? Math.round((correctCount / totalQuestions) * 100)
      : 0

  return {
    data: {
      totalSessions,
      totalQuestions,
      accuracyRate,
    } satisfies StudyPerformanceMetrics,
    error: null,
  }
}

export async function GetSimuladoPerformanceMetrics() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) {
    return { data: null, error: authError }
  }

  if (!user) {
    return { data: null, error: { message: 'Usuário não autenticado.' } }
  }

  const { data: sessions, error: sessionsError } = await supabase
    .from('simulado_sessions')
    .select('id, simulado_sessions_answers(is_correct)')
    .eq('profile_id', user.id)
    .not('end_at', 'is', null)

  if (sessionsError) {
    return { data: null, error: sessionsError }
  }

  const totalSimulados = sessions?.length ?? 0
  const sessionScores: number[] = []

  for (const session of sessions ?? []) {
    const answers = (session.simulado_sessions_answers ?? []) as {
      is_correct: boolean | null
    }[]

    let correctCount = 0
    let totalQuestions = 0

    for (const answer of answers) {
      totalQuestions++
      if (answer.is_correct === true) {
        correctCount++
      }
    }

    if (totalQuestions > 0) {
      sessionScores.push(Math.round((correctCount / totalQuestions) * 100))
    }
  }

  const averageScore =
    sessionScores.length > 0
      ? Math.round(
          sessionScores.reduce((sum, score) => sum + score, 0) /
            sessionScores.length,
        )
      : 0

  const bestScore = sessionScores.length > 0 ? Math.max(...sessionScores) : 0

  return {
    data: {
      totalSimulados,
      averageScore,
      bestScore,
    } satisfies SimuladoPerformanceMetrics,
    error: null,
  }
}
