'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { BottomNav } from '@/components/layout/BottomNav'
import { Sidebar } from '@/components/layout/Sidebar'
import { GetScheduledLiveClasses } from '@/lib/lib-live-classes'
import type { LiveClasses } from '@/types'
import { CalendarDays, Clock, Radio, Sparkles, Video, ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

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

function hasLiveStarted(scheduledAt: string | null, now: number) {
  if (!scheduledAt) return false
  return new Date(scheduledAt).getTime() <= now
}

export default function LivePage() {
  const [liveClasses, setLiveClasses] = useState<LiveClasses[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    async function fetchLiveClasses() {
      const { data, error } = await GetScheduledLiveClasses()
      if (!error && data) setLiveClasses(data)
      setIsLoading(false)
    }

    void fetchLiveClasses()
  }, [])

  useEffect(() => {
    const intervalId = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(intervalId)
  }, [])

  const router = useRouter()

  function handleStepBack(){
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="min-h-screen pb-20 lg:ml-[240px] lg:pb-0">
        
      <header className="sticky top-0 z-30 border-b border-border bg-background mb-3">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <button
              type="button"
              onClick={handleStepBack}
              className="flex h-12 min-w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-sidebar-accent text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="font-heading truncate text-base font-bold text-foreground">
                Aulas ao Vivo
              </h1>
              <p className="text-sm text-muted-foreground">
                Acesse as aulas que estão acontecendo agora.
              </p>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1210px] p-6">
          <div className="flex flex-col gap-8">
            <section className="flex flex-col gap-4">
              <div>
                <h2 className="font-heading text-lg font-semibold text-foreground">
                  Próxima Aula ao Vivo
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Prepare-se para a próxima transmissão
                </p>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center rounded-2xl border border-border bg-card px-6 py-16">
                  <p className="text-sm text-muted-foreground">Carregando...</p>
                </div>
              ) : liveClasses.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card px-6 py-16 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-muted/30">
                    <Radio className="h-5 w-5 text-muted-foreground" aria-hidden />
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
                  {liveClasses.map((liveClass) => {
                    const started = hasLiveStarted(liveClass.scheduled_at, now)
                    const countdown = liveClass.scheduled_at
                      ? formatCountdown(liveClass.scheduled_at, now)
                      : null

                    return (
                      <article
                        key={liveClass.id}
                        className="flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card"
                      >
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
                                background:
                                  'linear-gradient(135deg, #1a0d38, #0d3020)',
                              }}
                            />
                          )}
                          {!liveClass.thumbnail_url ? (
                            <div
                              className="absolute inset-0 flex items-center justify-center font-heading text-xl font-bold tracking-tight text-white"
                              style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}
                            >
                              PRÓXIMA AULA AO VIVO
                            </div>
                          ) : null}
                          {started ? (
                            <div className="live-badge-live absolute left-3 top-3 flex items-center gap-2 rounded-full border border-white/40 bg-gradient-to-r from-red-600 via-rose-500 to-red-600 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.25),0_0_28px_rgba(239,68,68,0.85)]">
                              <span className="relative flex h-2.5 w-2.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-80" />
                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                              </span>
                              Ao vivo agora
                            </div>
                          ) : (
                            <div className="live-badge-soon absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-amber-200/60 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-amber-950 shadow-[0_0_0_1px_rgba(255,255,255,0.35),0_0_22px_rgba(251,191,36,0.65)]">
                              <Sparkles
                                className="h-3.5 w-3.5 animate-pulse text-amber-900"
                                aria-hidden
                              />
                              Em breve
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-3 p-4">
                          <h3 className="font-heading text-base font-bold leading-snug text-foreground">
                            {liveClass.title ?? 'Aula ao vivo'}
                          </h3>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                            <span>{formatLiveDate(liveClass.scheduled_at)}</span>
                          </div>

                          {started && liveClass.video_url ? (
                            <a
                              href={liveClass.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary bg-primary py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
                            >
                              <Video className="h-4 w-4" aria-hidden />
                              Assistir ao vivo
                            </a>
                          ) : countdown ? (
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
                  })}
                </div>
              )}
            </section>
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
