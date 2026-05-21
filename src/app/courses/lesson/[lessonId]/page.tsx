'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Bookmark,
  CheckCircle,
  ChevronRight,
  ClipboardList,
  Download,
  FileText,
  LayoutTemplate,
  Map,
  NotebookPen,
  PanelRight,
  PanelRightClose,
  Paperclip,
  Play,
  Save,
  Sparkles,
  X,
} from 'lucide-react'

const mockLessons = [
  {
    id: '1',
    title: 'Tutorial - Como funciona a plataforma',
    duration: '8:32',
    completed: true,
    current: true,
  },
  {
    id: '2',
    title: 'Entre no Grupo de Alunos',
    duration: '2:15',
    completed: false,
    current: false,
  },
  {
    id: '3',
    title: 'Introducao ao Modulo 2',
    duration: '14:20',
    completed: false,
    current: false,
  },
  {
    id: '4',
    title: 'Conceitos Fundamentais',
    duration: '22:10',
    completed: false,
    current: false,
  },
  {
    id: '5',
    title: 'Exercicios Praticos',
    duration: '18:45',
    completed: false,
    current: false,
  },
]

const mockFiles = [
  {
    id: '1',
    name: 'Apostila - Tutorial',
    size: '2,4 MB',
    icon: FileText,
    iconClassName: 'text-red-400',
    bgClassName: 'bg-red-500/20',
  },
  {
    id: '2',
    name: 'Slides - Tutorial',
    size: '1,1 MB',
    icon: LayoutTemplate,
    iconClassName: 'text-blue-400',
    bgClassName: 'bg-blue-500/20',
  },
  {
    id: '3',
    name: 'Questoes da Aula',
    size: '340 KB',
    icon: ClipboardList,
    iconClassName: 'text-primary',
    bgClassName: 'bg-primary/20',
  },
  {
    id: '4',
    name: 'Mapa Mental da Aula',
    size: '890 KB',
    icon: Map,
    iconClassName: 'text-chart-5',
    bgClassName: 'bg-chart-5/20',
  },
]

