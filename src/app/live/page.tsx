'use client'

import Image from 'next/image'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { BottomNav } from '@/components/layout/BottomNav'
import { Sidebar } from '@/components/layout/Sidebar'
import LiveClassChat from '@/components/shared/LiveClassChat'
import { isValidMuxPlaybackId } from '@/components/shared/LiveMuxPlayer'
import {
  GetScheduledLiveClasses,
  GetStartedLiveClass,
} from '@/lib/lib-live-classes'
import type { LiveClasses } from '@/types'
import {
  CalendarDays,
  ChevronLeft,
  Clock,
  Radio,
  Sparkles,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

const LiveMuxPlayer = dynamic(
  () => import('@/components/shared/LiveMuxPlayer'),
  { ssr: false },
)

function LivePlayerPlaceholder({ message }: { message: string }) {
  return (
    <div className="flex aspect-video flex-col items-center justify-center gap-3 bg-muted/30 px-6 text-center">
      <Radio className="h-8 w-8 text-muted-foreground" aria-hidden />
      <p className="text-sm font-semibold text-foreground">
        Transmissão em preparação
      </p>
      <p className="max-w-sm text-xs text-muted-foreground">{message}</p>
    </div>
  )
}

function formatLiveDate(value: string | null) {
  if (!value) return 'Data a definir'
  return new Date(value).toLocaleString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatCountdown(scheduledAt: string, now: number) {
  const diff = new Date(scheduledAt).getTime() - now
  if (diff <= 0) return null

  const days = Math.floor(diff / 86_400_000)
  const hours = Math.floor((diff % 86_400_000) / 3_600_000)
  const minutes = Math.floor((diff % 3_600_000) / 60_000)

  if (days > 0) return `Começa em ${days} dia${days > 1 ? 's' : ''}`
  if (hours > 0) return `Começa em ${hours}h`
  return `Começa em ${minutes} min`
}

type UpcomingLiveCardProps = {
  liveClass: LiveClasses
  now: number
}

function UpcomingLiveCard({ liveClass, now }: UpcomingLiveCardProps) {
  const countdown = liveClass.scheduled_at
    ? formatCountdown(liveClass.scheduled_at, now)
    : null

  return (
    <article className="flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/30">
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {liveClass.thumbnail_url ? (
          <Image
            src={liveClass.thumbnail_url}
            alt=""
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, #1a0d38, #0d3020)',
            }}
          />
        )}
        {!liveClass.thumbnail_url ? (
          <div
            className="absolute inset-0 flex items-center justify-center font-heading text-lg font-bold tracking-tight text-white sm:text-xl"
            style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}
          >
            PRÓXIMA AULA AO VIVO
          </div>
        ) : null}
        <div className="live-badge-soon absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-amber-200/60 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-amber-950 shadow-[0_0_0_1px_rgba(255,255,255,0.35),0_0_22px_rgba(251,191,36,0.65)]">
          <Sparkles
            className="h-3.5 w-3.5 animate-pulse text-amber-900"
            aria-hidden
          />
          Em breve
        </div>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <h3 className="font-heading text-base font-bold leading-snug text-foreground">
          {liveClass.title ?? 'Aula ao vivo'}
        </h3>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
          <span>{formatLiveDate(liveClass.scheduled_at)}</span>
        </div>

        {countdown ? (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full border border-chart-2/30 bg-chart-2/15 px-3 py-1.5 text-xs font-bold text-chart-2">
              <Clock className="h-3.5 w-3.5" />
              <span>{countdown}</span>
            </div>
          </div>
        ) : null}
      </div>
    </article>
  )
}

