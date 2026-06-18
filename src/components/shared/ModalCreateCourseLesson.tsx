'use client'

import {
  CreateCourseModuleLesson,
  type CourseLesson,
} from '@/lib/lib-lessons'
import { UploadLessonMaterials } from '@/lib/lib-storage'
import type { VideoType } from '@/types'
import { FileUp, Loader2, X } from 'lucide-react'
import { useRef, useState } from 'react'
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

type ModalCreateCourseLessonProps = {
  open: boolean
  moduleId: number
  onClose: () => void
  onCreated: (lesson: CourseLesson) => void
}

function isAcceptedMaterialFile(file: File): boolean {
  const lowerName = file.name.toLowerCase()
  return ACCEPTED_MATERIAL_EXTENSIONS.some((ext) => lowerName.endsWith(ext))
}

export function ModalCreateCourseLesson({
  open,
  moduleId,
  onClose,
  onCreated,
}: ModalCreateCourseLessonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoType, setVideoType] = useState<VideoType>('youtube')
  const [videoUrl, setVideoUrl] = useState('')
  const [duration, setDuration] = useState('')
  const [materialFiles, setMaterialFiles] = useState<File[]>([])
  const [isSaving, setIsSaving] = useState(false)

  function resetForm() {
    setTitle('')
    setDescription('')
    setVideoType('youtube')
    setVideoUrl('')
    setDuration('')
    setMaterialFiles([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleClose() {
    if (isSaving) return
    resetForm()
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

    setMaterialFiles((prev) => [...prev, ...files])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removeMaterialFile(index: number) {
    setMaterialFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit() {
    const trimmedTitle = title.trim()
    const trimmedDescription = description.trim()
    const trimmedUrl = videoUrl.trim()

    if (!trimmedTitle) {
      toast.error('Informe o título da aula')
      return
    }

    if (!trimmedDescription) {
      toast.error('Informe a descrição da aula')
      return
    }

    setIsSaving(true)

    const { data, error } = await CreateCourseModuleLesson(moduleId, {
      title: trimmedTitle,
      description: trimmedDescription,
      videoType,
      videoUrl: trimmedUrl,
      duration: duration.trim(),
    })

    if (error || !data) {
      toast.error(error?.message ?? 'Não foi possível criar a aula')
      setIsSaving(false)
      return
    }

    if (materialFiles.length > 0) {
      const { error: materialsError } = await UploadLessonMaterials(
        materialFiles,
        data.id,
      )

      if (materialsError) {
        toast.error(materialsError.message)
        setIsSaving(false)
        return
      }
    }

    setIsSaving(false)
    toast.success('Aula criada com sucesso')
    resetForm()
    onCreated(data)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div
        className="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-border bg-card"
        style={{ maxWidth: '520px' }}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border p-4 md:p-6">
          <div>
            <h3 className="text-base font-black text-foreground md:text-lg">
              Nova aula
            </h3>
            <p className="text-sm text-muted-foreground">
              Preencha os dados da aula e envie os materiais.
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
              placeholder="https://"
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
            <label className={fieldLabelClass}>Materiais da aula</label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSaving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-50"
            >
              <FileUp className="h-4 w-4" />
              Enviar arquivos
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
              PDF, JPEG, PNG, DOCX ou PPTX
            </p>

            {materialFiles.length > 0 ? (
              <ul className="space-y-2">
                {materialFiles.map((file, index) => (
                  <li
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2"
                  >
                    <span className="truncate text-xs text-foreground">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeMaterialFile(index)}
                      disabled={isSaving}
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      aria-label="Remover arquivo"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
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
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            Criar aula
          </button>
        </div>
      </div>
    </div>
  )
}
