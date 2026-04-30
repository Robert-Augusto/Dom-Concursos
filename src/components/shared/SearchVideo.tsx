'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import {
  Eye,
  MessageCircle,
  Play,
  Search,
  ThumbsUp,
} from 'lucide-react'

const FILTER_PILLS = [
  'Tudo',
  'Questões de Bancas',
  'Português',
  'Matemática',
  'Informática',
  'Legislação do SUS',
  'Raciocínio Lógico',
  'Dir. Constitucional',
  'Dir. Administrativo',
  'Atualidades',
] as const

const videos = [
  {
    id: 'a',
    thumbnail: '/thumbs/video-a.jpg',
    duration: '1:15:20',
    tag: 'CONHECIMENTOS GERAIS',
    title: 'Município de Contagem – Concurso Prefeitura 2025',
    views: '42 mil',
    likes: '1,3 mil',
    comments: '69',
    category: 'Tudo',
  },
  {
    id: 'b',
    thumbnail: '/thumbs/video-b.jpg',
    duration: '1:32:35',
    tag: 'INFORMÁTICA',
    title: 'Concurso Contagem/MG 2026 – Noções Essenciais',
    views: '1,6 mil',
    likes: '103',
    comments: '4',
    category: 'Informática',
  },
  {
    id: 'c',
    thumbnail: '/thumbs/video-c.jpg',
    duration: '1:18:51',
    tag: 'LEGISLAÇÃO DO SUS',
    title: 'SESA Paraná – Questões Banca FAFIPA – Aula 2',
    views: '13 mil',
    likes: '579',
    comments: '82',
    category: 'Tudo',
  },
  {
    id: 'd',
    thumbnail: '/thumbs/video-d.jpg',
    duration: '15:00',
    tag: 'PROVA DE TÍTULOS',
    title: 'Como Enviar – Concurso Prefeitura Contagem (31/03)',
    views: '1,5 mil',
    likes: '98',
    comments: '12',
    category: 'Tudo',
  },
] as const

function tagClassName(tag: string): string {
  switch (tag) {
    case 'CONHECIMENTOS GERAIS':
      return 'bg-blue-500/20 text-blue-400'
    case 'INFORMÁTICA':
      return 'bg-red-500/20 text-red-400'
    case 'LEGISLAÇÃO DO SUS':
      return 'bg-green-500/20 text-green-400'
    case 'PROVA DE TÍTULOS':
      return 'bg-yellow-500/20 text-yellow-400'
    case 'PORTUGUÊS':
      return 'bg-purple-500/20 text-purple-400'
    case 'MATEMÁTICA':
      return 'bg-orange-500/20 text-orange-400'
    default:
      return 'bg-muted text-muted-foreground'
  }
}

function VideoThumbnail({
  src,
  alt,
  duration,
}: {
  src: string
  alt: string
  duration: string
}) {
  const [failed, setFailed] = useState(false)

  return (
    <div className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
      {!failed ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="112px"
          onError={() => setFailed(true)}
        />
      ) : null}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40">
        <Play className="h-8 w-8 text-white" aria-hidden />
      </div>
      <span className="pointer-events-none absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-bold text-white">
        {duration}
      </span>
    </div>
  )
}

export function SearchVideo() {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<string>('Tudo')

  const filteredVideos = useMemo(() => {
    const q = search.trim().toLowerCase()
    return videos.filter((video) => {
      const matchesFilter =
        activeFilter === 'Tudo' || video.category === activeFilter
      const matchesSearch =
        q === '' || video.title.toLowerCase().includes(q)
      return matchesFilter && matchesSearch
    })
  }, [search, activeFilter])

  return (
    <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
            <h2 className="text-lg font-black text-foreground font-heading">
                Buscar Aulas
            </h2>
            <p className="text-sm text-muted-foreground">
                Procure suas aulas de interesse
            </p>
        </div>
      <div className="relative max-w-[700px]">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquise aulas, questões..."
          className="w-full rounded-full border border-border bg-card py-3 pl-11 pr-5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {FILTER_PILLS.map((label) => {
          const active = activeFilter === label
          return (
            <button
              key={label}
              type="button"
              onClick={() => setActiveFilter(label)}
              className={`rounded-full border mb-2 px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-transparent text-muted-foreground hover:border-primary/40 hover:text-foreground'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>

      <p className="pt-2 text-xs font-bold tracking-widest text-muted-foreground uppercase">
        {activeFilter}
      </p>

      <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4">
        {filteredVideos.map((video) => (
          <div
            key={video.id}
            role="button"
            tabIndex={0}
            className="flex cursor-pointer flex-row gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/30"
          >
            <VideoThumbnail
              src={video.thumbnail}
              alt={video.title}
              duration={video.duration}
            />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span
                className={`inline-flex self-start rounded-full px-2 py-0.5 text-[9px] font-black tracking-wider uppercase ${tagClassName(video.tag)}`}
              >
                {video.tag}
              </span>
              <p className="line-clamp-2 text-sm leading-snug font-semibold text-foreground">
                {video.title}
              </p>
              <div className="mt-auto flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Eye className="h-3 w-3 shrink-0" aria-hidden />
                  {video.views}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ThumbsUp className="h-3 w-3 shrink-0" aria-hidden />
                  {video.likes}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MessageCircle className="h-3 w-3 shrink-0" aria-hidden />
                  {video.comments}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
