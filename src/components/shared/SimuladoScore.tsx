'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  Home,
  RefreshCw,
  Target,
  TrendingUp,
  Trophy,
  XCircle,
} from 'lucide-react'
import { StudyFlowLoading } from '@/components/shared/StudyFlowLoading'
import { GetSimuladoSession } from '@/lib/lib-simulado-session'
import { GetSimuladoSessionAnswers } from '@/lib/lib-simulado-session-answears'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const RING_CIRCUMFERENCE = 251.2
const RING_RADIUS = 40

export interface SimuladoScoreProps {
  simuladoSessionId: string
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
}

function formatSimuladoDuration(startedAt: string, endAt: string): string {
  const ms = new Date(endAt).getTime() - new Date(startedAt).getTime()
  if (ms <= 0) return '—'

  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) return `${hours} h ${minutes} min`
  if (minutes > 0) return `${minutes} min ${seconds} s`
  return `${seconds} s`
}

/**
 * Percentage-based tiers (simulado has 20/40/60 questions, not ~6).
 * Messages keep the same supportive tone as StudyScore, adapted to the
 * simulado context (multiple subjects in one run, no single "assunto").
 */
function getScoreTier(accuracyPct: number): ScoreTier {
  if (accuracyPct === 0) {
    return {
      emoji: '😔',
      headline: 'Não foi dessa vez...',
      message:
        'Mas tudo bem, o seu aprendizado começou. Revise as matérias do simulado na seção de Estudo Inteligente e refaça o simulado em 24 horas.',
      reviewLabel: 'Refazer em 24 horas',
      accent: '#FF4D6D',
      accentMuted: 'rgba(255,77,109,0.12)',
      ringGlow: 'rgba(255,77,109,0.35)',
    }
  }
  if (accuracyPct < 30) {
    return {
      emoji: '😕',
      headline: 'Começando a entender...',
      message:
        'Você está no caminho, mas ainda há bastante espaço para crescer. Revise as matérias do simulado em 24 horas para fixar melhor os conteúdos.',
      reviewLabel: 'Refazer em 24 horas',
      accent: '#FF6B8A',
      accentMuted: 'rgba(255,107,138,0.12)',
      ringGlow: 'rgba(255,107,138,0.3)',
    }
  }
  if (accuracyPct <= 50) {
    return {
      emoji: '🤔',
      headline: 'Metade lá!',
      message:
        'Você tem uma base, mas ainda precisa reforçar alguns pontos. Revise as matérias do simulado em 7 dias para consolidar o aprendizado.',
      reviewLabel: 'Refazer em 7 dias',
      accent: '#C9A84C',
      accentMuted: 'rgba(201,168,76,0.14)',
      ringGlow: 'rgba(201,168,76,0.35)',
    }
  }
  if (accuracyPct < 100) {
    return {
      emoji: '🙂',
      headline: 'Muito bom!',
      message:
        'Você demonstrou um bom domínio dos assuntos. Revise as matérias do simulado em 7 dias para manter o conhecimento fresco e evitar o esquecimento.',
      reviewLabel: 'Refazer em 7 dias',
      accent: '#C9A84C',
      accentMuted: 'rgba(201,168,76,0.16)',
      ringGlow: 'rgba(201,168,76,0.4)',
    }
  }
  return {
    emoji: '🎖️',
    headline: 'Excelente trabalho!',
    message:
      'Parabéns! Você dominou todos os assuntos do simulado. Revise em 30 dias para fixar na memória de longo prazo e siga praticando com outros simulados.',
    reviewLabel: 'Refazer em 30 dias',
    accent: '#C9A84C',
    accentMuted: 'rgba(201,168,76,0.18)',
    ringGlow: 'rgba(201,168,76,0.45)',
  }
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  subtext: string
  tone: 'success' | 'danger' | 'gold' | 'blue'
}) {
  const styles = {
    success: {
      border: 'border-chart-2/25',
      bg: 'bg-chart-2/8',
      label: 'text-chart-2',
      icon: 'text-chart-2/15',
    },
    danger: {
      border: 'border-destructive/25',
      bg: 'bg-destructive/8',
      label: 'text-destructive',
      icon: 'text-destructive/15',
    },
    gold: {
      border: 'border-primary/30',
      bg: 'bg-primary/8',
      label: 'text-primary',
      icon: 'text-primary/15',
    },
    blue: {
      border: 'border-accent/25',
      bg: 'bg-accent/8',
      label: 'text-accent',
      icon: 'text-accent/15',
    },
  }[tone]

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border p-4',
        styles.border,
        styles.bg,
      )}
    >
      <Icon
        className={cn(
          'pointer-events-none absolute -right-1 -bottom-1 h-10 w-10 mr-4 mb-14',
          styles.icon,
        )}
        aria-hidden
      />
      <div className="relative flex items-center gap-1.5">
        <Icon className={cn('h-3.5 w-3.5 shrink-0', styles.label)} aria-hidden />
        <span
          className={cn(
            'text-[10px] font-black uppercase tracking-wide',
            styles.label,
          )}
        >
          {label}
        </span>
      </div>
      <p className="relative mt-2 font-heading text-2xl font-black text-foreground">
        {value}
      </p>
      <p className="relative mt-0.5 text-xs text-muted-foreground">{subtext}</p>
    </div>
  )
}

