'use client'

import { BottomNav } from '@/components/layout/BottomNav'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { HeroBanner } from '@/components/shared/HeroBanner'
import { RedirectButtonsIcon } from '@/components/shared/RedirectButtonsIcon'
import { RedirectButtons } from '@/components/shared/RedirectButtons'
import { SearchVideo } from '@/components/shared/SearchVideo'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Lessons, Subjects } from '@/types'

export default function DashboardPage() {
  const [lessons, setLessons] = useState<Lessons[] | null> (null)
  const [subjects, setSubjects] = useState<Subjects[] | null> (null)

  useEffect(() => {
    
    const supabase = createClient()

    async function fetchData(){
      const {data: lessonsData} = await supabase
        .from('lessons')
        .select()
        .eq('is_published',true)


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
        <main className="p-6 max-w-[1210px] mx-auto">
          <div className="flex flex-col gap-8">
            <HeroBanner />
            <RedirectButtonsIcon />
            <RedirectButtons />
            <SearchVideo
              lessonsData={lessons}
              subjectsData={subjects} 
            />
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