export default function LessonPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [completed, setCompleted] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('materiais')
  const [notes, setNotes] = useState('')
  const router = useRouter()

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <div className="sticky top-0 z-10 flex w-full items-center justify-between border-b border-border bg-background px-4 py-3 sm:px-6 sm:py-4">
        <button 
            className="flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
            onClick={() => router.push('/courses/xxx')}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao curso
        </button>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all hover:opacity-90 active:scale-95"
          style={{
            background: sidebarOpen
              ? 'linear-gradient(90deg, #3D7FFF, #5A9FFF)'
              : 'linear-gradient(90deg, #C9A84C, #DDA83A)',
            color: '#0B1220',
            boxShadow: sidebarOpen
              ? '0 4px 14px rgba(61,127,255,0.4)'
              : '0 4px 14px rgba(201,168,76,0.4)',
          }}
        >
          {sidebarOpen ? (
            <PanelRightClose className="h-4 w-4" />
          ) : (
            <PanelRight className="h-4 w-4" />
          )}
          Aulas do módulo
        </button>
      </div>

      <div className="relative flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-5 sm:px-6 sm:py-6">
          <h1 className="font-heading text-xl font-semibold leading-tight text-foreground sm:text-2xl lg:text-3xl">
            Tutorial - Como funciona a plataforma
          </h1>

          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            Nesta aula voce vai entender como navegar pela plataforma, acessar
            seus cursos, materiais e acompanhar seu progresso de forma simples e
            eficiente.
          </p>

          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black">
            <iframe
              src="https://www.youtube.com/embed/XOb44bsZwSo"
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Tutorial - Como funciona a plataforma"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setCompleted(!completed)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all sm:px-5 sm:py-2.5 sm:text-sm ${
                completed
                  ? 'border border-chart-2 bg-chart-2 text-white'
                  : 'border border-chart-2/40 bg-chart-2/10 text-chart-2 hover:bg-chart-2/20'
              }`}
            >
              <CheckCircle className="h-4 w-4" />
              Marcar como Concluida
            </button>

            <button
              onClick={() => setSaved(!saved)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all sm:px-5 sm:py-2.5 sm:text-sm ${
                saved
                  ? 'border border-primary/50 bg-primary/10 text-primary'
                  : 'border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
              }`}
            >
              <Bookmark
                className="h-4 w-4"
                fill={saved ? 'currentColor' : 'none'}
              />
              Salvar para Revisao
            </button>
          </div>

          <div>
            <div className="flex items-center gap-0 border-b border-border">
              <button
                onClick={() => setActiveTab('materiais')}
                className={`relative flex items-center gap-2 border-b-2 px-3 py-3 text-xs font-semibold transition-colors sm:px-4 sm:text-sm ${
                  activeTab === 'materiais'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Paperclip className="h-4 w-4" />
                Materiais
              </button>

              <button
                onClick={() => setActiveTab('anotacoes')}
                className={`relative flex items-center gap-2 border-b-2 px-3 py-3 text-xs font-semibold transition-colors sm:px-4 sm:text-sm ${
                  activeTab === 'anotacoes'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <NotebookPen className="h-4 w-4" />
                Anotacoes
              </button>

              <button
                onClick={() => setActiveTab('resumo')}
                className={`relative flex items-center gap-2 border-b-2 px-3 py-3 text-xs font-semibold transition-colors sm:px-4 sm:text-sm ${
                  activeTab === 'resumo'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Sparkles className="h-4 w-4" />
                Resumo
                <span className="ml-1 rounded-full bg-primary/20 px-1.5 py-0.5 text-[8px] font-black text-primary">
                  IA
                </span>
              </button>
            </div>

            <div className="pt-4">
              {activeTab === 'materiais' && (
                <div className="flex flex-col gap-2">
                  <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Arquivos desta aula
                  </p>

                  {mockFiles.map((file) => {
                    const Icon = file.icon
                    return (
                      <div
                        key={file.id}
                        className="group flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-border/80"
                      >
                        <div
                          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${file.bgClassName}`}
                        >
                          <Icon className={`h-5 w-5 ${file.iconClassName}`} />
                        </div>

                        <div className="flex-1">
                          <p className="text-sm font-semibold text-foreground">
                            {file.name}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">
                            {file.size}
                          </span>
                          <Download className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {activeTab === 'anotacoes' && (
                <div className="flex flex-col gap-3">
                  <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Minhas anotacoes
                  </p>

                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    className="min-h-[200px] w-full resize-none rounded-xl border border-border bg-card p-4 text-sm text-foreground leading-relaxed outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50"
                    placeholder="Escreva suas anotacoes sobre esta aula..."
                  />

                  <p className="text-right text-[10px] text-muted-foreground">
                    {notes.length} caracteres
                  </p>

                  <button className="self-end rounded-xl bg-accent px-4 py-2 text-sm font-bold text-accent-foreground transition-opacity hover:opacity-90">
                    <span className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Salvar anotacao
                    </span>
                  </button>
                </div>
              )}

              {activeTab === 'resumo' && (
                <div className="flex flex-col items-center gap-4 py-8 text-center">
                  <div
                    className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
                    style={{
                      background: 'linear-gradient(135deg, #C9A84C, #DDA83A)',
                    }}
                  >
                    <Sparkles className="h-8 w-8 text-primary-foreground" />
                  </div>

                  <h3 className="font-heading text-base font-black text-foreground">
                    Resumo com IA
                  </h3>
                  <p className="max-w-xs text-sm text-muted-foreground">
                    Gere um resumo inteligente desta aula em segundos.
                  </p>

                  <button
                    className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-black text-primary-foreground transition-opacity hover:opacity-90"
                    style={{
                      background: 'linear-gradient(90deg, #C9A84C, #DDA83A)',
                      boxShadow: '0 4px 14px rgba(201,168,76,0.35)',
                    }}
                  >
                    <Sparkles className="h-4 w-4" />
                    Gerar resumo
                  </button>

                  <p className="text-xs text-muted-foreground">
                    Funcionalidade em breve disponivel
                  </p>
                </div>
              )}
            </div>
          </div>
          </div>
        </div>

        <div
          className={`absolute right-0 top-0 z-20 h-full border-l border-sidebar-border bg-popover text-popover-foreground ring-1 ring-inset ring-sidebar-border/40 transition-all duration-300 lg:relative lg:z-auto lg:flex-shrink-0 lg:overflow-y-auto ${
            sidebarOpen
              ? 'w-80 overflow-y-auto'
              : 'w-0 overflow-hidden border-l-0 ring-0 lg:border-l lg:border-sidebar-border lg:ring-1'
          }`}
        >
          <div className="flex h-full flex-col overflow-hidden">
          <div className="flex min-h-0 flex-1 flex-col px-2 pb-3 pt-2">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-muted/35">
            <div className="flex flex-shrink-0 items-center justify-between gap-2 border-b border-border/60 px-3 py-2.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Aulas do modulo
              </p>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                aria-label="Fechar lista de aulas"
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-border/80 hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
            {mockLessons.map((lesson, index) => (
              <div
                key={lesson.id}
                className={`flex cursor-pointer items-center gap-3 border-b border-border/60 px-3 py-3 transition-colors last:border-b-0 ${
                  lesson.current
                    ? 'border-l-2 border-primary bg-primary/10'
                    : 'hover:bg-muted/50'
                }`}
              >
                <span
                  className={`w-5 flex-shrink-0 text-center text-xs font-bold ${
                    lesson.current ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {index + 1}
                </span>

                <div
                  className="relative flex h-12 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted"
                  style={{
                    background:
                      index % 2 === 0
                        ? 'linear-gradient(135deg, #1a0a2e, #3d1a7a)'
                        : 'linear-gradient(135deg, #0a1e2e, #1a3d6e)',
                  }}
                >
                  <Play className="h-4 w-4 text-white/70" />
                  <span className="absolute bottom-1 left-1 rounded bg-black/80 px-1 text-[9px] text-white">
                    {lesson.duration}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-xs font-semibold leading-snug text-foreground">
                    {lesson.title}
                  </p>

                  {lesson.completed && (
                    <div className="mt-0.5 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-chart-2" />
                      <span className="text-[10px] text-chart-2">Concluida</span>
                    </div>
                  )}

                  {lesson.current && (
                    <span className="text-[10px] font-bold text-primary">
                      Assistindo
                    </span>
                  )}
                </div>

                <ChevronRight
                  className={`h-4 w-4 ${
                    lesson.current ? 'text-primary' : 'text-muted-foreground'
                  }`}
                />
              </div>
            ))}
            </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}
