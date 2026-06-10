import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { BottomNav } from '@/components/layout/BottomNav'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { PerformanceDashboard } from '@/components/shared/PerformanceDashboard'
import {
  GetSimuladoPerformanceMetrics,
  GetStudyPerformanceMetrics,
} from '@/lib/lib-performance-metrics'

export default async function ScorePage() {
  const [studyResult, simuladoResult] = await Promise.all([
    GetStudyPerformanceMetrics(),
    GetSimuladoPerformanceMetrics(),
  ])

  if (studyResult.error) {
    throw new Error(studyResult.error.message)
  }

  if (simuladoResult.error) {
    throw new Error(simuladoResult.error.message)
  }

  const studyMetrics = studyResult.data ?? {
    totalSessions: 0,
    totalQuestions: 0,
    accuracyRate: 0,
  }

  const simuladoMetrics = simuladoResult.data ?? {
    totalSimulados: 0,
    averageScore: 0,
    bestScore: 0,
  }
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="min-h-screen pb-20 lg:ml-[240px] lg:pb-0">
        <div className="hidden lg:block">
          <Header />
        </div>

        <header className="sticky top-0 z-30 border-b border-border bg-background lg:hidden">
          <div className="flex items-center gap-3 px-4 py-3">
            <Link
              href="/dashboard"
              className="flex h-12 min-w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-sidebar-accent text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Voltar"
            >
              <ChevronLeft className="h-6 w-6" />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-heading text-base font-bold text-foreground">
                Desempenho
              </h1>
              <p className="text-sm text-muted-foreground">
                Acompanhe sua evolução
              </p>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1210px] p-4 sm:p-6">
          <div className="mx-auto flex max-w-5xl flex-col gap-5 rounded-2xl lg:border lg:border-border lg:bg-card lg:p-6">
            <PerformanceDashboard
              studyMetrics={studyMetrics}
              simuladoMetrics={simuladoMetrics}
            />
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
