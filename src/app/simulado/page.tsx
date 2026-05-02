'use client'

import { useState } from 'react'
import { BottomNav } from '@/components/layout/BottomNav'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import SimuladoConfig from '@/components/shared/SimuladoConfig'
import SimuladoScore, { type SimuladoState } from '@/components/shared/SimuladoScore'
import SimuladoSession from '@/components/shared/SimuladoSession'

type SimuladoStep = 'config' | 'session' | 'score'

export default function SimuladoPage() {
  const [step, setStep] = useState<SimuladoStep>('config')
  const [simuladoState, setSimuladoState] = useState<SimuladoState>({
    banca: '',
    difficulty: 'medio',
    basicSubjects: [],
    specificSubjects: [],
    questionCount: 30,
    answers: {},
    timeSpent: 0,
  })

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="min-h-screen pb-20 lg:ml-[240px] lg:pb-0">
        <Header />
        <main className="p-6 max-w-[1210px] mx-auto">
          <div className="max-w-3xl mx-auto flex flex-col gap-6 py-6">
            {step === 'config' && (
              <SimuladoConfig
                onStart={(config) => {
                  setSimuladoState((prev) => ({ ...prev, ...config }))
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
