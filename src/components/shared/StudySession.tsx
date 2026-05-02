'use client'

import { useState } from 'react'
import {
  ArrowLeft,
  BookMarked,
  BookOpen,
  Brain,
  CheckCircle,
  FileText,
  LayoutGrid,
  Layers,
  Zap,
} from 'lucide-react'

export const mockStudyData = {
  theory: {
    main: 'Este tópico exige compreensão conceitual e capacidade de aplicação. Em nível intermediário, as bancas examinadoras (CESPE, FCC, VUNESP, IBAM) cobram não apenas a definição, mas também a interpretação e distinção entre conceitos similares. É fundamental entender o contexto normativo: cada tema está inserido em um ordenamento jurídico ou técnico específico. Leia o resumo duas vezes, preste atenção aos detalhes e compare conceitos.',
    deepDive:
      'As bancas adoram cobrar as exceções e casos específicos. É fundamental entender não apenas a regra geral mas também quando ela não se aplica. Questões de nível médio geralmente apresentam pegadinhas baseadas em exceções à regra geral. Pratique identificando a diferença entre conceitos similares.',
    keyPoint:
      'Bancas examinadoras adoram explorar as exceções e os casos específicos. Após entender a regra geral, sempre pergunte: "Existe alguma exceção a essa regra?" Esse hábito resolve sozinho cerca de 30% das questões de concurso.',
  },
  mindMap: ['Conceito', 'Requisitos', 'Exceções', 'Classificação', 'Efeitos'],
  cycles: [
    {
      id: 'ciclo1',
      label: 'Ciclo 1 — Questões Fáceis',
      sublabel: 'Consolide o básico',
      level: 'FÁCIL',
      color: 'chart-2',
      icon: '🌱',
      questions: [
        {
          id: 'q1',
          text: 'Em concursos públicos, qual é a base para resolver a maioria das questões?',
          options: {
            A: 'Decorar tudo',
            B: 'Entender os conceitos básicos',
            C: 'Fazer exercícios sem estudar',
            D: 'Depende da banca',
          },
          correct: 'B',
        },
        {
          id: 'q2',
          text: 'Qual estratégia de estudo é mais eficaz para iniciantes?',
          options: {
            A: 'Estudar tudo de uma vez',
            B: 'Estudar por tópicos específicos e pequenos',
            C: 'Só ler sem fazer exercícios',
            D: 'Estudar apenas na véspera',
          },
          correct: 'B',
        },
        {
          id: 'q3',
          text: 'O que significa "legislação" em concursos?',
          options: {
            A: 'Só a Constituição Federal',
            B: 'Conjunto de leis e normas jurídicas',
            C: 'Apenas as leis estaduais',
            D: 'Somente decretos presidenciais',
          },
          correct: 'B',
        },
      ],
      flashcard: {
        id: 'fc1',
        question: 'O que é o princípio básico de qualquer concurso público?',
        answer:
          'O princípio da isonomia: todos os candidatos devem ser tratados com igualdade, com critérios objetivos de seleção baseados em mérito e capacidade.',
      },
    },
    {
      id: 'ciclo2',
      label: 'Ciclo 2 — Questões Médias',
      sublabel: 'Aprofunde seu domínio',
      level: 'MÉDIO',
      color: 'accent',
      icon: '📘',
      questions: [
        {
          id: 'q4',
          text: 'Qual característica distingue um ato administrativo vinculado do discricionário?',
          options: {
            A: 'O ato vinculado admite juízo de conveniência',
            B: 'O ato discricionário não tem previsão legal',
            C: 'No vinculado, a lei define todos os elementos do ato',
            D: 'O discricionário é inconstitucional',
          },
          correct: 'C',
        },
        {
          id: 'q5',
          text: 'Segundo a CF/88, os servidores públicos têm direito a:',
          options: {
            A: 'Estabilidade após 1 ano de efetivo exercício',
            B: 'Estabilidade após 3 anos de efetivo exercício',
            C: 'Estabilidade apenas se aprovados em concurso para cargo em comissão',
            D: 'Estabilidade automática na posse',
          },
          correct: 'B',
        },
        {
          id: 'q6',
          text: 'O que é a "supremacia do interesse público" no Direito Administrativo?',
          options: {
            A: 'O Estado pode agir sem qualquer lei que o autorize',
            B: 'O interesse público sempre prevalece sobre o privado, quando em conflito legítimo',
            C: 'Qualquer ato público é válido automaticamente',
            D: 'O interesse privado pode superar o público nas concessões',
          },
          correct: 'B',
        },
      ],
      flashcard: {
        id: 'fc2',
        question:
          'Diferencie os princípios da Legalidade e da Moralidade na Administração Pública.',
        answer:
          'Legalidade: o administrador só pode fazer o que a lei permite. Moralidade: além de legal, o ato deve ser ético e honesto. Um ato pode ser legal mas imoral — ambos são exigidos simultaneamente.',
      },
    },
    {
      id: 'ciclo3',
      label: 'Ciclo 3 — Questões Difíceis',
      sublabel: 'Domine como especialista',
      level: 'DIFÍCIL',
      color: 'destructive',
      icon: '🦅',
      questions: [
        {
          id: 'q7',
          text: 'Segundo a tese firmada pelo STF no RE 655.265 (Repercussão Geral), sobre concurso público:',
          options: {
            A: 'A aprovação gera direito subjetivo à nomeação apenas se dentro do número de vagas previsto',
            B: 'O candidato aprovado fora do número de vagas nunca tem direito à nomeação',
            C: 'A administração tem discricionariedade absoluta para nomear ou não candidatos aprovados',
            D: 'Candidatos aprovados em cadastro reserva têm direito líquido e certo à nomeação imediata',
          },
          correct: 'A',
        },
        {
          id: 'q8',
          text: 'A "corrida às nomeações" (teoria do funil) no Direito Administrativo refere-se a:',
          options: {
            A: 'Processo de seleção de candidatos para cargos de confiança',
            B: 'Prática ilegal de contratar temporários para burlar concurso público',
            C: 'Surgimento de múltiplas vagas ao final do prazo de validade de concurso, obrigando à nomeação',
            D: 'Proibição de abrir novo concurso enquanto houver cadastro reserva válido',
          },
          correct: 'C',
        },
        {
          id: 'q9',
          text: 'No regime disciplinar do servidor público federal (Lei 8.112/90), a cassação de aposentadoria:',
          options: {
            A: 'Não é possível após a aposentadoria do servidor',
            B: 'Pode ser aplicada por infração cometida na atividade, punível com demissão',
            C: 'É pena exclusiva para servidores aposentados por invalidez',
            D: 'Só pode ser aplicada pelo Presidente da República',
          },
          correct: 'B',
        },
      ],
      flashcard: {
        id: 'fc3',
        question:
          'Diferencie as teorias do "Fato Consumado" e dos "Efeitos Prospectivos" (ex nunc) na anulação de atos administrativos.',
        answer:
          'Fato Consumado: situações consolidadas no tempo podem ser mantidas por razões de segurança jurídica, mesmo que o ato seja inválido. Efeitos Prospectivos (ex nunc): a anulação só produz efeitos a partir da decisão, preservando os efeitos passados do ato anulado.',
      },
    },
  ],
} as const