export default function LivePage() {
  const [activeLive, setActiveLive] = useState<LiveClasses | null>(null)
  const [upcomingLives, setUpcomingLives] = useState<LiveClasses[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [now, setNow] = useState(() => Date.now())

  const router = useRouter()

  useEffect(() => {
    async function fetchLiveData() {
      const [startedRes, scheduledRes] = await Promise.all([
        GetStartedLiveClass(),
        GetScheduledLiveClasses(),
      ])

      if (!startedRes.error) setActiveLive(startedRes.data)
      if (!scheduledRes.error && scheduledRes.data) {
        setUpcomingLives(scheduledRes.data)
      }

      setIsLoading(false)
    }

    void fetchLiveData()
  }, [])

  useEffect(() => {
    const intervalId = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(intervalId)
  }, [])

  const playbackId = activeLive?.mux_playback_id ?? null
  const canPlayLiveStream = isValidMuxPlaybackId(playbackId)
  const hasActiveLive = Boolean(activeLive)
  const showEmptyState = !isLoading && !hasActiveLive && upcomingLives.length === 0

  function handleStepBack() {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="min-h-screen pb-20 lg:ml-[240px] lg:pb-0">
        <header className="sticky top-0 z-30 mb-3 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <button
              type="button"
              onClick={handleStepBack}
              className="flex h-12 min-w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-sidebar-accent text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-heading text-base font-bold text-foreground">
                Aulas ao Vivo
              </h1>
              <p className="text-sm text-muted-foreground">
                {hasActiveLive
                  ? 'Assista à transmissão e acompanhe as próximas aulas.'
                  : 'Confira as próximas transmissões programadas.'}
              </p>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1280px] px-4 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-8 lg:gap-10">
            {isLoading ? (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="aspect-[4/3] animate-pulse rounded-2xl border border-border bg-card"
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {!isLoading && activeLive ? (
              <section className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="live-badge-live flex items-center gap-2 rounded-full border border-white/20 bg-gradient-to-r from-red-600 via-rose-500 to-red-600 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.25),0_0_28px_rgba(239,68,68,0.85)]">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-80" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                    </span>
                    Ao vivo agora
                  </div>
                  <h2 className="font-heading text-lg font-bold text-foreground sm:text-xl">
                    {activeLive.title ?? 'Transmissão ao vivo'}
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_min(100%,360px)] lg:items-stretch lg:gap-5">
                  <div className="flex flex-col gap-3">
                    <div className="overflow-hidden rounded-2xl border border-border bg-black shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
                      {canPlayLiveStream ? (
                        <LiveMuxPlayer playbackId={playbackId} />
                      ) : (
                        <LivePlayerPlaceholder message="O player será exibido assim que o sinal estiver disponível." />
                      )}
                    </div>

                    {activeLive.scheduled_at ? (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                        <span>{formatLiveDate(activeLive.scheduled_at)}</span>
                      </div>
                    ) : null}
                  </div>

                  <LiveClassChat liveClassId={activeLive.id} />
                </div>
              </section>
            ) : null}

            {!isLoading && (upcomingLives.length > 0 || showEmptyState) ? (
              <section className="flex flex-col gap-4">
                <div>
                  <h2 className="font-heading text-lg font-semibold text-foreground">
                    {hasActiveLive
                      ? 'Próximas transmissões'
                      : 'Transmissões programadas'}
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {hasActiveLive
                      ? 'Agende-se para as próximas aulas ao vivo.'
                      : 'Prepare-se para as próximas transmissões.'}
                  </p>
                </div>

                {showEmptyState ? (
                  <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card px-6 py-16 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-muted/30">
                      <Radio
                        className="h-5 w-5 text-muted-foreground"
                        aria-hidden
                      />
                    </span>
                    <p className="text-sm font-semibold text-foreground">
                      Nenhuma aula ao vivo programada
                    </p>
                    <p className="max-w-sm text-xs text-muted-foreground">
                      Volte em breve — novas transmissões aparecerão aqui.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {upcomingLives.map((liveClass) => (
                      <UpcomingLiveCard
                        key={liveClass.id}
                        liveClass={liveClass}
                        now={now}
                      />
                    ))}
                  </div>
                )}
              </section>
            ) : null}
          </div>
        </main>
      </div>
      <BottomNav />

      <style jsx>{`
        .live-badge-live {
          animation: live-glow-pulse 1.6s ease-in-out infinite;
        }

        .live-badge-soon {
          animation: soon-shimmer 2.4s ease-in-out infinite;
        }

        @keyframes live-glow-pulse {
          0%,
          100% {
            box-shadow:
              0 0 0 1px rgba(255, 255, 255, 0.25),
              0 0 20px rgba(239, 68, 68, 0.65);
            transform: scale(1);
          }
          50% {
            box-shadow:
              0 0 0 1px rgba(255, 255, 255, 0.45),
              0 0 36px rgba(239, 68, 68, 1);
            transform: scale(1.04);
          }
        }

        @keyframes soon-shimmer {
          0%,
          100% {
            filter: brightness(1);
            box-shadow:
              0 0 0 1px rgba(255, 255, 255, 0.35),
              0 0 16px rgba(251, 191, 36, 0.45);
          }
          50% {
            filter: brightness(1.12);
            box-shadow:
              0 0 0 1px rgba(255, 255, 255, 0.55),
              0 0 28px rgba(251, 191, 36, 0.85);
          }
        }
      `}</style>
    </div>
  )
}
