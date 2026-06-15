'use client'

import { type MouseEvent, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { toast } from 'sonner'
import {
  BookCheck,
  ChartNoAxesCombined,
  Home,
  NotebookPen,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { ModalSignup } from '@/components/shared/ModalSignup'
import { createClient } from '@/lib/supabase/client'

const LOGO_URL =
  'https://tzrcebhmkivfflfosstq.supabase.co/storage/v1/object/public/study_materials_images/Logo%20Dom%20Concursos%20_20260121_075709_0000.png'

type NavigationItem = {
  label: string
  href: string
  icon: LucideIcon
  comingSoon?: boolean
  comingSoonMessage?: string
}

const navigationItems: NavigationItem[] = [
  { label: 'Início', href: '/dashboard', icon: Home },
  { label: 'Estudo Inteligente', href: '/study', icon: NotebookPen },
  { label: 'Simulado', href: '/simulado', icon: BookCheck },
  { label: 'Comunidade', href: '/comunity', icon: Users },
  { label: 'Desempenho', href: '/score', icon: ChartNoAxesCombined },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    async function checkAuth() {
      const { data } = await supabase.auth.getUser()
      setIsAuthenticated(Boolean(data.user))
    }

    checkAuth()
  }, [])

  function handleNavClick(
    event: MouseEvent<HTMLAnchorElement>,
    item: NavigationItem,
  ) {
    if (item.comingSoon) {
      event.preventDefault()
      toast.info(
        item.comingSoonMessage ??
          'Este recurso estará disponível em breve nas próximas atualizações.',
      )
      return
    }

    if (isAuthenticated) return

    event.preventDefault()
    setIsModalOpen(true)
  }

  return (
    <>
      <aside className="hidden lg:block fixed left-0 top-0 z-40 h-screen w-[240px] bg-sidebar border-r border-border">
        <div className="flex h-full flex-col p-4">
        <Link href="/dashboard" className=" block mb-3">
          <Image
            src={LOGO_URL}
            alt="DOM Concursos"
            width={400}
            height={120}
            style={{ width: '150px', height: 'auto' }}
            className="object-contain"
            priority
          />
        </Link>

        <nav className="flex flex-col gap-1">
          {navigationItems.map((item) => {
            const isActive = !item.comingSoon && pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(event) => handleNavClick(event, item)}
                aria-disabled={item.comingSoon ? true : undefined}
                className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  item.comingSoon
                    ? 'cursor-default text-muted-foreground opacity-80'
                    : isActive
                      ? 'bg-gold/10 text-gold'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {item.comingSoon ? (
                  <span className="shrink-0 rounded-full border border-primary/40 bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary">
                    Em breve
                  </span>
                ) : null}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
    <ModalSignup open={isModalOpen} onClose={() => setIsModalOpen(false)} />
  </>
  )
}
