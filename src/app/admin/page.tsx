'use client'

import { BottomNav } from '@/components/layout/BottomNav'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import AdminQuestoes from '@/components/shared/AdminQuestoes'
import AdminLessons from '@/components/shared/AdminLessons'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Lessons, Subjects } from '@/types'
import EstudoInteligente from '@/components/shared/AdminEstudoInteligente'
import AdminLiveClasses from '@/components/shared/AdminLiveClasses'
import { NotificationsDropdown } from '@/components/shared/NotificationsDropdown'
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  HelpCircle,
  PlayCircle,
  Radio,
  ChevronLeft,
  type LucideIcon,
} from 'lucide-react'

const ADMIN_MENU_OPTIONS = [
  {
    id: 'register-lesson',
    label: 'Vídeos da Home',
    description: 'Aulas da tela inicial',
    Icon: PlayCircle,
  },
  {
    id: 'smart-study',
    label: 'Estudo Inteligente',
    description: 'PDFs, flashcards e questões',
    Icon: BookOpen,
  },
  {
    id: 'questions',
    label: 'Questões',
    description: 'Banco de questões e simulados',
    Icon: HelpCircle,
  },
  {
    id: 'live-classes',
    label: 'Aulas ao Vivo',
    description: 'Programar transmissões ao vivo',
    Icon: Radio,
  },
] as const satisfies ReadonlyArray<{
  id: string
  label: string
  description: string
  Icon: LucideIcon
}>

type AdminSectionId = (typeof ADMIN_MENU_OPTIONS)[number]['id']

export default function AdminPage() {
  const [selectedSection, setSelectedSection] = useState<AdminSectionId | null>(
    null,
  )
  const [lessons, setLessons] = useState<Lessons[] | null>(null)
  const [subjects, setSubjects] = useState<Subjects[] | null>(null)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    async function fetchLessons() {
      const { data: lessonsData } = await supabase.from('lessons').select('*')
      if (lessonsData) setLessons(lessonsData)
    }

    async function fetchSubjects() {
      const { data: subjectsData } = await supabase.from('subjects').select('*')
      if (subjectsData) setSubjects(subjectsData)
    }

    void Promise.all([fetchLessons(), fetchSubjects()])

    const channel = supabase
      .channel('admin_lessons_subjects')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lessons' },
        () => {
          fetchLessons()
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'subjects' },
        () => {
          fetchSubjects()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const selectedMenuOption = ADMIN_MENU_OPTIONS.find(
    (option) => option.id === selectedSection,
  )

  function handleBack() {
    if(selectedSection === null){
      router.push('settings')
    }

    if(selectedSection === 'questions'){
      setSelectedSection(null)
    }

    if(selectedSection === 'register-lesson'){
      setSelectedSection(null)
    }

    if(selectedSection === 'smart-study'){
      setSelectedSection(null)
    }

    if(selectedSection === 'live-classes'){
      setSelectedSection(null)
    }

  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="min-h-screen pb-20 lg:ml-[240px] lg:pb-0">
        
        <header className="sticky top-0 z-30 border-b border-border bg-background mb-3">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <button
              type="button"
              onClick={handleBack}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-muted-foreground/50 bg-border/80 text-primary transition-colors hover:text-foreground"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="font-heading truncate text-base font-bold text-primary">
                {selectedSection === null && 'Painel Admin'}
                {selectedSection === 'questions' && 'Questões'}
                {selectedSection === 'register-lesson' && 'Vídeos da Home'}
                {selectedSection === 'smart-study' && 'Estudo Inteligente'}
                {selectedSection === 'live-classes' && 'Aulas ao Vivo'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {selectedSection === null && 'Controle total da plataforma'}
                {selectedSection === 'questions' && 'Questões objetivas'}
                {selectedSection === 'register-lesson' && 'Aulas da tela inicial'}
                {selectedSection === 'smart-study' && 'Insira os materiais de estudos'}
                {selectedSection === 'live-classes' && 'Programar transmissões ao vivo'}
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-primary px-3 py-1 text-xs font-bold text-primary bg-primary/15">
              ADMIN
            </span>
            <div className="flex items-center gap-3">
              <NotificationsDropdown />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[700px] p-6">
          <div className="flex flex-col gap-6">
            {selectedSection === null ? (
              <section className="flex flex-col gap-4">
                <ul className="flex flex-col gap-2">
                  {ADMIN_MENU_OPTIONS.map(({ id, label, description, Icon }) => (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => setSelectedSection(id)}
                        className="group flex w-full items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-muted/30"
                      >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-primary/50 bg-background">
                          <Icon
                            className="h-5 w-5 text-primary"
                            aria-hidden
                          />
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span className="text-sm font-bold text-foreground">
                            {label}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {description}
                          </span>
                        </span>
                        <ChevronRight
                          className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                          aria-hidden
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ) : (
              <>
                {selectedSection === 'register-lesson' ? (
                  <AdminLessons subjectsData={subjects} lessonsData={lessons} />
                ) : null}

                {selectedSection === 'smart-study' ? (
                  <EstudoInteligente subjectsData={subjects} />
                ) : null}

                {selectedSection === 'questions' ? (
                  <AdminQuestoes subjectsData={subjects} />
                ) : null}

                {selectedSection === 'live-classes' ? <AdminLiveClasses /> : null}
              </>
            )}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
