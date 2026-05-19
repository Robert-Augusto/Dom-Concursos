'use client'

import { BarChart2, BookOpen, RefreshCw } from 'lucide-react'
import type { Questions } from '@/types'

export interface StudyScoreProps {
  subject: string
  questionsData: Questions[]
  answers: Record<string, string>
  onRestart: () => void
}

export default function StudyScore({
  subject,
  questionsData,
  answers,
  onRestart,
}: StudyScoreProps) {
  const totalQuestions = questionsData.length
  const correctAnswers = questionsData.filter(
    (q) => answers[q.id] === q.correct_option,
  ).length
  const score =
    totalQuestions > 0
      ? parseFloat(((correctAnswers / totalQuestions) * 10).toFixed(1))
      : 0

  const strokeColor =
    score >= 7 ? '#2ECC8A' : score >= 5 ? '#C9A84C' : '#FF4D6D'

  const feedbackTitle =
    score >= 8
      ? '🎉 Excelente domínio!'
      : score >= 6
        ? '📈 Bom progresso!'
        : score >= 4
          ? '💪 Continue praticando!'
          : '📖 Releia o material!'

  return (
    <div className="flex flex-col items-center gap-8 py-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          <BarChart2 className="h-3.5 w-3.5" />
          Seu resultado
        </div>
        <p className="text-sm text-muted-foreground">{subject}</p>
      </div>

      <div className="relative h-40 w-40">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            stroke={strokeColor}
            strokeDasharray={`${(score / 10) * 251.2} 251.2`}
          />
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="font-heading text-4xl font-black" style={{ color: strokeColor }}>
            {score}
          </p>
          <p className="text-sm text-muted-foreground">/ 10</p>
        </div>
      </div>

      <div className="max-w-sm text-center">
        <p className="font-heading text-lg font-black text-foreground">{feedbackTitle}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Você acertou {correctAnswers} de {totalQuestions} questões.
        </p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-3">
        <button
          type="button"
          onClick={onRestart}
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-black text-white transition-all hover:opacity-95"
          style={{
            background: 'linear-gradient(90deg, #3D7FFF, #5A9FFF)',
            boxShadow: '0 6px 20px rgba(61,127,255,0.4)',
          }}
        >
          <BookOpen className="h-5 w-5" />
          Estudar outro assunto
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3.5 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
        >
          <RefreshCw className="h-4 w-4" />
          Estudar este assunto novamente
        </button>
      </div>
    </div>
  )
}
