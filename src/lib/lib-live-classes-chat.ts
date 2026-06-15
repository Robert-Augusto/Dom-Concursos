import { createClient } from './supabase/client'
import type {
  LiveClassChatMessage,
  LiveClassChatProfile,
  LiveClassChatWithProfile,
} from '@/types'

const AUTHOR_COLORS = [
  'linear-gradient(135deg, #2ECC8A, #0D9488)',
  'linear-gradient(135deg, #3D7FFF, #8B5CF6)',
  'linear-gradient(135deg, #C9A84C, #DDA83A)',
  'linear-gradient(135deg, #FF4D6D, #C9A84C)',
  'linear-gradient(135deg, #8B5CF6, #3D7FFF)',
]

const CHAT_SELECT = `
  id,
  created_at,
  live_classes_id,
  profile_id,
  message,
  profile:profile_id (
    id,
    name,
    avatar_url,
    role
  )
`

function getAuthorColor(seed: string) {
  const index = seed.charCodeAt(0) % AUTHOR_COLORS.length
  return AUTHOR_COLORS[index]
}

function resolveProfile(
  profile: LiveClassChatWithProfile['profile'],
): LiveClassChatProfile | null {
  if (!profile) return null
  if (Array.isArray(profile)) return profile[0] ?? null
  return profile
}

export function formatChatMessageTime(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60_000)

  if (diffMin < 1) return 'Agora'

  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function mapLiveClassChatToMessage(
  row: LiveClassChatWithProfile,
): LiveClassChatMessage {
  const profile = resolveProfile(row.profile)
  const authorName = profile?.name?.trim() || 'Usuário'

  return {
    id: String(row.id),
    liveClassId: String(row.live_classes_id ?? ''),
    profileId: row.profile_id ?? profile?.id ?? '',
    message: row.message?.trim() || '',
    createdAt: row.created_at,
    timeLabel: formatChatMessageTime(row.created_at),
    authorName,
    authorInitial: authorName.charAt(0).toUpperCase(),
    authorColor: getAuthorColor(authorName),
    authorAvatarUrl: profile?.avatar_url?.trim() || null,
  }
}

export async function GetLiveClassChatMessages(liveClassId: string) {
  const supabase = createClient()
  const numericLiveClassId = Number(liveClassId)

  const { data, error } = await supabase
    .from('live_classes_chat')
    .select(CHAT_SELECT)
    .eq('live_classes_id', numericLiveClassId)
    .order('created_at', { ascending: true })

  return {
    data:
      (data as LiveClassChatWithProfile[] | null)?.map(
        mapLiveClassChatToMessage,
      ) ?? [],
    error,
  }
}

export async function CreateLiveClassChatMessage(
  liveClassId: string,
  profileId: string,
  message: string,
) {
  const trimmed = message.trim()

  if (!trimmed) {
    return {
      data: null,
      error: { message: 'Digite uma mensagem antes de enviar.' },
    }
  }

  const supabase = createClient()
  const numericLiveClassId = Number(liveClassId)

  const { data, error } = await supabase
    .from('live_classes_chat')
    .insert({
      live_classes_id: numericLiveClassId,
      profile_id: profileId,
      message: trimmed,
    })
    .select(CHAT_SELECT)
    .single()

  if (error || !data) {
    return {
      data: null,
      error: error ?? { message: 'Não foi possível enviar a mensagem.' },
    }
  }

  return {
    data: mapLiveClassChatToMessage(data as LiveClassChatWithProfile),
    error: null,
  }
}

export async function DeleteLiveClassChatMessage(
  messageId: string,
  profileId: string,
) {
  const supabase = createClient()
  const numericMessageId = Number(messageId)

  const { data: row, error: fetchError } = await supabase
    .from('live_classes_chat')
    .select('id, profile_id')
    .eq('id', numericMessageId)
    .single()

  if (fetchError || !row) {
    return {
      error: fetchError ?? { message: 'Mensagem não encontrada.' },
    }
  }

  if (row.profile_id !== profileId) {
    return {
      error: { message: 'Você só pode excluir suas próprias mensagens.' },
    }
  }

  const { error } = await supabase
    .from('live_classes_chat')
    .delete()
    .eq('id', numericMessageId)
    .eq('profile_id', profileId)

  return { error }
}
