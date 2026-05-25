'use client'

import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/layout/BottomNav'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import SimuladoConfig from '@/components/shared/SimuladoConfig'
import SimuladoScore, { type SimuladoState } from '@/components/shared/SimuladoScore'
import SimuladoSession from '@/components/shared/SimuladoSession'

type Step = 'config' | 'session' | 'score'

export default function SimuladoPage() {
  const [step, setStep] = useState<Step>('config')
  const router = useRouter()

  const [simuladoState, setSimuladoState] = useState<SimuladoState>({
    banca: '',
    difficulty: 'medio',
    basicSubjects: [],
    specificSubjects: [],
    questionCount: 30,
    answers: {},
    timeSpent: 0,
  })

  function handleStepBack() {
    if (step === 'session') setStep('config')
    if (step === 'config') router.push('dashboard')
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
                  {step === 'session' && 'Hora de responder!'}
                  {step === 'config' && 'Simulado'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {step === 'session' &&
                    'Leia com atenção e escolha a alternativa correta.'}
                  {step === 'config' && 'Coloque seus conhecimentos em prática...'}
                </p>
              </div>
            </div>
          </header>
        <main className="p-6 max-w-[1210px] mx-auto">
          <div className="max-w-3xl mx-auto flex flex-col gap-6 py-6">
            {step === 'config' && (
              <SimuladoConfig
                onStart={(config) => {
                  {/*setSimuladoState((prev) => ({ ...prev, ...config }))*/}
                  setStep('session')
                }}
              />
            )}
            {step === 'session' && (
              <SimuladoSession
                banca={simuladoState.banca}
                difficulty={simuladoState.difficulty}
                questionCount={simuladoState.questionCount}
                basicSubjects={simuladoState.basicSubjects}
                specificSubjects={simuladoState.specificSubjects}
                onFinish={(answers, timeSpent) => {
                  setSimuladoState((prev) => ({ ...prev, answers, timeSpent }))
                  setStep('score')
                }}
                onBackToConfig={() => {
                  if (
                    window.confirm(
                      'Tem certeza que deseja abandonar o simulado? Seu progresso será perdido.',
                    )
                  ) {
                    setStep('config')
                  }
                }}
              />
            )}
            {step === 'score' && (
              <SimuladoScore
                state={simuladoState}
                onNewExam={() => {
                  setSimuladoState({
                    banca: '',
                    difficulty: 'medio',
                    basicSubjects: [],
                    specificSubjects: [],
                    questionCount: 30,
                    answers: {},
                    timeSpent: 0,
                  })
                  setStep('config')
                }}
              />
            )}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
