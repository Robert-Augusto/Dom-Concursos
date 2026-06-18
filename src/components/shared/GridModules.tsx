'use client'

import { useProfile } from '@/context/ProfileContext'
import {
  CreateCourseModule,
  CreateCourseSection,
  DeleteCourseModule,
  GetCourseSectionsWithModules,
  ReorderCourseSections,
  ReorderSectionModules,
  UpdateCourseModuleThumbnail,
  UpdateCourseSectionTitle,
} from '@/lib/lib-courses-sections'
import {
  DeleteCourseThumbnail,
  UploadCourseModuleThumbnail,
} from '@/lib/lib-storage'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  ChevronUp,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

type ModuleItem = {
  id: number
  thumbnailUrl: string | null
}

type SectionItem = {
  id: number
  title: string
  modules: ModuleItem[]
}

type PendingModule = {
  sectionId: number
  previewUrl: string
  file: File
}

type PendingModuleEdit = {
  sectionId: number
  moduleId: number
  previewUrl: string
  file: File
  previousThumbnailUrl: string | null
}

type FilePickerTarget =
  | { type: 'create'; sectionId: number }
  | {
      type: 'edit'
      sectionId: number
      moduleId: number
      previousThumbnailUrl: string | null
    }

type GridModulesProps = {
  courseId: number
}

function mapSectionsFromDb(
  rows: Awaited<ReturnType<typeof GetCourseSectionsWithModules>>['data'],
): SectionItem[] {
  return rows.map((section) => ({
    id: section.id,
    title: section.title?.trim() || 'Seção sem título',
    modules: (section.courses_modules ?? []).map((module) => ({
      id: module.id,
      thumbnailUrl: module.thumbnail_url,
    })),
  }))
}

function sectionsAreEqual(a: SectionItem[], b: SectionItem[]): boolean {
  if (a.length !== b.length) return false

  return a.every((section, index) => {
    const other = b[index]
    if (!other) return false
    if (section.id !== other.id || section.title !== other.title) return false
    if (section.modules.length !== other.modules.length) return false

    return section.modules.every(
      (module, moduleIndex) =>
        module.id === other.modules[moduleIndex]?.id &&
        module.thumbnailUrl === other.modules[moduleIndex]?.thumbnailUrl,
    )
  })
}

type ModuleScrollRowProps = {
  children: ReactNode
}

function ModuleScrollRow({ children }: ModuleScrollRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const savedScrollLeftRef = useRef(0)

  useLayoutEffect(() => {
    const element = scrollRef.current
    if (!element) return
    element.scrollLeft = savedScrollLeftRef.current
  })

  return (
    <div
      ref={scrollRef}
      onScroll={() => {
        if (scrollRef.current) {
          savedScrollLeftRef.current = scrollRef.current.scrollLeft
        }
      }}
      className="flex gap-4 overflow-x-auto px-2 py-2 scrollbar-none"
    >
      {children}
    </div>
  )
}

