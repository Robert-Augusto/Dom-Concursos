'use client'

import type { Dispatch, SetStateAction } from 'react'
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  LayoutGrid,
} from 'lucide-react'
import { GetBancas } from '@/lib/lib-banca'

export type SimuladoQuestionGroup = 'basico' | 'especifico'

export type SimuladoQuestion = {
  id: string
  subject: string
  subjectEmoji: string
  group: SimuladoQuestionGroup
  weight: number
  text: string
  options: Record<string, string>
  correct: string
}

export const mockSimuladoQuestions: SimuladoQuestion[] = [
  {
    id: 'sq1',
    subject: 'Matemática',
    subjectEmoji: '📐',
    group: 'basico',
    weight: 1,
    text: 'Uma empresa tem 120 funcionários. Se 30% são do sexo feminino, quantas mulheres trabalham nessa empresa?',
    options: { A: '24', B: '36', C: '40', D: '42' },
    correct: 'B',
  },
  {
    id: 'sq2',
    subject: 'Matemática',
    subjectEmoji: '📐',
    group: 'basico',
    weight: 1,
    text: 'Se um produto custa R$80 e tem 25% de desconto, qual o preço final?',
    options: { A: 'R$55', B: 'R$60', C: 'R$65', D: 'R$70' },
    correct: 'B',
  },
  {
    id: 'sq3',
    subject: 'Matemática',
    subjectEmoji: '📐',
    group: 'basico',
    weight: 1,
    text: 'João investiu R$1.000 a juros simples de 2% ao mês. Após 6 meses, quanto terá de juros?',
    options: { A: 'R$100', B: 'R$120', C: 'R$140', D: 'R$160' },
    correct: 'B',
  },
  {
    id: 'sq4',
    subject: 'Matemática',
    subjectEmoji: '📐',
    group: 'basico',
    weight: 1,
    text: 'Qual é o MMC de 12 e 18?',
    options: { A: '6', B: '18', C: '36', D: '72' },
    correct: 'C',
  },
]

/** Cycles mock templates so session length matches configured questionCount. */
export function getSimuladoQuestionPaper(questionCount: number): SimuladoQuestion[] {
  const n = Math.max(1, questionCount)
  const templates = mockSimuladoQuestions
  return Array.from({ length: n }, (_, i) => {
    const t = templates[i % templates.length]
    return {
      ...t,
      id: `${t.id}__${i}`,
    }
  })
}

export type SimuladoDifficulty = 'facil' | 'medio' | 'dificil'

export interface SimuladoSessionProps {
  banca: string
  difficulty: SimuladoDifficulty
  questionCount: number
  basicSubjects: { id: string; weight: 1 | 2 | 3 }[]
  specificSubjects: { id: string; weight: 1 | 2 | 3 }[]
  onFinish: (answers: Record<string, string>, timeSpent: number) => void
  onBackToConfig: () => void
}

