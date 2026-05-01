'use client'

import type { ReactNode } from 'react'
import {
  AlertCircle,
  BarChart2,
  BookOpen,
  CheckCircle,
  Info,
  RefreshCw,
  Trophy,
  X,
} from 'lucide-react'
import { mockStudyData } from './StudySession'

type MockQuestion = {
  id: string
  text: string
  options: Record<string, string>
  correct: string
}

export interface StudyScoreProps {
  subject: string
  level: string
  answers: Record<string, string>
  onRestart: () => void
}

function correctInCycle(cycleIndex: number, answers: Record<string, string>) {
  const qs = mockStudyData.cycles[cycleIndex].questions as readonly MockQuestion[]
  return qs.filter((q) => answers[q.id] === q.correct).length
}

export default function StudyScore({ answers, onRestart }: StudyScoreProps) {
  const allQuestions: MockQuestion[] = mockStudyData.cycles.flatMap((c) =>
    [...c.questions],
  ) as MockQuestion[]
  const totalQuestions = allQuestions.length
  const correctAnswers = allQuestions.filter(
    (q) => answers[q.id] === q.correct,
  ).length
  const score = parseFloat(((correctAnswers / totalQuestions) * 10).toFixed(1))

  const easyCorrect = correctInCycle(0, answers)
  const mediumCorrect = correctInCycle(1, answers)
  const hardCorrect = correctInCycle(2, answers)

  const easyPct = (easyCorrect / 3) * 100
  const mediumPct = (mediumCorrect / 3) * 100
  const hardPct = (hardCorrect / 3) * 100

  const strokeColor =
    score >= 7 ? '#2ECC8A' : score >= 5 ? '#C9A84C' : '#FF4D6D'

  const wrongQuestions = allQuestions.filter(
    (q) => answers[q.id] !== q.correct,
  )

  const feedbackTitle =
    score >= 8
      ? { text: '🎉 Excelente domínio!', className: 'text-chart-2' }
      : score >= 6
        ? { text: '📈 Bom progresso!', className: 'text-primary' }
        : score >= 4
          ? { text: '💪 Continue Praticando!', className: 'text-accent' }
          : { text: '📖 Releia a teoria!', className: 'text-destructive' }

  const feedbackExtra =
    score >= 8
      ? 'Continue nesse ritmo para consolidar ainda mais o conteúdo.'
      : score >= 6
        ? 'Revise os erros abaixo e refaça o ciclo para subir ainda mais sua nota.'
        : score >= 4
          ? 'Foque nas questões erradas e releia o ponto-chave da teoria.'
          : 'Volte à teoria, anote os conceitos e tente novamente com calma.'

  const optionKeys = ['A', 'B', 'C', 'D'] as const

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        <BarChart2 className="h-3.5 w-3.5" />
        SEU DESEMPENHO
      </div>

      <div className="w-32 h-32 relative mx-auto">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
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
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="font-heading font-black text-3xl" style={{ color: strokeColor }}>
            {score}
          </p>
          <p className="text-xs text-muted-foreground">/ 10</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 w-16 shrink-0">
            <span className="text-xs">🌱</span>
            <span className="text-xs text-foreground font-semibold">Fácil</span>
          </div>
          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 bg-chart-2"
              style={{ width: `${easyPct}%` }}
            />
          </div>
          <span className="w-10 text-right text-xs font-black text-chart-2">
            {Math.round(easyPct)}%
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 w-16 shrink-0">
            <span className="text-xs">📘</span>
            <span className="text-xs text-foreground font-semibold">Médio</span>
          </div>
          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 bg-accent"
              style={{ width: `${mediumPct}%` }}
            />
          </div>
          <span className="w-10 text-right text-xs font-black text-accent">
            {Math.round(mediumPct)}%
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 w-16 shrink-0">
            <span className="text-xs">🦅</span>
            <span className="text-xs text-foreground font-semibold">Difícil</span>
          </div>
          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 bg-destructive"
              style={{ width: `${hardPct}%` }}
            />
          </div>
          <span className="w-10 text-right text-xs font-black text-destructive">
            {Math.round(hardPct)}%
          </span>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-5 border border-border">
        <p className={`font-heading font-black text-lg mb-2 ${feedbackTitle.className}`}>
          {feedbackTitle.text}
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Você acertou {correctAnswers} de {totalQuestions}. {feedbackExtra}
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        <AlertCircle className="h-3.5 w-3.5" />
        REVISÃO DAS QUESTÕES
      </div>

      {wrongQuestions.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <Trophy className="h-12 w-12 text-primary" />
          <p className="font-heading font-black text-lg text-foreground">
            Gabarito Perfeito!
          </p>
          <p className="text-sm text-muted-foreground">
            Você acertou todas as questões. Incrível domínio!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {wrongQuestions.map((q) => (
            <div
              key={q.id}
              className="bg-card rounded-2xl p-5 border border-destructive/30 overflow-hidden"
            >
              <div className="h-1 bg-destructive/60 w-full -mt-5 mb-4" />
              <p className="text-sm font-bold text-foreground mb-3">{q.text}</p>
              <div className="flex flex-col gap-1">
                {optionKeys.map((letter) => {
                  const text = q.options[letter]
                  const isCorrect = letter === q.correct
                  const isWrongPick =
                    letter === answers[q.id] && answers[q.id] !== q.correct

                  let rowClass = 'bg-muted/30 border border-transparent'
                  let badgeClass = 'bg-muted text-muted-foreground'
                  let rightIcon: ReactNode = null

                  if (isCorrect) {
                    rowClass = 'bg-chart-2/10 border border-chart-2/30'
                    badgeClass = 'bg-chart-2 text-white'
                    rightIcon = (
                      <CheckCircle className="h-4 w-4 text-chart-2 shrink-0 ml-auto" />
                    )
                  } else if (isWrongPick) {
                    rowClass = 'bg-destructive/10 border border-destructive/30'
                    badgeClass = 'bg-destructive text-white'
                    rightIcon = <X className="h-4 w-4 text-destructive shrink-0 ml-auto" />
                  }

                  return (
                    <div
                      key={letter}
                      className={`flex items-center gap-3 py-2 px-3 rounded-lg ${rowClass}`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0 ${badgeClass}`}
                      >
                        {letter}
                      </span>
                      <span className="text-sm text-foreground flex-1 min-w-0">{text}</span>
                      {rightIcon}
                    </div>
                  )
                })}
              </div>
              <div
                className="mt-3 p-4 rounded-xl"
                style={{
                  background: 'rgba(61,127,255,0.08)',
                  border: '1px solid rgba(61,127,255,0.2)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-accent" />
                  <span className="text-[10px] font-black uppercase text-accent">
                    EXPLICAÇÃO
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A alternativa correta é a &quot;{q.correct}&quot; pois esta opção representa o
                  conceito fundamental que as bancas examinadoras cobram sobre este tema.
                  Revise este tópico na teoria acima.
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onRestart}
          className="w-full py-4 rounded-2xl font-black text-base text-white flex items-center justify-center gap-2 transition-all hover:opacity-95"
          style={{
            background: 'linear-gradient(90deg, #3D7FFF, #5A9FFF)',
            boxShadow: '0 6px 20px rgba(61,127,255,0.4)',
          }}
        >
          <BookOpen className="h-5 w-5" />
          Estudar Outro Assunto
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="w-full py-3.5 rounded-2xl font-bold text-sm bg-card border border-border text-muted-foreground hover:border-border/80 hover:text-foreground transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Estudar Este Assunto Novamente
        </button>
      </div>
    </div>
  )
}
