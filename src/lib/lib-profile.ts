import { createClient } from '@/lib/supabase/client'

export const MAX_HEADLINE_LENGTH = 120

export async function UpdateProfileAvatar(avatarUrl: string | null) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: { message: 'Usuário não autenticado.' } }
  }

  const { error } = await supabase
    .from('profile')
    .update({ avatar_url: avatarUrl })
    .eq('id', user.id)

  return { error }
}

export async function UpdateProfileNameAndHeadline(
  name: string,
  headline: string,
) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: { message: 'Usuário não autenticado.' } }
  }

  const trimmedName = name.trim()
  if (!trimmedName) {
    return { error: { message: 'Informe um nome válido.' } }
  }

  const trimmedHeadline = headline.trim()
  if (trimmedHeadline.length > MAX_HEADLINE_LENGTH) {
    return {
      error: {
        message: `A descrição deve ter no máximo ${MAX_HEADLINE_LENGTH} caracteres.`,
      },
    }
  }

  const { error } = await supabase
    .from('profile')
    .update({
      name: trimmedName,
      headline: trimmedHeadline || null,
    })
    .eq('id', user.id)

  return { error }
}
