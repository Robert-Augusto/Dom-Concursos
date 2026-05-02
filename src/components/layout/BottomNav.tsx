'use client'

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

const navigationItems = [
  { label: 'Início', href: '/dashboard', icon: Home },
  { label: 'Cursos', href: '/courses', icon: TvMinimalPlay },
  { label: 'Estudo', href: '/study', icon: NotebookPen },
  { label: 'Simulado', href: '/simulado', icon: BookCheck },
  { label: 'Desempenho', href: '/score', icon: ChartNoAxesCombined },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-sidebar">
      <div className="grid h-16 grid-cols-5">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-1 ${
                isActive ? 'text-gold' : 'text-muted-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-[11px] leading-none">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
