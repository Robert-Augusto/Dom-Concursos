import { BottomNav } from '@/components/layout/BottomNav'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import GridModules from '@/components/shared/GridModules'
import { BookOpen, Clock, Layers, Video } from 'lucide-react'

export default function ModulesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="min-h-screen pb-20 lg:ml-[240px] lg:pb-0">
        <Header />
        <main className="p-6 max-w-[1210px] mx-auto">
          <div className="flex flex-col gap-8">
            <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden mb-6 bg-muted">
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(135deg, #1a0d38, #3a1878)' }}
              />

              <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
                  backgroundSize: '28px 28px',
                }}
              />

              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)',
                }}
              />

              <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1 border border-white/10">
                <BookOpen className="h-3.5 w-3.5 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                  Curso Exclusivo
                </span>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h1
                  className="font-heading font-black text-xl md:text-2xl text-white leading-tight"
                  style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}
                >
                  Direito Constitucional - Fundamentos
                </h1>

                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-xs text-white/70">
                    <Layers className="h-3.5 w-3.5" />
                    3 modulos
                  </span>
                  <span className="flex items-center gap-1 text-xs text-white/70">
                    <Video className="h-3.5 w-3.5" />
                    32 aulas
                  </span>
                  <span className="flex items-center gap-1 text-xs text-white/70">
                    <Clock className="h-3.5 w-3.5" />
                    12h de conteudo
                  </span>
                </div>
              </div>
            </div>

            <GridModules />
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
