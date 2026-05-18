'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertCircle, Bell, ListChecks, X, type LucideIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  getUnreadNotificationsForProfile,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '@/lib/lib-notifications'
import { toast } from 'sonner'
import type {
  NotificationType,
  Notifications as NotificationRow,
} from '@/types'
import { useProfile } from '@/context/ProfileContext'

type NotificationStyle = {
  icon: LucideIcon
  iconWrapperClassName: string
  iconClassName?: string
  rowClassName?: string
}

const notificationStyles: Record<NotificationType, NotificationStyle> = {
  questions_created: {
    icon: ListChecks,
    iconWrapperClassName: 'bg-primary/20 text-primary',
  },
  questions_error: {
    icon: AlertCircle,
    iconWrapperClassName: 'bg-destructive/20 text-destructive',
    rowClassName: 'bg-destructive/5',
  },
}

function formatRelativeTimePt(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  const seconds = Math.round((date.getTime() - Date.now()) / 1000)
  const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' })

  const abs = Math.abs(seconds)
  if (abs < 60) return rtf.format(Math.round(seconds / 1), 'second')
  const minutes = Math.round(seconds / 60)
  if (Math.abs(minutes) < 60) return rtf.format(minutes, 'minute')
  const hours = Math.round(minutes / 60)
  if (Math.abs(hours) < 24) return rtf.format(hours, 'hour')
  const days = Math.round(hours / 24)
  if (Math.abs(days) < 7) return rtf.format(days, 'day')
  const weeks = Math.round(days / 7)
  if (Math.abs(weeks) < 5) return rtf.format(weeks, 'week')
  const months = Math.round(days / 30)
  if (Math.abs(months) < 12) return rtf.format(months, 'month')
  return rtf.format(Math.round(days / 365), 'year')
}

export function NotificationsDropdown() {
  const { profile, loading: profileLoading } = useProfile()
  const [notifications, setNotifications] = useState<NotificationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)
  const [markingId, setMarkingId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const refetchUnread = useCallback(
    async (opts?: { silent?: boolean; isCancelled?: () => boolean }) => {
      const silent = opts?.silent ?? false
      const isCancelled = opts?.isCancelled ?? (() => false)

      if (!silent) {
        setLoading(true)
      }

      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (isCancelled()) return

      if (!user) {
        setNotifications([])
        if (!silent) setLoading(false)
        return
      }

      const profileId = profile?.id ?? user.id
      const { data, error } = await getUnreadNotificationsForProfile(
        profileId,
        profile?.role
      )
      if (isCancelled()) return

      if (error) {
        toast.error(error.message)
        setNotifications([])
        if (!silent) setLoading(false)
        return
      }

      if (isCancelled()) return
      setNotifications(data)
      if (!silent) setLoading(false)
    },
    [profile?.id, profile?.role]
  )

  useEffect(() => {
    if (profileLoading) return

    let cancelled = false
    const isCancelled = () => cancelled

    void refetchUnread({ silent: false, isCancelled })

    const supabase = createClient()
    const channelId = `notifications_feed:${profile?.id ?? 'pending'}`
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        () => {
          if (!cancelled) void refetchUnread({ silent: true })
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications_reads' },
        () => {
          if (!cancelled) void refetchUnread({ silent: true })
        }
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [profileLoading, profile?.id, refetchUnread])

  const count = notifications.length

  async function resolveProfileId(): Promise<string | null> {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null
    return profile?.id ?? user.id
  }

  async function handleMarkRead(notificationId: string) {
    if (markingId) return
    const profileId = await resolveProfileId()
    if (!profileId) return

    setMarkingId(notificationId)
    const { error } = await markNotificationAsRead(profileId, notificationId)
    setMarkingId(null)

    if (error) {
      toast.error(error.message)
      return
    }

    setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
  }

  async function handleMarkAllRead() {
    if (markingAll || notifications.length === 0) return
    const profileId = await resolveProfileId()
    if (!profileId) return

    setMarkingAll(true)
    const ids = notifications.map((n) => n.id)
    const { error } = await markAllNotificationsAsRead(profileId, ids)
    setMarkingAll(false)

    if (error) {
      toast.error(error.message)
      return
    }

    setNotifications([])
  }

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

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className="relative flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Notificações"
        onClick={() => setOpen((prev) => !prev)}
      >
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-black text-destructive-foreground">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-12 z-50 w-[min(100vw-1.5rem,20rem)] overflow-hidden rounded-2xl border border-border/90 bg-popover text-popover-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_16px_48px_-8px_rgba(0,0,0,0.55),0_32px_64px_-16px_rgba(0,0,0,0.35)] backdrop-blur-xl supports-[backdrop-filter]:bg-popover/95 md:w-96 md:max-w-none"
          role="region"
          aria-label="Notificações"
        >
          <div className="relative border-b border-border/80 bg-muted/20 px-4 py-3 pr-11">
            <button
              type="button"
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Fechar notificações"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
            <div className="flex min-w-0 items-center justify-between gap-2 pr-2">
              <h3 className="min-w-0 truncate font-heading text-sm font-black text-foreground">
                Notificações
              </h3>
              {count > 0 && (
                <button
                  type="button"
                  className="shrink-0 text-xs text-accent hover:underline disabled:pointer-events-none disabled:opacity-50"
                  disabled={markingAll || Boolean(markingId)}
                  onClick={() => void handleMarkAllRead()}
                >
                  {markingAll ? 'Marcando…' : 'Marcar todas como lidas'}
                </button>
              )}
            </div>
          </div>

          <div className="max-h-[min(480px,70dvh)] overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12">
                <p className="text-sm text-muted-foreground">Carregando…</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12">
                <Bell className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma notificação
                </p>
              </div>
            ) : (
              notifications.map((notification) => {
                const style =
                  notificationStyles[notification.type] ??
                  notificationStyles.questions_created
                const Icon = style.icon
                const isMarkingThis = markingId === notification.id

                return (
                  <button
                    key={notification.id}
                    type="button"
                    className={`flex w-full items-start gap-3 border-b border-border/50 px-4 py-3 text-left transition-colors hover:bg-muted/30 disabled:cursor-wait disabled:opacity-60 ${style.rowClassName ?? ''}`}
                    disabled={Boolean(markingId) && !isMarkingThis}
                    onClick={() => void handleMarkRead(notification.id)}
                  >
                    <div
                      className={`relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${style.iconWrapperClassName}`}
                    >
                      <Icon
                        className={`h-5 w-5 ${style.iconClassName ?? ''}`}
                      />
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="text-sm font-bold leading-snug text-foreground">
                        {notification.title}
                      </p>
                      <p className="line-clamp-3 text-xs leading-snug text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground/70">
                        {isMarkingThis
                          ? 'Marcando como lida…'
                          : formatRelativeTimePt(notification.created_at)}
                      </p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
