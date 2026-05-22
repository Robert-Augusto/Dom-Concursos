'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Check,
  CheckCircle,
  CheckSquare,
  ClipboardList,
  Play,
  Search,
} from 'lucide-react'
import { GetBancas } from '@/lib/lib-banca'
import { GetRootSubjects } from '@/lib/lib-subjects'
import type { Banca, Subjects, QuestionsDifficulty } from '@/types'
import { toast } from 'sonner'
import { CreateSimuladoSession } from '@/lib/lib-simulado-session'
import { useProfile } from '@/context/ProfileContext'

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
  { value: 15, label: 'Rápido' },
  { value: 30, label: 'Padrão' },
  { value: 50, label: 'Completo' },
  { value: 75, label: 'Extenso' },
  { value: 90, label: 'Máximo' },
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
      <div>
        <h1 className="flex items-center gap-2 font-heading font-black text-2xl text-foreground">
          <ClipboardList className="h-6 w-6 text-primary shrink-0" />
          Monte sua prova
        </h1>

        <button
          type="button"
          className="mt-4 flex items-center gap-3 bg-card border border-border rounded-xl p-4 cursor-pointer hover:border-accent/40 transition-colors self-start text-left w-full sm:w-auto"
        >
          <span
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #3D7FFF, #5A9FFF)',
              boxShadow: '0 4px 14px rgba(61,127,255,0.4)',
            }}
          >
            <Play className="h-4 w-4 text-white fill-white ml-0.5" />
          </span>
          <span className="flex flex-col">
            <span className="text-sm font-bold text-foreground">
              Como funciona o Simulador de Prova?
            </span>
            <span className="text-xs text-muted-foreground mt-0.5">2 min</span>
          </span>
        </button>

        <p className="text-sm text-muted-foreground mt-4">
          Configure banca, dificuldade, matérias e quantidade para um simulado
          personalizado.
        </p>
      </div>

      <section>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-3">
          1. ESTILO DE BANCA
        </p>
        <ListSearchInput
          id="simulado-banca-search"
          value={bancaSearch}
          onChange={setBancaSearch}
          placeholder="Buscar banca..."
          disabled={isBancasLoading}
        />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all text-left ${
                    selected
                      ? 'border-accent bg-accent/10'
                      : 'border-border bg-card hover:border-border/80'
                  }`}
                >
                  <span
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                    style={{ background: bancaAvatarColor(index) }}
                  >
                    {bancaInitials(b.name)}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-foreground">
                      {b.name}
                    </span>
                  </span>
                </button>
              )
            })
          )}
        </div>
      </section>

      <section>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-3">
          2. NÍVEL DE DIFICULDADE
        </p>
        <div className="grid grid-cols-3 gap-3">
          {(
            [
              { key: 'Fácil' as const, emoji: '😊', label: 'Fácil' },
              { key: 'Médio' as const, emoji: '😤', label: 'Médio' },
              { key: 'Difícil' as const, emoji: '🔥', label: 'Difícil' },
            ] as const
          ).map(({ key, emoji, label }) => {
            const active = difficulty === key
            const labelClass =
              key === 'Fácil'
                ? active
                  ? 'text-chart-2'
                  : 'text-muted-foreground'
                : key === 'Médio'
                  ? active
                    ? 'text-primary'
                    : 'text-muted-foreground'
                  : active
                    ? 'text-destructive'
                    : 'text-muted-foreground'
            return (
              <button
                key={key}
                type="button"
                onClick={() => setDifficulty(key)}
                className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  active
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card hover:border-border/80'
                }`}
              >
                <span className="text-3xl">{emoji}</span>
                <span className={`text-sm font-bold ${labelClass}`}>{label}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-1">
          3. MATÉRIAS E PESO
        </p>
        <p className="text-xs text-muted-foreground mb-3">
          Peso: <span className="text-foreground font-bold">1x</span> normal ·{' '}
          <span className="text-foreground font-bold">2x</span> dobro ·{' '}
          <span className="text-foreground font-bold">3x</span> triplo. Matérias específicas
          sempre têm peso maior.
        </p>

        <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent border-l-2 border-accent pl-3 mb-3">
          CONHECIMENTOS BÁSICOS
        </p>
        <ListSearchInput
          id="simulado-basic-subject-search"
          value={basicSubjectSearch}
          onChange={setBasicSubjectSearch}
          placeholder="Buscar matéria básica..."
          disabled={isSubjectsLoading}
        />
        {isSubjectsLoading ? (
          <p className="text-sm text-muted-foreground mb-2">Carregando matérias…</p>
        ) : basicSubjectsList.length === 0 ? (
          <p className="text-sm text-muted-foreground mb-2">
            Nenhuma matéria básica cadastrada.
          </p>
        ) : filteredBasicSubjects.length === 0 ? (
          <p className="text-sm text-muted-foreground mb-2">
            Nenhuma matéria básica encontrada para essa busca.
          </p>
        ) : (
          filteredBasicSubjects.map((subject) => {
          const row = basicSubjects.find((s) => s.id === subject.id)
          const selected = !!row
          return (
            <button
              key={subject.id}
              type="button"
              onClick={() => toggleBasicSubject(subject.id)}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border mb-2 cursor-pointer transition-colors text-left ${
                selected
                  ? 'border-chart-2/50 bg-chart-2/5'
                  : 'border-border bg-card hover:border-border/80'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  selected ? 'border-chart-2 bg-chart-2' : 'border-border bg-transparent'
                }`}
              >
                {selected && <Check className="h-3 w-3 text-white" />}
              </span>
              <span className="flex-1 flex items-center gap-2 min-w-0">
                <span className="text-sm font-semibold text-foreground">{subject.name}</span>
              </span>
              {/*{selected && row && (
                <span
                  className="flex items-center gap-1 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  {weights.map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        updateBasicWeight(subject.id, w)
                      }}
                      className={`w-8 h-8 rounded-lg text-xs font-black transition-colors text-center ${
                        row.weight === w
                          ? 'bg-chart-2 text-white'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {w}x
                    </button>
                  ))}
                </span>
              )}*/}
            </button>
          )
        })
        )}

        <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary border-l-2 border-primary pl-3 mb-3 mt-6">
          CONHECIMENTOS ESPECÍFICOS
        </p>
        <ListSearchInput
          id="simulado-specific-subject-search"
          value={specificSubjectSearch}
          onChange={setSpecificSubjectSearch}
          placeholder="Buscar matéria específica..."
          disabled={isSubjectsLoading}
        />
        {isSubjectsLoading ? (
          <p className="text-sm text-muted-foreground mb-2">Carregando matérias…</p>
        ) : specificSubjectsList.length === 0 ? (
          <p className="text-sm text-muted-foreground mb-2">
            Nenhuma matéria específica cadastrada.
          </p>
        ) : filteredSpecificSubjects.length === 0 ? (
          <p className="text-sm text-muted-foreground mb-2">
            Nenhuma matéria específica encontrada para essa busca.
          </p>
        ) : (
          filteredSpecificSubjects.map((subject) => {
          const row = specificSubjects.find((s) => s.id === subject.id)
          const selected = !!row
          return (
            <button
              key={subject.id}
              type="button"
              onClick={() => toggleSpecificSubject(subject.id)}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border mb-2 cursor-pointer transition-colors text-left ${
                selected
                  ? 'border-primary/50 bg-primary/5'
                  : 'border-border bg-card hover:border-border/80'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  selected ? 'border-primary bg-primary' : 'border-border bg-transparent'
                }`}
              >
                {selected && <Check className="h-3 w-3 text-white" />}
              </span>
              <span className="flex-1 flex items-center gap-2 min-w-0">
                <span className="text-sm font-semibold text-foreground">{subject.name}</span>
              </span>
              {/*{selected && row && (
                <span
                  className="flex items-center gap-1 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  {weights.map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        updateSpecificWeight(subject.id, w)
                      }}
                      className={`w-8 h-8 rounded-lg text-xs font-black transition-colors text-center ${
                        row.weight === w
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {w}x
                    </button>
                  ))}
                </span>
              )}*/}
            </button>
          )
        })
        )}
      </section>

      <section>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-3">
          4. QUANTIDADE DE QUESTÕES
        </p>
        <div className="grid grid-cols-5 gap-2">
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
