'use client'

import { BottomNav } from '@/components/layout/BottomNav'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { HeroBanner } from '@/components/shared/HeroBanner'
import { ModalSignup } from '@/components/shared/ModalSignup'
import { RedirectButtonsIcon } from '@/components/shared/RedirectButtonsIcon'
import { RedirectButtons } from '@/components/shared/RedirectButtons'
import { SearchVideo } from '@/components/shared/SearchVideo'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Lessons, Subjects } from '@/types'

export default function DashboardPage() {
  const [lessons, setLessons] = useState<Lessons[] | null> (null)
  const [subjects, setSubjects] = useState<Subjects[] | null> (null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)

  useEffect(() => {
    
    const supabase = createClient()

    async function checkAuth() {
      const { data } = await supabase.auth.getUser()
      setIsAuthenticated(Boolean(data.user))
      setAuthChecked(true)
    }

    async function fetchData(){
      const {data: lessonsData} = await supabase
        .from('lessons')
        .select()
        .eq('is_published',true)


      const {data: subjectsData} = await supabase
        .from('subjects')
        .select('*')

      if (lessonsData) setLessons(lessonsData)
      if (subjectsData) setSubjects(subjectsData)
    }

    fetchData()
    checkAuth()

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

  const canAccessFeatures = authChecked ? isAuthenticated : true

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="min-h-screen pb-20 lg:ml-[240px] lg:pb-0">
        {isAuthenticated ? <Header /> : null}
        <main className="mx-auto max-w-[1210px] px-0 pb-6 pt-0 lg:p-6">
          <HeroBanner />
          <div className="mt-3 flex flex-col gap-5 px-6 lg:px-0">
            <RedirectButtonsIcon
              isAuthenticated={canAccessFeatures}
              onRequireSignup={() => setIsSignupModalOpen(true)}
            />
            <RedirectButtons
              isAuthenticated={canAccessFeatures}
              onRequireSignup={() => setIsSignupModalOpen(true)}
            />
            <SearchVideo
              lessonsData={lessons}
              subjectsData={subjects}
              isAuthenticated={authChecked && isAuthenticated}
            />
          </div>
        </main>
      </div>
      <BottomNav />
      <ModalSignup
        open={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
      />
    </div>
  )
}
