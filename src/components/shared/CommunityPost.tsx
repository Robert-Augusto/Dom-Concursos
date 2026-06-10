'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  CheckCircle,
  FileText,
  Hash,
  Heart,
  HelpCircle,
  Lightbulb,
  MessageCircle,
  MoreVertical,
  Pencil,
  Share2,
  Trash2,
  Trophy,
  type LucideIcon,
} from 'lucide-react'

import type { Post, UserRole } from '@/components/shared/CommunityFeed'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { useProfile } from '@/context/ProfileContext'
import {
  CreateCommunityComment,
  DeleteCommunityComment,
  DeleteCommunityPost,
  GetCommunityComments,
  mapCommunityCommentToFeedComment,
  UpdateCommunityComment,
  type FeedComment,
} from '@/lib/lib-community-posts'
import { createClient } from '@/lib/supabase/client'

interface CommunityUserInfoProps {
  name: string
  initial: string
  color: string
  avatarUrl?: string | null
  headline: string
  time: string
  userRole?: UserRole
  size?: 'sm' | 'md'
}

function UserRoleBadge({ role }: { role: 'teacher' | 'admin' }) {
  if (role === 'admin') {
    return (
      <span className="rounded-full bg-chart-5 px-2 py-0.5 text-[10px] font-black text-white">
        Admin
      </span>
    )
  }

  return (
    <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-black text-primary-foreground">
      Professor
    </span>
  )
}

function CommunityUserInfo({
  name,
  initial,
  color,
  avatarUrl,
  headline,
  time,
  userRole,
  size = 'md',
}: CommunityUserInfoProps) {
  const avatarSizeClass =
    size === 'md' ? 'h-10 w-10 text-sm' : 'h-8 w-8 text-xs'
  const nameSizeClass = size === 'md' ? 'text-sm' : 'text-xs'
  const imageSizes = size === 'md' ? '40px' : '32px'

  return (
    <div className="flex min-w-0 items-start gap-3">
      <div
        className={`${avatarSizeClass} relative flex shrink-0 items-center justify-center overflow-hidden rounded-full font-black text-white`}
        style={avatarUrl ? undefined : { background: color }}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={name ? `Foto de ${name}` : 'Foto de perfil'}
            fill
            className="object-cover"
            sizes={imageSizes}
          />
        ) : (
          initial
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-0.5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className={`${nameSizeClass} font-black text-foreground`}>{name}</p>
          {userRole === 'admin' || userRole === 'teacher' ? (
            <UserRoleBadge role={userRole} />
          ) : null}
          <p className="text-xs text-muted-foreground">{time}</p>
        </div>
        <p className="text-xs leading-snug text-muted-foreground">{headline}</p>
      </div>
    </div>
  )
}

interface KebabMenuItem {
  label: string
  icon: LucideIcon
  onClick: () => void
  variant?: 'default' | 'destructive'
}

interface CommunityKebabMenuProps {
  items: KebabMenuItem[]
  size?: 'sm' | 'md'
  ariaLabel?: string
}