export default function GridModules({ courseId }: GridModulesProps) {
  const router = useRouter()
  const { profile, loading: profileLoading } = useProfile()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isAdmin = profile?.role === 'admin'

  const [sections, setSections] = useState<SectionItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingSection, setIsCreatingSection] = useState(false)
  const [isSavingModule, setIsSavingModule] = useState(false)
  const [savingModuleId, setSavingModuleId] = useState<number | null>(null)
  const [deletingModuleId, setDeletingModuleId] = useState<number | null>(null)
  const [deleteConfirmModuleId, setDeleteConfirmModuleId] = useState<
    number | null
  >(null)
  const [newSectionTitle, setNewSectionTitle] = useState('')
  const [filePickerTarget, setFilePickerTarget] =
    useState<FilePickerTarget | null>(null)
  const [pendingModule, setPendingModule] = useState<PendingModule | null>(null)
  const [pendingModuleEdit, setPendingModuleEdit] =
    useState<PendingModuleEdit | null>(null)
  const [reorderingSectionId, setReorderingSectionId] = useState<number | null>(
    null,
  )
  const [reorderingModuleId, setReorderingModuleId] = useState<number | null>(
    null,
  )
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null)
  const [draftSectionTitle, setDraftSectionTitle] = useState('')
  const [savingSectionId, setSavingSectionId] = useState<number | null>(null)
  const silentReloadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  )

  const loadSections = useCallback(async (options?: { silent?: boolean }) => {
    if (profileLoading) return

    if (!options?.silent) setIsLoading(true)
    const { data, error } = await GetCourseSectionsWithModules(courseId, {
      includeUnpublishedModules: isAdmin,
    })

    if (error) {
      if (!options?.silent) toast.error(error.message)
      setSections([])
    } else {
      const mapped = mapSectionsFromDb(data)
      setSections((prev) =>
        sectionsAreEqual(prev, mapped) ? prev : mapped,
      )
    }

    if (!options?.silent) setIsLoading(false)
  }, [courseId, isAdmin, profileLoading])

  const scheduleSilentReload = useCallback(() => {
    if (silentReloadTimeoutRef.current) {
      clearTimeout(silentReloadTimeoutRef.current)
    }

    silentReloadTimeoutRef.current = setTimeout(() => {
      void loadSections({ silent: true })
    }, 400)
  }, [loadSections])

  useEffect(() => {
    void loadSections()
  }, [loadSections])

  useEffect(() => {
    if (profileLoading) return

    const supabase = createClient()
    const channel = supabase
      .channel(`grid_modules_${courseId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'courses_sections',
          filter: `courses_id=eq.${courseId}`,
        },
        () => {
          scheduleSilentReload()
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'courses_modules' },
        () => {
          scheduleSilentReload()
        },
      )
      .subscribe()

    return () => {
      if (silentReloadTimeoutRef.current) {
        clearTimeout(silentReloadTimeoutRef.current)
      }
      void supabase.removeChannel(channel)
    }
  }, [courseId, loadSections, profileLoading, scheduleSilentReload])

  function revokePendingModule() {
    if (pendingModule) {
      URL.revokeObjectURL(pendingModule.previewUrl)
    }
  }

  function revokePendingModuleEdit() {
    if (pendingModuleEdit) {
      URL.revokeObjectURL(pendingModuleEdit.previewUrl)
    }
  }

  function clearPendingModuleEdit() {
    revokePendingModuleEdit()
    setPendingModuleEdit(null)
  }

  function clearPendingModule() {
    revokePendingModule()
    setPendingModule(null)
  }

  function clearAllPendingImages() {
    clearPendingModule()
    clearPendingModuleEdit()
  }

  async function handleAddSection() {
    const title = newSectionTitle.trim()
    if (!title) {
      toast.error('Informe o nome da seção')
      return
    }

    setIsCreatingSection(true)
    const { data, error } = await CreateCourseSection(courseId, title)
    setIsCreatingSection(false)

    if (error) {
      toast.error(error.message)
      return
    }

    if (!data) return

    setSections((prev) => [
      ...prev,
      {
        id: data.id,
        title: data.title?.trim() || title,
        modules: [],
      },
    ])
    setNewSectionTitle('')
    toast.success('Seção criada')
  }

  function handleSectionKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      void handleAddSection()
    }
  }

  function openModuleImagePicker(sectionId: number) {
    setFilePickerTarget({ type: 'create', sectionId })
    fileInputRef.current?.click()
  }

  function openEditModuleImagePicker(sectionId: number, module: ModuleItem) {
    setFilePickerTarget({
      type: 'edit',
      sectionId,
      moduleId: module.id,
      previousThumbnailUrl: module.thumbnailUrl,
    })
    fileInputRef.current?.click()
  }

  function handleModuleImageSelected(file: File | undefined) {
    if (!file || !filePickerTarget) return
    if (!file.type.startsWith('image/')) {
      toast.error('Selecione um arquivo de imagem')
      return
    }

    clearAllPendingImages()
    const previewUrl = URL.createObjectURL(file)

    if (filePickerTarget.type === 'create') {
      setPendingModule({
        sectionId: filePickerTarget.sectionId,
        previewUrl,
        file,
      })
    } else {
      setPendingModuleEdit({
        sectionId: filePickerTarget.sectionId,
        moduleId: filePickerTarget.moduleId,
        previewUrl,
        file,
        previousThumbnailUrl: filePickerTarget.previousThumbnailUrl,
      })
    }

    setFilePickerTarget(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function savePendingModule() {
    if (!pendingModule) return

    const section = sections.find((item) => item.id === pendingModule.sectionId)
    if (!section) return

    setIsSavingModule(true)

    const { publicUrl, uploadError } = await UploadCourseModuleThumbnail(
      pendingModule.file,
      courseId,
      pendingModule.sectionId,
    )

    if (uploadError) {
      toast.error(uploadError.message)
      setIsSavingModule(false)
      return
    }

    if (!publicUrl) {
      toast.error('Não foi possível enviar a imagem')
      setIsSavingModule(false)
      return
    }

    const { data, error } = await CreateCourseModule(
      pendingModule.sectionId,
      publicUrl,
    )

    setIsSavingModule(false)

    if (error) {
      toast.error(error.message)
      return
    }

    if (!data) return

    setSections((prev) =>
      prev.map((item) =>
        item.id === pendingModule.sectionId
          ? {
              ...item,
              modules: [
                ...item.modules,
                {
                  id: data.id,
                  thumbnailUrl: data.thumbnail_url,
                },
              ],
            }
          : item,
      ),
    )

    revokePendingModule()
    setPendingModule(null)
    toast.success('Módulo criado')
  }

  function cancelPendingModule() {
    clearPendingModule()
  }

  function cancelPendingModuleEdit() {
    clearPendingModuleEdit()
  }

  async function savePendingModuleEdit() {
    if (!pendingModuleEdit) return

    setIsSavingModule(true)
    setSavingModuleId(pendingModuleEdit.moduleId)

    const { publicUrl, uploadError } = await UploadCourseModuleThumbnail(
      pendingModuleEdit.file,
      courseId,
      pendingModuleEdit.sectionId,
    )

    if (uploadError) {
      toast.error(uploadError.message)
      setIsSavingModule(false)
      setSavingModuleId(null)
      return
    }

    if (!publicUrl) {
      toast.error('Não foi possível enviar a imagem')
      setIsSavingModule(false)
      setSavingModuleId(null)
      return
    }

    const { data, error } = await UpdateCourseModuleThumbnail(
      pendingModuleEdit.moduleId,
      publicUrl,
    )

    if (error) {
      toast.error(error.message)
      setIsSavingModule(false)
      setSavingModuleId(null)
      return
    }

    if (pendingModuleEdit.previousThumbnailUrl) {
      await DeleteCourseThumbnail(pendingModuleEdit.previousThumbnailUrl)
    }

    if (data) {
      setSections((prev) =>
        prev.map((section) =>
          section.id === pendingModuleEdit.sectionId
            ? {
                ...section,
                modules: section.modules.map((module) =>
                  module.id === pendingModuleEdit.moduleId
                    ? { ...module, thumbnailUrl: data.thumbnail_url }
                    : module,
                ),
              }
            : section,
        ),
      )
    }

    revokePendingModuleEdit()
    setPendingModuleEdit(null)
    setIsSavingModule(false)
    setSavingModuleId(null)
    toast.success('Imagem do módulo atualizada')
  }

  async function handleDeleteModule(sectionId: number, module: ModuleItem) {
    setDeletingModuleId(module.id)

    if (module.thumbnailUrl) {
      const { error: storageError } = await DeleteCourseThumbnail(
        module.thumbnailUrl,
      )
      if (storageError) {
        toast.error(storageError.message)
        setDeletingModuleId(null)
        return
      }
    }

    const { error } = await DeleteCourseModule(module.id)
    setDeletingModuleId(null)

    if (error) {
      toast.error(error.message)
      return
    }

    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              modules: section.modules.filter((item) => item.id !== module.id),
            }
          : section,
      ),
    )
    setDeleteConfirmModuleId(null)

    if (pendingModuleEdit?.moduleId === module.id) {
      clearPendingModuleEdit()
    }

    toast.success('Módulo excluído')
  }

  function startEditSectionTitle(section: SectionItem) {
    setEditingSectionId(section.id)
    setDraftSectionTitle(section.title)
  }

  function cancelEditSectionTitle() {
    setEditingSectionId(null)
    setDraftSectionTitle('')
  }

  async function saveSectionTitle(sectionId: number) {
    const trimmed = draftSectionTitle.trim()

    if (!trimmed) {
      toast.error('Informe o nome da seção')
      return
    }

    setSavingSectionId(sectionId)

    const { data, error } = await UpdateCourseSectionTitle(sectionId, trimmed)

    setSavingSectionId(null)

    if (error) {
      toast.error(error.message)
      return
    }

    const nextTitle = data?.title?.trim() || trimmed

    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId ? { ...section, title: nextTitle } : section,
      ),
    )
    setEditingSectionId(null)
    setDraftSectionTitle('')
    toast.success('Seção atualizada')
  }

  async function handleMoveSection(
    sectionId: number,
    direction: 'up' | 'down',
  ) {
    if (reorderingSectionId !== null) return

    const currentIndex = sections.findIndex((section) => section.id === sectionId)
    const targetIndex =
      direction === 'up' ? currentIndex - 1 : currentIndex + 1

    if (
      currentIndex < 0 ||
      targetIndex < 0 ||
      targetIndex >= sections.length
    ) {
      return
    }

    const reordered = [...sections]
    const [movedSection] = reordered.splice(currentIndex, 1)
    reordered.splice(targetIndex, 0, movedSection)

    const previousOrder = sections
    setSections(reordered)
    setReorderingSectionId(sectionId)

    const { error } = await ReorderCourseSections(
      courseId,
      reordered.map((section) => section.id),
    )

    setReorderingSectionId(null)

    if (error) {
      toast.error(error.message)
      setSections(previousOrder)
    }
  }

  async function handleMoveModule(
    sectionId: number,
    moduleId: number,
    direction: 'left' | 'right',
  ) {
    if (reorderingModuleId !== null) return

    const section = sections.find((item) => item.id === sectionId)
    if (!section) return

    const currentIndex = section.modules.findIndex(
      (module) => module.id === moduleId,
    )
    const targetIndex =
      direction === 'left' ? currentIndex - 1 : currentIndex + 1

    if (
      currentIndex < 0 ||
      targetIndex < 0 ||
      targetIndex >= section.modules.length
    ) {
      return
    }

    const reorderedModules = [...section.modules]
    const [movedModule] = reorderedModules.splice(currentIndex, 1)
    reorderedModules.splice(targetIndex, 0, movedModule)

    const previousSections = sections
    setSections((prev) =>
      prev.map((item) =>
        item.id === sectionId ? { ...item, modules: reorderedModules } : item,
      ),
    )
    setReorderingModuleId(moduleId)

    const { error } = await ReorderSectionModules(
      sectionId,
      reorderedModules.map((module) => module.id),
    )

    setReorderingModuleId(null)

    if (error) {
      toast.error(error.message)
      setSections(previousSections)
    }
  }

  function renderScrollHint() {
    return (
      <div className="flex flex-col items-center gap-1 pt-1">
        <div className="flex items-center justify-center gap-1.5">
          <div className="h-1 w-6 rounded-full bg-primary" />
          <div className="h-1 w-3 rounded-full bg-muted" />
          <div className="h-1 w-3 rounded-full bg-muted" />
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <ChevronsRight className="h-3.5 w-3.5 shrink-0 text-accent" />
          <span>Deslize para ver mais cursos</span>
        </div>
      </div>
    )
  }

  function renderModuleCard(
    sectionId: number,
    module: ModuleItem,
    moduleIndex: number,
    moduleCount: number,
  ) {
    const isEditing = pendingModuleEdit?.moduleId === module.id
    const isDeleteConfirm = deleteConfirmModuleId === module.id
    const isSaving =
      savingModuleId === module.id || deletingModuleId === module.id

    if (isEditing && pendingModuleEdit) {
      return (
        <div
          key={module.id}
          className="relative shrink-0 overflow-hidden rounded-2xl border border-border bg-card"
          style={{ width: '220px', height: '280px', minWidth: '220px' }}
        >
          <Image
            src={pendingModuleEdit.previewUrl}
            alt=""
            fill
            unoptimized
            className="object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 space-y-2 bg-black/75 p-3">
            <p className="text-[10px] text-white/80">
              Nova imagem selecionada — salve para aplicar
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-chart-2 px-2 py-1.5 text-[10px] font-bold text-primary-foreground disabled:opacity-50"
                onClick={() => void savePendingModuleEdit()}
                disabled={isSavingModule}
              >
                {isSavingModule ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Save className="h-3 w-3" />
                )}
                Salvar
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg border border-border bg-background/90 px-2 py-1.5 text-[10px] font-bold text-muted-foreground disabled:opacity-50"
                onClick={cancelPendingModuleEdit}
                disabled={isSavingModule}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div
        key={module.id}
        className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-chart-5 transition-colors hover:border-primary/30"
        style={{ width: '220px', height: '280px', minWidth: '220px' }}
        onClick={() => router.push(`/courses/lesson/${module.id}`)}
      >
        {module.thumbnailUrl ? (
          <Image
            src={module.thumbnailUrl}
            alt=""
            fill
            unoptimized={module.thumbnailUrl.startsWith('blob:')}
            className="object-cover"
          />
        ) : null}

        {isAdmin ? (
          <div
            className="absolute left-2 top-2 z-10 flex gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => void handleMoveModule(sectionId, module.id, 'left')}
              disabled={
                moduleIndex === 0 ||
                reorderingModuleId !== null ||
                isSaving
              }
              aria-label="Mover módulo para a esquerda"
              className="inline-flex h-7 w-7 items-center justify-center rounded border border-border bg-background/90 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              {reorderingModuleId === module.id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ChevronLeft className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              type="button"
              onClick={() =>
                void handleMoveModule(sectionId, module.id, 'right')
              }
              disabled={
                moduleIndex === moduleCount - 1 ||
                reorderingModuleId !== null ||
                isSaving
              }
              aria-label="Mover módulo para a direita"
              className="inline-flex h-7 w-7 items-center justify-center rounded border border-border bg-background/90 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : null}

        {isAdmin ? (
          <div
            className="absolute inset-x-0 bottom-0 bg-black/75 p-2"
            onClick={(e) => e.stopPropagation()}
          >
            {isDeleteConfirm ? (
              <div className="space-y-2">
                <p className="text-[10px] text-destructive">Excluir módulo?</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-destructive px-2 py-1.5 text-[10px] font-bold text-destructive-foreground disabled:opacity-50"
                    onClick={() => void handleDeleteModule(sectionId, module)}
                    disabled={isSaving}
                  >
                    {deletingModuleId === module.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      'Sim'
                    )}
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-lg border border-border bg-background/90 px-2 py-1.5 text-[10px] font-bold text-muted-foreground"
                    onClick={() => setDeleteConfirmModuleId(null)}
                    disabled={isSaving}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-foreground/25 px-2 py-1.5 text-[10px] font-bold text-white/80 transition-colors hover:border-destructive/40 hover:text-destructive disabled:opacity-50"
                  onClick={() => setDeleteConfirmModuleId(module.id)}
                  disabled={isSaving}
                >
                  <Trash2 className="h-3 w-3" />
                  Excluir
                </button>
                <button
                  type="button"
                  className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-foreground/25 px-2 py-1.5 text-[10px] font-bold text-white/80 transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-50"
                  onClick={() => openEditModuleImagePicker(sectionId, module)}
                  disabled={isSaving}
                >
                  <Pencil className="h-3 w-3" />
                  Imagem
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    )
  }

  function renderPendingModuleCard() {
    if (!pendingModule) return null

    return (
      <div
        className="relative shrink-0 overflow-hidden rounded-2xl border border-border bg-card"
        style={{ width: '220px', height: '280px', minWidth: '220px' }}
      >
        <Image
          src={pendingModule.previewUrl}
          alt=""
          fill
          unoptimized
          className="object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 space-y-2 bg-black/75 p-3">
          <p className="text-[10px] text-white/80">
            Nova imagem selecionada — salve para aplicar
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-chart-2 px-2 py-1.5 text-[10px] font-bold text-primary-foreground disabled:opacity-50"
              onClick={() => void savePendingModule()}
              disabled={isSavingModule}
            >
              {isSavingModule ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Save className="h-3 w-3" />
              )}
              Salvar
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-background/90 px-2 py-1.5 text-[10px] font-bold text-muted-foreground disabled:opacity-50"
              onClick={cancelPendingModule}
              disabled={isSavingModule}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  function renderAddModuleCard(sectionId: number) {
    const hasPendingInSection = pendingModule?.sectionId === sectionId

    if (hasPendingInSection) return null

    return (
      <button
        type="button"
        className="flex shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-muted/30 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        style={{ width: '220px', height: '280px', minWidth: '220px' }}
        onClick={() => openModuleImagePicker(sectionId)}
      >
        <ImagePlus className="h-8 w-8" />
        <span className="px-4 text-center text-[10px] font-bold">
          Enviar imagem do módulo
        </span>
      </button>
    )
  }

  if (isLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-10">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleModuleImageSelected(e.target.files?.[0])}
      />

      {isAdmin ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
          <label className="text-xs font-bold text-muted-foreground">
            Nova seção
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              onKeyDown={handleSectionKeyDown}
              placeholder="Digite o nome da seção"
              className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              disabled={isCreatingSection}
            />
            <button
              type="button"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              onClick={() => void handleAddSection()}
              disabled={isCreatingSection}
            >
              {isCreatingSection ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              Adicionar seção
            </button>
          </div>
        </div>
      ) : null}

      {sections.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center text-xs text-muted-foreground">
          Nenhuma seção neste curso
        </div>
      ) : null}

      {sections.map((section, sectionIndex) => (
        <section key={section.id} className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {isAdmin ? (
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => void handleMoveSection(section.id, 'up')}
                    disabled={
                      sectionIndex === 0 || reorderingSectionId !== null
                    }
                    aria-label="Mover seção para cima"
                    className="inline-flex h-7 w-7 items-center justify-center rounded border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {reorderingSectionId === section.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <ChevronUp className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleMoveSection(section.id, 'down')}
                    disabled={
                      sectionIndex === sections.length - 1 ||
                      reorderingSectionId !== null
                    }
                    aria-label="Mover seção para baixo"
                    className="inline-flex h-7 w-7 items-center justify-center rounded border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : null}
              {isAdmin && editingSectionId === section.id ? (
                <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    type="text"
                    value={draftSectionTitle}
                    onChange={(e) => setDraftSectionTitle(e.target.value)}
                    className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground"
                    disabled={savingSectionId === section.id}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        void saveSectionTitle(section.id)
                      }
                      if (e.key === 'Escape') cancelEditSectionTitle()
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-1 rounded-lg bg-primary px-3 py-2 text-[10px] font-bold text-primary-foreground disabled:opacity-50"
                      onClick={() => void saveSectionTitle(section.id)}
                      disabled={savingSectionId === section.id}
                    >
                      {savingSectionId === section.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Save className="h-3 w-3" />
                      )}
                      Salvar
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-lg border border-border px-2 py-2 text-muted-foreground disabled:opacity-50"
                      onClick={cancelEditSectionTitle}
                      disabled={savingSectionId === section.id}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex min-w-0 items-center gap-2">
                  <h2 className="font-heading text-lg font-semibold text-foreground">
                    {section.title}
                  </h2>
                  {isAdmin ? (
                    <button
                      type="button"
                      onClick={() => startEditSectionTitle(section)}
                      disabled={
                        savingSectionId === section.id ||
                        reorderingSectionId !== null
                      }
                      className="inline-flex shrink-0 items-center justify-center rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-50"
                      aria-label="Editar nome da seção"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          <div>
            <ModuleScrollRow>
              {section.modules.map((module, moduleIndex) =>
                renderModuleCard(
                  section.id,
                  module,
                  moduleIndex,
                  section.modules.length,
                ),
              )}
              {pendingModule?.sectionId === section.id
                ? renderPendingModuleCard()
                : null}
              {isAdmin ? renderAddModuleCard(section.id) : null}
            </ModuleScrollRow>
          </div>

          {section.modules.length > 0 ? renderScrollHint() : null}
        </section>
      ))}
    </div>
  )
}
