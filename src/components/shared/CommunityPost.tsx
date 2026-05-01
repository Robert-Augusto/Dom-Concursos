'use client'

import {
  CheckCircle,
  FileText,
  Hash,
  Heart,
  HelpCircle,
  Lightbulb,
  MessageCircle,
  Share2,
  Trophy,
} from 'lucide-react'

import type { Post } from '@/components/shared/CommunityFeed'

interface CommunityPostProps {
  post: Post
  isLiked: boolean
  onLike: (id: string) => void
}

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

export default function CommunityPost({
  post,
  isLiked,
  onLike,
}: CommunityPostProps) {
  const currentType = typeConfig[post.type]
  const TypeIcon = currentType.icon

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden hover:border-border/80 transition-colors">
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-black text-white"
              style={{ background: post.authorColor }}
            >
              {post.authorInitial}
            </div>

            <div className="flex flex-col gap-0">
              <p className="text-sm font-black text-foreground flex items-center gap-1.5">
                <span>{post.authorName}</span>
                {post.authorBadge ? <span>{post.authorBadge}</span> : null}
              </p>
              <p className="text-xs text-muted-foreground">
                {post.authorRole} {' · '} {post.time}
              </p>
            </div>
          </div>

          <div
            className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 ${currentType.className}`}
          >
            <TypeIcon className="h-3 w-3" />
            <span>{currentType.label}</span>
          </div>
        </div>

        <p className="text-sm text-foreground leading-relaxed">{post.content}</p>

        {post.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={`${post.id}-${tag}`}
                className="rounded-full px-2.5 py-1 text-[10px] font-bold bg-muted text-muted-foreground flex items-center gap-1"
              >
                <Hash className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="border-t border-border grid grid-cols-3 divide-x divide-border">
        <button
          type="button"
          className={`flex items-center justify-center gap-2 py-3 text-xs font-semibold hover:bg-muted/30 transition-colors cursor-pointer ${
            isLiked ? 'text-destructive' : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => onLike(post.id)}
        >
          <Heart
            className={`h-4 w-4 ${isLiked ? 'fill-destructive text-destructive' : ''}`}
          />
          <span>{post.likes} Curtidas</span>
        </button>

        <button
          type="button"
          className="flex items-center justify-center gap-2 py-3 text-xs font-semibold text-muted-foreground hover:bg-muted/30 hover:text-foreground transition-colors cursor-pointer"
        >
          <MessageCircle className="h-4 w-4" />
          <span>{post.comments} Comentarios</span>
        </button>

        <button
          type="button"
          className="flex items-center justify-center gap-2 py-3 text-xs font-semibold text-muted-foreground hover:bg-muted/30 hover:text-foreground transition-colors cursor-pointer"
        >
          <Share2 className="h-4 w-4" />
          <span>Compartilhar</span>
        </button>
      </div>
    </div>
  )
}
