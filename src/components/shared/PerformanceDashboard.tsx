import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  BookOpen,
  ChartNoAxesCombined,
  CircleHelp,
  ClipboardList,
  Medal,
  Star,
  Target,
  TrendingUp,
  Trophy,
} from 'lucide-react'
import type {
  SimuladoPerformanceMetrics,
  StudyPerformanceMetrics,
} from '@/lib/lib-performance-metrics'

type MetricTone = 'blue' | 'purple'

interface MetricItem {
  label: string
  value: string
  Icon: LucideIcon
  highlightValue?: boolean
}

interface PerformanceSection {
  title: string
  subtitle: string
  HeaderIcon: LucideIcon
  BackgroundIcon: LucideIcon
  tone: MetricTone
  metrics: MetricItem[]
}

function buildStudyMetricsSection(
  metrics: StudyPerformanceMetrics,
): PerformanceSection {
  return {
    title: 'Sessões de Estudo',
    subtitle: 'Seu desempenho nos estudos',
    HeaderIcon: BookOpen,
    BackgroundIcon: BookOpen,
    tone: 'blue',
    metrics: [
      {
        label: 'Total de sessões de estudo',
        value: String(metrics.totalSessions),
        Icon: BarChart3,
      },
      {
        label: 'Total de questões respondidas',
        value: String(metrics.totalQuestions),
        Icon: CircleHelp,
      },
      {
        label: 'Taxa geral de acertos',
        value: `${metrics.accuracyRate}%`,
        Icon: Target,
        highlightValue: true,
      },
    ],
  }
}

function buildSimuladoMetricsSection(
  metrics: SimuladoPerformanceMetrics,
): PerformanceSection {
  return {
    title: 'Simulados',
    subtitle: 'Seu desempenho nos simulados',
    HeaderIcon: Trophy,
    BackgroundIcon: Trophy,
    tone: 'purple',
    metrics: [
      {
        label: 'Total de simulados realizados',
        value: String(metrics.totalSimulados),
        Icon: ClipboardList,
      },
      {
        label: 'Média de pontuação',
        value: `${metrics.averageScore}%`,
        Icon: Star,
        highlightValue: true,
      },
      {
        label: 'Melhor pontuação',
        value: `${metrics.bestScore}%`,
        Icon: Medal,
        highlightValue: true,
      },
    ],
  }
}

const toneStyles: Record<
  MetricTone,
  {
    title: string
    iconBox: string
    icon: string
    card: string
    metricRow: string
    metricIcon: string
    value: string
    bgIcon: string
  }
> = {
  blue: {
    title: 'text-accent',
    iconBox: 'border-accent/30 bg-accent/15',
    icon: 'text-accent',
    card: 'border-accent/25 bg-accent/5',
    metricRow: 'border-accent/20 bg-accent/5',
    metricIcon: 'border-accent/25 bg-accent/10 text-accent',
    value: 'text-accent',
    bgIcon: 'text-accent/10',
  },
  purple: {
    title: 'text-chart-5',
    iconBox: 'border-chart-5/30 bg-chart-5/15',
    icon: 'text-chart-5',
    card: 'border-chart-5/25 bg-chart-5/5',
    metricRow: 'border-chart-5/20 bg-chart-5/5',
    metricIcon: 'border-chart-5/25 bg-chart-5/10 text-chart-5',
    value: 'text-chart-5',
    bgIcon: 'text-chart-5/10',
  },
}

