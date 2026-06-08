import { createClient } from '@/lib/supabase/client'
import { CreateCommentPostNotification } from '@/lib/lib-notifications'
import type {
  CommunityCommentWithProfile,
  CommunityPostType,
  CommunityPostWithRelations,
  FilterKey,
  ProfileRole,
} from '@/types'

const COMMUNITY_POSTS_BUCKET = 'community_posts'

const AUTHOR_COLORS = [
  'linear-gradient(135deg, #2ECC8A, #0D9488)',
  'linear-gradient(135deg, #3D7FFF, #8B5CF6)',
  'linear-gradient(135deg, #C9A84C, #DDA83A)',
  'linear-gradient(135deg, #FF4D6D, #C9A84C)',
  'linear-gradient(135deg, #8B5CF6, #3D7FFF)',
]

export type FeedPostType = 'aprovada' | 'dica' | 'duvida' | 'edital' | 'conquista'

export interface FeedPost {
  id: string
  type: FeedPostType
  category: FilterKey
  authorProfileId: string
  authorName: string
  authorInitial: string
  authorColor: string
  authorHeadline: string
  authorUserRole?: ProfileRole
  time: string
  content: string
  imageUrl: string | null
  videoUrl: string | null
  tags: string[]
  likes: number
  comments: number
  following?: boolean
}

export interface FeedComment {
  id: string
  authorProfileId: string
  authorName: string
  authorInitial: string
  authorColor: string
  authorHeadline: string
  authorUserRole?: ProfileRole
  time: string
  content: string
}

function getAuthorColor(seed: string) {
  const index = seed.charCodeAt(0) % AUTHOR_COLORS.length
  return AUTHOR_COLORS[index]
}

function getAuthorHeadline(role?: ProfileRole | null) {
  switch (role) {
    case 'teacher':
      return 'Professor DOM Concursos'
    case 'admin':
      return 'Moderador DOM Concursos'
    default:
      return 'Estudante DOM Concursos'
  }
}

