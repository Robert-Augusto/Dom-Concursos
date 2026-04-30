'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Bell,
  FileText,
  Lightbulb,
  Star,
  Video,
  type LucideIcon,
} from 'lucide-react'

interface Notification {
  id: string
  type: 'aula_ao_vivo' | 'edital' | 'flashcard' | 'aula' | 'conquista'
  title: string
  description: string
  time: string
  category: string
  group: 'Hoje' | 'Ontem'
  unread: boolean
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'aula_ao_vivo',
    title: 'Aula ao vivo começando!',
    description:
      'Prof. João Lima - Direito Constitucional está começando agora. 1.243 alunos assistindo.',
    time: 'Agora',
    category: 'Aula ao Vivo',
    group: 'Hoje',
    unread: true,
  },
  {
    id: '2',
    type: 'edital',
    title: 'Novo edital publicado',
    description:
      'TJ-SP abriu 5.000 vagas para Escrevente. Salário R$ 4.600. Prova em 13/07!',
    time: '2h atrás',
    category: 'Editais',
    group: 'Hoje',
    unread: true,
  },
  {
    id: '3',
    type: 'conquista',
    title: 'Meta semanal quase lá!',
    description:
      'Você já completou 68% da sua meta semanal. Faltam apenas 2h30min de estudos!',
    time: '5h atrás',
    category: 'Progresso',
    group: 'Hoje',
    unread: true,
  },
  {
    id: '4',
    type: 'flashcard',
    title: 'Hora do flashcard!',
    description:
      'Você não revisa Direito Constitucional há 3 dias. Que tal 10 minutos agora?',
    time: '8h atrás',
    category: 'Estudo',
    group: 'Hoje',
    unread: true,
  },
  {
    id: '5',
    type: 'conquista',
    title: 'Nova conquista desbloqueada!',
    description:
      'Você completou 7 sessões Pomodoro seguidas. Parabéns pelo "Foco de Ferro"!',
    time: 'Ontem às 21:15',
    category: 'Conquistas',
    group: 'Ontem',
    unread: false,
  },
  {
    id: '6',
    type: 'aula',
    title: 'Nova aula disponível',
    description:
      'Prof. Ana Silva publicou "Ortografia - Questões CESPE/CEBRASPE" no seu curso de Português.',
    time: 'Ontem às 18:40',
    category: 'Cursos',
    group: 'Ontem',
    unread: false,
  },
]

type NotificationStyle = {
  icon: LucideIcon
  iconWrapperClassName: string
  iconClassName?: string
  livePulse?: boolean
}

const notificationStyles: Record<Notification['type'], NotificationStyle> = {
  aula_ao_vivo: {
    icon: Video,
    iconWrapperClassName: 'bg-destructive/20 text-destructive',
    livePulse: true,
  },
  edital: {
    icon: FileText,
    iconWrapperClassName: 'bg-primary/20 text-primary',
  },
  flashcard: {
    icon: Lightbulb,
    iconWrapperClassName: 'bg-accent/20 text-accent',
  },
  aula: {
    icon: Bell,
    iconWrapperClassName: 'bg-primary/20 text-primary',
  },
  conquista: {
    icon: Star,
    iconWrapperClassName: 'bg-primary/20 text-primary',
    iconClassName: 'fill-primary',
  },
}

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const unreadCount = useMemo(
    () => notifications.filter((notification) => notification.unread).length,
    [notifications]
  )

  useEffect(() => {
    if (!open) return

    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current) return
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [open])

  function markAllAsRead() {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, unread: false }))
    )
  }

  function markAsRead(id: string) {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, unread: false } : notification
      )
    )
  }

  const groups = ['Hoje', 'Ontem'] as const

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className="relative flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Notificações"
        onClick={() => setOpen((prev) => !prev)}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-black text-destructive-foreground">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-xl md:w-96">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="font-heading text-sm font-black text-foreground">
              Notificações
            </h3>
            <button
              type="button"
              className="text-xs text-accent hover:underline"
              onClick={markAllAsRead}
            >
              Marcar todas como lidas
            </button>
          </div>

          <div className="max-h-[480px] overflow-y-auto">
            {notifications.length === 0 || unreadCount === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12">
                <Bell className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma notificação nova
                </p>
              </div>
            ) : (
              groups.map((group) => {
                const groupNotifications = notifications.filter(
                  (notification) => notification.group === group
                )

                if (groupNotifications.length === 0) return null

                return (
                  <div key={group}>
                    <div className="bg-background/50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      {group}
                    </div>

                    {groupNotifications.map((notification) => {
                      const style = notificationStyles[notification.type]
                      const Icon = style.icon

                      return (
                        <div
                          key={notification.id}
                          className={`flex cursor-pointer items-start gap-3 border-b border-border/50 px-4 py-3 transition-colors hover:bg-muted/30 ${
                            notification.unread ? 'bg-primary/5' : ''
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div
                            className={`relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${style.iconWrapperClassName}`}
                          >
                            {style.livePulse && (
                              <span className="absolute -left-0.5 -top-0.5 h-2 w-2 rounded-full bg-destructive animate-pulse" />
                            )}
                            <Icon className={`h-5 w-5 ${style.iconClassName ?? ''}`} />
                          </div>

                          <div className="min-w-0 flex-1 space-y-0.5">
                            <p className="text-sm font-bold leading-snug text-foreground">
                              {notification.title}
                            </p>
                            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                              {notification.description}
                            </p>
                            <p className="mt-1 text-[10px] text-muted-foreground/70">
                              {notification.time} • {notification.category}
                            </p>
                          </div>

                          {notification.unread && (
                            <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-accent" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
