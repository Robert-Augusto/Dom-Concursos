'use client'

import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/layout/BottomNav'
import { Sidebar } from '@/components/layout/Sidebar'
import { ModalSimuladoExit } from '@/components/shared/ModalSimuladoExit'
import SimuladoConfig from '@/components/shared/SimuladoConfig'
import SimuladoScore from '@/components/shared/SimuladoScore'
import SimuladoSession from '@/components/shared/SimuladoSession'
import { UpdateSimuladoSession } from '@/lib/lib-simulado-session'
import { toast } from 'sonner'
import type { Questions } from '@/types'

type Step = 'config' | 'session' | 'score'

export type SimuladoPayload = {
  simuladoId: string
  questionsData: Questions[]
}

export default function SimuladoPage() {
  const [step, setStep] = useState<Step>('config')
  const router = useRouter()
  const [questions, setQuestions] = useState<Questions[]>([])
  const [simuladoId, setSimuladoId] = useState('')
  const [isExitModalOpen, setIsExitModalOpen] = useState(false)

  function handleStepBack() {
    if (step === 'session') {
      setIsExitModalOpen(true)
      return
    }
    if (step === 'config') router.push('/dashboard')
  }

  async function handleConfirmExitSession() {
    if (!simuladoId) return

    const { error } = await UpdateSimuladoSession(simuladoId, new Date())

    if (error) {
      toast.error('Não foi possível finalizar o simulado. Tente novamente.')
      return
    }
    
    setIsExitModalOpen(false)
    setQuestions([])
    setSimuladoId('')
    setStep('config')
  }

  function handleStart(payload: SimuladoPayload) {
    setQuestions(payload.questionsData)
    setSimuladoId(payload.simuladoId)
    setStep('session')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleFinish() {
    if (!simuladoId) return

    const { error } = await UpdateSimuladoSession(simuladoId, new Date())
    if (error) {
      toast.error('Não foi possível finalizar o simulado. Tente novamente.')
      return
    }

    setStep('score')
  }

  function handleRestart() {
    setQuestions([])
    setSimuladoId('')
    setStep('config')
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="min-h-screen pb-20 lg:ml-[240px] lg:pb-0">

        {step !== 'score' && (<header className="sticky top-0 z-30 border-b border-border bg-background mb-3">
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
                {step === 'config' && 'Simulado'}
                {step === 'session' && 'Hora de responder!'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {step === 'config' && 'Coloque seus conhecimentos em prática...'}
                {step === 'session' &&
                  'Leia com atenção e escolha a alternativa correta.'}
              </p>
            </div>
          </div>
        </header>)}


        <main className="p-6 max-w-[1210px] mx-auto">
          <div className="max-w-3xl mx-auto flex flex-col gap-6">
            {step === 'config' && <SimuladoConfig onStart={handleStart} />}
            {step === 'session' && (
              <SimuladoSession
                questions_data={questions}
                simulado_id={simuladoId}
                onFinish={handleFinish}
              />
            )}
            {step === 'score' && (
              <SimuladoScore
                simuladoSessionId={simuladoId}
                onRestart={handleRestart}
              />
            )}
          </div>
        </main>
      </div>
      {step !== 'session' &&(<BottomNav />)}

      <ModalSimuladoExit
        open={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirm={handleConfirmExitSession}
      />
    </div>
  )
}
