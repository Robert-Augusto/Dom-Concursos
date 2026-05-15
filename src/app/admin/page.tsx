'use client'

import { BottomNav } from '@/components/layout/BottomNav'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import AdminQuestoes from '@/components/shared/AdminQuestoes'
import { SearchVideo } from '@/components/shared/SearchVideo'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Lessons, Subjects } from '@/types'
import EstudoInteligente from '@/components/shared/EstudoInteligente'

const ADMIN_SECTIONS = [
  { id: 'register-lesson', label: 'Aulas' },
  { id: 'smart-study', label: 'Estudo Inteligente' },
  { id: 'questions', label: 'Questões' },
] as const

type AdminSectionId = (typeof ADMIN_SECTIONS)[number]['id']

export default function AdminPage() {
  const [selectedSection, setSelectedSection] =
    useState<AdminSectionId>('register-lesson')
  const [lessons, setLessons] = useState<Lessons[] | null>(null)
  const [subjects, setSubjects] = useState<Subjects[] | null>(null)

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
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'subjects' },
        () => {
          fetchSubjects()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="min-h-screen pb-20 lg:ml-[240px] lg:pb-0">
        <Header />
        <main className="mx-auto max-w-[1210px] p-6">
          <div className="flex flex-col gap-8">
            <section className="flex flex-col gap-3">
              <h1 className="text-xl font-black text-foreground font-heading">
                Painel Administrativo
              </h1>
              <div className="flex flex-wrap gap-2">
                {ADMIN_SECTIONS.map((section) => {
                  const isSelected = selectedSection === section.id

                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => setSelectedSection(section.id)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
                      }`}
                    >
                      {section.label}
                    </button>
                  )
                })}
              </div>
            </section>

            {selectedSection === 'register-lesson' ? (
              <SearchVideo
                lessonsData={lessons}
                subjectsData={subjects}
              />
            ) : null}

            {selectedSection === 'smart-study' ? (
              <EstudoInteligente subjectsData={subjects} />
            ) : null}

            {selectedSection === 'questions' ? (
              <AdminQuestoes subjectsData={subjects} />
            ) : null}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
