'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { CreateLesson, UpdateLesson } from '@/lib/lib-lessons'
import { VideoType, AccessLevel, Subjects, Lessons, SubjectType } from '@/types'
import { Switch } from '@/components/ui/switch'
import { CreateSubject } from '@/lib/lib-subjects'

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
  const [selectedSubject, setSelectedSubject] = useState('')

  const [showCreateRootPanel, setShowCreateRootPanel] = useState(false)
  const [newRootSubjectName, setNewRootSubjectName] = useState('')
  const [subjectLevel, setSubjectLevel] = useState<SubjectType>('basic')

  const rootSubjects = useMemo(() => {
    return (subjectsData ?? []).filter((subject) => subject.subject_id === null)
  }, [subjectsData])

  function closeCreateRootPanel() {
    setShowCreateRootPanel(false)
    setNewRootSubjectName('')
  }

  function toggleCreateRootPanel() {
    setShowCreateRootPanel((open) => !open)
  }

  async function handleSaveNewRoot() {
    const name = newRootSubjectName.trim()
    if (!name) return
    const { error, data } = await CreateSubject(name, subjectLevel, null)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Matéria criada com sucesso!!')
    closeCreateRootPanel()
    if (data?.id) setSelectedSubject(data.id)
  }

  useEffect(() => {
    if (lessonsData) {
      setTitle(lessonsData.title)
      setDescription(lessonsData.description)
      setVideoType(lessonsData.video_type)
      setVideoUrl(lessonsData.video_url)
      setAccessLevel(lessonsData.access_level)
      setIsPublished(lessonsData.is_published)
      const row = (subjectsData ?? []).find(
        (subject) => subject.id === lessonsData.subject_id
      )
      const rootId =
        row == null
          ? lessonsData.subject_id
          : row.subject_id === null
            ? row.id
            : row.subject_id
      setSelectedSubject(rootId)
      setShowCreateRootPanel(false)
    }
  }, [lessonsData, subjectsData])
  
  async function handleCreateLesson(event: React.FormEvent){
    event.preventDefault()
    
    if (!title || !videoUrl || !selectedSubject) {
      toast.error("Preencha todos os campos obrigatórios !!")
      return
    }

    const { error } = await CreateLesson(
      title,
      description,
      videoType,
      accessLevel,
      videoUrl,
      selectedSubject,
      isPublished,
      null,
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

    const { error } = await UpdateLesson(
      String(lessonsData?.id),
      title,
      description,
      videoType,
      accessLevel,
      videoUrl,
      selectedSubject,
      lessonsData?.thumbnail ?? null,
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
            Título da aula <span className="text-destructive text-xs">*</span>
            <span className="text-xs font-normal text-destructive/70 ml-1">obrigatório</span>
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
              URL do vídeo <span className="text-destructive text-xs">*</span>
              <span className="text-xs font-normal text-destructive/70 ml-1">obrigatório</span>
            </span>
            <input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50"
              placeholder="https://..."
            />
          </label>

          <div className="flex flex-col gap-1 md:col-span-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Matéria da aula <span className="text-destructive text-xs">*</span>
              <span className="text-xs font-normal text-destructive/70 ml-1">
                obrigatório
              </span>
            </span>
            <div className="space-y-2 rounded-lg border border-border bg-card p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Matéria principal
              </p>
              <div className="flex flex-col gap-3">
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  <button
                    type="button"
                    onClick={toggleCreateRootPanel}
                    aria-expanded={showCreateRootPanel}
                    className={`mb-2 shrink-0 rounded-full border border-dashed px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                      showCreateRootPanel
                        ? 'border-primary bg-primary/15 text-primary'
                        : 'border-primary/60 bg-primary/5 text-primary hover:border-primary hover:bg-primary/10'
                    }`}
                  >
                    + Criar Matéria
                  </button>
                  {rootSubjects.map((subject) => {
                    const active = selectedSubject === subject.id
                    return (
                      <button
                        key={subject.id}
                        type="button"
                        onClick={() => {
                          setSelectedSubject(subject.id)
                          setShowCreateRootPanel(false)
                        }}
                        className={`mb-2 rounded-full border px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                          active
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-transparent text-muted-foreground hover:border-primary/40 hover:text-foreground'
                        }`}
                      >
                        {subject.name}
                      </button>
                    )
                  })}
                  {rootSubjects.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Nenhuma matéria principal cadastrada.
                    </p>
                  ) : null}
                </div>

                {showCreateRootPanel ? (
                  <div className="rounded-xl border border-primary/25 bg-gradient-to-b from-primary/5 to-background p-4 shadow-sm ring-1 ring-primary/10">
                    <div className="mb-3 flex items-start gap-2">
                      <span
                        className="mt-1 h-8 w-1 shrink-0 rounded-full bg-primary"
                        aria-hidden
                      />
                      <div>
                        <h4 className="text-sm font-bold text-foreground">
                          Nova matéria principal
                        </h4>
                        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                          Digite o nome da matéria (ex.: Português, Matemática).
                          Ela aparecerá na lista para você organizar assuntos
                          depois.
                        </p>
                      </div>
                    </div>

                    <label className="mb-4 flex flex-col gap-1.5">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Nome da matéria
                      </span>
                      <input
                        id="modal-lesson-new-root-name"
                        type="text"
                        value={newRootSubjectName}
                        onChange={(e) => setNewRootSubjectName(e.target.value)}
                        placeholder="Ex.: Legislação"
                        className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                      />
                    </label>

                    <label className="mb-4 flex flex-col gap-1">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Nível da matéria
                      </span>
                      <select
                        value={subjectLevel}
                        onChange={(e) =>
                          setSubjectLevel(e.target.value as SubjectType)
                        }
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/50"
                      >
                        <option value="basic">básico</option>
                        <option value="specific">específico</option>
                      </select>
                    </label>

                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={closeCreateRootPanel}
                        className="rounded-full border border-border bg-transparent px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleSaveNewRoot()}
                        className="rounded-full border border-primary bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
                      >
                        Salvar
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

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
