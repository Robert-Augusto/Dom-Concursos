import { createClient } from '@/lib/supabase/client'
import type { PostgrestError } from '@supabase/supabase-js'
import type {
  NotificationRole,
  Notifications as NotificationRow,
  NotificationType,
  ProfileRole,
} from '@/types'

export async function CreateNotification(
  title: string,
  message: string,
  type: NotificationType,
  role: NotificationRole,
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      title,
      message,
      type,
      role,
    })
    .select('id')
    .single()

  return { data, error }
}

function parseNotificationRow(row: NotificationRow): NotificationRow {
  return {
    ...row,
    created_at:
      typeof row.created_at === 'string'
        ? new Date(row.created_at)
        : row.created_at,
  }
}

/** Admins see every notification. Students and teachers only see notifications with role "all" (never role "admin"). */
function filterNotificationsByAudience(
  rows: NotificationRow[],
  profileRole: ProfileRole | undefined
): NotificationRow[] {
  if (profileRole === 'admin') {
    return rows
  }
  return rows.filter((n) => n.role === 'all')
}

export async function getUnreadNotificationsForProfile(
  profileId: string,
  profileRole: ProfileRole | undefined
): Promise<{ data: NotificationRow[]; error: PostgrestError | null }> {
  const supabase = createClient()

  const { data: reads, error: readsError } = await supabase
    .from('notifications_reads')
    .select('notifications_id')
    .eq('profile_id', profileId)

  if (readsError) {
    return { data: [], error: readsError }
  }

  const readIds = new Set(
    (reads ?? []).map((r: { notifications_id: string }) => r.notifications_id)
  )

  const { data: notifications, error: notificationsError } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })

  if (notificationsError) {
    return { data: [], error: notificationsError }
  }

  const rows = (notifications ?? [])
    .map((row) => parseNotificationRow(row as NotificationRow))
    .filter((n) => !readIds.has(n.id))

  return {
    data: filterNotificationsByAudience(rows, profileRole),
    error: null,
  }
}

export async function markNotificationAsRead(
  profileId: string,
  notificationId: string
): Promise<{ error: PostgrestError | null }> {
  const supabase = createClient()
  const readAt = new Date().toISOString()

  const { error } = await supabase.from('notifications_reads').insert({
    profile_id: profileId,
    notifications_id: notificationId,
    read_at: readAt,
  })

  return { error }
}

export async function markAllNotificationsAsRead(
  profileId: string,
  notificationIds: string[]
): Promise<{ error: PostgrestError | null }> {
  if (notificationIds.length === 0) {
    return { error: null }
  }

  const supabase = createClient()
  const readAt = new Date().toISOString()

  const rows = notificationIds.map((notifications_id) => ({
    profile_id: profileId,
    notifications_id,
    read_at: readAt,
  }))

  const { error } = await supabase.from('notifications_reads').insert(rows)

  return { error }
}
