'use client'

import { useState } from 'react'
import { Lightbulb, Play, Rocket, Target } from 'lucide-react'

export type StudyLevel = 'iniciante' | 'intermediario' | 'avancado'

export interface StudyConfigProps {
  onStart: (subject: string, level: StudyLevel) => void
}

const suggestions = [
  'Art. 5° CF/88',
  'Lei 14.133',
  'Concordância Verbal',
  'Juros Compostos',
  'Princípios do SUS',
  'Excel para Concursos',
  'Atos Adm.',
  'Uso do Hífen',
]

export default function StudyConfig({ onStart }: StudyConfigProps) {
  const [subject, setSubject] = useState('')
  const [level, setLevel] = useState<StudyLevel>('intermediario')

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading font-black text-2xl text-foreground flex items-center gap-2">
        <Target className="h-6 w-6 text-primary shrink-0" />
        Estudo por Assunto
      </h1>

      <button
        type="button"
        className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 cursor-pointer hover:border-accent/40 transition-colors self-start text-left w-full sm:w-auto"
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
            Como funciona o Estudo Inteligente?
          </span>
          <span className="text-xs text-muted-foreground mt-0.5">
            Assista ao vídeo explicativo · 2 min
          </span>
        </span>
      </button>

      <div className="flex items-start gap-3 bg-primary/8 border border-primary/25 rounded-xl p-4">
        <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-foreground leading-relaxed">
          Estude{' '}
          <strong className="text-primary">um assunto específico por vez</strong>
          . Exemplo: ao invés de &quot;Português&quot;, escolha{' '}
          <strong className="text-accent">&quot;Concordância Verbal&quot;</strong>
          {' ou '}
          <strong className="text-accent">&quot;Uso do Hífen&quot;</strong>
          . Quanto mais específico, mais profundo e eficaz será o seu aprendizado!
        </p>
      </div>

      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
          NÍVEL DE EXPLICAÇÃO
        </p>
        <div className="grid grid-cols-3 gap-3">
          {(
            [
              { key: 'iniciante' as const, emoji: '🌱', label: 'Iniciante' },
              { key: 'intermediario' as const, emoji: '📘', label: 'Intermediário' },
              { key: 'avancado' as const, emoji: '🦅', label: 'Avançado' },
            ] as const
          ).map(({ key, emoji, label }) => {
            const active = level === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => setLevel(key)}
                className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  active
                    ? 'border-accent bg-accent/10'
                    : 'border-border bg-card hover:border-border/80'
                }`}
              >
                <span className="text-3xl">{emoji}</span>
                <span
                  className={`text-sm font-bold ${
                    active ? 'text-accent' : 'text-muted-foreground'
                  }`}
                >
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <p className="text-sm font-bold text-foreground mb-2">
          Qual assunto você quer dominar hoje?
        </p>
        <input
          type="text"
          className="w-full bg-card border border-border rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors"
          placeholder="Ex: Concordância Verbal, Juros Compostos, Art. 5° CF/88..."
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <div className="flex flex-wrap gap-2 mt-3">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setSubject(suggestion)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-card border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={subject.trim() === ''}
        onClick={() => onStart(subject, level)}
        className={`w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all ${
          subject.trim() === ''
            ? 'bg-muted text-muted-foreground cursor-not-allowed'
            : 'text-white hover:opacity-95'
        }`}
        style={
          subject.trim() === ''
            ? undefined
            : {
                background: 'linear-gradient(90deg, #3D7FFF, #5A9FFF)',
                boxShadow: '0 6px 20px rgba(61,127,255,0.4)',
              }
        }
      >
        <Rocket className="h-5 w-5 shrink-0" />
        Iniciar Estudo Focado
      </button>
    </div>
  )
}
