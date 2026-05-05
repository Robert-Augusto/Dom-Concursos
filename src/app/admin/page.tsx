 'use client'

import { BottomNav } from '@/components/layout/BottomNav'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { SearchVideo } from '@/components/shared/SearchVideo'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Lessons, Subjects } from '@/types'

const ADMIN_SECTIONS = [{ id: 'register-lesson', label: 'Aulas' }] as const

type AdminSectionId = (typeof ADMIN_SECTIONS)[number]['id']

export default function AdminPage() {
  const [selectedSection, setSelectedSection] =
    useState<AdminSectionId>('register-lesson')
  const [lessons, setLessons] = useState<Lessons[] | null> (null)
  const [subjects, setSubjects] = useState<Subjects[] | null> (null)

  useEffect(() => {
    
    const supabase = createClient()

    async function fetchData(){
      const {data: lessonsData} = await supabase
        .from('lessons')
        .select('*')

      const {data: subjectsData} = await supabase
        .from('subjects')
        .select()
        .not('subject_id','is',null)

      if (lessonsData) setLessons(lessonsData)
      if (subjectsData) setSubjects(subjectsData)
    }

    fetchData()

    const channel = supabase
      .channel('lessons_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lessons' },
        () => {
          fetchData()
        }
      )
      .subscribe()
  
    return () => {
      supabase.removeChannel(channel)
    }

  },[])
  
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

            {selectedSection === 'register-lesson' ? <SearchVideo
              lessonsData={lessons}
              subjectsData={subjects}
            /> : null}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