const optionKeys = ['A', 'B', 'C', 'D'] as const

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export default function SimuladoSession({
  banca,
  questionCount,
  onFinish,
  onBackToConfig,
}: SimuladoSessionProps) {
  const questions = useMemo(
    () => getSimuladoQuestionPaper(questionCount),
    [questionCount],
  )
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [seconds, setSeconds] = useState(0)
  const [bancaName, setBancaName] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadBancaName() {
      const { data, error } = await GetBancas()
      if (cancelled) return
      if (error) return
      const found = data.find((item) => item.id === banca)
      setBancaName(found?.name ?? '')
    }

    void loadBancaName()
    return () => {
      cancelled = true
    }
  }, [banca])

  useEffect(() => {
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  const answeredCount = Object.keys(answers).length

  const calculatePoints = () => {
    let pts = 0
    for (const q of questions) {
      if (answers[q.id] === q.correct) pts += q.weight
    }
    return pts
  }

  const timerColorClass =
    seconds < 300
      ? 'text-chart-2'
      : seconds <= 600
        ? 'text-primary'
        : 'text-destructive'

  const basicQs = questions.filter((q) => q.group === 'basico')
  const specificQs = questions.filter((q) => q.group === 'especifico')

  return (
    <div className="flex flex-col min-h-[50vh]">
      <div className="sticky top-0 z-20 bg-background border-b border-border px-4 py-3 shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={onBackToConfig}
              className="p-1 rounded-lg hover:bg-muted transition-colors shrink-0"
              aria-label="Voltar"
            >
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            </button>
            <span className="text-sm font-bold text-foreground truncate">
              {questionCount} questões · {bancaName || '—'}
            </span>
          </div>
          <div className={`flex items-center gap-1.5 text-sm font-black shrink-0 ${timerColorClass}`}>
            <Clock className="h-4 w-4" />
            {formatTime(seconds)}
          </div>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-muted-foreground">
            {answeredCount} de {questions.length} respondidas
          </span>
          <span className="text-xs font-black text-primary">
            Pontos: {calculatePoints()}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-6 pb-24 pt-6">
        {basicQs.length > 0 && (
          <section>
            <div className="flex items-center gap-2 border-l-2 border-accent pl-3 text-[10px] font-black uppercase tracking-widest text-accent mb-4">
              <LayoutGrid className="h-3.5 w-3.5" />
              CONHECIMENTOS BÁSICOS
            </div>
            <div className="flex flex-col gap-5">
              {basicQs.map((q) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  index={questions.indexOf(q)}
                  answers={answers}
                  setAnswers={setAnswers}
                />
              ))}
            </div>
          </section>
        )}

        {specificQs.length > 0 && (
          <section>
            <div className="flex items-center gap-2 border-l-2 border-primary pl-3 text-[10px] font-black uppercase tracking-widest text-primary mb-4">
              <LayoutGrid className="h-3.5 w-3.5" />
              CONHECIMENTOS ESPECÍFICOS
            </div>
            <div className="flex flex-col gap-5">
              {specificQs.map((q) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  index={questions.indexOf(q)}
                  answers={answers}
                  setAnswers={setAnswers}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 bg-background/95 backdrop-blur-sm border-t border-border p-4">
        <button
          type="button"
          onClick={() => {
            onFinish(answers, seconds)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          className="w-full max-w-3xl mx-auto py-4 rounded-2xl font-black text-base text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 block"
          style={{
            background: 'linear-gradient(90deg, #2ECC8A, #0D9488)',
            boxShadow: '0 6px 20px rgba(46,204,138,0.4)',
          }}
        >
          <CheckCircle className="h-5 w-5" />
          Ver Resultado
        </button>
      </div>
    </div>
  )
}

function QuestionCard({
  question: q,
  index,
  answers,
  setAnswers,
}: {
  question: SimuladoQuestion
  index: number
  answers: Record<string, string>
  setAnswers: Dispatch<SetStateAction<Record<string, string>>>
}) {
  const selected = answers[q.id]
  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <div className="flex justify-between items-start mb-3 gap-2">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className="text-xs font-black text-muted-foreground shrink-0">
            Q{index + 1}
          </span>
          <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-accent/15 text-accent text-[9px] font-black uppercase">
            <span>{q.subjectEmoji}</span>
            {q.subject}
          </span>
        </div>
        <span className="rounded-full px-2.5 py-1 text-[9px] font-black bg-muted text-muted-foreground border border-border shrink-0">
          Peso {q.weight}x
        </span>
      </div>
      <p className="text-sm font-bold text-foreground leading-snug mb-4">{q.text}</p>
      <div className="flex flex-col gap-2">
        {optionKeys.map((key) => {
          const isSel = selected === key
          return (
            <button
              key={key}
              type="button"
              onClick={() =>
                setAnswers((prev) => ({
                  ...prev,
                  [q.id]: key,
                }))
              }
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-sm text-left transition-all ${
                isSel
                  ? 'border-accent bg-accent/10 text-foreground'
                  : 'border-border bg-background text-foreground hover:border-border/80'
              }`}
            >
              <span
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black flex-shrink-0 ${
                  isSel
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {key}
              </span>
              {q.options[key]}
            </button>
          )
        })}
      </div>
    </div>
  )
}
