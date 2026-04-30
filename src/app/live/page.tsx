import { BottomNav } from '@/components/layout/BottomNav'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { CalendarDays, Clock, User, Users, Video } from 'lucide-react'

const nextLive = {
  title: '[LIVE] Direito Constitucional — Revisão Completa para Concursos 2025',
  date: 'Quinta-feira, 8 de Mai, 19:00 – 21:00 (GMT-3)',
  daysRemaining: 3,
  professor: 'Prof. João Lima',
  attendees: 47,
  type: 'Aula Virtual',
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="min-h-screen pb-20 lg:ml-[240px] lg:pb-0">
        <Header />
        <main className="p-6 max-w-[1210px] mx-auto">
          <div className="flex flex-col gap-8 max-w-xl mx-auto">
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-heading font-semibold text-lg text-foreground">
                    Próxima Aula ao Vivo
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Prepare-se para a próxima transmissão
                  </p>
                </div>
              </div>

              <div className="bg-card rounded-2xl overflow-hidden border border-border max-w-xl w-full flex flex-col">
                <div className="relative w-full aspect-video overflow-hidden bg-muted">
                  <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(135deg, #1a0d38, #0d3020)' }}
                  />
                  <div
                    className="absolute inset-0 flex items-center justify-center font-heading font-bold text-2xl text-white tracking-tight"
                    style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}
                  >
                    PRÓXIMA AULA AO VIVO
                  </div>
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-destructive text-destructive-foreground rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    Ao Vivo em Breve
                  </div>
                </div>

                <div className="p-5 flex flex-col gap-4">
                  <h2 className="font-heading font-bold text-lg text-foreground leading-snug">
                    {nextLive.title}
                  </h2>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4 flex-shrink-0" />
                    <span>{nextLive.date}</span>
                  </div>

                  <div className="flex items-center flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-chart-2/15 text-chart-2 border border-chart-2/30 text-xs font-bold">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Começa em {nextLive.daysRemaining} dias</span>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-xs text-muted-foreground">
                      <Video className="h-3.5 w-3.5" />
                      <span>{nextLive.type}</span>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-xs text-muted-foreground">
                      <User className="h-3.5 w-3.5" />
                      <span>{nextLive.professor}</span>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-xs text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      <span>{nextLive.attendees} confirmados</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
