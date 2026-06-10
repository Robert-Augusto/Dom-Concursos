'use client'

import Link from 'next/link'
import { Mail, MessageCircle, Phone, ChevronLeft } from 'lucide-react'
import { BottomNav } from '@/components/layout/BottomNav'
import { Sidebar } from '@/components/layout/Sidebar'
import { FaqAccordion } from '@/components/shared/FaqAccordion'
import { useRouter } from 'next/navigation'

export default function DoubtsPage() {
  const router = useRouter()

  function handleStepBack(){
    router.push('/dashboard')
  }


  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="min-h-screen pb-20 lg:ml-[240px] lg:pb-0">
        
      <header className="sticky top-0 z-30 border-b border-border bg-background mb-3">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <button
              type="button"
              onClick={handleStepBack}
              className="flex h-12 min-w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-sidebar-accent text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="font-heading truncate text-base font-bold text-foreground">
                Perguntas Frequentes
              </h1>
              <p className="text-sm text-muted-foreground">
                Tire suas dúvidas aqui ou entre em contato no suporte.
              </p>
            </div>
          </div>
        </header>

        <main className="p-6 max-w-[1210px] mx-auto">
          <div className="flex flex-col gap-6 max-w-2xl mx-auto">
            <div className="bg-card rounded-2xl p-5 border border-border">
              <h2 className="font-heading font-bold text-lg text-foreground">
                Tire suas dúvidas em segundos
              </h2>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Veja as perguntas mais comuns abaixo. Se não encontrar sua resposta, fale com nosso
                suporte humano pelo WhatsApp.
              </p>
            </div>

            <FaqAccordion />

            <div
              className="rounded-2xl overflow-hidden border border-chart-2/30"
              style={{ background: 'linear-gradient(135deg, #0d3020, #1a5a38)' }}
            >
              <div className="p-5 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-chart-2/20 border border-chart-2/30">
                    <MessageCircle className="h-6 w-6 text-chart-2" />
                  </div>

                  <div>
                    <p className="text-sm font-black text-foreground">Não encontrou sua resposta?</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Fale com um humano agora mesmo
                    </p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  Nossa equipe de suporte está disponível. Resposta em até 5
                  minutos no horário de atendimento.
                </p>

                <Link
                  href="https://wa.me/5511971509703"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-sm text-white transition-opacity hover:opacity-90 bg-[#25D366]"
                >
                  <Phone className="h-4 w-4" />
                  Falar no WhatsApp
                </Link>
              </div>

              <div className="flex flex-col items-center gap-1 py-3 border-t border-chart-2/20">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  Coordenação: (11) 97150-9703
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  domconcursoss@gmail.com
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
