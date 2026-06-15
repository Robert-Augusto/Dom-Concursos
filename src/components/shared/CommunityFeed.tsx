'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { LayoutGrid, Pencil, Plus, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

import CommunityPost from '@/components/shared/CommunityPost'
import CreatePostModal from '@/components/shared/CreatePostModal'
import { useProfile } from '@/context/ProfileContext'
import { createClient } from '@/lib/supabase/client'
import {
  CreateCommunityLike,
  DeleteCommunityLike,
  GetCommunityPosts,
  getLikedPostIds,
  mapCommunityPostToFeedPost,
  type FeedPost,
} from '@/lib/lib-community-posts'
import { FilterKey, filters } from '@/types'

export type UserRole = 'student' | 'teacher' | 'admin'
export type Post = FeedPost
type FeedFilterKey = FilterKey | 'Todos'

export default function CommunityFeed() {
  const { profile } = useProfile()
  const [activeFilter, setActiveFilter] = useState<FeedFilterKey>('Todos')
  const [posts, setPosts] = useState<Post[]>([])
  const [likedPosts, setLikedPosts] = useState<string[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const getFilterForPost = useCallback((post: Post): FilterKey => {
    switch (post.type) {
      case 'dica':
        return 'Dicas'
      case 'edital':
        return 'Editais'
      case 'duvida':
        return 'Dúvidas'
      case 'aprovada':
      case 'conquista':
      default:
        return 'Aprovação'
    }
  }, [])

  const loadPosts = useCallback(async (silent = false) => {
    if (!silent) {
      setIsLoading(true)
    }

    const { data, error } = await GetCommunityPosts()

    if (error) {
      if (!silent) {
        toast.error(error.message)
      }
      setPosts([])
      if (!silent) {
        setIsLoading(false)
      }
      return
    }

    setPosts(data.map(mapCommunityPostToFeedPost))

    if (profile?.id) {
      setLikedPosts(getLikedPostIds(data, profile.id))
    }

    if (!silent) {
      setIsLoading(false)
    }
  }, [profile?.id])

  useEffect(() => {
    let cancelled = false

    void loadPosts()

    const supabase = createClient()
    const channel = supabase
      .channel('community_feed')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'community_posts' },
        () => {
          if (!cancelled) {
            void loadPosts(true)
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'community_likes' },
        () => {
          if (!cancelled) {
            void loadPosts(true)
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'community_comments' },
        () => {
          if (!cancelled) {
            void loadPosts(true)
          }
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' && !cancelled) {
          void loadPosts(true)
        }
      })

    return () => {
      cancelled = true
      void supabase.removeChannel(channel)
    }
  }, [loadPosts])

  const handlePostCreated = useCallback(
    (post: Post) => {
      setPosts((prevPosts) => {
        const alreadyExists = prevPosts.some(
          (existingPost) => existingPost.id === post.id
        )

        if (alreadyExists) {
          return prevPosts
        }

        return [post, ...prevPosts]
      })
      setActiveFilter(getFilterForPost(post))
      void loadPosts(true)
    },
    [getFilterForPost, loadPosts]
  )

  const handlePostUpdated = useCallback(
    (post: Post) => {
      setPosts((prevPosts) =>
        prevPosts.map((existingPost) =>
          existingPost.id === post.id ? post : existingPost
        )
      )
      setActiveFilter(getFilterForPost(post))
      void loadPosts(true)
    },
    [getFilterForPost, loadPosts]
  )

  const handlePostDeleted = useCallback((postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.filter((existingPost) => existingPost.id !== postId)
    )
    setLikedPosts((prevLiked) => prevLiked.filter((id) => id !== postId))
    setEditingPost((current) => (current?.id === postId ? null : current))
  }, [])

  const handleCommentCreated = useCallback((postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? { ...post, comments: post.comments + 1 }
          : post
      )
    )
  }, [])

  const handleCommentDeleted = useCallback((postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? { ...post, comments: Math.max(post.comments - 1, 0) }
          : post
      )
    )
  }, [])

  const handleLike = async (id: string) => {
    if (!profile?.id) {
      toast.error('Faça login para curtir.')
      return
    }

    const isLiked = likedPosts.includes(id)

    setLikedPosts((prev) =>
      isLiked ? prev.filter((likedId) => likedId !== id) : [...prev, id]
    )

    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id !== id) {
          return post
        }

        return {
          ...post,
          likes: Math.max(post.likes + (isLiked ? -1 : 1), 0),
        }
      })
    )

    const { error } = isLiked
      ? await DeleteCommunityLike(profile.id, id)
      : await CreateCommunityLike(profile.id, id)

    if (error) {
      toast.error(error.message)

      setLikedPosts((prev) =>
        isLiked ? [...prev, id] : prev.filter((likedId) => likedId !== id)
      )

      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id !== id) {
            return post
          }

          return {
            ...post,
            likes: Math.max(post.likes + (isLiked ? 1 : -1), 0),
          }
        })
      )
    }
  }

  const filteredPosts = useMemo(() => {
    switch (activeFilter) {
      case 'Todos':
        return posts
      case 'Dicas':
        return posts.filter((post) => post.type === 'dica')
      case 'Editais':
        return posts.filter((post) => post.type === 'edital')
      case 'Dúvidas':
        return posts.filter((post) => post.type === 'duvida')
      case 'Aprovação':
        return posts.filter(
          (post) => post.type === 'aprovada' || post.type === 'conquista'
        )
      default:
        return posts
    }
  }, [activeFilter, posts])

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-card rounded-2xl border border-border p-5">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="relative w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center bg-muted border border-border">
              <Pencil className="h-5 w-5 text-primary" />
              <Sparkles className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 text-primary" />
            </div>

            <div className="flex flex-col gap-1 min-w-0">
              <h2 className="text-sm font-black text-foreground">
                Criar uma publicação
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Compartilhe dúvidas, dicas, materiais, conquistas ou oportunidades.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full md:w-auto md:flex-shrink-0 flex items-center justify-center gap-2 px-6 py-3 rounded-full md:rounded-xl text-sm font-black bg-primary text-primary-foreground transition-opacity hover:opacity-90 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Criar publicação</span>
          </button>
        </div>
      </div>

      <CreatePostModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onPostCreated={handlePostCreated}
      />

      <CreatePostModal
        open={!!editingPost}
        onOpenChange={(open) => {
          if (!open) {
            setEditingPost(null)
          }
        }}
        editingPost={editingPost}
        onPostUpdated={handlePostUpdated}
      />

      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        <button
          type="button"
          onClick={() => setActiveFilter('Todos')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border flex-shrink-0 ${
            activeFilter === 'Todos'
              ? 'bg-accent text-primary-foregroud'
              : 'bg-card text-muted-foreground border-foreground/25 hover:border-accent/40 hover:text-foreground'
          }`}
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          <span>Todos</span>
        </button>

        {filters.map((filter) => {
          const isActive = activeFilter === filter.label
          const Icon = filter.icon

          return (
            <button
              key={filter.label}
              type="button"
              onClick={() => setActiveFilter(filter.label)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border flex-shrink-0 ${
                isActive
                  ? 'bg-accent text-primary-foreground'
                  : 'bg-card text-muted-foreground border-foreground/25 hover:border-accent/40 hover:text-foreground'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{filter.label}</span>
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-4">
        {isLoading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Carregando publicações...
          </p>
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <CommunityPost
              key={post.id}
              post={post}
              isLiked={likedPosts.includes(post.id)}
              onLike={handleLike}
              onCommentCreated={handleCommentCreated}
              onCommentDeleted={handleCommentDeleted}
              onEdit={setEditingPost}
              onDelete={handlePostDeleted}
            />
          ))
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhuma publicação encontrada nesta categoria.
          </p>
        )}
      </div>
    </div>
  )
}