function SectionHeader({
  section,
}: {
  section: PerformanceSection
}) {
  const styles = toneStyles[section.tone]
  const HeaderIcon = section.HeaderIcon

  return (
    <div className="flex items-start gap-3">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${styles.iconBox}`}
      >
        <HeaderIcon className={`h-5 w-5 ${styles.icon}`} aria-hidden />
      </div>
      <div className="min-w-0">
        <h2 className={`font-heading text-base font-black ${styles.title}`}>
          {section.title}
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{section.subtitle}</p>
      </div>
    </div>
  )
}

function MobileMetricRow({
  metric,
  tone,
}: {
  metric: MetricItem
  tone: MetricTone
}) {
  const styles = toneStyles[tone]
  const Icon = metric.Icon

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 ${styles.metricRow}`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${styles.metricIcon}`}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted-foreground">{metric.label}</p>
        <p
          className={`mt-0.5 font-heading text-2xl font-black ${
            metric.highlightValue ? styles.value : 'text-foreground'
          }`}
        >
          {metric.value}
        </p>
      </div>
    </div>
  )
}

function DesktopMetricCard({
  metric,
  tone,
}: {
  metric: MetricItem
  tone: MetricTone
}) {
  const styles = toneStyles[tone]
  const Icon = metric.Icon

  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-4 ${styles.metricRow}`}
    >
      <div
        className={`mb-3 flex h-5 w-9 items-center justify-center rounded-lg border ${styles.metricIcon}`}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </div>
      <p className="text-sm leading-snug text-muted-foreground">{metric.label}</p>
      <p
        className={`mt-2 font-heading text-3xl font-black ${
          metric.highlightValue ? styles.value : 'text-foreground'
        }`}
      >
        {metric.value}
      </p>
    </div>
  )
}

function PerformanceSectionCard({
  section,
  variant,
}: {
  section: PerformanceSection
  variant: 'mobile' | 'desktop'
}) {
  const styles = toneStyles[section.tone]
  const BackgroundIcon = section.BackgroundIcon

  return (
    <section
      className={`relative overflow-hidden rounded-2xl border p-5 ${styles.card}`}
    >
      <BackgroundIcon
        className={`pointer-events-none absolute -right-4 -top-2 h-12 w-12 mr-8 mt-6 ${styles.bgIcon}`}
        strokeWidth={1.2}
        aria-hidden
      />

      <div className="relative flex flex-col gap-4">
        <SectionHeader section={section} />

        {variant === 'mobile' ? (
          <div className="flex flex-col gap-2.5">
            {section.metrics.map((metric) => (
              <MobileMetricRow
                key={metric.label}
                metric={metric}
                tone={section.tone}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {section.metrics.map((metric) => (
              <DesktopMetricCard
                key={metric.label}
                metric={metric}
                tone={section.tone}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function InfoFooter() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-primary/5 px-4 py-4 sm:px-5">
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary/15 blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-primary"
        aria-hidden
      />

      <div className="relative flex items-start gap-3.5 sm:items-center sm:gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 sm:h-11 sm:w-11">
          <TrendingUp className="h-5 w-5 text-primary" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="font-heading text-sm font-black text-foreground sm:text-base">
            Continue evoluindo
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Estude com regularidade e faça simulados para acompanhar sua evolução
            rumo à{' '}
            <span className="font-semibold text-primary">aprovação</span>.
          </p>
        </div>
      </div>
    </div>
  )
}

interface PerformanceDashboardProps {
  studyMetrics: StudyPerformanceMetrics
  simuladoMetrics: SimuladoPerformanceMetrics
}

export function PerformanceDashboard({
  studyMetrics,
  simuladoMetrics,
}: PerformanceDashboardProps) {
  const studySection = buildStudyMetricsSection(studyMetrics)
  const simuladoSection = buildSimuladoMetricsSection(simuladoMetrics)

  return (
    <div className="flex flex-col gap-5 lg:gap-6">
      <div className="hidden items-start gap-4 lg:flex">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-accent/15">
          <ChartNoAxesCombined className="h-6 w-6 text-accent" aria-hidden />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-black text-foreground">
            Desempenho
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Acompanhe sua evolução nos estudos e simulados
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-2 lg:gap-5">
        <div className="lg:hidden">
          <PerformanceSectionCard section={studySection} variant="mobile" />
        </div>
        <div className="hidden lg:block">
          <PerformanceSectionCard section={studySection} variant="desktop" />
        </div>

        <div className="lg:hidden">
          <PerformanceSectionCard section={simuladoSection} variant="mobile" />
        </div>
        <div className="hidden lg:block">
          <PerformanceSectionCard section={simuladoSection} variant="desktop" />
        </div>
      </div>

      <InfoFooter />
    </div>
  )
}
