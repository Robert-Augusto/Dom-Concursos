'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Home,
  Layers,
  Sparkles,
  Target,
  Trophy,
  TrendingUp,
  XCircle,
} from 'lucide-react'
import { StudyFlowLoading } from '@/components/shared/StudyFlowLoading'
import { GetStudySessionAnswers } from '@/lib/lib-study-session-answears'
import { GetStudySession } from '@/lib/lib-study-session'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const RING_CIRCUMFERENCE = 251.2
const RING_RADIUS = 40

export interface StudyScoreProps {
  subject: string
  studySessionId: string
  onRestart: () => void
}

type ScoreTier = {
  emoji: string
  headline: string
  headlineAccent: string
  message: string
  motivational: string
  motivationalAccent: string
  reviewLabel: string
  accent: string
  accentMuted: string
  ringGlow: string
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

function getScoreTier(correct: number, total: number): ScoreTier {
  if (correct === 0) {
    return {
      emoji: '😔',
      headline: 'Não foi dessa',
      headlineAccent: 'vez',
      message:
        'Mas tudo bem — o aprendizado começa aqui. Revise o conteúdo teórico e tente novamente em 24 horas.',
      motivational: 'Cada tentativa te aproxima da sua',
      motivationalAccent: 'aprovação!',
      reviewLabel: 'Revisar em 24 horas',
      accent: '#FF4D6D',
      accentMuted: 'rgba(255,77,109,0.12)',
      ringGlow: 'rgba(255,77,109,0.35)',
    }
  }
  if (correct <= 2) {
    return {
      emoji: '😕',
      headline: 'Começando a',
      headlineAccent: 'entender',
      message:
        'Você está no caminho, mas ainda há bastante espaço para crescer. Revise esse conteúdo em 24 horas para fixar melhor o que estudou.',
      motivational: 'Sua dedicação está te aproximando da sua',
      motivationalAccent: 'aprovação!',
      reviewLabel: 'Revisar em 24 horas',
      accent: '#FF6B8A',
      accentMuted: 'rgba(255,107,138,0.12)',
      ringGlow: 'rgba(255,107,138,0.3)',
    }
  }
  if (correct <= Math.floor(total / 2)) {
    return {
      emoji: '🤔',
      headline: 'Metade',
      headlineAccent: 'lá!',
      message:
        'Você tem uma base, mas ainda precisa reforçar alguns pontos. Revise esse conteúdo em 7 dias para consolidar o aprendizado.',
      motivational: 'Sua dedicação está te aproximando da sua',
      motivationalAccent: 'aprovação!',
      reviewLabel: 'Revisar em 7 dias',
      accent: '#C9A84C',
      accentMuted: 'rgba(201,168,76,0.14)',
      ringGlow: 'rgba(201,168,76,0.35)',
    }
  }
  if (correct <= total - 1) {
    return {
      emoji: '🙂',
      headline: 'Muito',
      headlineAccent: 'bom!',
      message:
        'Você demonstrou um bom domínio do assunto. Revise esse conteúdo em 7 dias para manter o conhecimento fresco e evitar o esquecimento.',
      motivational: 'Sua dedicação está te aproximando da sua',
      motivationalAccent: 'aprovação!',
      reviewLabel: 'Revisar em 7 dias',
      accent: '#C9A84C',
      accentMuted: 'rgba(201,168,76,0.16)',
      ringGlow: 'rgba(201,168,76,0.4)',
    }
  }
  return {
    emoji: '🎖️',
    headline: 'Excelente',
    headlineAccent: 'trabalho!',
    message:
      'Parabéns! Você dominou esse assunto. Revise em 30 dias para fixar na memória de longo prazo e avance para um novo assunto.',
    motivational: 'Sua dedicação está te aproximando da sua',
    motivationalAccent: 'aprovação!',
    reviewLabel: 'Revisar em 30 dias',
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

const FLOW_STAGES = [
  { id: 'material', label: 'Estudo Teórico', Icon: BookOpen, color: '#3D7FFF' },
  { id: 'flashcard', label: 'Flashcards', Icon: Layers, color: '#2ECC8A' },
  { id: 'session', label: 'Questões', Icon: FileText, color: '#C9A84C' },
] as const

export default function StudyScore({
  subject,
  studySessionId,
  onRestart,
}: StudyScoreProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
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
  }, [studySessionId])

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
  const tier = getScoreTier(correctAnswers, totalQuestions || 6)
  const ringProgress = (accuracyPct / 100) * RING_CIRCUMFERENCE

  const stageScores = {
    material: 100,
    flashcard: 100,
    session: accuracyPct,
  }

  const performanceSubtext =
    accuracyPct >= 80
      ? 'Excelente desempenho!'
      : accuracyPct >= 50
        ? 'Bom desempenho!'
        : 'Continue praticando!'

  return (
    <div className="flex flex-col gap-6 pb-4">
      {/* Header */}
      <section className="flex flex-col items-center gap-3 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/5 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-foreground">
          <Trophy className="h-3.5 w-3.5 text-primary" aria-hidden />
          Seu resultado
        </span>

        <span className="text-4xl leading-none" aria-hidden>
          {tier.emoji}
        </span>

        <h1 className="font-heading text-2xl font-black text-foreground sm:text-3xl">
          {tier.headline}{' '}
          <span style={{ color: tier.accent }}>{tier.headlineAccent}</span>
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Você concluiu todas as etapas de estudo em{' '}
          <span className="font-semibold text-foreground">{subject}</span>.
        </p>
      </section>

      {/* Score ring */}
      <section className="flex flex-col items-center gap-4">
        <div className="relative h-60 w-60 shrink-0 p-3 ">
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

        <p className="max-w-sm text-center text-sm text-muted-foreground">
          {tier.motivational}{' '}
          <span className="font-semibold" style={{ color: tier.accent }}>
            {tier.motivationalAccent}
          </span>
        </p>
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
          subtext="Tempo de estudo"
          tone="blue"
        />
      </section>

      {/* Stage performance */}
      <section className="flex flex-col gap-4">
        <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
          Desempenho por etapa
        </p>

        <div className="flex items-start justify-between gap-2 px-1">
          {FLOW_STAGES.map((stage, index) => {
            const pct =
              stage.id === 'material'
                ? stageScores.material
                : stage.id === 'flashcard'
                  ? stageScores.flashcard
                  : stageScores.session
            const { Icon } = stage

            return (
              <div
                key={stage.id}
                className="flex min-w-0 flex-1 flex-col items-center gap-2"
              >
                <div className="flex w-full items-center">
                  {index > 0 ? (
                    <div
                      className="h-px min-w-0 flex-1 border-t border-dashed border-border"
                      aria-hidden
                    />
                  ) : (
                    <div className="min-w-0 flex-1" aria-hidden />
                  )}
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 bg-popover"
                    style={{
                      borderColor: `${stage.color}66`,
                      boxShadow: `0 0 16px ${stage.color}33`,
                      color: stage.color,
                    }}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                  </div>
                  {index < FLOW_STAGES.length - 1 ? (
                    <div
                      className="h-px min-w-0 flex-1 border-t border-dashed border-border"
                      aria-hidden
                    />
                  ) : (
                    <div className="min-w-0 flex-1" aria-hidden />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold leading-tight text-foreground">
                    {stage.label}
                  </p>
                  <p
                    className="text-[11px] font-black"
                    style={{ color: stage.color }}
                  >
                    {pct}%
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="relative h-1.5 overflow-hidden rounded-full bg-muted/50">
          <div
            className="h-full rounded-full"
            style={{
              width: '100%',
              background:
                'linear-gradient(90deg, #3D7FFF 0%, #2ECC8A 50%, #C9A84C 100%)',
            }}
          />
          <div
            className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border-2 border-background bg-primary shadow-[0_0_8px_rgba(201,168,76,0.6)]"
            style={{ left: `calc(${accuracyPct}% - 5px)` }}
            aria-hidden
          />
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Você concluiu{' '}
          <span className="font-bold text-foreground">3 de 3 etapas</span> com
          sucesso! 🚀
        </p>
      </section>

      {/* Review CTA */}
      <section className="rounded-2xl border border-primary/35 bg-card p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
            <CalendarClock className="h-6 w-6 text-primary" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-base font-black text-foreground">
              Reforce o que aprendeu!
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {tier.message}
            </p>
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
              <Target className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {tier.reviewLabel}
            </span>
          </div>
          {/*<button
            type="button"
            onClick={onRestart}
            className="flex shrink-0 items-center justify-center gap-1 rounded-xl bg-primary px-5 py-3 text-[11px] font-black uppercase tracking-wide text-primary-foreground transition-all hover:brightness-110"
            style={{ boxShadow: '0 4px 20px rgba(201,168,76,0.4)' }}
          >
            Revisar agora
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>*/}
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
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/40 bg-primary/10 py-4 text-base font-black text-primary transition-all hover:bg-primary/15"
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
