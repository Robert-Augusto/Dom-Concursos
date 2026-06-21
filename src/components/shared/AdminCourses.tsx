'use client'

import Image from 'next/image'
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import {
  BookOpen,
  ExternalLink,
  ImagePlus,
  MoreVertical,
  Pencil,
  Trash2,
  TriangleAlert,
  X,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'
import { Switch } from '@/components/ui/switch'
import {
  CreateCourse,
  DEFAULT_COURSE_TITLE,
  DeleteCourse,
  GetCourses,
  UpdateCourseAccessLevel,
  UpdateCoursePublished,
  UpdateCourseThumbnail,
  UpdateCourseTitle,
  UpdateCourseWhatsappGroup,
} from '@/lib/lib-courses'
import {
  DeleteCourseThumbnail,
  UploadCourseThumbnail,
} from '@/lib/lib-storage'
import type { AccessLevel, Courses } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const fieldLabelClass =
  'text-[11px] font-bold uppercase tracking-wider text-muted-foreground'

const inputClass =
  'w-full rounded-lg border border-border bg-primary-foreground px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50'

const ACCESS_LEVEL_OPTIONS: { value: AccessLevel; label: string }[] = [
  { value: 'free', label: 'Gratuito' },
  { value: 'plus', label: 'Plus' },
  { value: 'premium', label: 'Premium' },
]

function accessLevelLabel(level: AccessLevel | null): string {
  if (!level) return 'Sem acesso'
  return ACCESS_LEVEL_OPTIONS.find((option) => option.value === level)?.label ?? level
}

function getCourseTitle(course: Courses): string {
  return course.title?.trim() || DEFAULT_COURSE_TITLE
}

type CourseKebabMenuItem = {
  label: string
  icon: LucideIcon
  onClick: () => void
  variant?: 'default' | 'destructive'
  disabled?: boolean
}

type CourseKebabMenuProps = {
  items: CourseKebabMenuItem[]
  disabled?: boolean
  ariaLabel?: string
}

function CourseKebabMenu({
  items,
  disabled = false,
  ariaLabel = 'Abrir menu',
}: CourseKebabMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={disabled}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-accent/40 hover:bg-muted/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <MoreVertical className="h-4 w-4" />
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
                disabled={item.disabled}
                onClick={() => {
                  if (item.disabled) return
                  setIsOpen(false)
                  item.onClick()
                }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold transition-colors hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-50 ${
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

export default function AdminCourses() {
  const thumbnailInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('free')
  const [whatsappGroup, setWhatsappGroup] = useState('')
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [savedThumbnailUrl, setSavedThumbnailUrl] = useState<string | null>(null)
  const [thumbnailRemoved, setThumbnailRemoved] = useState(false)
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [courses, setCourses] = useState<Courses[]>([])
  const [publishedState, setPublishedState] = useState<Record<number, boolean>>(
    {},
  )
  const [togglingCourseId, setTogglingCourseId] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Courses | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const thumbnailPreviewUrl = useMemo(() => {
    if (!thumbnailFile) return null
    return URL.createObjectURL(thumbnailFile)
  }, [thumbnailFile])

  const thumbnailDisplayUrl = useMemo(() => {
    if (thumbnailPreviewUrl) return thumbnailPreviewUrl
    if (thumbnailRemoved) return null
    return savedThumbnailUrl
  }, [thumbnailPreviewUrl, thumbnailRemoved, savedThumbnailUrl])

  const loadCourses = useCallback(async () => {
    const { data, error } = await GetCourses({ includeUnpublished: true })

    if (error) {
      toast.error(error.message)
      return
    }

    setCourses(data)
    setPublishedState(
      Object.fromEntries(
        data.map((course) => [course.id, Boolean(course.is_published)]),
      ),
    )
  }, [])

  useEffect(() => {
    void loadCourses()
  }, [loadCourses])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('admin_courses')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'courses' },
        () => {
          void loadCourses()
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [loadCourses])

  function handleThumbnailChange(files: FileList | null) {
    if (!files?.[0]) return
    const file = files[0]
    if (!file.type.startsWith('image/')) {
      toast.error('Envie apenas imagens para a capa do curso.')
      return
    }
    setThumbnailFile(file)
    setThumbnailRemoved(false)
  }

  function handleRemoveThumbnail() {
    setThumbnailFile(null)
    setThumbnailRemoved(true)
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = ''
  }

  function resetForm() {
    setEditingCourseId(null)
    setTitle('')
    setAccessLevel('free')
    setWhatsappGroup('')
    setThumbnailFile(null)
    setSavedThumbnailUrl(null)
    setThumbnailRemoved(false)
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = ''
  }

  function startEditCourse(course: Courses) {
    resetForm()
    setEditingCourseId(course.id)
    setTitle(getCourseTitle(course))
    setAccessLevel(course.access_level ?? 'free')
    setWhatsappGroup(course.whatsapp_group ?? '')
    setSavedThumbnailUrl(course.thumbnail_url)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    resetForm()
  }

  function getCoursePublished(course: Courses): boolean {
    return publishedState[course.id] ?? Boolean(course.is_published)
  }

  async function handleTogglePublished(courseId: number, isPublished: boolean) {
    const previous =
      publishedState[courseId] ??
      courses.find((course) => course.id === courseId)?.is_published ??
      false

    setPublishedState((prev) => ({ ...prev, [courseId]: isPublished }))
    setTogglingCourseId(courseId)

    const { data, error } = await UpdateCoursePublished(courseId, isPublished)

    setTogglingCourseId(null)

    if (error) {
      setPublishedState((prev) => ({ ...prev, [courseId]: previous }))
      toast.error(error.message)
      return
    }

    if (data) {
      setCourses((prev) =>
        prev.map((course) => (course.id === courseId ? data : course)),
      )
    }
  }

  async function uploadThumbnailIfNeeded(courseId: number) {
    if (!thumbnailFile) return { url: null as string | null, error: null }

    const { publicUrl, uploadError } = await UploadCourseThumbnail(
      thumbnailFile,
      courseId,
    )

    if (uploadError || !publicUrl) {
      return {
        url: null,
        error: uploadError ?? { message: 'Não foi possível enviar a imagem.' },
      }
    }

    return { url: publicUrl, error: null }
  }

  async function handleCreateCourse() {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      toast.error('Informe o título do curso.')
      return
    }

    const { data, error } = await CreateCourse({
      title: trimmedTitle,
      accessLevel,
      isPublished: false,
    })

    if (error || !data) {
      toast.error(error?.message ?? 'Erro ao criar o curso.')
      return
    }

    let finalCourse = data

    if (thumbnailFile) {
      const { url, error: uploadError } = await uploadThumbnailIfNeeded(data.id)

      if (uploadError) {
        toast.error(uploadError.message)
        return
      }

      if (url) {
        const { data: updated, error: thumbError } = await UpdateCourseThumbnail(
          data.id,
          url,
        )

        if (thumbError) {
          toast.error(thumbError.message)
          return
        }

        if (updated) finalCourse = updated
      }
    }

    const trimmedWhatsappGroup = whatsappGroup.trim()
    if (trimmedWhatsappGroup) {
      const { data: updated, error: whatsappError } =
        await UpdateCourseWhatsappGroup(data.id, trimmedWhatsappGroup)

      if (whatsappError) {
        toast.error(whatsappError.message)
        return
      }

      if (updated) finalCourse = updated
    }

    setCourses((prev) => [finalCourse, ...prev])
    setPublishedState((prev) => ({ ...prev, [finalCourse.id]: false }))
    resetForm()
    toast.success('Curso criado com sucesso!')
  }

  async function handleUpdateCourse() {
    if (!editingCourseId) return

    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      toast.error('Informe o título do curso.')
      return
    }

    const previousThumbnailUrl = savedThumbnailUrl
    let thumbnailToDelete: string | null = null
    let finalThumbnailUrl: string | null = savedThumbnailUrl

    if (thumbnailRemoved && !thumbnailFile) {
      finalThumbnailUrl = null
      if (previousThumbnailUrl) thumbnailToDelete = previousThumbnailUrl
    } else if (thumbnailFile) {
      const { url, error: uploadError } = await uploadThumbnailIfNeeded(
        editingCourseId,
      )

      if (uploadError) {
        toast.error(uploadError.message)
        return
      }

      finalThumbnailUrl = url
      if (previousThumbnailUrl) thumbnailToDelete = previousThumbnailUrl
    }

    const { error: titleError } = await UpdateCourseTitle(
      editingCourseId,
      trimmedTitle,
    )

    if (titleError) {
      toast.error(titleError.message)
      return
    }

    const { error: accessError } = await UpdateCourseAccessLevel(
      editingCourseId,
      accessLevel,
    )

    if (accessError) {
      toast.error(accessError.message)
      return
    }

    const trimmedWhatsappGroup = whatsappGroup.trim()
    const { error: whatsappError } = await UpdateCourseWhatsappGroup(
        editingCourseId,
        trimmedWhatsappGroup || null,
      )

    if (whatsappError) {
      toast.error(whatsappError.message)
      return
    }

    const { data, error: thumbUpdateError } = await UpdateCourseThumbnail(
      editingCourseId,
      finalThumbnailUrl,
    )

    if (thumbUpdateError) {
      toast.error(thumbUpdateError.message)
      return
    }

    if (thumbnailToDelete) {
      const { error: thumbDeleteError } =
        await DeleteCourseThumbnail(thumbnailToDelete)

      if (thumbDeleteError) {
        toast.error(thumbDeleteError.message)
        return
      }
    }

    if (data) {
      setCourses((prev) =>
        prev.map((course) => (course.id === editingCourseId ? data : course)),
      )
    }

    resetForm()
    toast.success('Curso atualizado com sucesso!')
  }

  async function handleDeleteCourse() {
    if (!deleteTarget) return

    setIsDeleting(true)

    try {
      if (deleteTarget.thumbnail_url) {
        const { error: storageError } = await DeleteCourseThumbnail(
          deleteTarget.thumbnail_url,
        )

        if (storageError) {
          toast.error(storageError.message)
          return
        }
      }

      const { error } = await DeleteCourse(deleteTarget.id)

      if (error) {
        toast.error(error.message)
        return
      }

      if (editingCourseId === deleteTarget.id) resetForm()

      setCourses((prev) =>
        prev.filter((course) => course.id !== deleteTarget.id),
      )
      setPublishedState((prev) => {
        const next = { ...prev }
        delete next[deleteTarget.id]
        return next
      })

      setDeleteTarget(null)
      toast.success('Curso excluído com sucesso!')
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    setIsSaving(true)

    try {
      if (editingCourseId) {
        await handleUpdateCourse()
      } else {
        await handleCreateCourse()
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="relative flex flex-col gap-8">
      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-4 md:p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                  <TriangleAlert className="h-4 w-4" aria-hidden />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground md:text-lg">
                    Confirmar exclusão
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Esta ação remove o curso permanentemente.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-50"
                aria-label="Fechar modal"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <div className="rounded-xl border border-border bg-background p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Curso selecionado
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {getCourseTitle(deleteTarget)}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={isDeleting}
                className="rounded-full border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/20 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => void handleDeleteCourse()}
              >
                {isDeleting ? 'Excluindo...' : 'Confirmar exclusão'}
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {editingCourseId ? (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3">
            <p className="text-sm font-semibold text-foreground">
              Editando curso
            </p>
            <button
              type="button"
              onClick={cancelEdit}
              disabled={isSaving}
              className="text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        ) : null}

        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-lg font-black text-foreground">
            {editingCourseId ? 'Atualizar curso' : 'Cadastrar curso'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {editingCourseId
              ? 'Altere os dados do curso selecionado.'
              : 'Crie um novo curso exclusivo na plataforma.'}
          </p>
        </div>

        <article className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="course-title" className={fieldLabelClass}>
              Título
            </label>
            <input
              id="course-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Curso Completo TRT"
              className={inputClass}
              disabled={isSaving}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="course-access-level" className={fieldLabelClass}>
              Nível de acesso
            </label>
            <select
              id="course-access-level"
              value={accessLevel}
              onChange={(e) => setAccessLevel(e.target.value as AccessLevel)}
              className={inputClass}
              disabled={isSaving}
            >
              {ACCESS_LEVEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="course-whatsapp-group" className={fieldLabelClass}>
              Grupo do WhatsApp (opcional)
            </label>
            <input
              id="course-whatsapp-group"
              type="url"
              value={whatsappGroup}
              onChange={(e) => setWhatsappGroup(e.target.value)}
              placeholder="https://chat.whatsapp.com/..."
              className={inputClass}
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground">
              Link do grupo exibido na página do curso. Deixe em branco para
              ocultar o botão.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <span className={fieldLabelClass}>Capa do curso (opcional)</span>
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="sr-only"
              onChange={(e) => handleThumbnailChange(e.target.files)}
              disabled={isSaving}
            />
            <button
              type="button"
              onClick={() => thumbnailInputRef.current?.click()}
              disabled={isSaving}
              className="flex min-h-[140px] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background px-4 py-6 transition-colors hover:border-primary/40 hover:bg-muted/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {thumbnailDisplayUrl ? (
                <Image
                  src={thumbnailDisplayUrl}
                  alt="Pré-visualização da capa"
                  width={320}
                  height={180}
                  unoptimized
                  className="max-h-24 w-auto rounded-lg object-contain"
                />
              ) : (
                <>
                  <ImagePlus className="h-6 w-6 text-accent" aria-hidden />
                  <p className="text-center text-sm text-muted-foreground">
                    <span className="font-semibold text-accent">
                      Selecione do computador
                    </span>{' '}
                    ou arraste aqui
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG ou WEBP
                  </p>
                </>
              )}
            </button>

            {thumbnailDisplayUrl ? (
              <button
                type="button"
                onClick={handleRemoveThumbnail}
                disabled={isSaving}
                className="self-start text-xs font-semibold text-destructive transition-colors hover:underline disabled:cursor-not-allowed disabled:opacity-60"
              >
                Remover capa
              </button>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full rounded-xl border border-primary bg-primary py-3.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving
              ? 'Salvando...'
              : editingCourseId
                ? 'Salvar alterações'
                : 'Cadastrar curso'}
          </button>
        </article>
      </form>

      <section className="flex flex-col gap-3">
        <h3 className="text-base font-bold text-foreground">Cursos cadastrados</h3>

        {courses.length === 0 ? (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-muted/30">
                <BookOpen className="h-5 w-5 text-muted-foreground" aria-hidden />
              </span>
              <p className="text-sm font-semibold text-foreground">
                Nenhum curso cadastrado
              </p>
              <p className="max-w-sm text-xs text-muted-foreground">
                Os cursos que você cadastrar aparecerão aqui.
              </p>
            </div>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {courses.map((course) => {
              const isPublished = getCoursePublished(course)

              return (
                <li
                  key={course.id}
                  className="flex gap-3 rounded-xl border border-border bg-card p-4"
                >
                  {course.thumbnail_url ? (
                    <Image
                      src={course.thumbnail_url}
                      alt=""
                      width={96}
                      height={54}
                      unoptimized
                      className="h-14 w-24 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <span className="flex h-14 w-24 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/30">
                      <BookOpen
                        className="h-5 w-5 text-muted-foreground"
                        aria-hidden
                      />
                    </span>
                  )}
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p className="truncate text-sm font-bold text-foreground">
                      {getCourseTitle(course)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {accessLevelLabel(course.access_level)}
                    </p>
                    <Link
                      href={`/courses/${course.id}`}
                      className="mt-1 inline-flex w-fit items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[10px] font-bold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                    >
                      Abrir curso
                      <ExternalLink className="h-3 w-3" aria-hidden />
                    </Link>
                  </div>
                  <div className="flex shrink-0 flex-col items-end justify-center gap-2">
                    <div className="flex items-center gap-2">
                      <CourseKebabMenu
                        disabled={
                          isSaving ||
                          isDeleting ||
                          editingCourseId === course.id
                        }
                        ariaLabel={`Ações do curso: ${getCourseTitle(course)}`}
                        items={[
                          {
                            label: 'Editar',
                            icon: Pencil,
                            disabled:
                              isSaving ||
                              isDeleting ||
                              editingCourseId === course.id,
                            onClick: () => startEditCourse(course),
                          },
                          {
                            label: 'Excluir',
                            icon: Trash2,
                            variant: 'destructive',
                            disabled:
                              isSaving ||
                              isDeleting ||
                              editingCourseId === course.id,
                            onClick: () => setDeleteTarget(course),
                          },
                        ]}
                      />
                      <Switch
                        checked={isPublished}
                        onCheckedChange={(checked) =>
                          void handleTogglePublished(course.id, checked)
                        }
                        disabled={
                          togglingCourseId === course.id ||
                          editingCourseId === course.id ||
                          isDeleting
                        }
                        aria-label={`Publicação do curso: ${getCourseTitle(course)}`}
                        className="scale-125 data-checked:bg-chart-2"
                      />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {isPublished ? 'Publicado' : 'Rascunho'}
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </section>
  )
}
