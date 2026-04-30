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
  { label: 'Início', href: '/inicio', icon: Home },
  { label: 'Comunidade', href: '/comunidade', icon: Users },
  { label: 'Aprovados', href: '/aprovados', icon: Trophy },
  { label: 'Assinar', href: '/assinar', icon: Star, isPro: true },
  { label: 'Painel', href: '/painel', icon: LayoutDashboard },
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
              {item.isPro && (
                <span className="absolute top-0 -translate-y-1/2 rounded-full bg-gold px-1.5 py-0.5 text-[9px] font-bold leading-none text-gold-foreground">
                  PRO
                </span>
              )}
              <Icon className="h-4 w-4" />
              <span className="text-[11px] leading-none">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
