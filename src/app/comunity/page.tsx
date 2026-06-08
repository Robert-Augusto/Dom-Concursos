'use client'

import { BottomNav } from '@/components/layout/BottomNav'
import { Sidebar } from '@/components/layout/Sidebar'
import CommunityFeed from '@/components/shared/CommunityFeed'
import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { NotificationsDropdown } from '@/components/shared/NotificationsDropdown'

export default function DashboardPage() {
  const router = useRouter()

  function handleStepBack(){
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="min-h-screen pb-20 lg:ml-[240px] lg:pb-0">
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
                Comunidade
              </h1>
              <p className="text-sm text-muted-foreground">
                Conecte-se com outros estudantes.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <NotificationsDropdown />
            </div>
          </div>
        </header>
        <main className="p-6 max-w-[768px] mx-auto">
          <div className="flex flex-col gap-8">
            <CommunityFeed />
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
