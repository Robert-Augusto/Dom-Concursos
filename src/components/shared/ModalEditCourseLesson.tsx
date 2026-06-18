'use client'

import {
  DeleteLessonMaterials,
  GetLessonMaterials,
  UpdateCourseModuleLesson,
  type CourseLesson,
} from '@/lib/lib-lessons'
import {
  DeleteLessonMaterialFile,
  UploadLessonMaterials,
} from '@/lib/lib-storage'
import type { LessonMaterials, VideoType } from '@/types'
import { FileUp, Loader2, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

const ACCEPTED_MATERIAL_EXTENSIONS = [
  '.pdf',
  '.jpeg',
  '.jpg',
  '.png',
  '.docx',
  '.pptx',
]

const fieldLabelClass =
  'text-[11px] font-bold uppercase tracking-wider text-muted-foreground'

const inputClass =
  'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50'

type ModalEditCourseLessonProps = {
  open: boolean
  lesson: CourseLesson | null
  onClose: () => void
  onUpdated: (lesson: CourseLesson) => void
}

function isAcceptedMaterialFile(file: File): boolean {
  const lowerName = file.name.toLowerCase()
  return ACCEPTED_MATERIAL_EXTENSIONS.some((ext) => lowerName.endsWith(ext))
}

export function ModalEditCourseLesson({
  open,
  lesson,
  onClose,
  onUpdated,
}: ModalEditCourseLessonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoType, setVideoType] = useState<VideoType>('youtube')
  const [videoUrl, setVideoUrl] = useState('')
  const [duration, setDuration] = useState('')
  const [existingMaterials, setExistingMaterials] = useState<LessonMaterials[]>(
    [],
  )
  const [removedMaterialIds, setRemovedMaterialIds] = useState<Set<string>>(
    new Set(),
  )
  const [pendingNewFiles, setPendingNewFiles] = useState<File[]>([])
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const keptExistingMaterials = useMemo(
    () => existingMaterials.filter((m) => !removedMaterialIds.has(m.id)),
    [existingMaterials, removedMaterialIds],
  )

  useEffect(() => {
    if (!open || !lesson) return

    setTitle(lesson.title ?? '')
    setDescription(lesson.description ?? '')
    setVideoType(lesson.video_type ?? 'youtube')
    setVideoUrl(lesson.video_url ?? '')
    setDuration(lesson.duration_seconds ?? '')
    setRemovedMaterialIds(new Set())
    setPendingNewFiles([])
    if (fileInputRef.current) fileInputRef.current.value = ''

    void loadExistingMaterials(lesson.id)
  }, [lesson, open])

  async function loadExistingMaterials(lessonId: string | number) {
    setIsLoadingMaterials(true)

    const { data, error } = await GetLessonMaterials(lessonId)

    setIsLoadingMaterials(false)

    if (error) {
      toast.error(error.message)
      setExistingMaterials([])
      return
    }

    setExistingMaterials(data)
  }

  function resetMaterialState() {
    setExistingMaterials([])
    setRemovedMaterialIds(new Set())
    setPendingNewFiles([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleClose() {
    if (isSaving) return
    resetMaterialState()
    onClose()
  }

  function handleMaterialFilesSelected(fileList: FileList | null) {
    if (!fileList) return

    const files = Array.from(fileList)
    const invalid = files.filter((file) => !isAcceptedMaterialFile(file))

    if (invalid.length > 0) {
      toast.error('Formatos aceitos: PDF, JPEG, PNG, DOCX e PPTX')
      return
    }

    setPendingNewFiles((prev) => [...prev, ...files])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removePendingFile(index: number) {
    setPendingNewFiles((prev) => prev.filter((_, i) => i !== index))
  }

  function markMaterialForRemoval(materialId: string) {
    setRemovedMaterialIds((prev) => new Set(prev).add(materialId))
  }

  async function handleSubmit() {
    if (!lesson) return

    const trimmedTitle = title.trim()
    const trimmedDescription = description.trim()

    if (!trimmedTitle) {
      toast.error('Informe o título da aula')
      return
    }

    if (!trimmedDescription) {
      toast.error('Informe a descrição da aula')
      return
    }

    setIsSaving(true)

    const { data, error } = await UpdateCourseModuleLesson(lesson.id, {
      title: trimmedTitle,
      description: trimmedDescription,
      videoType,
      videoUrl: videoUrl.trim(),
      duration: duration.trim(),
    })

    if (error || !data) {
      toast.error(error?.message ?? 'Não foi possível atualizar a aula')
      setIsSaving(false)
      return
    }

    const materialsToRemove = existingMaterials.filter((m) =>
      removedMaterialIds.has(m.id),
    )

    for (const material of materialsToRemove) {
      const { error: storageError } = await DeleteLessonMaterialFile(
        material.file_url,
      )

      if (storageError) {
        toast.error(storageError.message)
        setIsSaving(false)
        return
      }

      const { error: deleteError } = await DeleteLessonMaterials(material.id)

      if (deleteError) {
        toast.error(deleteError.message)
        setIsSaving(false)
        return
      }
    }

    if (pendingNewFiles.length > 0) {
      const { error: materialsError } = await UploadLessonMaterials(
        pendingNewFiles,
        data.id,
      )

      if (materialsError) {
        toast.error(materialsError.message)
        setIsSaving(false)
        return
      }
    }

    setIsSaving(false)
    toast.success('Aula atualizada com sucesso')
    onUpdated(data)
    resetMaterialState()
    onClose()
  }

  if (!open || !lesson) return null

  const hasMaterialList =
    keptExistingMaterials.length > 0 || pendingNewFiles.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div
        className="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-border bg-card"
        style={{ maxWidth: '520px' }}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border p-4 md:p-6">
          <div>
            <h3 className="text-base font-black text-foreground md:text-lg">
              Editar aula
            </h3>
            <p className="text-sm text-muted-foreground">
              Atualize os dados da aula e gerencie os materiais.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-50"
            aria-label="Fechar modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
          <div className="space-y-1.5">
            <label className={fieldLabelClass}>Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
              placeholder="Título da aula"
              disabled={isSaving}
            />
          </div>

          <div className="space-y-1.5">
            <label className={fieldLabelClass}>Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputClass} min-h-[96px] resize-none`}
              placeholder="Descrição da aula"
              disabled={isSaving}
            />
          </div>

          <div className="space-y-1.5">
            <label className={fieldLabelClass}>Tipo de vídeo</label>
            <select
              value={videoType}
              onChange={(e) => setVideoType(e.target.value as VideoType)}
              className={inputClass}
              disabled={isSaving}
            >
              <option value="youtube">YouTube</option>
              <option value="panda">Panda</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className={fieldLabelClass}>URL do vídeo</label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className={inputClass}
              placeholder="https:// (opcional)"
              disabled={isSaving}
            />
          </div>

          <div className="space-y-1.5">
            <label className={fieldLabelClass}>Duração</label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className={inputClass}
              placeholder="Ex.: 8:32, 45 min, 1h 20min"
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <label className={fieldLabelClass}>Materiais</label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSaving || isLoadingMaterials}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-50"
            >
              <FileUp className="h-4 w-4" />
              Adicionar arquivos
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpeg,.jpg,.png,.docx,.pptx,application/pdf,image/jpeg,image/png,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation"
              className="hidden"
              onChange={(e) => handleMaterialFilesSelected(e.target.files)}
            />
            <p className="text-[10px] text-muted-foreground">
              PDF, JPEG, PNG, DOCX ou PPTX. Remoções só são aplicadas ao salvar.
            </p>

            {isLoadingMaterials ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Carregando materiais...
              </div>
            ) : null}

            {hasMaterialList ? (
              <ul className="space-y-2">
                {keptExistingMaterials.map((material) => (
                  <li
                    key={material.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2"
                  >
                    <span className="flex min-w-0 items-center gap-2 text-xs text-foreground">
                      <FileUp
                        className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                        aria-hidden
                      />
                      <span className="truncate">{material.title}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => markMaterialForRemoval(material.id)}
                      disabled={isSaving}
                      className="shrink-0 text-xs font-semibold text-destructive hover:underline disabled:opacity-50"
                    >
                      Remover
                    </button>
                  </li>
                ))}
                {pendingNewFiles.map((file, index) => (
                  <li
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between gap-2 rounded-lg border border-dashed border-accent/30 bg-accent/5 px-3 py-2"
                  >
                    <span className="flex min-w-0 items-center gap-2 text-xs text-foreground">
                      <FileUp
                        className="h-3.5 w-3.5 shrink-0 text-accent"
                        aria-hidden
                      />
                      <span className="truncate">{file.name}</span>
                      <span className="shrink-0 text-[10px] font-semibold uppercase text-accent">
                        Novo
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => removePendingFile(index)}
                      disabled={isSaving}
                      className="shrink-0 text-xs font-semibold text-destructive hover:underline disabled:opacity-50"
                    >
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
            ) : !isLoadingMaterials ? (
              <p className="text-xs text-muted-foreground">
                Nenhum material nesta aula.
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border p-4 md:p-6">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving}
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isSaving || isLoadingMaterials}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            Salvar alterações
          </button>
        </div>
      </div>
    </div>
  )
}
