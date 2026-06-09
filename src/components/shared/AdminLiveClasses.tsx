'use client'

import Image from 'next/image'
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import {
  CalendarClock,
  ExternalLink,
  ImagePlus,
  MoreVertical,
  Pencil,
  Radio,
  Trash2,
  TriangleAlert,
  X,
  type LucideIcon,
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import {
  CreateLiveClass,
  DeleteLiveClass,
  GetLiveClasses,
  UpdateLiveClass,
  UpdateLiveClassStatus,
} from '@/lib/lib-live-classes'
import {
  DeleteLessonThumbnail,
  UploadLessonThumbnail,
} from '@/lib/lib-storage'
import type { LiveClasses, LiveClassesStatus } from '@/types'
import { toast } from 'sonner'

const fieldLabelClass =
  'text-[11px] font-bold uppercase tracking-wider text-muted-foreground'

const inputClass =
  'w-full rounded-lg border border-border bg-primary-foreground px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50'

function formatScheduledAt(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

function toDatetimeLocalValue(value: string | null) {
  if (!value) return ''
  const date = new Date(value)
  const pad = (part: number) => String(part).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

type LiveClassKebabMenuItem = {
  label: string
  icon: LucideIcon
  onClick: () => void
  variant?: 'default' | 'destructive'
  disabled?: boolean
}

type LiveClassKebabMenuProps = {
  items: LiveClassKebabMenuItem[]
  disabled?: boolean
  ariaLabel?: string
}

function LiveClassKebabMenu({
  items,
  disabled = false,
  ariaLabel = 'Abrir menu',
}: LiveClassKebabMenuProps) {
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

export default function AdminLiveClasses() {
  const thumbnailInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [streamUrl, setStreamUrl] = useState('')
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [savedThumbnailUrl, setSavedThumbnailUrl] = useState<string | null>(null)
  const [thumbnailRemoved, setThumbnailRemoved] = useState(false)
  const [editingLiveClassId, setEditingLiveClassId] = useState<string | null>(
    null,
  )
  const [isSaving, setIsSaving] = useState(false)
  const [liveClasses, setLiveClasses] = useState<LiveClasses[]>([])
  const [statusState, setStatusState] = useState<
    Record<string, LiveClassesStatus>
  >({})
  const [togglingLiveClassId, setTogglingLiveClassId] = useState<string | null>(
    null,
  )
  const [deleteTarget, setDeleteTarget] = useState<LiveClasses | null>(null)
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

  useEffect(() => {
    async function fetchLiveClasses() {
      const { data, error } = await GetLiveClasses()
      if (error) {
        toast.error('Erro ao carregar as transmissões programadas.')
        return
      }
      if (data) setLiveClasses(data)
    }

    void fetchLiveClasses()
  }, [])

  function handleThumbnailChange(files: FileList | null) {
    if (!files?.[0]) return
    const file = files[0]
    if (!file.type.startsWith('image/')) {
      toast.error('Envie apenas imagens para a thumbnail.')
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
    setEditingLiveClassId(null)
    setTitle('')
    setScheduledAt('')
    setStreamUrl('')
    setThumbnailFile(null)
    setSavedThumbnailUrl(null)
    setThumbnailRemoved(false)
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = ''
  }

  function startEditLiveClass(liveClass: LiveClasses) {
    resetForm()
    setEditingLiveClassId(liveClass.id)
    setTitle(liveClass.title ?? '')
    setScheduledAt(toDatetimeLocalValue(liveClass.scheduled_at))
    setStreamUrl(liveClass.video_url ?? '')
    setSavedThumbnailUrl(liveClass.thumbnail_url)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    resetForm()
  }

  function getLiveClassStatus(liveClass: LiveClasses): LiveClassesStatus {
    return (
      statusState[liveClass.id] ??
      liveClass.status ??
      'scheduled'
    )
  }

  async function handleToggleStatus(
    liveClassId: string,
    isScheduled: boolean,
  ) {
    const nextStatus: LiveClassesStatus = isScheduled ? 'scheduled' : 'ended'
    const previous =
      statusState[liveClassId] ??
      liveClasses.find((item) => item.id === liveClassId)?.status ??
      'scheduled'

    setStatusState((prev) => ({ ...prev, [liveClassId]: nextStatus }))
    setTogglingLiveClassId(liveClassId)

    const { error } = await UpdateLiveClassStatus(liveClassId, nextStatus)

    setTogglingLiveClassId(null)

    if (error) {
      setStatusState((prev) => ({ ...prev, [liveClassId]: previous }))
      toast.error(error.message)
      return
    }

    setLiveClasses((prev) =>
      prev.map((item) =>
        item.id === liveClassId ? { ...item, status: nextStatus } : item,
      ),
    )
  }

  async function refreshLiveClasses() {
    const { data, error } = await GetLiveClasses()
    if (!error && data) setLiveClasses(data)
  }

  async function handleDeleteLiveClass() {
    if (!deleteTarget) return

    setIsDeleting(true)

    try {
      const { error } = await DeleteLiveClass(deleteTarget.id)

      if (error) {
        toast.error(error.message)
        return
      }

      if (deleteTarget.thumbnail_url) {
        const { error: thumbError } = await DeleteLessonThumbnail(
          deleteTarget.thumbnail_url,
        )
        if (thumbError) {
          toast.error(thumbError.message)
        }
      }

      if (editingLiveClassId === deleteTarget.id) resetForm()

      setLiveClasses((prev) =>
        prev.filter((item) => item.id !== deleteTarget.id),
      )
      setStatusState((prev) => {
        const next = { ...prev }
        delete next[deleteTarget.id]
        return next
      })

      setDeleteTarget(null)
      toast.success('Transmissão excluída com sucesso!')
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleCreateLiveClass() {
    let thumbnailUrl: string | null = null

    if (thumbnailFile) {
      const { publicUrl, uploadError } = await UploadLessonThumbnail(
        thumbnailFile,
        `live-classes/${Date.now()}-${thumbnailFile.name}`,
      )

      if (uploadError || !publicUrl) {
        toast.error('Erro ao salvar a thumbnail, tente novamente.')
        return
      }

      thumbnailUrl = publicUrl
    }

    const scheduledAtIso = new Date(scheduledAt).toISOString()

    const { data, error } = await CreateLiveClass(
      title,
      scheduledAtIso,
      streamUrl,
      thumbnailUrl,
    )

    if (error || !data?.id) {
      toast.error(error?.message ?? 'Erro ao programar a transmissão.')
      return
    }

    await refreshLiveClasses()
    resetForm()
    toast.success('Transmissão programada com sucesso!')
  }

  async function handleUpdateLiveClass() {
    if (!editingLiveClassId) return

    const previousThumbnailUrl = savedThumbnailUrl
    let thumbnailToDelete: string | null = null
    let finalThumbnailUrl: string | null = null

    if (thumbnailRemoved && !thumbnailFile) {
      finalThumbnailUrl = null
      if (previousThumbnailUrl) thumbnailToDelete = previousThumbnailUrl
    } else if (thumbnailFile) {
      const { publicUrl, uploadError } = await UploadLessonThumbnail(
        thumbnailFile,
        `live-classes/${Date.now()}-${thumbnailFile.name}`,
      )

      if (uploadError || !publicUrl) {
        toast.error('Erro ao salvar a thumbnail, tente novamente.')
        return
      }

      finalThumbnailUrl = publicUrl
      if (previousThumbnailUrl) thumbnailToDelete = previousThumbnailUrl
    } else {
      finalThumbnailUrl = savedThumbnailUrl
    }

    const scheduledAtIso = new Date(scheduledAt).toISOString()

    const { error } = await UpdateLiveClass(
      editingLiveClassId,
      title,
      scheduledAtIso,
      streamUrl,
      finalThumbnailUrl,
    )

    if (error) {
      toast.error(error.message)
      return
    }

    if (thumbnailToDelete) {
      const { error: thumbDeleteError } =
        await DeleteLessonThumbnail(thumbnailToDelete)
      if (thumbDeleteError) {
        toast.error(thumbDeleteError.message)
        return
      }
    }

    await refreshLiveClasses()
    resetForm()
    toast.success('Transmissão atualizada com sucesso!')
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (!title.trim() || !scheduledAt || !streamUrl.trim()) {
      toast.error('Preencha todos os campos obrigatórios.')
      return
    }

    setIsSaving(true)

    try {
      if (editingLiveClassId) {
        await handleUpdateLiveClass()
      } else {
        await handleCreateLiveClass()
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
                    Esta ação remove a transmissão da lista.
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
                Transmissão selecionada
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {deleteTarget.title ?? 'Sem título'}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={isDeleting}
                className="rounded-full border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/20 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => void handleDeleteLiveClass()}
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
        {editingLiveClassId ? (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3">
            <p className="text-sm font-semibold text-foreground">
              Editando transmissão
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
            {editingLiveClassId
              ? 'Atualizar aula ao vivo'
              : 'Programar aula ao vivo'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {editingLiveClassId
              ? 'Altere os detalhes da transmissão selecionada.'
              : 'Defina os detalhes da próxima transmissão ao vivo.'}
          </p>
        </div>

        <article className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="live-title" className={fieldLabelClass}>
              Título
            </label>
            <input
              id="live-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Live — Dicas finais Contagem 2026"
              className={inputClass}
              disabled={isSaving}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="live-scheduled-at" className={fieldLabelClass}>
              Data e horário
            </label>
            <div className="relative">
              <input
                id="live-scheduled-at"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className={`${inputClass} pr-10`}
                disabled={isSaving}
              />
              <CalendarClock
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="live-stream-url" className={fieldLabelClass}>
              Link da transmissão
            </label>
            <input
              id="live-stream-url"
              type="url"
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              placeholder="https://..."
              className={inputClass}
              disabled={isSaving}
            />
          </div>

          <div className="flex flex-col gap-3">
            <span className={fieldLabelClass}>Thumbnail (opcional)</span>
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
                  alt="Pré-visualização da thumbnail"
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
                Remover thumbnail
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
              : editingLiveClassId
                ? 'Salvar alterações'
                : 'Programar transmissão'}
          </button>
        </article>
      </form>

      <section className="flex flex-col gap-3">
        <h3 className="text-base font-bold text-foreground">
          Próximas transmissões
        </h3>

        {liveClasses.length === 0 ? (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-muted/30">
                <Radio className="h-5 w-5 text-muted-foreground" aria-hidden />
              </span>
              <p className="text-sm font-semibold text-foreground">
                Nenhuma transmissão programada
              </p>
              <p className="max-w-sm text-xs text-muted-foreground">
                As aulas ao vivo que você programar aparecerão aqui.
              </p>
            </div>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {liveClasses.map((liveClass) => {
              const isScheduled = getLiveClassStatus(liveClass) === 'scheduled'

              return (
                <li
                  key={liveClass.id}
                  className="flex gap-3 rounded-xl border border-border bg-card p-4"
                >
                  {liveClass.thumbnail_url ? (
                    <Image
                      src={liveClass.thumbnail_url}
                      alt=""
                      width={96}
                      height={54}
                      unoptimized
                      className="h-14 w-24 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <span className="flex h-14 w-24 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/30">
                      <Radio
                        className="h-5 w-5 text-muted-foreground"
                        aria-hidden
                      />
                    </span>
                  )}
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p className="truncate text-sm font-bold text-foreground">
                      {liveClass.title ?? 'Sem título'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatScheduledAt(liveClass.scheduled_at)}
                    </p>
                    {liveClass.video_url ? (
                      <a
                        href={liveClass.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
                      >
                        Abrir link
                        <ExternalLink className="h-3 w-3" aria-hidden />
                      </a>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-col items-end justify-center gap-2">
                    <div className="flex items-center gap-2">
                      <LiveClassKebabMenu
                        disabled={
                          isSaving ||
                          isDeleting ||
                          editingLiveClassId === liveClass.id
                        }
                        ariaLabel={`Ações da transmissão: ${liveClass.title ?? 'Sem título'}`}
                        items={[
                          {
                            label: 'Editar',
                            icon: Pencil,
                            disabled:
                              isSaving ||
                              isDeleting ||
                              editingLiveClassId === liveClass.id,
                            onClick: () => startEditLiveClass(liveClass),
                          },
                          {
                            label: 'Excluir',
                            icon: Trash2,
                            variant: 'destructive',
                            disabled:
                              isSaving ||
                              isDeleting ||
                              editingLiveClassId === liveClass.id,
                            onClick: () => setDeleteTarget(liveClass),
                          },
                        ]}
                      />
                      <Switch
                        checked={isScheduled}
                        onCheckedChange={(checked) =>
                          void handleToggleStatus(liveClass.id, checked)
                        }
                        disabled={
                          togglingLiveClassId === liveClass.id ||
                          editingLiveClassId === liveClass.id ||
                          isDeleting
                        }
                        aria-label={`Status da transmissão: ${liveClass.title ?? 'Sem título'}`}
                        className="data-checked:bg-chart-2 scale-125"
                      />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {isScheduled ? 'Programada' : 'Encerrada'}
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
