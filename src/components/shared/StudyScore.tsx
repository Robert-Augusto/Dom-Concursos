'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart2,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Clock,
  Home,
  Target,
  XCircle,
} from 'lucide-react'
import { StudyFlowLoading } from '@/components/shared/StudyFlowLoading'
import { GetStudySessionAnswers } from '@/lib/lib-study-session-answears'
import { GetStudySession } from '@/lib/lib-study-session'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const TOTAL_QUESTIONS = 6
const RING_CIRCUMFERENCE = 251.2

export interface StudyScoreProps {
  subject: string
  studySessionId: string
  onRestart: () => void
}

type ScoreTier = {
  emoji: string
  headline: string
  message: string
  reviewLabel: string
  accent: string
  accentMuted: string
  ringGlow: string
  heroGradient: string
}

function formatStudyDuration(startedAt: string, endAt: string): string {
  const ms = new Date(endAt).getTime() - new Date(startedAt).getTime()
  if (ms <= 0) return '—'

  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  if (minutes > 0) {
    return `${minutes} min ${seconds} s`
  }
  return `${seconds} s`
}

function getScoreTier(correct: number): ScoreTier {
  if (correct === 0) {
    return {
      emoji: '😔',
      headline: 'Não foi dessa vez',
      message:
        'Mas tudo bem — o aprendizado começa aqui. Revise o conteúdo teórico e tente novamente em 24 horas.',
      reviewLabel: 'Revisar em 24 horas',
      accent: '#FF4D6D',
      accentMuted: 'rgba(255,77,109,0.12)',
      ringGlow: 'rgba(255,77,109,0.35)',
      heroGradient:
        'linear-gradient(135deg, rgba(255,77,109,0.14) 0%, rgba(255,77,109,0.04) 50%, transparent 100%)',
    }
  }
  if (correct <= 2) {
    return {
      emoji: '😕',
      headline: 'Começando a entender',
      message:
        'Você está no caminho, mas ainda há bastante espaço para crescer. Revise esse conteúdo em 24 horas para fixar melhor o que estudou.',
      reviewLabel: 'Revisar em 24 horas',
      accent: '#FF6B8A',
      accentMuted: 'rgba(255,107,138,0.12)',
      ringGlow: 'rgba(255,107,138,0.3)',
      heroGradient:
        'linear-gradient(135deg, rgba(255,107,138,0.12) 0%, rgba(61,127,255,0.06) 100%)',
    }
  }
  if (correct === 3) {
    return {
      emoji: '🤔',
      headline: 'Metade lá!',
      message:
        'Você tem uma base, mas ainda precisa reforçar alguns pontos. Revise esse conteúdo em 7 dias para consolidar o aprendizado.',
      reviewLabel: 'Revisar em 7 dias',
      accent: '#C9A84C',
      accentMuted: 'rgba(201,168,76,0.14)',
      ringGlow: 'rgba(201,168,76,0.35)',
      heroGradient:
        'linear-gradient(135deg, rgba(201,168,76,0.16) 0%, rgba(61,127,255,0.06) 100%)',
    }
  }
  if (correct <= 5) {
    return {
      emoji: '🙂',
      headline: 'Muito bom!',
      message:
        'Você demonstrou um bom domínio do assunto. Revise esse conteúdo em 7 dias para manter o conhecimento fresco e evitar o esquecimento.',
      reviewLabel: 'Revisar em 7 dias',
      accent: '#2ECC8A',
      accentMuted: 'rgba(46,204,138,0.14)',
      ringGlow: 'rgba(46,204,138,0.35)',
      heroGradient:
        'linear-gradient(135deg, rgba(46,204,138,0.16) 0%, rgba(61,127,255,0.08) 100%)',
    }
  }
  return {
    emoji: '🎖️',
    headline: 'Domínio completo!',
    message:
      'Parabéns! Você dominou esse assunto. Revise em 30 dias para fixar na memória de longo prazo e avance para um novo assunto.',
    reviewLabel: 'Revisar em 30 dias',
    accent: '#2ECC8A',
    accentMuted: 'rgba(46,204,138,0.18)',
    ringGlow: 'rgba(46,204,138,0.45)',
    heroGradient:
      'linear-gradient(135deg, rgba(46,204,138,0.2) 0%, rgba(61,127,255,0.12) 50%, rgba(139,92,246,0.08) 100%)',
  }
}

