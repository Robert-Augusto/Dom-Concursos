import { BottomNav } from '@/components/layout/BottomNav'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import CommunityFeed from '@/components/shared/CommunityFeed'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="min-h-screen pb-20 lg:ml-[240px] lg:pb-0">
        <Header />
        <main className="p-6 max-w-[1210px] mx-auto">
          <div className="flex flex-col gap-8">
            <CommunityFeed />
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