export function formatTimeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) {
    return 'Agora'
  }

  if (diffMin < 60) {
    return `${diffMin}min atrás`
  }

  const diffHours = Math.floor(diffMin / 60)

  if (diffHours < 24) {
    return `${diffHours}h atrás`
  }

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d atrás`
}

export function mapFilterKeyToFeedPostType(type: FilterKey): FeedPostType {
  switch (type) {
    case 'Dicas':
      return 'dica'
    case 'Editais':
      return 'edital'
    case 'Dúvidas':
      return 'duvida'
    case 'Aprovação':
    default:
      return 'aprovada'
  }
}

function mapProfileToAuthor(profile: CommunityPostWithRelations['profile']) {
  const authorName = profile?.name?.trim() || 'Usuário'
  const headline = profile?.headline?.trim()

  return {
    authorName,
    authorInitial: authorName.charAt(0).toUpperCase(),
    authorColor: getAuthorColor(authorName),
    authorHeadline: headline || getAuthorHeadline(profile?.role),
    authorUserRole:
      profile?.role && profile.role !== 'student' ? profile.role : undefined,
  }
}

export function mapCommunityCommentToFeedComment(
  row: CommunityCommentWithProfile
): FeedComment {
  const author = mapProfileToAuthor(row.profile)

  return {
    id: String(row.id),
    authorProfileId: row.profile_id ?? row.profile?.id ?? '',
    ...author,
    time: formatTimeAgo(row.created_at),
    content: row.content?.trim() || '',
  }
}

function resolveCommunityMediaUrl(url: string | null | undefined) {
  if (!url) {
    return null
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  const supabase = createClient()
  const { data } = supabase.storage
    .from(COMMUNITY_POSTS_BUCKET)
    .getPublicUrl(url)

  return data.publicUrl
}

function getCommunityPostMediaStoragePath(url: string | null | undefined) {
  if (!url) {
    return null
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return url
  }

  try {
    const parsed = new URL(url)
    const marker = `/object/public/${COMMUNITY_POSTS_BUCKET}/`
    const idx = parsed.pathname.indexOf(marker)

    if (idx === -1) {
      return null
    }

    return decodeURIComponent(parsed.pathname.slice(idx + marker.length))
  } catch {
    return null
  }
}

async function deleteCommunityPostMediaFiles(
  imageUrl: string | null | undefined,
  videoUrl: string | null | undefined
) {
  const paths = [
    getCommunityPostMediaStoragePath(imageUrl),
    getCommunityPostMediaStoragePath(videoUrl),
  ].filter((path): path is string => !!path)

  if (paths.length === 0) {
    return { error: null }
  }

  const supabase = createClient()
  const { error } = await supabase.storage
    .from(COMMUNITY_POSTS_BUCKET)
    .remove(paths)

  return { error }
}

export async function UploadCommunityPostMedia(
  profileId: string,
  file: File,
  kind: 'image' | 'video'
) {
  const supabase = createClient()
  const safeName = file.name.replace(/[^\w.-]/g, '_')
  const path = `${profileId}/${kind}s/${Date.now()}-${safeName}`

  const { data, error } = await supabase.storage
    .from(COMMUNITY_POSTS_BUCKET)
    .upload(path, file, { contentType: file.type })

  if (error) {
    return { publicUrl: null, error }
  }

  const { data: urlData } = supabase.storage
    .from(COMMUNITY_POSTS_BUCKET)
    .getPublicUrl(data.path)

  return { publicUrl: urlData.publicUrl, error: null }
}

export function mapCommunityPostToFeedPost(
  row: CommunityPostWithRelations
): FeedPost {
  const author = mapProfileToAuthor(row.profile)
  const postType = row.type ? mapFilterKeyToFeedPostType(row.type) : 'aprovada'

  return {
    id: String(row.id),
    type: postType,
    category: row.type ?? 'Aprovação',
    authorProfileId: row.profile_id ?? row.profile?.id ?? '',
    ...author,
    time: formatTimeAgo(row.created_at),
    content: row.content?.trim() || '',
    imageUrl: resolveCommunityMediaUrl(row.image_url),
    videoUrl: resolveCommunityMediaUrl(row.video_url),
    tags: row.type ? [row.type] : [],
    likes: row.community_likes?.length ?? 0,
    comments: row.community_comments?.length ?? 0,
    following: false,
  }
}

export async function CreateCommunityPost(
  profileId: string,
  content: string,
  type: CommunityPostType,
  media?: {
    imageUrl?: string | null
    videoUrl?: string | null
  }
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('community_posts')
    .insert({
      profile_id: profileId,
      content: content.trim(),
      type,
      image_url: media?.imageUrl ?? null,
      video_url: media?.videoUrl ?? null,
    })
    .select(
      `
      id,
      created_at,
      profile_id,
      content,
      image_url,
      video_url,
      type,
      profile:profile_id (
        id,
        name,
        role,
        avatar_url,
        headline
      ),
      community_likes (id, profile_id),
      community_comments (id)
    `
    )
    .single()

  return {
    data: data as CommunityPostWithRelations | null,
    error,
  }
}

export async function UpdateCommunityPost(
  postId: string,
  profileId: string,
  content: string,
  type: CommunityPostType,
  media?: {
    imageUrl?: string | null
    videoUrl?: string | null
  }
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('community_posts')
    .update({
      content: content.trim(),
      type,
      ...(media
        ? {
            image_url: media.imageUrl ?? null,
            video_url: media.videoUrl ?? null,
          }
        : {}),
    })
    .eq('id', Number(postId))
    .eq('profile_id', profileId)
    .select(
      `
      id,
      created_at,
      profile_id,
      content,
      image_url,
      video_url,
      type,
      profile:profile_id (
        id,
        name,
        role,
        avatar_url,
        headline
      ),
      community_likes (id, profile_id),
      community_comments (id)
    `
    )
    .single()

  return {
    data: data as CommunityPostWithRelations | null,
    error,
  }
}

export async function DeleteCommunityPost(
  postId: string,
  profileId: string,
  options?: { isAdmin?: boolean }
) {
  const supabase = createClient()
  const numericPostId = Number(postId)
  const isAdmin = options?.isAdmin ?? false

  const { data: post, error: fetchError } = await supabase
    .from('community_posts')
    .select('id, profile_id, image_url, video_url')
    .eq('id', numericPostId)
    .single()

  if (fetchError || !post) {
    return {
      error: fetchError ?? { message: 'Publicação não encontrada.' },
    }
  }

  const isOwner = post.profile_id === profileId

  if (!isOwner && !isAdmin) {
    return {
      error: { message: 'Você não tem permissão para excluir esta publicação.' },
    }
  }

  const { error: commentsError } = await supabase
    .from('community_comments')
    .delete()
    .eq('post_id', numericPostId)

  if (commentsError) {
    return { error: commentsError }
  }

  const { error: likesError } = await supabase
    .from('community_likes')
    .delete()
    .eq('post_id', numericPostId)

  if (likesError) {
    return { error: likesError }
  }

  const { error: storageError } = await deleteCommunityPostMediaFiles(
    post.image_url,
    post.video_url
  )

  if (storageError) {
    return { error: storageError }
  }

  let deleteQuery = supabase
    .from('community_posts')
    .delete()
    .eq('id', numericPostId)

  if (!isAdmin) {
    deleteQuery = deleteQuery.eq('profile_id', profileId)
  }

  const { error: deleteError } = await deleteQuery

  return { error: deleteError }
}

export function getLikedPostIds(
  rows: CommunityPostWithRelations[],
  profileId: string
) {
  return rows
    .filter((row) =>
      row.community_likes?.some((like) => like.profile_id === profileId)
    )
    .map((row) => String(row.id))
}

export async function CreateCommunityLike(profileId: string, postId: string) {
  const supabase = createClient()
  const { error } = await supabase.from('community_likes').insert({
    profile_id: profileId,
    post_id: Number(postId),
  })

  return { error }
}

export async function DeleteCommunityLike(profileId: string, postId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('community_likes')
    .delete()
    .eq('profile_id', profileId)
    .eq('post_id', Number(postId))

  return { error }
}

export async function GetCommunityPosts() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('community_posts')
    .select(
      `
      id,
      created_at,
      profile_id,
      content,
      image_url,
      video_url,
      type,
      profile:profile_id (
        id,
        name,
        role,
        avatar_url,
        headline
      ),
      community_likes (id, profile_id),
      community_comments (id)
    `
    )
    .order('created_at', { ascending: false })

  return {
    data: (data as CommunityPostWithRelations[] | null) ?? [],
    error,
  }
}

export async function GetCommunityComments(postId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('community_comments')
    .select(
      `
      id,
      created_at,
      profile_id,
      content,
      post_id,
      profile:profile_id (
        id,
        name,
        role,
        avatar_url,
        headline
      )
    `
    )
    .eq('post_id', Number(postId))
    .order('created_at', { ascending: true })

  return {
    data: (data as CommunityCommentWithProfile[] | null) ?? [],
    error,
  }
}

export async function CreateCommunityComment(
  profileId: string,
  postId: string,
  content: string
) {
  const supabase = createClient()
  const numericPostId = Number(postId)

  const { data: post, error: postError } = await supabase
    .from('community_posts')
    .select('profile_id')
    .eq('id', numericPostId)
    .single()

  if (postError || !post) {
    return {
      data: null,
      error: postError ?? { message: 'Publicação não encontrada.' },
    }
  }

  const { data, error } = await supabase
    .from('community_comments')
    .insert({
      profile_id: profileId,
      post_id: numericPostId,
      content: content.trim(),
    })
    .select(
      `
      id,
      created_at,
      profile_id,
      content,
      post_id,
      profile:profile_id (
        id,
        name,
        role,
        avatar_url,
        headline
      )
    `
    )
    .single()

  if (error || !data) {
    return {
      data: data as CommunityCommentWithProfile | null,
      error,
    }
  }

  const postOwnerId = post.profile_id

  const commentRow = data as unknown as CommunityCommentWithProfile

  if (postOwnerId && postOwnerId !== profileId) {
    const commenterName =
      commentRow.profile?.name?.trim() || 'Alguém'

    await CreateCommentPostNotification(postOwnerId, commenterName)
  }

  return {
    data: commentRow,
    error: null,
  }
}

export async function UpdateCommunityComment(
  commentId: string,
  profileId: string,
  content: string
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('community_comments')
    .update({
      content: content.trim(),
    })
    .eq('id', Number(commentId))
    .eq('profile_id', profileId)
    .select(
      `
      id,
      created_at,
      profile_id,
      content,
      post_id,
      profile:profile_id (
        id,
        name,
        role,
        avatar_url,
        headline
      )
    `
    )
    .single()

  return {
    data: data as CommunityCommentWithProfile | null,
    error,
  }
}

export async function DeleteCommunityComment(
  commentId: string,
  profileId: string,
  options?: { isAdmin?: boolean }
) {
  const supabase = createClient()
  const numericCommentId = Number(commentId)
  const isAdmin = options?.isAdmin ?? false

  const { data: comment, error: fetchError } = await supabase
    .from('community_comments')
    .select('id, profile_id, post_id')
    .eq('id', numericCommentId)
    .single()

  if (fetchError || !comment) {
    return {
      error: fetchError ?? { message: 'Comentário não encontrado.' },
    }
  }

  const isOwner = comment.profile_id === profileId

  if (!isOwner && !isAdmin) {
    return {
      error: { message: 'Você não tem permissão para excluir este comentário.' },
    }
  }

  let deleteQuery = supabase
    .from('community_comments')
    .delete()
    .eq('id', numericCommentId)

  if (!isAdmin) {
    deleteQuery = deleteQuery.eq('profile_id', profileId)
  }

  const { error } = await deleteQuery

  return { error }
}
