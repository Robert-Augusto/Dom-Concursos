'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { CreateLesson, UpdateLesson } from '@/lib/lessons'
import { VideoType, AccessLevel, Subjects, Lessons } from '@/types'
import { Switch } from '@/components/ui/switch'

type ModalLessonMode = 'create' | 'edit'

type ModalLessonProps = {
  open: boolean
  mode: ModalLessonMode
  onClose: () => void
  lessonsData: Lessons | null
  subjectsData: Subjects[] | null
}

export function ModalLesson({
  open,
  mode,
  onClose,
  lessonsData,
  subjectsData
}: ModalLessonProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoType, setVideoType] = useState<VideoType>('youtube')
  const [videoUrl, setVideoUrl] = useState('')
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('free')

  const [isPublished, setIsPublished] = useState(true)
  const [subjectSearch, setSubjectSearch] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')

  const filteredSubjects = useMemo(() => {
    const query = subjectSearch.trim().toLowerCase()
    const source = subjectsData ?? []
    if (!query) return source
    return source.filter((subject) =>
      subject.name.toLowerCase().includes(query)
    )
  }, [subjectSearch, subjectsData])

  useEffect(() => {
    if (lessonsData) {
      setTitle(lessonsData.title)
      setDescription(lessonsData.description)
      setVideoType(lessonsData.video_type)
      setVideoUrl(lessonsData.video_url)
      setAccessLevel(lessonsData.access_level)
      setIsPublished(lessonsData.is_published)
      setSelectedSubject(lessonsData.subject_id)
    }
  }, [lessonsData])
  
  async function handleCreateLesson(event: React.FormEvent){
    event.preventDefault()
    
    if (!title || !videoUrl || !selectedSubject) {
      toast.error("Preencha todos os campos obrigatórios !!")
      return
    }

    const {error} = await CreateLesson(
      title,
      description,
      videoType,
      accessLevel,
      videoUrl,
      selectedSubject,
      String(isPublished)
    )
    if(error){
      toast.error(error.message)
      return
    }
    toast.success("Aula cadastrada com sucesso!!")
    onClose()
  }

  async function handleUpdateLesson(event: React.FormEvent){
    event.preventDefault()

    if (!title || !videoUrl || !selectedSubject) {
      toast.error("Preencha todos os campos obrigatórios !!")
      return
    }

    const {error} = await UpdateLesson(
      String(lessonsData?.id),
      title,
      description,
      videoType,
      accessLevel,
      videoUrl,
      selectedSubject,
      String(isPublished)
    )

    if (error) {
      toast.error(error.message)
      return 
    }

    toast.success("Aula atualizada com sucesso!!")
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-4 md:p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-black text-foreground">
              {mode === 'create' ? 'Criar aula' : 'Editar aula'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {mode === 'create'
                ? 'Preencha os dados da nova aula.'
                : 'Atualize as informações da aula.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            aria-label="Fechar modal"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Título da aula
            </span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50"
              placeholder="Digite o título da aula"
            />
          </label>

          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Descrição da aula
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50"
              placeholder="Descreva a aula"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-muted-foreground">
              Tipo de vídeo
            </span>
            <select
              value={videoType}
              onChange={(e) => setVideoType(e.target.value as VideoType)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/50"
            >
              <option value="youtube">youtube</option>
              <option value="panda">panda</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-muted-foreground">
              Nível de acesso
            </span>
            <select
              value={accessLevel}
              onChange={(e) =>
                setAccessLevel(e.target.value as AccessLevel)
              }
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/50"
            >
              <option value="free">free</option>
              <option value="plus">plus</option>
              <option value="premium">premium</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-xs font-semibold text-muted-foreground">
              URL do vídeo
            </span>
            <input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50"
              placeholder="https://..."
            />
          </label>

          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Buscar matéria da aula
            </span>
            <input
              value={subjectSearch}
              onChange={(e) => setSubjectSearch(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50"
              placeholder="Pesquise e selecione a matéria"
            />
            <div className="mt-1 flex max-h-28 flex-wrap gap-2 overflow-y-auto rounded-lg border border-border bg-background p-2">
              {filteredSubjects.map((subject) => {
                const selected = selectedSubject === subject.id
                return (
                  <button
                    key={subject.id}
                    type="button"
                    onClick={() => setSelectedSubject(subject.id)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                      selected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                    }`}
                  >
                    {subject.name}
                  </button>
                )
              })}
              {filteredSubjects.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Nenhuma matéria encontrada.
                </p>
              ) : null}
            </div>
          </label>

          <div className="md:col-span-2 flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5">
            <span className="text-sm font-medium text-foreground">
              Publicada
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">
                {isPublished ? 'Ativa' : 'Inativa'}
              </span>
              <Switch
                checked={isPublished}
                onCheckedChange={setIsPublished}
                aria-label="Alternar publicação"
              />
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {mode === 'create' ? (
            <button
              type="button"
              className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
              onClick={handleCreateLesson}
            >
              Cadastrar
            </button>
          ) : (
            <>
              <button
                type="button"
                className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
                onClick={handleUpdateLesson}
              >
                Salvar alterações
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                Cancelar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
