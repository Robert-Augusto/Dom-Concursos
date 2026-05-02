'use client'

import { useState } from 'react'
import {
  Check,
  CheckCircle,
  CheckSquare,
  ClipboardList,
  Play,
} from 'lucide-react'

export type SimuladoDifficulty = 'facil' | 'medio' | 'dificil'

export interface SimuladoConfigPayload {
  banca: string
  difficulty: SimuladoDifficulty
  basicSubjects: { id: string; weight: 1 | 2 | 3 }[]
  specificSubjects: { id: string; weight: 1 | 2 | 3 }[]
  questionCount: number
}

export interface SimuladoConfigProps {
  onStart: (config: SimuladoConfigPayload) => void
}

const bancas = [
  { id: 'cespe', label: 'CESPE/CEBRASPE', description: 'Certo ou Errado + Múlt.', initials: 'C', color: '#3D7FFF' },
  { id: 'fcc', label: 'FCC', description: 'Múltipla Escolha A–E', initials: 'F', color: '#8B5CF6' },
  { id: 'vunesp', label: 'VUNESP', description: 'Múlt. Escolha + Contexto', initials: 'V', color: '#2ECC8A' },
  { id: 'ibam', label: 'IBAM', description: 'Múlt. Escolha Regional', initials: 'I', color: '#C9A84C' },
  { id: 'fafipa', label: 'Fund. FAFIPA', description: 'Múlt. Escolha', initials: 'FA', color: '#FF4D6D' },
  { id: 'ibfc', label: 'IBFC', description: 'Múlt. Escolha', initials: 'IB', color: '#0D9488' },
  { id: 'idecan', label: 'IDECAN', description: 'Múlt. Escolha', initials: 'ID', color: '#8B5CF6' },
  { id: 'ibgp', label: 'IBGP', description: 'Múlt. Escolha', initials: 'IG', color: '#FF4D6D' },
  { id: 'access', label: 'ACCESS', description: 'Múlt. Escolha', initials: 'AC', color: '#3D7FFF' },
  { id: 'fgv', label: 'FGV', description: 'Múlt. Escolha Analítica', initials: 'FG', color: '#C9A84C' },
]

const basicSubjectsList = [
  { id: 'portugues', label: 'Português', emoji: '📖' },
  { id: 'matematica', label: 'Matemática', emoji: '📐' },
  { id: 'raciocinio', label: 'Raciocínio Lógico', emoji: '🧩' },
  { id: 'leg-sus', label: 'Legislação do SUS', emoji: '📋' },
  { id: 'leg-municipal', label: 'Legislação Municipal', emoji: '🏛️' },
  { id: 'informatica', label: 'Informática', emoji: '💻' },
  { id: 'atualidades', label: 'Conhecimentos Gerais / Atualidades', emoji: '🌐' },
  { id: 'dir-const', label: 'Dir. Constitucional', emoji: '⚖️' },
  { id: 'dir-adm', label: 'Dir. Administrativo', emoji: '🏛️' },
]

const specificSubjectsList = [
  { id: 'tec-enfermagem', label: 'Técnico em Enfermagem', emoji: '🩺' },
  { id: 'enfermeiro', label: 'Enfermeiro', emoji: '👩‍⚕️' },
  { id: 'assist-adm', label: 'Assistente Administrativo', emoji: '📁' },
  { id: 'psicologo', label: 'Psicólogo', emoji: '🧠' },
  { id: 'assist-social', label: 'Assistente Social', emoji: '🤝' },
  { id: 'dentista', label: 'Cirurgião Dentista', emoji: '🦷' },
  { id: 'medico', label: 'Médico', emoji: '👨‍⚕️' },
  { id: 'farmaceutico', label: 'Farmacêutico', emoji: '💊' },
]

const quantities = [
  { value: 15, label: 'Rápido' },
  { value: 30, label: 'Padrão' },
  { value: 50, label: 'Completo' },
  { value: 75, label: 'Extenso' },
  { value: 90, label: 'Máximo' },
]

const weights = [1, 2, 3] as const

function difficultyLabel(d: SimuladoDifficulty) {
  if (d === 'facil') return 'Fácil'
  if (d === 'medio') return 'Médio'
  return 'Difícil'
}

export default function SimuladoConfig({ onStart }: SimuladoConfigProps) {
  const [banca, setBanca] = useState('')
  const [difficulty, setDifficulty] = useState<SimuladoDifficulty>('medio')
  const [basicSubjects, setBasicSubjects] = useState<{ id: string; weight: 1 | 2 | 3 }[]>(
    [],
  )
  const [specificSubjects, setSpecificSubjects] = useState<
    { id: string; weight: 1 | 2 | 3 }[]
  >([])
  const [questionCount, setQuestionCount] = useState(30)

  const totalSelectedSubjects = basicSubjects.length + specificSubjects.length
  const canStart = banca !== '' && totalSelectedSubjects > 0

  const bancaLabel = bancas.find((x) => x.id === banca)?.label ?? ''

  const toggleBasicSubject = (id: string) => {
    setBasicSubjects((prev) => {
      const exists = prev.find((s) => s.id === id)
      if (exists) return prev.filter((s) => s.id !== id)
      return [...prev, { id, weight: 1 }]
    })
  }

  const updateBasicWeight = (id: string, weight: 1 | 2 | 3) => {
    setBasicSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, weight } : s)),
    )
  }

  const toggleSpecificSubject = (id: string) => {
    setSpecificSubjects((prev) => {
      const exists = prev.find((s) => s.id === id)
      if (exists) return prev.filter((s) => s.id !== id)
      return [...prev, { id, weight: 3 }]
    })
  }

  const updateSpecificWeight = (id: string, weight: 1 | 2 | 3) => {
    setSpecificSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, weight } : s)),
    )
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
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {bancas.map((b) => {
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
                  style={{ background: b.color }}
                >
                  {b.initials}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-foreground">{b.label}</span>
                  <span className="block text-xs text-muted-foreground mt-0.5">
                    {b.description}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-3">
          2. NÍVEL DE DIFICULDADE
        </p>
        <div className="grid grid-cols-3 gap-3">
          {(
            [
              { key: 'facil' as const, emoji: '😊', label: 'Fácil' },
              { key: 'medio' as const, emoji: '😤', label: 'Médio' },
              { key: 'dificil' as const, emoji: '🔥', label: 'Difícil' },
            ] as const
          ).map(({ key, emoji, label }) => {
            const active = difficulty === key
            const labelClass =
              key === 'facil'
                ? active
                  ? 'text-chart-2'
                  : 'text-muted-foreground'
                : key === 'medio'
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
        {basicSubjectsList.map((subject) => {
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
                <span className="text-lg shrink-0">{subject.emoji}</span>
                <span className="text-sm font-semibold text-foreground">{subject.label}</span>
              </span>
              {selected && row && (
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
              )}
            </button>
          )
        })}

        <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary border-l-2 border-primary pl-3 mb-3 mt-6">
          CONHECIMENTOS ESPECÍFICOS
        </p>
        {specificSubjectsList.map((subject) => {
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
                <span className="text-lg shrink-0">{subject.emoji}</span>
                <span className="text-sm font-semibold text-foreground">{subject.label}</span>
              </span>
              {selected && row && (
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
              )}
            </button>
          )
        })}
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
