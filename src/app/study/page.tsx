'use client'

import { useState } from 'react'
import { BottomNav } from '@/components/layout/BottomNav'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import StudyConfig from '@/components/shared/StudyConfig'
import StudyScore from '@/components/shared/StudyScore'
import StudySession from '@/components/shared/StudySession'

type Step = 'config' | 'session' | 'score'

interface StudyState {
  subject: string
  level: 'iniciante' | 'intermediario' | 'avancado'
  answers: Record<string, string>
}

export default function StudyPage() {
  const [step, setStep] = useState<Step>('config')
  const [studyState, setStudyState] = useState<StudyState>({
    subject: '',
    level: 'intermediario',
    answers: {},
  })

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="min-h-screen pb-20 lg:ml-[240px] lg:pb-0">
        <Header />
        <main className="p-6 max-w-[1210px] mx-auto">
          <div className="max-w-3xl mx-auto flex flex-col gap-6 py-6">
            {step === 'config' && (
              <StudyConfig
                onStart={(subject, level) => {
                  setStudyState((prev) => ({ ...prev, subject, level }))
                  setStep('session')
                }}
              />
            )}
            {step === 'session' && (
              <StudySession
                subject={studyState.subject}
                level={studyState.level}
                onFinish={(answers) => {
                  setStudyState((prev) => ({ ...prev, answers }))
                  setStep('score')
                }}
                onBackToConfig={() => setStep('config')}
              />
            )}
            {step === 'score' && (
              <StudyScore
                subject={studyState.subject}
                level={studyState.level}
                answers={studyState.answers}
                onRestart={() => {
                  setStudyState({
                    subject: '',
                    level: 'intermediario',
                    answers: {},
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
