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
import { UpdateStudySession } from '@/lib/lib-study-session'
import { toast } from 'sonner'

type Step = 'config' | 'material' | 'session' | 'score'

interface StudyState {
  subjectId: string
  subject: string
  rootSubjectName: string
  studySessionId: string
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
    flashcardsData: null,
    materialsData: null,
    studySessionId: '',
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
      flashcardsData: payload.flashcardsData,
      materialsData: payload.materialsData,
      studySessionId: payload.studySessionId
    })
    setStep('material')
  }

  function handleQuestions(fetchedQuestions: Questions[]) {
    setQuestions(fetchedQuestions)
    setIsLoadingQuestions(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
      flashcardsData: null,
      materialsData: null,
      studySessionId: '',
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
                studySessionId={studyState.studySessionId}
                questionsData={questions}
                isLoading={isLoadingQuestions}
                onFinish={async () => {
                  const { error } = await UpdateStudySession(
                    studyState.studySessionId,
                    new Date(),
                  )
                  if (error) {
                    toast.error(error.message)
                    return
                  }
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                  setStep('score')
                }}
                onBack={() => setStep('material')}
              />
            )}
            {step === 'score' && (
              <StudyScore
                subject={studyState.subject}
                studySessionId={studyState.studySessionId}
                onRestart={handleRestart}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