export default function SimuladoScore({
  simuladoSessionId,
  onRestart,
}: SimuladoScoreProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [durationLabel, setDurationLabel] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadScore() {
      if (!simuladoSessionId) {
        setLoading(false)
        return
      }

      setLoading(true)

      const [sessionRes, answersRes] = await Promise.all([
        GetSimuladoSession(simuladoSessionId),
        GetSimuladoSessionAnswers(simuladoSessionId),
      ])

      if (cancelled) return

      if (sessionRes.error) {
        toast.error(sessionRes.error.message)
      } else if (sessionRes.data?.started_at && sessionRes.data?.end_at) {
        setDurationLabel(
          formatSimuladoDuration(
            String(sessionRes.data.started_at),
            String(sessionRes.data.end_at),
          ),
        )
      }

      if (answersRes.error) {
        toast.error(answersRes.error.message)
        setCorrectAnswers(0)
        setTotalQuestions(0)
      } else {
        const rows = answersRes.data ?? []
        setTotalQuestions(rows.length)
        setCorrectAnswers(rows.filter((row) => row.is_correct === true).length)
      }

      setLoading(false)
    }

    void loadScore()
    return () => {
      cancelled = true
    }
  }, [simuladoSessionId])

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center py-12">
        <StudyFlowLoading label="Carregando resultado..." />
      </div>
    )
  }

  const wrongAnswers = totalQuestions - correctAnswers
  const accuracyPct =
    totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
  const tier = getScoreTier(accuracyPct)
  const ringProgress = (accuracyPct / 100) * RING_CIRCUMFERENCE

  const performanceSubtext =
    accuracyPct >= 80
      ? 'Excelente desempenho!'
      : accuracyPct >= 50
        ? 'Bom desempenho!'
        : 'Continue praticando!'

  return (
    <div className="flex flex-col gap-6 pb-4">
      <section className="flex flex-col items-center gap-3 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/5 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-foreground">
          <Trophy className="h-3.5 w-3.5 text-primary" aria-hidden />
          Seu resultado
        </span>
        <h1 className="font-heading text-2xl font-black text-foreground sm:text-3xl">
          {tier.headline}
        </h1>
      </section>

      {/* Score ring */}
      <section className="flex flex-col items-center gap-4">
        <div className="relative h-60 w-60 shrink-0 p-3">
          <svg
            viewBox="0 0 100 100"
            className="relative h-full w-full -rotate-90"
            aria-hidden
          >
            <circle
              cx="50"
              cy="50"
              r={RING_RADIUS}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="6"
              opacity={0.45}
            />
            <circle
              cx="50"
              cy="50"
              r={RING_RADIUS}
              fill="none"
              strokeWidth="6"
              strokeLinecap="round"
              stroke={tier.accent}
              strokeDasharray={`${ringProgress} ${RING_CIRCUMFERENCE}`}
            />
          </svg>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-1">
            <Trophy
              className="mb-1 h-5 w-5"
              style={{ color: tier.accent }}
              aria-hidden
            />
            <p
              className="font-heading text-4xl font-black leading-none"
              style={{ color: tier.accent }}
            >
              {accuracyPct}%
            </p>
            <p
              className="mt-1 text-[9px] font-black uppercase tracking-[0.18em]"
              style={{ color: tier.accent }}
            >
              aproveitamento
            </p>
          </div>
        </div>
      </section>

      {/* Review CTA */}
      <section className="rounded-2xl border border-primary/35 bg-card p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
            <CalendarClock className="h-6 w-6 text-primary" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-base font-black text-foreground">
              {tier.headline}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {tier.message}
            </p>
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
              <Target className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {tier.reviewLabel}
            </span>
          </div>
        </div>
      </section>

      {/* Stats grid */}
      <section className="grid grid-cols-2 gap-3">
        <StatCard
          icon={CheckCircle2}
          label="Acertos"
          value={String(correctAnswers)}
          subtext={
            totalQuestions > 0
              ? `de ${totalQuestions} questões`
              : 'de — questões'
          }
          tone="success"
        />
        <StatCard
          icon={XCircle}
          label="Erros"
          value={String(wrongAnswers)}
          subtext={
            totalQuestions > 0
              ? `de ${totalQuestions} questões`
              : 'de — questões'
          }
          tone="danger"
        />
        <StatCard
          icon={TrendingUp}
          label="Aproveitamento"
          value={`${accuracyPct}%`}
          subtext={performanceSubtext}
          tone="gold"
        />
        <StatCard
          icon={Clock}
          label="Tempo total"
          value={durationLabel ?? '—'}
          subtext="Tempo do simulado"
          tone="blue"
        />
      </section>

      {/* Actions */}
      <section className="flex w-full flex-col gap-3">
        <p className="text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          Próximo passo
        </p>
        <button
          type="button"
          onClick={onRestart}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/40 bg-primary/10 py-4 text-base font-black text-primary transition-all hover:bg-primary/15"
        >
          <RefreshCw className="h-5 w-5" aria-hidden />
          Fazer novo simulado
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
