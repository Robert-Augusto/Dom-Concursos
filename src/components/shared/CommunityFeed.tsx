'use client'

import { useMemo, useState } from 'react'
import {
  FileText,
  Flame,
  HelpCircle,
  Lightbulb,
  Star,
} from 'lucide-react'

import CommunityPost from '@/components/shared/CommunityPost'

export interface Post {
  id: string
  type: 'aprovada' | 'dica' | 'duvida' | 'edital' | 'conquista'
  authorName: string
  authorInitial: string
  authorColor: string
  authorRole: string
  authorBadge?: string
  time: string
  content: string
  tags: string[]
  likes: number
  comments: number
  following?: boolean
}

type FilterKey = 'em_alta' | 'seguindo' | 'dicas' | 'editais' | 'duvidas'

const mockPosts: Post[] = [
  {
    id: '1',
    type: 'aprovada',
    authorName: 'Ana Carolina S.',
    authorInitial: 'A',
    authorColor: 'linear-gradient(135deg, #2ECC8A, #0D9488)',
    authorRole: 'Aprovada SESA-PR',
    authorBadge: '🥇',
    time: '2h atrás',
    content:
      'APROVADA! Resultado do SESA-PR saiu e meu nome está na lista! Após 2 anos de dedicação, finalmente consegui! Quem estiver estudando, não desista! O método que me ajudou mais foi dividir as matérias por dificuldade e usar os flashcards todo dia.',
    tags: ['SESA-PR', 'Aprovação'],
    likes: 312,
    comments: 47,
    following: true,
  },
  {
    id: '2',
    type: 'dica',
    authorName: 'Lucas Mendes',
    authorInitial: 'L',
    authorColor: 'linear-gradient(135deg, #3D7FFF, #8B5CF6)',
    authorRole: 'Estudando para TJ-SP',
    authorBadge: '📌',
    time: '5h atrás',
    content:
      'Dica de ouro para quem vai fazer TJ-SP: o VUNESP ama cobrar questões de "emprego de palavras" e "semântica". Recomendo estudar as questões das últimas 5 provas do TJ-SP. Deixei a lista de tópicos nos comentários!',
    tags: ['Português', 'TJ-SP'],
    likes: 89,
    comments: 23,
    following: true,
  },
  {
    id: '3',
    type: 'duvida',
    authorName: 'Marcos Vinicius',
    authorInitial: 'M',
    authorColor: 'linear-gradient(135deg, #C9A84C, #DDA83A)',
    authorRole: '6.500 pontos',
    time: '8h atrás',
    content:
      'Alguém pode me explicar a diferença entre ato administrativo NULO e ANULÁVEL? Estou confundindo sempre nas questões do CESPE...',
    tags: ['Dir. Administrativo'],
    likes: 34,
    comments: 12,
    following: false,
  },
  {
    id: '4',
    type: 'edital',
    authorName: 'Fernanda Lima',
    authorInitial: 'F',
    authorColor: 'linear-gradient(135deg, #FF4D6D, #C9A84C)',
    authorRole: 'Moderadora',
    authorBadge: '⭐',
    time: '1d atrás',
    content:
      'NOVO EDITAL: PMSP abriu 2.700 vagas para Guarda Civil Metropolitano. Salário inicial de R$ 4.200. Inscrições até 15 de junho. Banca: VUNESP. Prova prevista para agosto. Quem vai fazer? Já estou montando o cronograma!',
    tags: ['PMSP', 'Segurança', 'VUNESP'],
    likes: 156,
    comments: 38,
    following: false,
  },
  {
    id: '5',
    type: 'conquista',
    authorName: 'Rafael Souza',
    authorInitial: 'R',
    authorColor: 'linear-gradient(135deg, #8B5CF6, #3D7FFF)',
    authorRole: '12.400 pontos',
    authorBadge: '🏆',
    time: '2d atrás',
    content:
      'Meta batida! Completei 30 dias seguidos de estudos sem falhar um único dia. Fiz em média 50 questões por dia. Total: 1.500 questões no mês! Agradeço muito a plataforma DOM Concursos que tornou isso possível com o sistema de simulados.',
    tags: ['Conquista', 'Motivação'],
    likes: 204,
    comments: 31,
    following: true,
  },
]

const filters: Array<{ key: FilterKey; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { key: 'em_alta', label: 'Em Alta', icon: Flame },
  { key: 'seguindo', label: 'Seguindo', icon: Star },
  { key: 'dicas', label: 'Dicas', icon: Lightbulb },
  { key: 'editais', label: 'Editais', icon: FileText },
  { key: 'duvidas', label: 'Dúvidas', icon: HelpCircle },
]

export default function CommunityFeed() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('em_alta')
  const [posts, setPosts] = useState<Post[]>(mockPosts)
  const [newPostText, setNewPostText] = useState('')
  const [likedPosts, setLikedPosts] = useState<string[]>([])

  const handleLike = (id: string) => {
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
  }

  const filteredPosts = useMemo(() => {
    switch (activeFilter) {
      case 'seguindo':
        return posts.filter((post) => post.following)
      case 'dicas':
        return posts.filter((post) => post.type === 'dica')
      case 'editais':
        return posts.filter((post) => post.type === 'edital')
      case 'duvidas':
        return posts.filter((post) => post.type === 'duvida')
      case 'em_alta':
      default:
        return [...posts].sort((a, b) => b.likes - a.likes)
    }
  }, [activeFilter, posts])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 bg-card rounded-2xl px-4 py-3 border border-border">
        <span
          className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-black text-primary-foreground"
          style={{ background: 'linear-gradient(135deg, #C9A84C, #DDA83A)' }}
        >
          R
        </span>

        <input
          className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground cursor-pointer"
          placeholder="O que você quer compartilhar?"
          readOnly
          value={newPostText}
          onChange={(event) => setNewPostText(event.target.value)}
          onClick={() => setNewPostText('')}
        />

        <button
          type="button"
          className="px-5 py-2 rounded-xl text-sm font-black text-primary-foreground transition-opacity hover:opacity-90"
          style={{
            background: 'linear-gradient(90deg, #3D7FFF, #5A9FFF)',
            boxShadow: '0 4px 14px rgba(61,127,255,0.35)',
          }}
        >
          Postar
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        {filters.map((filter) => {
          const isActive = activeFilter === filter.key
          const Icon = filter.icon

          return (
            <button
              key={filter.key}
              type="button"
              onClick={() => setActiveFilter(filter.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border flex-shrink-0 ${
                isActive
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{filter.label}</span>
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-3">
        {filteredPosts.map((post) => (
          <CommunityPost
            key={post.id}
            post={post}
            isLiked={likedPosts.includes(post.id)}
            onLike={handleLike}
          />
        ))}
      </div>
    </div>
  )
}
