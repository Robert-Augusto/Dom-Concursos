'use client'

import { useEffect, useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import StudyConfig, { type StudyStartPayload } from '@/components/shared/StudyConfig'
import StudyFlashcard from '@/components/shared/StudyFlashcard'
import StudyMaterial from '@/components/shared/StudyMaterial'
import StudyScore from '@/components/shared/StudyScore'
import StudySession from '@/components/shared/StudySession'
import { StudyFlowLoadingOverlay } from '@/components/shared/StudyFlowLoading'
import StudyFlowSteps, {
  type StudyFlowStepId,
} from '@/components/shared/StudyFlowSteps'
import { createClient } from '@/lib/supabase/client'
import { Subjects, StudyFlashcards, StudyMaterials, Questions } from '@/types'
import { UpdateStudySession } from '@/lib/lib-study-session'
import { toast } from 'sonner'
import { BottomNav } from '@/components/layout/BottomNav'
import { ChevronLeft, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Step = 'config' | 'material' | 'flashcard' | 'session' | 'score'

interface StudyState {
  subjectId: string
  subject: string
  rootSubjectName: string
  studySessionId: string
  flashcardsData: StudyFlashcards[]
  materialsData: StudyMaterials | null
}

export default function StudyPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('config')
  const [subjects, setSubjects] = useState<Subjects[] | null>(null)
  const [subjectsLoading, setSubjectsLoading] = useState(true)
  const [studyState, setStudyState] = useState<StudyState>({
    subjectId: '',
    subject: '',
    rootSubjectName: '',
    flashcardsData: [],
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
      studySessionId: payload.studySessionId,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
      flashcardsData: [],
      materialsData: null,
      studySessionId: '',
    })
    setStep('config')
  }

  function handleStepBack() {
    if (step === 'material') setStep('config')
    if (step === 'flashcard') setStep('material')
    if (step === 'session') setStep('flashcard')
    if (step === 'config') router.push('dashboard')
  }

  const showFlowHeader = ['material', 'flashcard', 'session', 'config'].includes(step)
  const flowStepId: StudyFlowStepId | null =
    step === 'material' || step === 'flashcard' || step === 'session'
      ? step
      : null

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="min-h-screen lg:ml-[240px]">
        {showFlowHeader && (
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
                  {step === 'material' && 'Estudo Teórico'}
                  {step === 'flashcard' && 'Flashcards de revisão'}
                  {step === 'session' && 'Hora de responder!'}
                  {step === 'config' && 'Estudo inteligente'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {step === 'material' &&
                    'Leia com atenção. O que você absorver agora fará diferença nas questões.'}
                  {step === 'flashcard' &&
                    'Revise os 3 flashcards antes de seguir para as questões.'}
                  {step === 'session' &&
                    'Leia com atenção e escolha a alternativa correta.'}
                  {step === 'config' && 'Estude no seu tempo...'}
                </p>
              </div>
            </div>
          </header>
        )}

        {flowStepId ? (
              <div>
                <StudyFlowSteps activeStep={flowStepId} />
              </div>
        ) : null}

{step === 'score' && (
  <>
    <section
      className="justify-center mx-auto relative overflow-hidden rounded-2xl border border-chart-2/30 bg-card p-5 sm:p-6 mt-5 ml-5 mr-5 max-w-[770px]"
      style={{
        background:
          'linear-gradient(135deg, rgba(46,204,138,0.12) 0%, rgba(46,204,138,0.04) 50%, hsl(var(--card)) 100%)',
      }}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-chart-2/25 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-12 -left-8 h-28 w-28 rounded-full bg-accent/15 blur-3xl"
        aria-hidden
      />

      <div className="relative flex items-start gap-4 sm:items-center">
        <span
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-chart-2/40 bg-chart-2/15 sm:h-14 sm:w-14"
          style={{ boxShadow: '0 6px 20px rgba(46,204,138,0.3)' }}
        >
          <span className="text-2xl leading-none sm:text-3xl" aria-hidden>
            🎉
          </span>
        </span>

        <div className="min-w-0 flex-1">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-chart-2/35 bg-chart-2/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-chart-2">
            <Sparkles className="h-3 w-3 shrink-0" aria-hidden />
            Parabéns!
          </span>
          <p className="mt-2 font-heading text-base font-black leading-tight text-foreground sm:text-lg">
            Você concluiu todas as etapas! 🚀
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Estudo teórico, flashcards e questões. Sua dedicação está te
            aproximando da{' '}
            <span className="font-semibold text-primary">aprovação</span>!
          </p>
        </div>
      </div>
    </section>

    <div className='mt-8'>
      <StudyFlowSteps activeStep="session" allCompleted />
    </div>
  </>
)}

        <main className="mx-auto max-w-[1210px] p-6 mb-20">
          <div className="relative mx-auto flex max-w-3xl flex-col gap-6 pb-6">
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
                materialsData={studyState.materialsData}
                onContinue={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                  setStep('flashcard')
                }}
              />
            )}
            {step === 'flashcard' && (
              <StudyFlashcard
                flashcardsData={studyState.flashcardsData}
                subjectId={studyState.subjectId}
                onContinue={handleQuestions}
                onQuestionsLoadingChange={setIsLoadingQuestions}
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
                onBack={() => setStep('flashcard')}
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
      {step === 'config' && (<BottomNav />)}
    </div>
  )
}
