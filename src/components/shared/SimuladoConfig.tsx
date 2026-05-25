'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Check,
  CheckCircle,
  CheckSquare,
  Lightbulb,
  Play,
  Search,
} from 'lucide-react'
import { GetBancas } from '@/lib/lib-banca'
import { GetRootSubjects } from '@/lib/lib-subjects'
import type { Banca, Subjects, QuestionsDifficulty } from '@/types'
import { toast } from 'sonner'
import { CreateSimuladoSession } from '@/lib/lib-simulado-session'
import { useProfile } from '@/context/ProfileContext'
import { cn } from '@/lib/utils'

type SubjectColor = 'accent' | 'chart-2'

function subjectChoiceClass(active: boolean, color: SubjectColor) {
  const base =
    'group relative inline-flex items-center font-semibold transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background'

  if (color === 'accent') {
    return cn(
      base,
      'min-h-[3.5rem] w-full justify-between gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm focus-visible:ring-accent/60',
      active
        ? 'border-accent bg-accent/15 text-foreground shadow-[0_0_0_1px_rgba(61,127,255,0.3),0_8px_22px_rgba(61,127,255,0.25)]'
        : 'border-border/70 bg-card text-foreground/90 shadow-[0_2px_6px_rgba(0,0,0,0.18)] hover:-translate-y-0.5 hover:border-accent/50 hover:bg-popover hover:shadow-[0_8px_20px_rgba(0,0,0,0.28)]',
    )
  }

  return cn(
    base,
    'min-h-[3.5rem] w-full justify-between gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm focus-visible:ring-chart-2/60',
    active
      ? 'border-chart-2 bg-chart-2/15 text-foreground shadow-[0_0_0_1px_rgba(46,204,138,0.3),0_8px_22px_rgba(46,204,138,0.25)]'
      : 'border-border/70 bg-card text-foreground/90 shadow-[0_2px_6px_rgba(0,0,0,0.18)] hover:-translate-y-0.5 hover:border-chart-2/50 hover:bg-popover hover:shadow-[0_8px_20px_rgba(0,0,0,0.28)]',
  )
}

function subjectCheckMarkerClass(active: boolean, color: SubjectColor) {
  if (color === 'accent') {
    return cn(
      'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all',
      active
        ? 'border-accent bg-accent text-accent-foreground'
        : 'border-border/70 bg-background group-hover:border-accent/55',
    )
  }

  return cn(
    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all',
    active
      ? 'border-chart-2 bg-chart-2 text-white'
      : 'border-border/70 bg-background group-hover:border-chart-2/55',
  )
}

export interface SimuladoConfigPayload {
  banca: string
  difficulty: QuestionsDifficulty
  basicSubjects: { id: string; weight: 1 | 2 | 3 }[]
  specificSubjects: { id: string; weight: 1 | 2 | 3 }[]
  questionCount: number
}

export interface SimuladoConfigProps {
  onStart: (config: SimuladoConfigPayload) => void
}

const BANCA_AVATAR_COLORS = [
  '#3D7FFF',
  '#8B5CF6',
  '#2ECC8A',
  '#C9A84C',
  '#FF4D6D',
  '#0D9488',
] as const

function bancaInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase().slice(0, 2)
  }
  return name.trim().slice(0, 2).toUpperCase()
}

function bancaAvatarColor(index: number) {
  return BANCA_AVATAR_COLORS[index % BANCA_AVATAR_COLORS.length]
}

const quantities = [
  { value: 20, label: 'Rápido' },
  { value: 40, label: 'Padrão' },
  { value: 60, label: 'Completo' }
]

function difficultyLabel(d: QuestionsDifficulty) {
  if (d === 'Fácil') return 'Fácil'
  if (d === 'Médio') return 'Médio'
  return 'Difícil'
}

function filterByName<T extends { name: string }>(items: T[], query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return items
  return items.filter((item) => item.name.toLowerCase().includes(q))
}

function ListSearchInput({
  id,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  disabled?: boolean
}) {
  return (
    <div className="relative mb-3">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/25 disabled:opacity-50"
      />
    </div>
  )
}