function CommunityKebabMenu({
  items,
  size = 'md',
  ariaLabel = 'Abrir menu',
}: CommunityKebabMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  if (items.length === 0) {
    return null
  }

  const buttonSize = size === 'sm' ? 'h-7 w-7' : 'h-8 w-8'
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex ${buttonSize} items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-accent/40 hover:bg-muted/40 hover:text-foreground`}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <MoreVertical className={iconSize} />
      </button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-1 min-w-[9.5rem] overflow-hidden rounded-xl border border-border bg-popover py-1 shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
        >
          {items.map((item) => {
            const Icon = item.icon

            return (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsOpen(false)
                  item.onClick()
                }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold transition-colors hover:bg-muted/60 ${
                  item.variant === 'destructive'
                    ? 'text-destructive'
                    : 'text-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

interface CommunityPostProps {
  post: Post
  isLiked: boolean
  onLike: (id: string) => void
  onCommentCreated?: (postId: string) => void
  onCommentDeleted?: (postId: string) => void
  onEdit?: (post: Post) => void
  onDelete?: (postId: string) => void
}

type DeleteTarget =
  | { kind: 'post' }
  | { kind: 'comment'; comment: FeedComment }

const typeConfig = {
  aprovada: {
    label: 'Aprovada',
    icon: CheckCircle,
    className: 'bg-chart-2/20 text-chart-2',
  },
  dica: {
    label: 'Dica',
    icon: Lightbulb,
    className: 'bg-primary/20 text-primary',
  },
  duvida: {
    label: 'Duvida',
    icon: HelpCircle,
    className: 'bg-chart-5/20 text-chart-5',
  },
  edital: {
    label: 'Edital',
    icon: FileText,
    className: 'bg-accent/20 text-accent',
  },
  conquista: {
    label: 'Conquista',
    icon: Trophy,
    className: 'bg-orange-500/20 text-orange-400',
  },
} as const

const CONTENT_COLLAPSE_THRESHOLD = 220

export default function CommunityPost({
  post,
  isLiked,
  onLike,
  onCommentCreated,
  onCommentDeleted,
  onEdit,
  onDelete,
}: CommunityPostProps) {
  const { profile, loading: profileLoading } = useProfile()
  const isOwner = profile?.id === post.authorProfileId
  const isAdmin = profile?.role === 'admin'
  const canDelete = isOwner || isAdmin
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)
  const [comments, setComments] = useState<FeedComment[]>([])
  const [newCommentText, setNewCommentText] = useState('')
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [isPostingComment, setIsPostingComment] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingCommentText, setEditingCommentText] = useState('')
  const [isSavingComment, setIsSavingComment] = useState(false)
  const [isPostExpanded, setIsPostExpanded] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const hasMedia = !!(post.imageUrl || post.videoUrl)
  const isLongContent = post.content.length > CONTENT_COLLAPSE_THRESHOLD
  const shouldCollapsePost = isLongContent || hasMedia

  const currentType = typeConfig[post.type]
  const TypeIcon = currentType.icon

  const loadComments = useCallback(async () => {
    const { data, error } = await GetCommunityComments(post.id)

    if (error) {
      toast.error(error.message)
      return
    }

    setComments(data.map(mapCommunityCommentToFeedComment))
  }, [post.id])

  useEffect(() => {
    if (!isCommentsOpen) {
      return
    }

    let cancelled = false

    async function fetchComments() {
      setIsLoadingComments(true)
      const { data, error } = await GetCommunityComments(post.id)

      if (cancelled) {
        return
      }

      if (error) {
        toast.error(error.message)
        setComments([])
      } else {
        setComments(data.map(mapCommunityCommentToFeedComment))
      }

      setIsLoadingComments(false)
    }

    void fetchComments()

    const supabase = createClient()
    const channel = supabase
      .channel(`community_comments_${post.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'community_comments',
          filter: `post_id=eq.${post.id}`,
        },
        () => {
          if (!cancelled) {
            void loadComments()
          }
        }
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [isCommentsOpen, post.id, loadComments])

  useEffect(() => {
    setIsPostExpanded(false)
  }, [post.id, post.content, post.imageUrl, post.videoUrl])

  const handleStartEditComment = (comment: FeedComment) => {
    setEditingCommentId(comment.id)
    setEditingCommentText(comment.content)
  }

  const handleCancelEditComment = () => {
    setEditingCommentId(null)
    setEditingCommentText('')
  }

  const handleSaveComment = async (commentId: string) => {
    const trimmedComment = editingCommentText.trim()

    if (!trimmedComment) {
      toast.error('Escreva algo antes de salvar.')
      return
    }

    if (profileLoading) {
      return
    }

    if (!profile?.id) {
      toast.error('Faça login para editar o comentário.')
      return
    }

    setIsSavingComment(true)

    try {
      const { data, error } = await UpdateCommunityComment(
        commentId,
        profile.id,
        trimmedComment
      )

      if (error || !data) {
        toast.error(error?.message ?? 'Erro ao salvar comentário.')
        return
      }

      const updatedComment = mapCommunityCommentToFeedComment(data)

      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId ? updatedComment : comment
        )
      )
      handleCancelEditComment()
      toast.success('Comentário atualizado!')
    } finally {
      setIsSavingComment(false)
    }
  }

  const handlePostComment = async () => {
    const trimmedComment = newCommentText.trim()
    if (!trimmedComment) {
      return
    }

    if (profileLoading) {
      return
    }

    if (!profile?.id) {
      toast.error('Faça login para comentar.')
      return
    }

    setIsPostingComment(true)

    try {
      const { data, error } = await CreateCommunityComment(
        profile.id,
        post.id,
        trimmedComment
      )

      if (error || !data) {
        toast.error(error?.message ?? 'Erro ao publicar comentário.')
        return
      }

      const newComment = mapCommunityCommentToFeedComment(data)

      setComments((prevComments) => {
        const alreadyExists = prevComments.some(
          (comment) => comment.id === newComment.id
        )

        if (alreadyExists) {
          return prevComments
        }

        return [...prevComments, newComment]
      })
      setNewCommentText('')
      onCommentCreated?.(post.id)
      toast.success('Comentário publicado!')
    } finally {
      setIsPostingComment(false)
    }
  }

  const handleDeletePost = async () => {
    if (profileLoading) {
      return
    }

    if (!profile?.id) {
      toast.error('Faça login para excluir a publicação.')
      return
    }

    if (!canDelete) {
      toast.error('Você não tem permissão para excluir esta publicação.')
      return
    }

    setIsDeleting(true)

    try {
      const { error } = await DeleteCommunityPost(post.id, profile.id, {
        isAdmin,
      })

      if (error) {
        toast.error(error.message ?? 'Erro ao excluir a publicação.')
        return
      }

      toast.success('Publicação excluída com sucesso!')
      setDeleteTarget(null)
      onDelete?.(post.id)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteComment = async (comment: FeedComment) => {
    if (profileLoading) {
      return
    }

    if (!profile?.id) {
      toast.error('Faça login para excluir o comentário.')
      return
    }

    const isCommentOwner = profile.id === comment.authorProfileId

    if (!isCommentOwner && !isAdmin) {
      toast.error('Você não tem permissão para excluir este comentário.')
      return
    }

    setIsDeleting(true)

    try {
      const { error } = await DeleteCommunityComment(comment.id, profile.id, {
        isAdmin,
      })

      if (error) {
        toast.error(error.message ?? 'Erro ao excluir o comentário.')
        return
      }

      setComments((prevComments) =>
        prevComments.filter((item) => item.id !== comment.id)
      )

      if (editingCommentId === comment.id) {
        handleCancelEditComment()
      }

      toast.success('Comentário excluído com sucesso!')
      setDeleteTarget(null)
      onCommentDeleted?.(post.id)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) {
      return
    }

    if (deleteTarget.kind === 'post') {
      await handleDeletePost()
      return
    }

    await handleDeleteComment(deleteTarget.comment)
  }

  return (
    <>
    <div className="bg-card rounded-2xl border border-border overflow-hidden hover:border-border/80 transition-colors">
      <div className="flex flex-col gap-2.5 p-3 sm:gap-3 sm:p-4">
        <div className="relative">
          <div className={`min-w-0 ${isOwner || canDelete ? 'pr-10' : ''}`}>
            <CommunityUserInfo
              name={post.authorName}
              initial={post.authorInitial}
              color={post.authorColor}
              avatarUrl={post.authorAvatarUrl}
              headline={post.authorHeadline}
              time={post.time}
              userRole={post.authorUserRole}
            />
          </div>

          {isOwner || canDelete ? (
            <div className="absolute top-0 right-0">
              <CommunityKebabMenu
                ariaLabel="Opções da publicação"
                items={[
                  ...(isOwner
                    ? [
                        {
                          label: 'Editar',
                          icon: Pencil,
                          onClick: () => onEdit?.(post),
                        },
                      ]
                    : []),
                  ...(canDelete
                    ? [
                        {
                          label: 'Excluir',
                          icon: Trash2,
                          variant: 'destructive' as const,
                          onClick: () => setDeleteTarget({ kind: 'post' }),
                        },
                      ]
                    : []),
                ]}
              />
            </div>
          ) : null}

          <div className="mt-2.5">
            <div
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${currentType.className}`}
            >
              <TypeIcon className="h-3 w-3 shrink-0" />
              <span>{currentType.label}</span>
            </div>
          </div>
        </div>

        <div>
          <p
            className={`text-sm leading-relaxed text-foreground ${
              isLongContent && shouldCollapsePost && !isPostExpanded
                ? 'line-clamp-4'
                : ''
            }`}
          >
            {post.content}
          </p>

          {shouldCollapsePost && !isPostExpanded && hasMedia ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {post.imageUrl && post.videoUrl
                ? 'Contém foto e vídeo'
                : post.imageUrl
                  ? 'Contém foto'
                  : 'Contém vídeo'}
            </p>
          ) : null}

          {(!shouldCollapsePost || isPostExpanded) && hasMedia ? (
            <div className="mt-2 flex flex-col gap-2">
              {post.imageUrl ? (
                <div className="overflow-hidden rounded-xl border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.imageUrl}
                    alt="Imagem da publicação"
                    className="block h-auto w-full"
                  />
                </div>
              ) : null}

              {post.videoUrl ? (
                <div className="overflow-hidden rounded-xl border border-border bg-black">
                  <video
                    src={post.videoUrl}
                    controls
                    className="max-h-80 w-full object-contain"
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          {shouldCollapsePost ? (
            <button
              type="button"
              onClick={() => setIsPostExpanded((prev) => !prev)}
              className="mt-1 text-base font-bold text-accent transition-colors hover:text-accent/80"
            >
              {isPostExpanded ? 'Ver menos' : 'Ver mais'}
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-border border-t border-border">
        <button
          type="button"
          className={`flex min-w-0 flex-col items-center justify-center gap-0.5 px-1 py-2.5 text-[10px] font-semibold transition-colors hover:bg-muted/30 sm:flex-row sm:gap-1.5 sm:py-3 sm:text-xs ${
            isLiked ? 'text-destructive' : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => onLike(post.id)}
        >
          <Heart
            className={`h-4 w-4 shrink-0 ${isLiked ? 'fill-destructive text-destructive' : ''}`}
          />
          <span className="truncate sm:hidden">{post.likes}</span>
          <span className="hidden truncate sm:inline">{post.likes} Curtidas</span>
        </button>

        <button
          type="button"
          onClick={() => setIsCommentsOpen((prev) => !prev)}
          className={`flex min-w-0 flex-col items-center justify-center gap-0.5 px-1 py-2.5 text-[10px] font-semibold transition-colors hover:bg-muted/30 sm:flex-row sm:gap-1.5 sm:py-3 sm:text-xs ${
            isCommentsOpen
              ? 'text-accent'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <MessageCircle className="h-4 w-4 shrink-0" />
          <span className="truncate sm:hidden">{post.comments}</span>
          <span className="hidden truncate sm:inline">
            {post.comments} Comentários
          </span>
        </button>

        <button
          type="button"
          onClick={() =>
            toast.info('Compartilhar estará disponível em breve.')
          }
          className="flex min-w-0 flex-col items-center justify-center gap-0.5 px-1 py-2.5 text-[10px] font-semibold text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground sm:flex-row sm:gap-1.5 sm:py-3 sm:text-xs"
          aria-label="Compartilhar"
        >
          <Share2 className="h-4 w-4 shrink-0" />
          <span className="hidden truncate sm:inline">Compartilhar</span>
        </button>
      </div>

      {isCommentsOpen ? (
        <div className="flex flex-col gap-4 border-t border-border bg-muted/20 p-3 sm:p-4">
          <div className="flex flex-col gap-3">
            {isLoadingComments ? (
              <p className="text-xs text-muted-foreground text-center py-2">
                Carregando comentários...
              </p>
            ) : comments.length > 0 ? (
              comments.map((comment) => {
                const isCommentOwner = profile?.id === comment.authorProfileId
                const isEditingComment = editingCommentId === comment.id
                const canDeleteComment = isCommentOwner || isAdmin

                return (
                  <div key={comment.id} className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <CommunityUserInfo
                        name={comment.authorName}
                        initial={comment.authorInitial}
                        color={comment.authorColor}
                        avatarUrl={comment.authorAvatarUrl}
                        headline={comment.authorHeadline}
                        time={comment.time}
                        userRole={comment.authorUserRole}
                        size="sm"
                      />

                      {!isEditingComment && (isCommentOwner || canDeleteComment) ? (
                        <CommunityKebabMenu
                          size="sm"
                          ariaLabel="Opções do comentário"
                          items={[
                            ...(isCommentOwner
                              ? [
                                  {
                                    label: 'Editar',
                                    icon: Pencil,
                                    onClick: () => handleStartEditComment(comment),
                                  },
                                ]
                              : []),
                            ...(canDeleteComment
                              ? [
                                  {
                                    label: 'Excluir',
                                    icon: Trash2,
                                    variant: 'destructive' as const,
                                    onClick: () =>
                                      setDeleteTarget({
                                        kind: 'comment',
                                        comment,
                                      }),
                                  },
                                ]
                              : []),
                          ]}
                        />
                      ) : null}
                    </div>

                    {isEditingComment ? (
                      <div className="flex flex-col gap-2 pl-0 sm:pl-11">
                        <textarea
                          value={editingCommentText}
                          onChange={(event) =>
                            setEditingCommentText(event.target.value)
                          }
                          rows={3}
                          className="w-full min-w-0 resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-accent/50"
                        />

                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={handleCancelEditComment}
                            disabled={isSavingComment}
                            className="rounded-xl px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                          >
                            Cancelar
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSaveComment(comment.id)}
                            disabled={
                              !editingCommentText.trim() ||
                              isSavingComment ||
                              profileLoading
                            }
                            className="rounded-xl bg-accent px-4 py-2 text-xs font-black text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isSavingComment ? 'Salvando...' : 'Salvar'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="pl-0 text-sm leading-relaxed text-foreground sm:pl-11">
                        {comment.content}
                      </p>
                    )}
                  </div>
                )
              })
            ) : (
              <p className="text-xs text-muted-foreground text-center py-2">
                Nenhum comentário ainda. Seja o primeiro a comentar!
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 border-t border-border pt-4">
            <textarea
              value={newCommentText}
              onChange={(event) => setNewCommentText(event.target.value)}
              placeholder="Escreva um comentário..."
              rows={3}
              className="w-full min-w-0 resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-accent/50"
            />

            <button
              type="button"
              onClick={handlePostComment}
              disabled={!newCommentText.trim() || isPostingComment || profileLoading}
              className="self-end rounded-xl bg-accent px-5 py-2 text-xs font-black text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPostingComment ? 'Enviando...' : 'Comentar'}
            </button>
          </div>
        </div>
      ) : null}
    </div>

    <Dialog
      open={deleteTarget !== null}
      onOpenChange={(open) => {
        if (!open && !isDeleting) {
          setDeleteTarget(null)
        }
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="max-w-sm gap-4 border-border bg-card p-5"
      >
        <div className="flex flex-col gap-2">
          <DialogTitle className="text-base font-black text-foreground">
            {deleteTarget?.kind === 'comment'
              ? 'Excluir comentário?'
              : 'Excluir publicação?'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {deleteTarget?.kind === 'comment'
              ? isAdmin &&
                deleteTarget.comment.authorProfileId !== profile?.id
                ? 'Esta ação remove o comentário permanentemente.'
                : 'Esta ação remove seu comentário permanentemente.'
              : isAdmin && !isOwner
                ? 'Esta ação remove a publicação, comentários, curtidas e arquivos anexados permanentemente.'
                : 'Esta ação remove sua publicação, comentários, curtidas e arquivos anexados permanentemente.'}
          </DialogDescription>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => setDeleteTarget(null)}
            disabled={isDeleting}
            className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmDelete}
            disabled={isDeleting || profileLoading}
            className="rounded-xl bg-destructive px-4 py-2.5 text-sm font-black text-destructive-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}
