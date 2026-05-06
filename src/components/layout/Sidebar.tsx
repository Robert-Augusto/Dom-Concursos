'use client'

import { type MouseEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  TvMinimalPlay,
  ChartNoAxesCombined,
  Users,
  NotebookPen,
  BookCheck
} from 'lucide-react'
import { ModalSignup } from '@/components/shared/ModalSignup'
import { createClient } from '@/lib/supabase/client'

const navigationItems = [
  { label: 'Início', href: '/dashboard', icon: Home },
  { label: 'Cursos', href: '/courses', icon: TvMinimalPlay },
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

  function handleNavClick(event: MouseEvent<HTMLAnchorElement>) {
    if (isAuthenticated) return

    event.preventDefault()
    setIsModalOpen(true)
  }

  return (
    <>
      <aside className="hidden lg:block fixed left-0 top-0 z-40 h-screen w-[240px] bg-sidebar border-r border-border">
        <div className="flex h-full flex-col p-4">
        <div className="mb-6 flex items-center gap-3 px-2 py-3">
          <div
            className="h-9 w-9 rounded-lg"
            style={{
              background:
                'linear-gradient(135deg, color-mix(in oklab, var(--color-primary) 100%, white 0%), color-mix(in oklab, var(--color-primary) 82%, white 18%))',
            }}
          />
          <div className="leading-none">
            <p className="font-heading text-lg font-black text-foreground">DOM</p>
            <p className="mt-1 text-[10px] tracking-widest text-muted-foreground">
              CONCURSOS
            </p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-gold/10 text-gold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
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