export default function StudyScore({
  subject,
  studySessionId,
  onRestart,
}: StudyScoreProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [durationLabel, setDurationLabel] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadScore() {
      if (!studySessionId) {
        setLoading(false)
        return
      }

      setLoading(true)

      const [sessionRes, answersRes] = await Promise.all([
        GetStudySession(studySessionId),
        GetStudySessionAnswers(studySessionId),
      ])

      if (cancelled) return

      if (sessionRes.error) {
        toast.error(sessionRes.error.message)
      } else if (sessionRes.data?.started_at && sessionRes.data?.end_at) {
        setDurationLabel(
          formatStudyDuration(
            String(sessionRes.data.started_at),
            String(sessionRes.data.end_at),
          ),
        )
      }

      if (answersRes.error) {
        toast.error(answersRes.error.message)
        setCorrectAnswers(0)
      } else {
        const correct =
          answersRes.data?.filter((row) => row.is_correct === true).length ?? 0
        setCorrectAnswers(correct)
      }

      setLoading(false)
    }

    void loadScore()
    return () => {
      cancelled = true
    }
  }, [studySessionId])

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center py-12">
        <StudyFlowLoading label="Carregando resultado..." />
      </div>
    )
  }

  const wrongAnswers = TOTAL_QUESTIONS - correctAnswers
  const accuracyPct = Math.round((correctAnswers / TOTAL_QUESTIONS) * 100)
  const tier = getScoreTier(correctAnswers)
  const ringProgress = (correctAnswers / TOTAL_QUESTIONS) * RING_CIRCUMFERENCE

  return (
    <div className="flex flex-col gap-5 pb-2">
      {/* Hero score card */}
      <section
        className="relative overflow-hidden rounded-2xl border border-border bg-card"
        style={{ boxShadow: `0 0 40px ${tier.ringGlow}` }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: tier.heroGradient }}
        />
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-40 blur-2xl"
          style={{ background: tier.accent }}
        />

        <div className="relative flex flex-col gap-6 p-6 sm:p-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/60 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground backdrop-blur-sm">
              <BarChart2 className="h-3.5 w-3.5 text-primary" aria-hidden />
              Seu resultado
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-heading text-lg font-black text-foreground sm:text-xl">
                {subject}
              </p>
              <p className="text-xs text-muted-foreground">
                Sessão de estudo focado concluída
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-10">
            <div className="relative h-44 w-44 shrink-0">
              <div
                className="absolute inset-2 rounded-full blur-xl"
                style={{ background: tier.accentMuted }}
              />
              <svg
                viewBox="0 0 100 100"
                className="relative h-full w-full -rotate-90"
                aria-hidden
              >
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="7"
                  opacity={0.5}
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  strokeWidth="7"
                  strokeLinecap="round"
                  stroke={tier.accent}
                  strokeDasharray={`${ringProgress} ${RING_CIRCUMFERENCE}`}
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl leading-none" aria-hidden>
                  {tier.emoji}
                </span>
                <p
                  className="font-heading mt-1 text-3xl font-black"
                  style={{ color: tier.accent }}
                >
                  {correctAnswers}
                  <span className="text-lg font-bold text-muted-foreground">
                    /{TOTAL_QUESTIONS}
                  </span>
                </p>
                <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  acertos
                </p>
              </div>
            </div>

            <div className="grid w-full max-w-xs grid-cols-2 gap-3 sm:max-w-none">
              <StatPill
                icon={CheckCircle2}
                label="Acertos"
                value={String(correctAnswers)}
                tone="success"
              />
              <StatPill
                icon={XCircle}
                label="Erros"
                value={String(wrongAnswers)}
                tone="danger"
              />
              <StatPill
                icon={Target}
                label="Aproveitamento"
                value={`${accuracyPct}%`}
                tone="primary"
              />
              <StatPill
                icon={Clock}
                label="Tempo"
                value={durationLabel ?? '—'}
                tone="muted"
              />
            </div>
          </div>

          {/* Answer breakdown dots */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Desempenho por questão
            </p>
            <div className="flex items-center gap-2">
              {Array.from({ length: TOTAL_QUESTIONS }, (_, i) => {
                const isCorrect = i < correctAnswers
                return (
                  <div
                    key={i}
                    className={cn(
                      'h-3 w-3 rounded-full border-2 transition-colors',
                      isCorrect
                        ? 'border-chart-2 bg-chart-2 shadow-[0_0_8px_rgba(46,204,138,0.5)]'
                        : 'border-destructive/50 bg-destructive/20',
                    )}
                    title={isCorrect ? 'Acerto' : 'Erro'}
                  />
                )
              })}
            </div>
            <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${accuracyPct}%`,
                  background: `linear-gradient(90deg, ${tier.accent}, ${tier.accent}99)`,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Feedback */}
      <section
        className="rounded-2xl border border-border bg-card p-5 sm:p-6"
        style={{ borderColor: `${tier.accent}33` }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl"
            style={{ background: tier.accentMuted }}
          >
            <span aria-hidden>{tier.emoji}</span>
          </div>
          <div className="flex flex-1 flex-col gap-3 text-center sm:text-left">
            <p className="font-heading text-lg font-black text-foreground">
              {tier.headline}
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {tier.message}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold"
                style={{
                  background: tier.accentMuted,
                  color: tier.accent,
                }}
              >
                <CalendarClock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {tier.reviewLabel}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-chart-2" aria-hidden />
                {correctAnswers} de {TOTAL_QUESTIONS} questões corretas
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Actions */}
      <section className="flex w-full flex-col gap-3">
        <p className="text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          Próximo passo
        </p>
        <button
          type="button"
          onClick={onRestart}
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-black text-white transition-all hover:opacity-95 hover:shadow-lg"
          style={{
            background: 'linear-gradient(90deg, #3D7FFF, #5A9FFF)',
            boxShadow: '0 6px 24px rgba(61,127,255,0.45)',
          }}
        >
          <BookOpen className="h-5 w-5" aria-hidden />
          Estudar outro assunto
        </button>
        <p className="text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          OU
        </p>
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3.5 text-sm font-bold text-muted-foreground transition-colors hover:border-border/80 hover:text-foreground"
        >
          <Home className="h-4 w-4 shrink-0" aria-hidden />
          Voltar ao dashboard
        </button>
      </section>
    </div>
  )
}

function StatPill({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  tone: 'success' | 'danger' | 'primary' | 'muted'
}) {
  const toneStyles = {
    success: 'text-chart-2 bg-chart-2/10 border-chart-2/20',
    danger: 'text-destructive bg-destructive/10 border-destructive/20',
    primary: 'text-primary bg-primary/10 border-primary/20',
    muted: 'text-muted-foreground bg-muted/50 border-border',
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-1 rounded-xl border p-3',
        toneStyles[tone],
      )}
    >
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
        <span className="text-[10px] font-black uppercase tracking-wide opacity-80">
          {label}
        </span>
      </div>
      <span className="font-heading text-lg font-black leading-none text-foreground">
        {value}
      </span>
    </div>
  )
}
