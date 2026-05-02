'use client'

import { useEffect, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Search,
  Lightbulb,
  ClipboardCheck,
  CalendarDays,
  MessageCircle,
  Trophy,
  X,
} from 'lucide-react'
import { BottomNav } from '@/components/layout/BottomNav'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'

interface Tutorial {
  id: string
  title: string
  description: string
  duration: string
  videoId: string
  iconBg: string
  Icon: LucideIcon
}

const tutorials: Tutorial[] = [
  {
    id: '1',
    title: 'Pesquisar aulas e questões',
    description: 'Como usar a barra de busca da home',
    duration: '2:14',
    videoId: 'dQw4w9WgXcQ',
    iconBg: 'linear-gradient(135deg, #3D7FFF, #5A9FFF)',
    Icon: Search,
  },
  {
    id: '2',
    title: 'Estudo Inteligente com IA',
    description: 'Resumos, mapas mentais e quizzes',
    duration: '3:48',
    videoId: 'dQw4w9WgXcQ',
    iconBg: 'linear-gradient(135deg, #2ECC8A, #0D9488)',
    Icon: Lightbulb,
  },
  {
    id: '3',
    title: 'Simulador de Provas',
    description: 'Crie e treine simulados completos',
    duration: '4:22',
    videoId: 'dQw4w9WgXcQ',
    iconBg: 'linear-gradient(135deg, #FF4D6D, #C9A84C)',
    Icon: ClipboardCheck,
  },
  {
    id: '4',
    title: 'Cronograma de Estudos',
    description: 'Monte seu plano semanal',
    duration: '2:55',
    videoId: 'dQw4w9WgXcQ',
    iconBg: 'linear-gradient(135deg, #8B5CF6, #3D7FFF)',
    Icon: CalendarDays,
  },
  {
    id: '5',
    title: 'Comunidade e Chat ao Vivo',
    description: 'Participe e converse com colegas',
    duration: '3:10',
    videoId: 'dQw4w9WgXcQ',
    iconBg: 'linear-gradient(135deg, #C9A84C, #DDA83A)',
    Icon: MessageCircle,
  },
  {
    id: '6',
    title: 'Cantinho do Aprovado',
    description: 'Compartilhe sua aprovação e ganhe um presente',
    duration: '2:30',
    videoId: 'dQw4w9WgXcQ',
    iconBg: 'linear-gradient(135deg, #C9A84C, #FF4D6D)',
    Icon: Trophy,
  },
]

export default function TutorialPage() {
  const [activeVideo, setActiveVideo] = useState<Tutorial | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    setActiveVideo(tutorials[0])
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="min-h-screen pb-20 lg:ml-[240px] lg:pb-0">
        <Header />
        <main className="p-6 max-w-[1210px] mx-auto">
          <div className="flex flex-col gap-6 max-w-3xl mx-auto">
            {/* 1. WELCOME BANNER */}
            <div className="relative bg-card rounded-2xl p-5 border border-border">
              <button
                type="button"
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 cursor-pointer transition-colors"
                aria-label="Fechar"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
              <h2 className="font-heading font-black text-lg text-foreground flex items-center gap-2 pr-10">
                Bem-vindo(a) à DOM! 👋
              </h2>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Assista aos tutoriais abaixo e aprenda a usar cada ferramenta da
                plataforma em poucos minutos. Você pode voltar aqui sempre que
                precisar.
              </p>
            </div>

            {/* 2. VIDEO PLAYER AREA */}
            {activeVideo && (
              <div className="bg-black rounded-2xl overflow-hidden border border-border relative">
                <div className="relative w-full aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${activeVideo.videoId}?autoplay=1`}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={activeVideo.title}
                  />
                </div>
              </div>
            )}

            {/* 3. TUTORIALS LIST */}
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                TUTORIAIS POR FERRAMENTA
              </p>
              {tutorials.map((tutorial) => (
                <div
                  key={tutorial.id}
                  onClick={() => setActiveVideo(tutorial)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all hover:border-border/80 hover:bg-muted/20 ${
                    activeVideo?.id === tutorial.id
                      ? 'border-primary/40 bg-primary/5'
                      : 'border-border bg-card'
                  }`}
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: tutorial.iconBg }}
                  >
                    <tutorial.Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-foreground leading-snug">
                      {tutorial.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {tutorial.description}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground flex-shrink-0">
                    {tutorial.duration}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
