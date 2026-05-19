'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import StudyConfig, { type StudyStartPayload } from '@/components/shared/StudyConfig'
import StudyMaterial from '@/components/shared/StudyMaterial'
import StudyScore from '@/components/shared/StudyScore'
import StudySession from '@/components/shared/StudySession'
import { StudyFlowLoadingOverlay } from '@/components/shared/StudyFlowLoading'
import { createClient } from '@/lib/supabase/client'
import { Subjects, StudyFlashcards, StudyMaterials, Questions } from '@/types'

type Step = 'config' | 'material' | 'session' | 'score'

interface StudyState {
  subjectId: string
  subject: string
  rootSubjectName: string
  answers: Record<string, string>
  flashcardsData: StudyFlashcards | null
  materialsData: StudyMaterials | null
}

export default function StudyPage() {
  const [step, setStep] = useState<Step>('config')
  const [subjects, setSubjects] = useState<Subjects[] | null>(null)
  const [subjectsLoading, setSubjectsLoading] = useState(true)
  const [studyState, setStudyState] = useState<StudyState>({
    subjectId: '',
    subject: '',
    rootSubjectName: '',
    answers: {},
    flashcardsData: null,
    materialsData: null,
  })
  const [questions, setQuestions] = useState<Questions[]>([])
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)
  const [isStartingStudy, setIsStartingStudy] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    async function fetchSubjects() {
      setSubjectsLoading(true)
      const { data } = await supabase.from('subjects').select('*')
      setSubjects(data ?? [])
      setSubjectsLoading(false)
    }

    void fetchSubjects()
  }, [])

  function handleStart(payload: StudyStartPayload) {
    setIsStartingStudy(false)
    setStudyState({
      subjectId: payload.subjectId,
      subject: payload.subjectName,
      rootSubjectName: payload.rootSubjectName,
      answers: {},
      flashcardsData: payload.flashcardsData,
      materialsData: payload.materialsData,
    })
    setStep('material')
  }

  function handleQuestions(fetchedQuestions: Questions[]) {
    setQuestions(fetchedQuestions)
    setIsLoadingQuestions(false)
    setStep('session')
  }

  function handleRestart() {
    setQuestions([])
    setIsLoadingQuestions(false)
    setIsStartingStudy(false)
    setStudyState({
      subjectId: '',
      subject: '',
      rootSubjectName: '',
      answers: {},
      flashcardsData: null,
      materialsData: null,
    })
    setStep('config')
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="min-h-screen pb-20 lg:ml-[240px] lg:pb-0">
        <Header />
        <main className="mx-auto max-w-[1210px] p-6">
          <div className="relative mx-auto flex max-w-3xl flex-col gap-6 py-6">
            {(isLoadingQuestions || isStartingStudy) && (
              <StudyFlowLoadingOverlay
                label={
                  isStartingStudy
                    ? 'Preparando material de estudo...'
                    : 'Carregando questões...'
                }
              />
            )}
            {step === 'config' && (
              <StudyConfig
                subjectsData={subjects}
                isLoadingSubjects={subjectsLoading}
                onStart={handleStart}
                onStartingChange={setIsStartingStudy}
              />
            )}
            {step === 'material' && (
              <StudyMaterial
                subjectName={studyState.subject}
                subjectId={studyState.subjectId}
                rootSubjectName={studyState.rootSubjectName}
                onContinue={handleQuestions}
                onQuestionsLoadingChange={setIsLoadingQuestions}
                flashcardsData={studyState.flashcardsData}
                materialsData={studyState.materialsData}
                onBack={() => setStep('config')}
              />
            )}
            {step === 'session' && (
              <StudySession
                subjectName={studyState.subject}
                questionsData={questions}
                isLoading={isLoadingQuestions}
                onFinish={(answers) => {
                  setStudyState((prev) => ({ ...prev, answers }))
                  setStep('score')
                }}
                onBack={() => setStep('material')}
              />
            )}
            {step === 'score' && (
              <StudyScore
                subject={studyState.subject}
                questionsData={questions}
                answers={studyState.answers}
                onRestart={handleRestart}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
