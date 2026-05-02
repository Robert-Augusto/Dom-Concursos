'use client'

import {
  AlertCircle,
  BarChart2,
  CheckCircle,
  Clock,
  History,
  Info,
  RefreshCw,
  Star,
  X,
  Zap,
} from 'lucide-react'
import { getSimuladoQuestionPaper } from './SimuladoSession'

export type SimuladoDifficulty = 'facil' | 'medio' | 'dificil'

export interface SimuladoState {
  banca: string
  difficulty: SimuladoDifficulty
  basicSubjects: { id: string; weight: 1 | 2 | 3 }[]
  specificSubjects: { id: string; weight: 1 | 2 | 3 }[]
  questionCount: number
  answers: Record<string, string>
  timeSpent: number
}

export interface SimuladoScoreProps {
  state: SimuladoState
  onNewExam: () => void
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}min ${s}s`
}

const optionKeys = ['A', 'B', 'C', 'D'] as const

function feedbackTitle(score: number) {
  if (score >= 9) return '🏆 Excelente! Aprovado com distinção!'
  if (score >= 7) return '[OK] Aprovado!'
  if (score >= 5) return '[!] Atenção! Na zona de risco.'
  return '[X] Reprovado. Revise o conteúdo.'
}

function feedbackSubtitle(score: number) {
  if (score >= 7)
    return 'Ótimo resultado! Reforce as matérias mais fracas e mantenha o ritmo.'
  if (score >= 5)
    return 'Resultado mediano. Foque nas questões erradas e revise os tópicos.'
  return 'Não desista! Revise a teoria e refaça o simulado.'
}

function starsFilled(score: number) {
  return Math.min(4, Math.max(0, Math.round(score / 2.5)))
}

type SubjectAgg = { correct: number; total: number }

function aggregateByGroupSubject(
  questions: SimuladoQuestion[],
  answers: Record<string, string>,
  group: 'basico' | 'especifico',
) {
  const filtered = questions.filter((q) => q.group === group)
  const map = new Map<string, SubjectAgg>()
  for (const q of filtered) {
    const cur = map.get(q.subject) ?? { correct: 0, total: 0 }
    cur.total += 1
    if (answers[q.id] === q.correct) cur.correct += 1
    map.set(q.subject, cur)
  }
  return { entries: [...map.entries()], hasAny: filtered.length > 0 }
}

function barColorClass(pct: number) {
  if (pct >= 75) return 'text-chart-2'
  if (pct >= 50) return 'text-primary'
  return 'text-destructive'
}

function barBgClass(pct: number) {
  if (pct >= 75) return 'bg-chart-2'
  if (pct >= 50) return 'bg-primary'
  return 'bg-destructive'
}

function tipForPct(pct: number) {
  if (pct >= 75) return 'Bom. Revise os tópicos que errou.'
  if (pct >= 50) return 'Mediano. Dedique mais tempo a esta matéria.'
  return 'Fraco. Estude esta matéria com prioridade.'
}

export default function SimuladoScore({ state, onNewExam }: SimuladoScoreProps) {
  const questions = getSimuladoQuestionPaper(state.questionCount)
  const totalQuestions = questions.length
  const correctCount = questions.filter(
    (q) => state.answers[q.id] === q.correct,
  ).length
  const score = parseFloat(((correctCount / totalQuestions) * 10).toFixed(1))

  const scoreColorClass =
    score >= 7 ? 'text-primary' : score >= 5 ? 'text-accent' : 'text-destructive'

  const filledStars = starsFilled(score)

  const wrongQuestions = questions.filter(
    (q) => state.answers[q.id] !== q.correct,
  )

  const basics = aggregateByGroupSubject(questions, state.answers, 'basico')
  const specifics = aggregateByGroupSubject(questions, state.answers, 'especifico')

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-card rounded-2xl border border-border p-8 flex flex-col items-center text-center gap-3">
        <p className={`font-heading font-black text-7xl ${scoreColorClass}`}>{score}</p>
        <p className="text-sm text-muted-foreground">
          / 10 · {correctCount} de {totalQuestions} acertos
        </p>
        <div className="flex items-center gap-1">
          {Array.from({ length: 4 }, (_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < filledStars
                  ? 'text-primary fill-primary'
                  : 'text-muted-foreground'
              }`}
            />
          ))}
        </div>
        <p className="font-heading font-black text-lg text-foreground">
          {feedbackTitle(score)}
        </p>
        <p className="text-sm text-muted-foreground max-w-md">
          {feedbackSubtitle(score)}
        </p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          Tempo: {formatTime(state.timeSpent)}
        </div>
      </div>

      <section>
        <div className="flex items-center gap-2 font-heading font-bold text-base text-foreground mb-4">
          <BarChart2 className="h-5 w-5 text-primary" />
          Desempenho por Matéria
        </div>

        {basics.hasAny && (
          <div className="mb-6">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent border-l-2 border-accent pl-3 mb-3">
              CONHECIMENTOS BÁSICOS
            </div>
            {basics.entries.map(([subject, { correct, total }]) => {
              const pct = total ? Math.round((correct / total) * 100) : 0
              const color = barColorClass(pct)
              const bg = barBgClass(pct)
              return (
                <div
                  key={subject}
                  className="bg-card rounded-xl p-4 border border-border mb-2"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-foreground">{subject}</span>
                    <span className={`text-xs font-black ${color}`}>
                      {correct}/{total} · {pct}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${bg}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{tipForPct(pct)}</p>
                </div>
              )
            })}
          </div>
        )}

        {specifics.hasAny && (
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary border-l-2 border-primary pl-3 mb-3">
              CONHECIMENTOS ESPECÍFICOS
            </div>
            {specifics.entries.map(([subject, { correct, total }]) => {
              const pct = total ? Math.round((correct / total) * 100) : 0
              const color = barColorClass(pct)
              const bg = barBgClass(pct)
              return (
                <div
                  key={subject}
                  className="bg-card rounded-xl p-4 border border-border mb-2"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-foreground">{subject}</span>
                    <span className={`text-xs font-black ${color}`}>
                      {correct}/{total} · {pct}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${bg}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{tipForPct(pct)}</p>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <div className="bg-card rounded-2xl border border-border p-5">
        <Zap className="h-6 w-6 text-primary mb-3" />
        <p className="text-sm text-foreground leading-relaxed italic">
          Aprovados em concurso público não são diferentes de você. A diferença está na
          disciplina diária. Você já está no caminho certo!
        </p>
        <p className="text-xs text-primary font-bold mt-2">— DOM Concursos</p>
      </div>

      {wrongQuestions.length > 0 && (
        <section>
          <div className="flex items-center gap-2 font-heading font-bold text-sm text-foreground mb-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            GABARITO E CORREÇÕES
          </div>
          <div className="flex flex-col gap-4">
            {wrongQuestions.map((q) => {
              const userAns = state.answers[q.id]
              return (
                <div
                  key={q.id}
                  className="bg-card rounded-2xl border border-destructive/30 p-5"
                >
                  <p className="text-sm font-bold text-foreground mb-4">{q.text}</p>
                  <div className="flex flex-col gap-0">
                    {optionKeys.map((key) => {
                      const isCorrect = key === q.correct
                      const isWrongUser = key === userAns && userAns !== q.correct
                      const rowClass = isCorrect
                        ? 'bg-chart-2/10 border border-chart-2/30'
                        : isWrongUser
                          ? 'bg-destructive/10 border border-destructive/30'
                          : 'bg-muted/20 border border-transparent'
                      const letterClass = isCorrect
                        ? 'bg-chart-2 text-white'
                        : isWrongUser
                          ? 'bg-destructive text-white'
                          : 'bg-muted text-muted-foreground'
                      return (
                        <div
                          key={key}
                          className={`flex items-center gap-3 py-2.5 px-3 rounded-lg mb-1 ${rowClass}`}
                        >
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0 ${letterClass}`}
                          >
                            {key}
                          </span>
                          <span className="text-sm flex-1">{q.options[key]}</span>
                          {isCorrect && (
                            <CheckCircle className="h-4 w-4 text-chart-2 shrink-0" />
                          )}
                          {isWrongUser && <X className="h-4 w-4 text-destructive shrink-0" />}
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-3 p-4 rounded-xl bg-accent/10 border border-accent/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="h-4 w-4 text-accent shrink-0" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-accent">
                        COMENTÁRIO
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      A alternativa correta demonstra o conceito fundamental exigido pelas
                      bancas. Revise este tema na seção de Estudo Inteligente para consolidar
                      o conhecimento.
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onNewExam}
          className="w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 bg-card border-2 border-border text-foreground hover:border-primary/40 transition-colors"
        >
          <RefreshCw className="h-5 w-5" />
          Nova Prova
        </button>
        <button
          type="button"
          onClick={() => window.alert('Histórico em breve.')}
          className="w-full py-4 rounded-2xl font-black text-base text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
          style={{
            background: 'linear-gradient(90deg, #C9A84C, #DDA83A)',
            boxShadow: '0 6px 20px rgba(201,168,76,0.35)',
          }}
        >
          <History className="h-5 w-5" />
          Ver Histórico
        </button>
      </div>
    </div>
  )
}