export default function SimuladoConfig({ onStart }: SimuladoConfigProps) {
  const [bancas, setBancas] = useState<Banca[] | null>(null)
  const [rootSubjects, setRootSubjects] = useState<Subjects[] | null>(null)
  const [banca, setBanca] = useState('')
  const [difficulty, setDifficulty] = useState<QuestionsDifficulty>('Médio')
  const [basicSubjects, setBasicSubjects] = useState<{ id: string; weight: 1 | 2 | 3 }[]>(
    [],
  )
  const [specificSubjects, setSpecificSubjects] = useState<
    { id: string; weight: 1 | 2 | 3 }[]
  >([])
  const [questionCount, setQuestionCount] = useState(30)
  const [bancaSearch, setBancaSearch] = useState('')
  const [basicSubjectSearch, setBasicSubjectSearch] = useState('')
  const [specificSubjectSearch, setSpecificSubjectSearch] = useState('')
  const { profile, loading: profileLoading } = useProfile()

  useEffect(() => {
    let cancelled = false

    async function fetchBancas() {
      const { data, error } = await GetBancas()
      if (cancelled) return

      if (error) {
        console.error('banca:', error)
        toast.error('Não foi possível carregar as bancas.')
        setBancas([])
        return
      }

      setBancas(data)
    }

    void fetchBancas()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function fetchSubjects() {
      const { data, error } = await GetRootSubjects()
      if (cancelled) return

      if (error) {
        console.error('subjects:', error)
        toast.error('Não foi possível carregar as matérias.')
        setRootSubjects([])
        return
      }

      setRootSubjects(data)
    }

    void fetchSubjects()
    return () => {
      cancelled = true
    }
  }, [])

  const basicSubjectsList = useMemo(
    () => (rootSubjects ?? []).filter((s) => s.type === 'basic'),
    [rootSubjects],
  )

  const specificSubjectsList = useMemo(
    () => (rootSubjects ?? []).filter((s) => s.type === 'specific'),
    [rootSubjects],
  )

  const filteredBancas = useMemo(
    () => filterByName(bancas ?? [], bancaSearch),
    [bancas, bancaSearch],
  )

  const filteredBasicSubjects = useMemo(
    () => filterByName(basicSubjectsList, basicSubjectSearch),
    [basicSubjectsList, basicSubjectSearch],
  )

  const filteredSpecificSubjects = useMemo(
    () => filterByName(specificSubjectsList, specificSubjectSearch),
    [specificSubjectsList, specificSubjectSearch],
  )

  const totalSelectedSubjects = basicSubjects.length + specificSubjects.length
  const canStart = banca !== '' && totalSelectedSubjects > 0

  const bancaLabel = bancas?.find((x) => x.id === banca)?.name ?? ''
  const isBancasLoading = bancas === null
  const isSubjectsLoading = rootSubjects === null

  const toggleBasicSubject = (id: string) => {
    setBasicSubjects((prev) => {
      const exists = prev.find((s) => s.id === id)
      if (exists) return prev.filter((s) => s.id !== id)
      return [...prev, { id, weight: 1 }]
    })
  }

  const toggleSpecificSubject = (id: string) => {
    setSpecificSubjects((prev) => {
      const exists = prev.find((s) => s.id === id)
      if (exists) return prev.filter((s) => s.id !== id)
      return [...prev, { id, weight: 3 }]
    })
  }

  async function handleCreateSimuladoSession(){
    if (profileLoading) return

    if (!profile?.id) {
      toast.error('Faça login para iniciar o estudo.')
      return
    }
    
    const {data, error} = await CreateSimuladoSession(profile.id, questionCount, new Date, banca, difficulty)

    if(error || !data){
      toast.error("Erro ao iniciar o simulado, tente novamente.")
      return
    }

    
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6">

        <div className="flex flex-col gap-2">
          <h1 className="font-heading flex items-center gap-2 text-2xl font-black text-foreground">
            <span className="w-2 self-stretch rounded-sm bg-primary" />
            Monte sua prova! 🎯
          </h1>
        </div>

          <button
          type="button"
          className="flex w-full cursor-pointer items-center gap-3 self-start rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-accent/40 sm:w-auto"
        >
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{
              background: 'linear-gradient(135deg, #3D7FFF, #5A9FFF)',
              boxShadow: '0 4px 14px rgba(61,127,255,0.4)',
            }}
          >
            <Play className="ml-0.5 h-4 w-4 fill-white text-white" />
          </span>
          <span className="flex flex-col gap-1">
            <span className="text-sm font-bold text-foreground">
              Como funciona o Simulador de Prova?
            </span>
            <span className="mt-0.5 text-xs text-muted-foreground">
              Clique aqui e assista o vídeo para entender.
            </span>
            <span className="mt-0.5 text-xs text-muted-foreground">
              2 min
            </span>
          </span>
        </button>

        <div className="flex items-start gap-3 rounded-xl border border-primary/25 bg-primary/8 p-4">
          <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p className="text-sm leading-relaxed text-foreground">
          Configure <strong className="text-primary">banca, dificuldade, matérias</strong> e <strong className="text-primary">quantidade</strong> para um simulado personalizado
        </p>
      </div>

      </div>

      <section className='flex flex-col'>
        <div className="flex items-center gap-2.5 mb-5 mt-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-black text-accent-foreground">
            1
          </span>
          <h3 className="text-sm font-bold text-primary sm:text-base">
            ESCOLHA A QUANTIDADE DE QUESTÕES
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {quantities.map((q) => {
            const active = questionCount === q.value
            return (
              <button
                key={q.value}
                type="button"
                onClick={() => setQuestionCount(q.value)}
                className={`flex flex-col items-center gap-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  active
                    ? 'border-chart-2 bg-chart-2/10'
                    : 'border-border bg-card hover:border-border/80'
                }`}
              >
                <p
                  className={`text-xl font-black ${
                    active ? 'text-chart-2' : 'text-foreground'
                  }`}
                >
                  {q.value}
                </p>
                <p className="text-[10px] text-muted-foreground">{q.label}</p>
              </button>
            )
          })}
        </div>
        </section>

      <section className='flex flex-col gap-3'>
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-black text-accent-foreground">
            2
          </span>
          <h3 className="text-sm font-bold text-primary sm:text-base">
            ESCOLHA A BANCA
          </h3>
        </div>

        <ListSearchInput
          id="simulado-banca-search"
          value={bancaSearch}
          onChange={setBancaSearch}
          placeholder="Buscar banca..."
          disabled={isBancasLoading}
        />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {isBancasLoading ? (
            <p className="text-sm text-muted-foreground col-span-full">
              Carregando bancas…
            </p>
          ) : (bancas?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground col-span-full">
              Nenhuma banca cadastrada.
            </p>
          ) : filteredBancas.length === 0 ? (
            <p className="text-sm text-muted-foreground col-span-full">
              Nenhuma banca encontrada para essa busca.
            </p>
          ) : (
            filteredBancas.map((b, index) => {
              const selected = banca === b.id
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBanca(b.id)}
                  title={b.name}
                  className={`relative flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-all ${
                    selected
                      ? 'border-accent bg-accent/10 shadow-sm'
                      : 'border-border bg-card hover:border-accent/40 hover:bg-accent/5'
                  }`}
                >
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[10px] font-black text-white"
                    style={{ background: bancaAvatarColor(index) }}
                  >
                    {bancaInitials(b.name)}
                  </span>
                  <span
                    className={`min-w-0 flex-1 truncate text-xs font-bold ${
                      selected ? 'text-accent' : 'text-foreground'
                    }`}
                  >
                    {b.name}
                  </span>
                  {selected && (
                    <Check
                      className="h-3.5 w-3.5 shrink-0 text-accent"
                      aria-hidden
                    />
                  )}
                </button>
              )
            })
          )}
        </div>
      </section>

      <section className='flex flex-col gap-3'>

        <div className="flex items-center gap-2.5 mb-5 mt-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-black text-accent-foreground">
            3
          </span>
          <h3 className="text-sm font-bold text-primary sm:text-base">
            ESCOLHA AS MATÉRIAS
          </h3>
        </div>

        <div className="flex flex-col gap-4">
          <p className="flex items-center gap-2 border-l-2 border-accent pl-3 text-[14px] font-black uppercase tracking-widest text-accent">
            CONHECIMENTOS BÁSICOS {'(peso 1.0)'}
          </p>

          {isSubjectsLoading ? (
            <p className="text-xs text-muted-foreground">Carregando matérias...</p>
          ) : basicSubjectsList.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-muted/30 px-3 py-4 text-center text-xs text-muted-foreground">
              Nenhuma matéria básica cadastrada.
            </p>
          ) : filteredBasicSubjects.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-muted/30 px-3 py-4 text-center text-xs text-muted-foreground">
              Nenhuma matéria básica encontrada para essa busca.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {filteredBasicSubjects.map((subject) => {
                const selected = basicSubjects.some((s) => s.id === subject.id)
                return (
                  <button
                    key={subject.id}
                    type="button"
                    onClick={() => toggleBasicSubject(subject.id)}
                    aria-pressed={selected}
                    className={subjectChoiceClass(selected, 'accent')}
                  >
                    <span className="flex-1 leading-tight font-semibold">
                      {subject.name}
                    </span>
                    <span
                      className={subjectCheckMarkerClass(selected, 'accent')}
                      aria-hidden
                    >
                      {selected ? <Check className="h-3 w-3" strokeWidth={3.5} /> : null}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-medium text-accent">
              • Não encontrou a matéria básica?
            </p>
            <div className="relative w-full sm:max-w-[220px] sm:shrink-0">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-accent/70"
                aria-hidden
              />
              <input
                id="simulado-basic-subject-search"
                type="search"
                value={basicSubjectSearch}
                onChange={(e) => setBasicSubjectSearch(e.target.value)}
                disabled={isSubjectsLoading}
                placeholder="Pesquisar..."
                className="w-full rounded-lg border border-accent/40 bg-background py-2.5 pl-10 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent/70 disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <p className="flex items-center gap-2 border-l-2 border-chart-2 pl-3 text-[14px] font-black uppercase tracking-widest text-chart-2">
            CONHECIMENTOS ESPECÍFICOS {'(peso 2.0)'}
          </p>

          {isSubjectsLoading ? (
            <p className="text-xs text-muted-foreground">Carregando matérias...</p>
          ) : specificSubjectsList.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-muted/30 px-3 py-4 text-center text-xs text-muted-foreground">
              Nenhuma matéria específica cadastrada.
            </p>
          ) : filteredSpecificSubjects.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-muted/30 px-3 py-4 text-center text-xs text-muted-foreground">
              Nenhuma matéria específica encontrada para essa busca.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {filteredSpecificSubjects.map((subject) => {
                const selected = specificSubjects.some((s) => s.id === subject.id)
                return (
                  <button
                    key={subject.id}
                    type="button"
                    onClick={() => toggleSpecificSubject(subject.id)}
                    aria-pressed={selected}
                    className={subjectChoiceClass(selected, 'chart-2')}
                  >
                    <span className="flex-1 leading-tight font-semibold">
                      {subject.name}
                    </span>
                    <span
                      className={subjectCheckMarkerClass(selected, 'chart-2')}
                      aria-hidden
                    >
                      {selected ? <Check className="h-3 w-3" strokeWidth={3.5} /> : null}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-medium text-chart-2">
              • Não encontrou a matéria específica?
            </p>
            <div className="relative w-full sm:max-w-[220px] sm:shrink-0">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-chart-2/70"
                aria-hidden
              />
              <input
                id="simulado-specific-subject-search"
                type="search"
                value={specificSubjectSearch}
                onChange={(e) => setSpecificSubjectSearch(e.target.value)}
                disabled={isSubjectsLoading}
                placeholder="Pesquisar..."
                className="w-full rounded-lg border border-chart-2/40 bg-background py-2.5 pl-10 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-chart-2/70 disabled:opacity-50"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-4">
        {canStart && (
          <div className="flex items-center gap-2 p-4 bg-card rounded-xl border border-chart-2/30">
            <CheckSquare className="h-4 w-4 text-chart-2 shrink-0" />
            <p className="text-xs text-muted-foreground">
              Prova configurada:{' '}
              <span className="text-foreground font-bold">
                {questionCount} questões · {bancaLabel} · {difficultyLabel(difficulty)} ·{' '}
                {totalSelectedSubjects} matérias selecionadas
              </span>
            </p>
          </div>
        )}

        <button
          type="button"
          disabled={!canStart}
          onClick={() =>
            onStart({
              banca,
              difficulty,
              basicSubjects,
              specificSubjects,
              questionCount,
            })
          }
          className={`w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all ${
            canStart
              ? 'text-white'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
          style={
            canStart
              ? {
                  background: 'linear-gradient(90deg, #2ECC8A, #0D9488)',
                  boxShadow: '0 6px 20px rgba(46,204,138,0.4)',
                }
              : undefined
          }
        >
          <CheckCircle className="h-5 w-5" />
          Iniciar Simulado
        </button>
      </div>
    </div>
  )
}
