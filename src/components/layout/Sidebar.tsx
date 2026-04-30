'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  LayoutDashboard,
  Star,
  Trophy,
  Users,
} from 'lucide-react'

const navigationItems = [
  { label: 'Início', href: '/dashboard', icon: Home },
  { label: 'Comunidade', href: '/comunidade', icon: Users },
  { label: 'Aprovados', href: '/aprovados', icon: Trophy },
  { label: 'Assinar', href: '/assinar', icon: Star, isPro: true },
  { label: 'Painel', href: '/painel', icon: LayoutDashboard },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
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
                className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-gold/10 text-gold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {item.isPro && (
                  <span className="absolute left-8 top-0 -translate-y-1/2 rounded-full bg-gold px-1.5 py-0.5 text-[9px] font-bold leading-none text-gold-foreground">
                    PRO
                  </span>
                )}
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
