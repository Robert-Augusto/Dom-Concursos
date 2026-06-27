import { BottomNav } from '@/components/layout/BottomNav'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { HeroBanner } from '@/components/shared/HeroBanner'
import { RedirectButtonsIcon } from '@/components/shared/RedirectButtonsIcon'
import { RedirectButtons } from '@/components/shared/RedirectButtons'
import { SearchVideo } from '@/components/shared/SearchVideo'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {

  const supabase = await createClient()

  const {data: lessonsData} = await supabase
    .from('lessons')
    .select()
    .eq('is_published',true)
    .eq('is_searchable', true)

  const {data: subjectsData} = await supabase
    .from('subjects')
    .select('*')
  

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="min-h-screen pb-20 lg:ml-[240px] lg:pb-0">
        <Header />
        <main className="mx-auto max-w-[1210px] px-0 pb-6 pt-0 lg:p-6">
          <HeroBanner />
          <div className="mt-5 flex flex-col gap-5 px-6 lg:px-0">
            <RedirectButtonsIcon/>
            <RedirectButtons/>
            <SearchVideo
              lessonsData={lessonsData}
              subjectsData={subjectsData}
            />
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}