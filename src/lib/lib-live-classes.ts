import { createClient } from './supabase/client'
import type { LiveClasses, LiveClassesStatus } from '@/types'

export async function CreateLiveClass(
  title: string,
  scheduledAt: string,
  videoUrl: string,
  thumbnailUrl: string | null,
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('live_classes')
    .insert({
      title: title.trim(),
      scheduled_at: scheduledAt,
      video_url: videoUrl.trim(),
      thumbnail_url: thumbnailUrl,
      status: 'scheduled',
    })
    .select('id')
    .single()

  return { data, error }
}

export async function GetLiveClasses() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('live_classes')
    .select('*')
    .order('scheduled_at', { ascending: true })

  return { data: (data as LiveClasses[] | null) ?? null, error }
}

export async function GetScheduledLiveClasses() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('live_classes')
    .select('*')
    .eq('status', 'scheduled')
    .order('scheduled_at', { ascending: true })

  return { data: (data as LiveClasses[] | null) ?? null, error }
}

export async function UpdateLiveClass(
  id: string,
  title: string,
  scheduledAt: string,
  videoUrl: string,
  thumbnailUrl: string | null,
) {
  const supabase = createClient()
  const { error } = await supabase
    .from('live_classes')
    .update({
      title: title.trim(),
      scheduled_at: scheduledAt,
      video_url: videoUrl.trim(),
      thumbnail_url: thumbnailUrl,
    })
    .eq('id', id)

  return { error }
}

export async function UpdateLiveClassStatus(
  id: string,
  status: LiveClassesStatus,
) {
  const supabase = createClient()
  const { error } = await supabase
    .from('live_classes')
    .update({ status })
    .eq('id', id)

  return { error }
}

export async function DeleteLiveClass(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('live_classes').delete().eq('id', id)

  return { error }
}
