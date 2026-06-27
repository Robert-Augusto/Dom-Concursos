'use client'

import { type MouseEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  ChartNoAxesCombined,
  Medal,
  Users,
  MessageCircleQuestionMark,
} from 'lucide-react'
import { ModalSignup } from '@/components/shared/ModalSignup'
import { useProfile } from '@/context/ProfileContext'

const navigationItems = [
  { label: 'Início', href: '/dashboard', icon: Home, center: false },
  { label: 'Aprovados', href: '/settings', icon: Medal, center: false },
  { label: 'Comunidade', href: '/comunity', icon: Users, center: true },
  { label: 'Dúvidas', href: '/doubts', icon: MessageCircleQuestionMark, center: false },
  { label: 'Painel', href: '/score', icon: ChartNoAxesCombined, center: false },
] as const

export function BottomNav() {
  const pathname = usePathname()
  const { loading, isAuthenticated } = useProfile()
  const [ isModalOpen, setIsModalOpen ] = useState(false)

  function handleNavClick(event: MouseEvent<HTMLAnchorElement>) {
    
    if (loading) {
      event.preventDefault()
      return
    }

    if (!isAuthenticated) {
      event.preventDefault()
      setIsModalOpen(true)
      return
    }

  }

  return (
    <>
      <nav
        className="lg:hidden fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom)]"
        aria-label="Navegação principal"
      >
        <div className="mx-auto max-w-md px-4 pb-3">
          <div className="flex items-center justify-between rounded-[28px] border border-border/60 bg-sidebar/90 px-2 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl supports-[backdrop-filter]:bg-sidebar/80">
            {navigationItems.map((item) => {
              const active = pathname === item.href
              const Icon = item.icon

              if (item.center) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleNavClick}
                    className="-mt-1 flex flex-1 flex-col items-center justify-center gap-1 text-center text-[10px] font-medium leading-none transition-transform active:scale-95"
                    aria-label={item.label}
                  >
                    <span className="-mt-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold shadow-[0_4px_24px_rgba(201,168,76,0.45)]">
                      <Icon
                        className="h-6 w-6 text-gold-foreground"
                        strokeWidth={2.4}
                        aria-hidden
                      />
                    </span>
                    <span
                      className={`mt-0.5 block w-full text-center leading-[1.1] ${
                        active ? 'text-gold' : 'text-muted-foreground'
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                )
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
                  className={`flex flex-1 flex-col items-center justify-center gap-1 py-2 text-center text-[10px] font-medium leading-none transition-colors ${
                    active
                      ? 'text-gold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon
                    className="h-[18px] w-[18px]"
                    strokeWidth={active ? 2.4 : 1.9}
                    aria-hidden
                  />
                  <span className="block w-full whitespace-pre-line text-center leading-[1.1]">
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
      <ModalSignup open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