export type StudySessionLevel = 'iniciante' | 'intermediario' | 'avancado'

export interface StudySessionProps {
  subject: string
  level: StudySessionLevel
  onFinish: (answers: Record<string, string>) => void
  onBackToConfig: () => void
}

function levelBadge(level: StudySessionLevel) {
  switch (level) {
    case 'iniciante':
      return '[Ini] INICIANTE'
    case 'intermediario':
      return '[Med] INTERMEDIÁRIO'
    case 'avancado':
      return '[Av] AVANÇADO'
    default:
      return ''
  }
}

function cycleIconBgClass(cycleId: string) {
  if (cycleId === 'ciclo1') return 'bg-chart-2/20'
  if (cycleId === 'ciclo2') return 'bg-accent/20'
  return 'bg-destructive/20'
}

export default function StudySession({
  subject,
  level,
  onFinish,
  onBackToConfig,
}: StudySessionProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [flippedCards, setFlippedCards] = useState<string[]>([])

  const subjectShort =
    subject.length > 20 ? `${subject.slice(0, 20)}…` : subject

  const toggleFlip = (id: string) => {
    setFlippedCards((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const handleBack = () => {
    if (
      typeof window !== 'undefined' &&
      window.confirm('Voltar ao início? O progresso desta sessão será perdido.')
    ) {
      onBackToConfig()
    }
  }

  const mm = mockStudyData.mindMap

  return (
    <div className="flex flex-col min-h-0">
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors min-w-0"
        >
          <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{subjectShort}</span>
        </button>
        <span className="text-border shrink-0">·</span>
        <span className="rounded-full px-2.5 py-1 text-[9px] font-black uppercase bg-accent/20 text-accent border border-accent/30 shrink-0">
          {levelBadge(level)}
        </span>
        <span className="text-xs text-muted-foreground hidden sm:inline truncate">
          Teoria · Mapa · 9 Questões · 3 Flashcards
        </span>
      </div>

      <div className="flex flex-col gap-8 pb-20">
        <div>
          <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground py-2">
            <BookOpen className="h-3.5 w-3.5" />
            ESTUDO TEÓRICO
          </div>
          <div className="bg-card rounded-2xl p-6 border border-border mt-2">
            <p className="text-sm text-foreground leading-relaxed">
              {mockStudyData.theory.main}
            </p>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <BookMarked className="h-4 w-4 text-accent" />
            <span className="text-[10px] font-black uppercase tracking-widest text-accent">
              APROFUNDAMENTO
            </span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            {mockStudyData.theory.deepDive}
          </p>
        </div>

        <div
          className="rounded-2xl p-5 border border-primary/30"
          style={{
            background:
              'linear-gradient(135deg, rgba(201,168,76,0.08), rgba(201,168,76,0.04))',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">
              PONTO-CHAVE PARA CONCURSOS
            </span>
          </div>
          <p className="text-sm text-foreground leading-relaxed italic">
            {mockStudyData.theory.keyPoint}
          </p>
        </div>

        <div>
          <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground py-2">
            <LayoutGrid className="h-3.5 w-3.5" />
            MAPA MENTAL
          </div>
          <div className="relative h-48 bg-card rounded-2xl border border-border overflow-hidden flex items-center justify-center mt-2">
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <line
                x1="50"
                y1="50"
                x2="50"
                y2="14"
                stroke="hsl(var(--border))"
                strokeWidth="0.35"
                opacity={0.6}
              />
              <line
                x1="50"
                y1="50"
                x2="86"
                y2="50"
                stroke="hsl(var(--border))"
                strokeWidth="0.35"
                opacity={0.6}
              />
              <line
                x1="50"
                y1="50"
                x2="50"
                y2="86"
                stroke="hsl(var(--border))"
                strokeWidth="0.35"
                opacity={0.6}
              />
              <line
                x1="50"
                y1="50"
                x2="14"
                y2="50"
                stroke="hsl(var(--border))"
                strokeWidth="0.35"
                opacity={0.6}
              />
              <line
                x1="50"
                y1="50"
                x2="78"
                y2="82"
                stroke="hsl(var(--border))"
                strokeWidth="0.35"
                opacity={0.6}
              />
            </svg>
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-card border border-border rounded-full px-3 py-1.5 text-xs text-muted-foreground z-10 max-w-[40%] truncate">
              {mm[0]}
            </div>
            <div className="absolute top-1/2 right-4 -translate-y-1/2 bg-card border border-border rounded-full px-3 py-1.5 text-xs text-muted-foreground z-10 max-w-[35%] truncate">
              {mm[1]}
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-card border border-border rounded-full px-3 py-1.5 text-xs text-muted-foreground z-10 max-w-[40%] truncate">
              {mm[2]}
            </div>
            <div className="absolute top-1/2 left-4 -translate-y-1/2 bg-card border border-border rounded-full px-3 py-1.5 text-xs text-muted-foreground z-10 max-w-[35%] truncate">
              {mm[3]}
            </div>
            <div className="absolute bottom-4 right-8 bg-card border border-border rounded-full px-3 py-1.5 text-xs text-muted-foreground z-10 max-w-[32%] truncate">
              {mm[4]}
            </div>
            <div className="absolute bg-accent text-accent-foreground rounded-full px-4 py-2 text-xs font-black z-10 max-w-[45%] truncate">
              {subject.length > 24 ? `${subject.slice(0, 24)}…` : subject}
            </div>
          </div>
        </div>

        {mockStudyData.cycles.map((cycle, cycleIndex) => {
          const isFlipped = flippedCards.includes(cycle.flashcard.id)
          return (
            <div key={cycle.id} className="flex flex-col gap-6">
              <div className="flex items-center gap-3 bg-card rounded-2xl p-4 border border-border">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${cycleIconBgClass(cycle.id)}`}
                >
                  <span className="text-2xl">{cycle.icon}</span>
                </div>
                <div className="min-w-0">
                  <p className="font-heading font-black text-sm text-foreground">
                    {cycle.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{cycle.sublabel}</p>
                </div>
              </div>

              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center justify-center gap-2">
                <FileText className="h-3.5 w-3.5" />
                3 QUESTÕES — NÍVEL {cycle.level}
              </div>

              <div className="flex flex-col gap-4">
                {cycle.questions.map((question, qi) => (
                  <div
                    key={question.id}
                    className="bg-card rounded-2xl p-5 border border-border"
                  >
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2">
                      QUESTÃO {qi + 1} DE {cycle.questions.length}
                    </p>
                    <p className="text-sm font-bold text-foreground mb-4 leading-snug">
                      {question.text}
                    </p>
                    <div className="flex flex-col gap-2">
                      {(Object.keys(question.options) as Array<'A' | 'B' | 'C' | 'D'>).map(
                        (key) => {
                          const selected = answers[question.id] === key
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() =>
                                setAnswers((prev) => ({
                                  ...prev,
                                  [question.id]: key,
                                }))
                              }
                              className={`w-full flex items-start gap-3 p-4 rounded-xl border text-sm text-left transition-all ${
                                selected
                                  ? 'border-accent bg-accent/10 text-foreground'
                                  : 'border-border bg-background text-foreground hover:border-border/80'
                              }`}
                            >
                              <span
                                className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0 ${
                                  selected
                                    ? 'bg-accent text-accent-foreground'
                                    : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                {key}
                              </span>
                              <span>{question.options[key]}</span>
                            </button>
                          )
                        },
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground py-2">
                  <Layers className="h-3.5 w-3.5" />
                  FLASHCARD DO CICLO {cycleIndex + 1}
                </div>
                <p className="text-xs text-chart-2 flex items-center justify-center gap-2 mb-3">
                  <span>●</span> Toque no card para revelar <span>●</span>
                </p>
                <div style={{ perspective: '1000px' }}>
                  <button
                    type="button"
                    onClick={() => toggleFlip(cycle.flashcard.id)}
                    className="w-full cursor-pointer text-left bg-transparent border-0 p-0"
                  >
                    <div
                      style={{
                        transition: 'transform 0.6s',
                        transformStyle: 'preserve-3d',
                        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                        position: 'relative',
                        minHeight: '140px',
                      }}
                    >
                      <div
                        style={{ backfaceVisibility: 'hidden' }}
                        className="absolute inset-0 bg-card rounded-2xl border border-border p-8 flex flex-col items-center justify-center gap-3"
                      >
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                          <Brain className="h-3 w-3" />
                          PERGUNTA
                        </span>
                        <p className="text-sm font-bold text-foreground text-center leading-snug max-w-lg">
                          {cycle.flashcard.question}
                        </p>
                        <span className="text-xl">👆</span>
                      </div>
                      <div
                        style={{
                          backfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)',
                          background:
                            'linear-gradient(135deg, rgba(46,204,138,0.08), rgba(46,204,138,0.04))',
                        }}
                        className="absolute inset-0 rounded-2xl border border-chart-2/30 p-8 flex flex-col items-center justify-center gap-3"
                      >
                        <span className="text-[9px] font-black uppercase tracking-widest text-chart-2 flex items-center gap-1.5">
                          <CheckCircle className="h-3 w-3" />
                          RESPOSTA
                        </span>
                        <p className="text-sm text-foreground text-center leading-relaxed max-w-lg">
                          {cycle.flashcard.answer}
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border z-20">
        <button
          type="button"
          onClick={() => {
            onFinish(answers)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          className="w-full max-w-3xl mx-auto py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 text-white transition-all hover:opacity-90"
          style={{
            background: 'linear-gradient(90deg, #3D7FFF, #8B5CF6)',
            boxShadow: '0 6px 20px rgba(61,127,255,0.4)',
          }}
        >
          <CheckCircle className="h-5 w-5" />
          Finalizar e Ver Resultado
        </button>
      </div>
    </div>
  )
}
