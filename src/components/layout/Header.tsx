'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { NotificationsDropdown } from '@/components/shared/NotificationsDropdown'
import { useProfile } from '@/context/ProfileContext'

export function Header() {
  const router = useRouter();
  const { profile, loading } = useProfile()

  return (
    <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-border bg-background px-6">
      
      <div className="flex items-center gap-3">

        <div
          onClick={() => router.push('/settings')}
          className="relative flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-full text-sm font-black text-primary-foreground transition-transform hover:scale-105 active:scale-95 select-none"
          style={
            profile?.avatar_url
              ? {
                  boxShadow:
                    '0 0 0 2px hsl(var(--background)), 0 0 0 4px hsl(42,50%,55%,0.4)',
                }
              : {
                  background: 'linear-gradient(135deg, #F0D080, #C9A84C)',
                  boxShadow:
                    '0 0 0 2px hsl(var(--background)), 0 0 0 4px hsl(42,50%,55%,0.4)',
                }
          }
        >
          {profile?.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.name ? `Foto de ${profile.name}` : 'Foto de perfil'}
              fill
              className="object-cover"
              sizes="36px"
            />
          ) : (
            profile?.name?.charAt(0).toUpperCase()
          )}
        </div>

        <div className="flex flex-col">
          <h1 className="text-base font-black text-foreground font-heading">
            Olá, {profile?.name} 👋
          </h1>
          <p className="text-xs text-muted-foreground">
            Bons estudos, rumo à aprovação!
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <NotificationsDropdown />
      </div>
    </header>
  )
}
