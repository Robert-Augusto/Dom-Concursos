'use client'

import { useProfile } from '@/context/ProfileContext'
import {
  GetCourseModuleById,
  GetCourseModuleContext,
} from '@/lib/lib-courses-sections'
import {
  GetLessonById,
  GetLessonMaterials,
  GetLessonNote,
  GetLessonProgress,
  GetLessonsByModuleId,
  GetLessonsProgressByLessonIds,
  RecordLessonWatch,
  ReorderModuleLessons,
  SaveLessonNote,
  SaveLessonProgress,
  type CourseLesson,
} from '@/lib/lib-lessons'
import { formatLessonDuration } from '@/lib/lesson-duration'
import { getLessonVideoEmbedUrl } from '@/lib/lesson-video'
import { GetLessonMaterialSignedUrl } from '@/lib/lib-storage'
import { ModalCreateCourseLesson } from '@/components/shared/ModalCreateCourseLesson'
import { ModalEditCourseLesson } from '@/components/shared/ModalEditCourseLesson'
import { createClient } from '@/lib/supabase/client'
import type { LessonMaterials } from '@/types'
import {
  ArrowLeft,
  Bookmark,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ClipboardList,
  Download,
  FileText,
  LayoutTemplate,
  Loader2,
  Map,
  NotebookPen,
  Paperclip,
  Pencil,
  Play,
  Plus,
  Save,
  Sparkles,
} from 'lucide-react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

function getMaterialIcon(fileName: string) {
  const lower = fileName.toLowerCase()
  if (lower.endsWith('.pdf')) {
    return {
      icon: FileText,
      iconClassName: 'text-destructive',
      bgClassName: 'bg-destructive/20',
    }
  }
  if (lower.endsWith('.docx')) {
    return {
      icon: FileText,
      iconClassName: 'text-accent',
      bgClassName: 'bg-accent/20',
    }
  }
  if (lower.endsWith('.pptx')) {
    return {
      icon: LayoutTemplate,
      iconClassName: 'text-primary',
      bgClassName: 'bg-primary/20',
    }
  }
  if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
    return {
      icon: Map,
      iconClassName: 'text-chart-5',
      bgClassName: 'bg-chart-5/20',
    }
  }
  return {
    icon: ClipboardList,
    iconClassName: 'text-muted-foreground',
    bgClassName: 'bg-muted',
  }
}

function dedupeLessonsById(lessons: CourseLesson[]): CourseLesson[] {
  const seen = new Set<number>()
  return lessons.filter((lesson) => {
    if (seen.has(lesson.id)) return false
    seen.add(lesson.id)
    return true
  })
}

type LessonProgressSummary = {
  completed: boolean
  lastWatchedAt: string | null
}

function getLessonProgressBarWidth(
  progress: LessonProgressSummary | undefined,
) {
  if (progress?.completed) return '100%'
  if (progress?.lastWatchedAt) return '35%'
  return '0%'
}

export default function LessonPage() {
  const router = useRouter()
  const params = useParams()
  const { profile, loading: profileLoading } = useProfile()

  const isAdmin = profile?.role === 'admin'
  const paramId = Number(params.lessonId)

  const [completed, setCompleted] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('materiais')
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [moduleId, setModuleId] = useState<number | null>(null)
  const [courseId, setCourseId] = useState<number | null>(null)
  const [activeLesson, setActiveLesson] = useState<CourseLesson | null>(null)
  const [moduleLessons, setModuleLessons] = useState<CourseLesson[]>([])
  const [materials, setMaterials] = useState<LessonMaterials[]>([])
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [downloadingMaterialId, setDownloadingMaterialId] = useState<
    string | null
  >(null)
  const [isSavingProgress, setIsSavingProgress] = useState(false)
  const [isSavingNote, setIsSavingNote] = useState(false)
  const [reorderingLessonId, setReorderingLessonId] = useState<number | null>(
    null,
  )
  const [isMobile, setIsMobile] = useState(false)
  const [mobileView, setMobileView] = useState<'list' | 'player'>('list')
  const [moduleTitle, setModuleTitle] = useState<string | null>(null)
  const [lessonsProgressMap, setLessonsProgressMap] = useState<
    Record<number, LessonProgressSummary>
  >({})

  const loadLessonProgress = useCallback(
    async (lessonId: number) => {
      if (!profile?.id) {
        setCompleted(false)
        setSaved(false)
        return
      }

      const { data, error } = await GetLessonProgress(profile.id, lessonId)

      if (error) {
        toast.error(error.message)
        return
      }

      setCompleted(Boolean(data?.completed))
      setSaved(Boolean(data?.saved_for_review))
    },
    [profile?.id],
  )

  const loadLessonNote = useCallback(
    async (lessonId: number) => {
      if (!profile?.id) {
        setNotes('')
        return
      }

      const { data, error } = await GetLessonNote(profile.id, lessonId)

      if (error) {
        toast.error(error.message)
        return
      }

      setNotes(data?.content ?? '')
    },
    [profile?.id],
  )

  const loadLessonsProgress = useCallback(
    async (lessonIds: number[]) => {
      if (!profile?.id || lessonIds.length === 0) {
        setLessonsProgressMap({})
        return
      }

      const { data, error } = await GetLessonsProgressByLessonIds(
        profile.id,
        lessonIds,
      )

      if (error) {
        toast.error(error.message)
        return
      }

      const nextMap: Record<number, LessonProgressSummary> = {}
      for (const row of data) {
        if (!row.lessons_id) continue
        nextMap[row.lessons_id] = {
          completed: Boolean(row.completed),
          lastWatchedAt: row.last_watched_at,
        }
      }

      setLessonsProgressMap(nextMap)
    },
    [profile?.id],
  )

  const loadModuleLessons = useCallback(
    async (resolvedModuleId: number) => {
      const { data, error } = await GetLessonsByModuleId(resolvedModuleId, {
        includeUnpublished: isAdmin,
      })

      if (error) {
        toast.error(error.message)
        setModuleLessons([])
        return []
      }

      setModuleLessons(dedupeLessonsById(data))
      return dedupeLessonsById(data)
    },
    [isAdmin],
  )

  const loadMaterials = useCallback(async (lessonId: number, silent = false) => {
    if (!silent) setIsLoadingMaterials(true)
    const { data, error } = await GetLessonMaterials(lessonId)

    if (error) {
      if (!silent) toast.error(error.message)
      setMaterials([])
    } else {
      setMaterials(data)
    }

    if (!silent) setIsLoadingMaterials(false)
  }, [])

  const syncRealtimeData = useCallback(async () => {
    if (!moduleId) return

    const { data: lessons, error: lessonsError } = await GetLessonsByModuleId(
      moduleId,
      { includeUnpublished: isAdmin },
    )

    if (lessonsError) return

    setModuleLessons(dedupeLessonsById(lessons))

    const targetLessonId = lessons.some((lesson) => lesson.id === paramId)
      ? paramId
      : null

    if (!targetLessonId) return

    const { data: refreshedLesson } = await GetLessonById(targetLessonId)
    if (!refreshedLesson) {
      setActiveLesson(null)
      setMaterials([])
      return
    }

    setActiveLesson(refreshedLesson)
    await loadMaterials(refreshedLesson.id, true)
  }, [isAdmin, loadMaterials, moduleId, paramId])

  const loadPage = useCallback(async () => {
    if (profileLoading || !Number.isFinite(paramId)) return

    setIsLoading(true)

    const { data: lessonByParam, error: lessonError } =
      await GetLessonById(paramId)

    if (lessonError) {
      toast.error(lessonError.message)
      setIsLoading(false)
      return
    }

    let resolvedModuleId: number | null = null
    let resolvedLesson: CourseLesson | null = null

    if (lessonByParam) {
      resolvedLesson = lessonByParam
      resolvedModuleId = lessonByParam.courses_modules_id
    } else {
      const { data: module, error: moduleError } =
        await GetCourseModuleById(paramId)

      if (moduleError) {
        toast.error(moduleError.message)
        setIsLoading(false)
        return
      }

      if (!module) {
        toast.error('Aula ou módulo não encontrado')
        setIsLoading(false)
        return
      }

      resolvedModuleId = module.id
    }

    if (!resolvedModuleId) {
      toast.error('Módulo da aula não encontrado')
      setIsLoading(false)
      return
    }

    const { courseId: resolvedCourseId, error: contextError } =
      await GetCourseModuleContext(resolvedModuleId)

    if (contextError) {
      toast.error(contextError.message)
    }

    const lessons = await loadModuleLessons(resolvedModuleId)

    const { data: moduleData } = await GetCourseModuleById(resolvedModuleId)
    setModuleTitle(moduleData?.title ?? null)

    await loadLessonsProgress(lessons.map((lesson) => lesson.id))

    if (!resolvedLesson && lessons.length > 0) {
      router.replace(`/courses/lesson/${lessons[0].id}`)
      return
    }

    setModuleId(resolvedModuleId)
    setCourseId(resolvedCourseId)
    setActiveLesson(resolvedLesson)

    if (resolvedLesson) {
      await loadMaterials(resolvedLesson.id)
    } else {
      setMaterials([])
    }

    setIsLoading(false)
  }, [
    isAdmin,
    loadLessonsProgress,
    loadMaterials,
    loadModuleLessons,
    paramId,
    profileLoading,
    router,
  ])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1023px)')
    const updateIsMobile = () => setIsMobile(mediaQuery.matches)

    updateIsMobile()
    mediaQuery.addEventListener('change', updateIsMobile)

    return () => mediaQuery.removeEventListener('change', updateIsMobile)
  }, [])

  useEffect(() => {
    void loadPage()
  }, [loadPage])

  useEffect(() => {
    if (!activeLesson?.id) {
      setCompleted(false)
      setSaved(false)
      setNotes('')
      return
    }

    void loadLessonProgress(activeLesson.id)
    void loadLessonNote(activeLesson.id)
  }, [activeLesson?.id, loadLessonProgress, loadLessonNote])

  useEffect(() => {
    if (!profile?.id || !activeLesson?.id) return
    if (isMobile && mobileView !== 'player') return

    void RecordLessonWatch(profile.id, activeLesson.id).then(() => {
      setLessonsProgressMap((prev) => ({
        ...prev,
        [activeLesson.id]: {
          completed: prev[activeLesson.id]?.completed ?? completed,
          lastWatchedAt: new Date().toISOString(),
        },
      }))
    })
  }, [profile?.id, activeLesson?.id, isMobile, mobileView, completed])

  useEffect(() => {
    if (profileLoading || !moduleId) return

    const supabase = createClient()
    const channel = supabase
      .channel(`course_module_lessons_${moduleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lessons',
          filter: `courses_modules_id=eq.${moduleId}`,
        },
        () => {
          void syncRealtimeData()
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [moduleId, profileLoading, syncRealtimeData])

  useEffect(() => {
    if (!activeLesson?.id) return

    const lessonId = activeLesson.id
    const supabase = createClient()
    const channel = supabase
      .channel(`course_lesson_materials_${lessonId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lessons_materials',
          filter: `lessons_id=eq.${lessonId}`,
        },
        () => {
          void loadMaterials(lessonId, true)
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [activeLesson?.id, loadMaterials])

  async function handleMobileLessonOpen(lesson: CourseLesson) {
    setMobileView('player')

    if (activeLesson?.id !== lesson.id) {
      setActiveLesson(lesson)
      await loadMaterials(lesson.id)
      void loadLessonProgress(lesson.id)
      void loadLessonNote(lesson.id)
    }

    const targetUrl = `/courses/lesson/${lesson.id}?view=player`
    if (lesson.id === paramId) {
      router.replace(targetUrl, { scroll: false })
      return
    }

    router.push(targetUrl, { scroll: false })
  }

  function handleMobileBackToList() {
    setMobileView('list')
    const lessonId = activeLesson?.id ?? paramId
    router.replace(`/courses/lesson/${lessonId}`, { scroll: false })
  }

  async function handleLessonSelect(lesson: CourseLesson) {
    if (isMobile) {
      handleMobileLessonOpen(lesson)
      return
    }

    router.push(`/courses/lesson/${lesson.id}`)
  }

  function handleLessonCreated(lesson: CourseLesson) {
    if (isMobile) {
      handleMobileLessonOpen(lesson)
      return
    }

    router.push(`/courses/lesson/${lesson.id}`)
  }

  function handleLessonUpdated(lesson: CourseLesson) {
    setActiveLesson(lesson)
    setModuleLessons((prev) =>
      dedupeLessonsById(
        prev.map((item) => (item.id === lesson.id ? lesson : item)),
      ),
    )
    void loadMaterials(lesson.id, true)
  }

  function handleLessonDeleted(deletedLessonId: number) {
    const remainingLessons = moduleLessons.filter(
      (lesson) => lesson.id !== deletedLessonId,
    )

    setModuleLessons(remainingLessons)
    setEditModalOpen(false)

    if (remainingLessons.length === 0) {
      setActiveLesson(null)
      setMaterials([])
      setMobileView('list')

      if (courseId) {
        router.push(`/courses/${courseId}`)
      }

      return
    }

    if (activeLesson?.id !== deletedLessonId) {
      return
    }

    const nextLesson = remainingLessons[0]
    setActiveLesson(nextLesson)
    setMaterials([])
    setMobileView('list')
    void loadMaterials(nextLesson.id)
    void loadLessonsProgress(remainingLessons.map((lesson) => lesson.id))
    router.replace(`/courses/lesson/${nextLesson.id}`, { scroll: false })
  }

  async function handleMoveLesson(
    lessonId: number,
    direction: 'up' | 'down',
  ) {
    if (!moduleId || reorderingLessonId !== null) return

    const currentIndex = moduleLessons.findIndex(
      (lesson) => lesson.id === lessonId,
    )
    const targetIndex =
      direction === 'up' ? currentIndex - 1 : currentIndex + 1

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= moduleLessons.length) {
      return
    }

    const reordered = [...moduleLessons]
    const [movedLesson] = reordered.splice(currentIndex, 1)
    reordered.splice(targetIndex, 0, movedLesson)

    const previousOrder = moduleLessons
    setModuleLessons(reordered)
    setReorderingLessonId(lessonId)

    const { error } = await ReorderModuleLessons(
      moduleId,
      reordered.map((lesson) => lesson.id),
    )

    setReorderingLessonId(null)

    if (error) {
      toast.error(error.message)
      setModuleLessons(previousOrder)
      return
    }
  }

  async function handleToggleCompleted() {
    if (!profile?.id) {
      toast.error('Faça login para marcar o progresso da aula')
      return
    }

    if (!activeLesson?.id) return

    const nextCompleted = !completed
    setIsSavingProgress(true)

    const { error } = await SaveLessonProgress(profile.id, activeLesson.id, {
      completed: nextCompleted,
      savedForReview: saved,
    })

    setIsSavingProgress(false)

    if (error) {
      toast.error(error.message)
      return
    }

    setCompleted(nextCompleted)
    setLessonsProgressMap((prev) => ({
      ...prev,
      [activeLesson.id]: {
        completed: nextCompleted,
        lastWatchedAt: prev[activeLesson.id]?.lastWatchedAt ?? null,
      },
    }))
  }

  async function handleToggleSavedForReview() {
    if (!profile?.id) {
      toast.error('Faça login para salvar a aula para revisão')
      return
    }

    if (!activeLesson?.id) return

    const nextSaved = !saved
    setIsSavingProgress(true)

    const { error } = await SaveLessonProgress(profile.id, activeLesson.id, {
      completed,
      savedForReview: nextSaved,
    })

    setIsSavingProgress(false)

    if (error) {
      toast.error(error.message)
      return
    }

    setSaved(nextSaved)
  }

  async function handleSaveNote() {
    if (!profile?.id) {
      toast.error('Faça login para salvar anotações')
      return
    }

    if (!activeLesson?.id) return

    const trimmedNote = notes.trim()
    if (!trimmedNote) {
      toast.error('Escreva uma anotação antes de salvar')
      return
    }

    setIsSavingNote(true)

    const { error } = await SaveLessonNote(
      profile.id,
      activeLesson.id,
      trimmedNote,
    )

    setIsSavingNote(false)

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Anotação salva')
  }

  async function handleDownloadMaterial(material: LessonMaterials) {
    setDownloadingMaterialId(material.id)

    const { signedUrl, error } = await GetLessonMaterialSignedUrl(
      material.file_url,
    )

    setDownloadingMaterialId(null)

    if (error || !signedUrl) {
      toast.error(error?.message ?? 'Não foi possível baixar o arquivo')
      return
    }

    window.open(signedUrl, '_blank', 'noopener,noreferrer')
  }

  const embedUrl = activeLesson
    ? getLessonVideoEmbedUrl(activeLesson.video_type, activeLesson.video_url)
    : null
  const hasVideoUrl = Boolean(activeLesson?.video_url?.trim())

  function renderPlayerBackButton() {
    const isMobilePlayer = isMobile && mobileView === 'player'

    return (
      <button
        type="button"
        onClick={() => {
          if (isMobilePlayer) {
            handleMobileBackToList()
            return
          }
          if (courseId) {
            router.push(`/courses/${courseId}`)
            return
          }
          router.back()
        }}
        className="flex h-11 w-fit shrink-0 items-center gap-2 self-start rounded-lg border border-border bg-sidebar-accent px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted lg:h-12 lg:px-3"
      >
        {isMobilePlayer ? (
          <ArrowLeft className="h-5 w-5 shrink-0" />
        ) : (
          <ChevronLeft className="h-5 w-5 shrink-0 lg:h-6 lg:w-6" />
        )}
        <span className="font-heading font-medium">
          {isMobilePlayer ? 'Voltar às aulas' : 'Voltar'}
        </span>
      </button>
    )
  }

  function renderLessonPlayerContent() {
    if (!activeLesson) {
      return (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhuma aula neste módulo ainda.
          </p>
          {isAdmin ? (
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
            >
              <Plus className="h-4 w-4" />
              Criar primeira aula
            </button>
          ) : null}
        </div>
      )
    }

    return (
      <>
        {renderPlayerBackButton()}

        <div className="flex items-start justify-between gap-3">
          <h1 className="min-w-0 flex-1 font-heading text-xl font-semibold leading-tight text-foreground sm:text-2xl lg:text-3xl">
            {activeLesson.title}
          </h1>
          {isAdmin ? (
            <button
              type="button"
              onClick={() => setEditModalOpen(true)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-bold text-foreground transition-colors hover:border-primary/40"
            >
              <Pencil className="h-3.5 w-3.5" />
              Editar aula
            </button>
          ) : null}
        </div>

        {activeLesson.description ? (
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            {activeLesson.description}
          </p>
        ) : null}

        {hasVideoUrl ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={activeLesson.title ?? 'Aula'}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Vídeo indisponível
              </div>
            )}
          </div>
        ) : null}

        {hasVideoUrl ? (
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void handleToggleCompleted()}
              disabled={isSavingProgress}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all sm:px-5 sm:py-2.5 sm:text-sm disabled:opacity-50 ${
                completed
                  ? 'border border-chart-2 bg-chart-2 text-white'
                  : 'border border-chart-2/40 bg-chart-2/10 text-chart-2 hover:bg-chart-2/20'
              }`}
            >
              <CheckCircle className="h-4 w-4" />
              Marcar como Concluída
            </button>

            <button
              type="button"
              onClick={() => void handleToggleSavedForReview()}
              disabled={isSavingProgress}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all sm:px-5 sm:py-2.5 sm:text-sm disabled:opacity-50 ${
                saved
                  ? 'border border-primary/50 bg-primary/10 text-primary'
                  : 'border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
              }`}
            >
              <Bookmark
                className="h-4 w-4"
                fill={saved ? 'currentColor' : 'none'}
              />
              Salvar para Revisão
            </button>
          </div>
        ) : null}

        <div>
          <div className="flex items-center gap-0 border-b border-border">
            <button
              type="button"
              onClick={() => setActiveTab('materiais')}
              className={`relative flex items-center gap-2 border-b-2 px-3 py-3 text-xs font-semibold transition-colors sm:px-4 sm:text-sm ${
                activeTab === 'materiais'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Paperclip className="h-4 w-4" />
              Materiais
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('anotacoes')}
              className={`relative flex items-center gap-2 border-b-2 px-3 py-3 text-xs font-semibold transition-colors sm:px-4 sm:text-sm ${
                activeTab === 'anotacoes'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <NotebookPen className="h-4 w-4" />
              Anotações
            </button>
          </div>

          <div className="pt-4">
            {activeTab === 'materiais' && (
              <div className="flex flex-col gap-2">
                <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Arquivos desta aula
                </p>

                {isLoadingMaterials ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : materials.length > 0 ? (
                  materials.map((file) => {
                    const visual = getMaterialIcon(file.title)
                    const Icon = visual.icon
                    const isDownloading = downloadingMaterialId === file.id

                    return (
                      <button
                        key={file.id}
                        type="button"
                        onClick={() => void handleDownloadMaterial(file)}
                        disabled={isDownloading}
                        className="group flex w-full cursor-pointer items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-border/80 disabled:opacity-50"
                      >
                        <div
                          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${visual.bgClassName}`}
                        >
                          <Icon
                            className={`h-5 w-5 ${visual.iconClassName}`}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {file.title}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          {isDownloading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          ) : (
                            <Download className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                          )}
                        </div>
                      </button>
                    )
                  })
                ) : (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Nenhum material nesta aula
                  </p>
                )}
              </div>
            )}

            {activeTab === 'anotacoes' && (
              <div className="flex flex-col gap-3">
                <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Minhas anotações
                </p>

                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  disabled={isSavingNote}
                  className="min-h-[200px] w-full resize-none rounded-xl border border-border bg-primary-foreground p-4 text-sm leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 disabled:opacity-50"
                  placeholder="Escreva suas anotações sobre esta aula..."
                />

                <p className="text-right text-[10px] text-muted-foreground">
                  {notes.length} caracteres
                </p>

                <button
                  type="button"
                  onClick={() => void handleSaveNote()}
                  disabled={isSavingNote}
                  className="self-end rounded-xl bg-accent px-4 py-2 text-sm font-bold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  <span className="flex items-center gap-2">
                    {isSavingNote ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Salvar anotação
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </>
    )
  }

  function renderMobileLessonList() {
    return (
      <div className="flex min-h-0 flex-1 flex-col bg-background">
        <div className="border-b border-border bg-card px-4 pb-4 pt-3">
          <button
            type="button"
            onClick={() => {
              if (courseId) {
                router.push(`/courses/${courseId}`)
                return
              }
              router.back()
            }}
            className="flex h-10 items-center gap-2 rounded-lg border border-border bg-sidebar-accent px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <ChevronLeft className="h-5 w-5 shrink-0" />
            Voltar
          </button>

          <div className="mt-4 flex items-start justify-between gap-3">
            <div>
              <h1 className="font-heading text-xl font-bold leading-tight text-foreground">
                {moduleTitle ?? 'Módulo'}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {moduleLessons.length} aulas
              </p>
            </div>

            {isAdmin && moduleId ? (
              <button
                type="button"
                onClick={() => setCreateModalOpen(true)}
                className="inline-flex h-10 shrink-0 items-center gap-1 rounded-xl border border-border bg-card px-3 text-xs font-bold text-foreground transition-colors hover:border-primary/40"
              >
                <Plus className="h-3.5 w-3.5" />
                Nova
              </button>
            ) : null}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {moduleLessons.length > 0 ? (
            moduleLessons.map((lesson, index) => {
              const lessonHasVideo = Boolean(lesson.video_url?.trim())
              const ThumbnailIcon = lessonHasVideo ? Play : FileText
              const progress = lessonsProgressMap[lesson.id]
              const isCurrent = activeLesson?.id === lesson.id
              const progressWidth = getLessonProgressBarWidth(progress)

              return (
                <div
                  key={lesson.id}
                  className={`flex items-stretch gap-1 border-b border-border px-4 ${
                    isCurrent ? 'bg-primary/5' : ''
                  }`}
                >
                  {isAdmin ? (
                    <div className="flex flex-col justify-center gap-0.5 py-3.5">
                      <button
                        type="button"
                        onClick={() => void handleMoveLesson(lesson.id, 'up')}
                        disabled={
                          index === 0 || reorderingLessonId !== null
                        }
                        aria-label="Mover aula para cima"
                        className="inline-flex h-6 w-6 items-center justify-center rounded border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {reorderingLessonId === lesson.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <ChevronUp className="h-3 w-3" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          void handleMoveLesson(lesson.id, 'down')
                        }
                        disabled={
                          index === moduleLessons.length - 1 ||
                          reorderingLessonId !== null
                        }
                        aria-label="Mover aula para baixo"
                        className="inline-flex h-6 w-6 items-center justify-center rounded border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => void handleMobileLessonOpen(lesson)}
                    className="flex min-w-0 flex-1 items-center gap-3 py-3.5 text-left transition-colors active:bg-muted/40"
                  >
                  <div
                    className={`flex shrink-0 items-center justify-center rounded-md border ${
                      progress?.completed
                        ? 'border-chart-2 bg-chart-2 text-white'
                        : 'border-border bg-card text-transparent'
                    }`}
                    style={{ width: '20px', height: '20px', minWidth: '20px' }}
                  >
                    {progress?.completed ? (
                      <Check className="h-3 w-3" strokeWidth={3} />
                    ) : null}
                  </div>

                  <div
                    className="relative shrink-0 overflow-hidden rounded-lg bg-muted"
                    style={{ width: '88px', height: '52px', minWidth: '88px' }}
                  >
                    {lesson.thumbnail ? (
                      <Image
                        src={lesson.thumbnail}
                        alt=""
                        fill
                        sizes="88px"
                        className="object-cover"
                      />
                    ) : (
                      <>
                        <div
                          className={`absolute inset-0 ${
                            lessonHasVideo
                              ? 'bg-gradient-to-br from-primary/30 to-accent/20'
                              : 'bg-gradient-to-br from-muted to-card'
                          }`}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ThumbnailIcon className="h-4 w-4 text-foreground/70" />
                        </div>
                      </>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-muted/80">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: progressWidth }}
                      />
                    </div>
                  </div>

                  <p className="min-w-0 flex-1 text-sm font-medium leading-snug text-foreground">
                    {index + 1}. {lesson.title ?? 'Aula sem título'}
                  </p>
                  </button>
                </div>
              )
            })
          ) : (
            <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
              <p className="text-sm text-muted-foreground">
                Nenhuma aula neste módulo ainda.
              </p>
              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
                >
                  <Plus className="h-4 w-4" />
                  Criar primeira aula
                </button>
              ) : null}
            </div>
          )}
        </div>
      </div>
    )
  }

  function renderModuleSidebar() {
    return (
      <aside
        className="flex min-h-0 shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-card"
        style={{ width: '360px', minWidth: '360px' }}
      >
        <div className="border-b border-border px-5 py-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Aulas do módulo
          </p>

          {isAdmin && moduleId ? (
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-bold text-accent-foreground transition-opacity hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Adicionar Nova Aula
            </button>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {moduleLessons.length > 0 ? (
            <div className="flex flex-col gap-2">
              {moduleLessons.map((lesson, index) => {
                const isCurrent = activeLesson?.id === lesson.id
                const lessonHasVideo = Boolean(lesson.video_url?.trim())
                const duration = formatLessonDuration(lesson.duration_seconds)
                const ThumbnailIcon = lessonHasVideo ? Play : FileText
                const isReordering = reorderingLessonId === lesson.id

                return (
                  <div key={lesson.id} className="flex items-stretch gap-1">
                    {isAdmin ? (
                      <div className="flex flex-col justify-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => void handleMoveLesson(lesson.id, 'up')}
                          disabled={
                            index === 0 || reorderingLessonId !== null
                          }
                          aria-label="Mover aula para cima"
                          className="inline-flex h-6 w-6 items-center justify-center rounded border border-border bg-background text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {isReordering ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <ChevronUp className="h-3 w-3" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            void handleMoveLesson(lesson.id, 'down')
                          }
                          disabled={
                            index === moduleLessons.length - 1 ||
                            reorderingLessonId !== null
                          }
                          aria-label="Mover aula para baixo"
                          className="inline-flex h-6 w-6 items-center justify-center rounded border border-border bg-background text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </button>
                      </div>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => void handleLessonSelect(lesson)}
                      className={`flex min-w-0 flex-1 items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors ${
                        isCurrent
                          ? 'border-primary/40 bg-primary/5'
                          : 'border-border bg-background hover:border-primary/25 hover:bg-muted/30'
                      }`}
                    >
                      <span
                        className={`shrink-0 text-center text-xs font-bold ${
                          isCurrent
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        }`}
                        style={{ width: '16px', minWidth: '16px' }}
                      >
                        {index + 1}
                      </span>

                      <div
                        className="relative shrink-0 overflow-hidden rounded-lg bg-muted"
                        style={{ width: '72px', height: '48px', minWidth: '72px' }}
                      >
                        {lesson.thumbnail ? (
                          <Image
                            src={lesson.thumbnail}
                            alt=""
                            fill
                            sizes="72px"
                            className="object-cover"
                          />
                        ) : (
                          <>
                            <div
                              className={`absolute inset-0 ${
                                lessonHasVideo
                                  ? 'bg-gradient-to-br from-accent/35 to-primary/20'
                                  : 'bg-gradient-to-br from-muted to-card'
                              }`}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <ThumbnailIcon className="h-4 w-4 text-foreground/70" />
                            </div>
                          </>
                        )}
                        <span className="absolute bottom-1 left-1 rounded bg-black/80 px-1 text-[9px] text-white">
                          {duration}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <p
                          className={`line-clamp-2 text-sm font-semibold leading-snug ${
                            isCurrent ? 'text-primary' : 'text-foreground'
                          }`}
                        >
                          {lesson.title ?? 'Aula sem título'}
                        </p>

                        {isCurrent ? (
                          <span className="mt-1 inline-flex rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                            Assistindo
                          </span>
                        ) : null}
                      </div>

                      <ChevronRight
                        className={`h-4 w-4 shrink-0 ${
                          isCurrent ? 'text-primary' : 'text-muted-foreground'
                        }`}
                      />
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="px-2 py-8 text-center text-sm text-muted-foreground">
              Nenhuma aula criada
            </p>
          )}
        </div>
      </aside>
    )
  }

  if (isLoading || profileLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <ModalCreateCourseLesson
        open={createModalOpen}
        moduleId={moduleId ?? 0}
        onClose={() => setCreateModalOpen(false)}
        onCreated={handleLessonCreated}
      />

      <ModalEditCourseLesson
        open={editModalOpen}
        lesson={activeLesson}
        onClose={() => setEditModalOpen(false)}
        onUpdated={handleLessonUpdated}
        onDeleted={handleLessonDeleted}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:hidden">
        {mobileView === 'list' ? (
          renderMobileLessonList()
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-5">
              {renderLessonPlayerContent()}
            </div>
          </div>
        )}
      </div>

      <div className="hidden min-h-0 flex-1 overflow-hidden lg:flex">
        <div className="flex min-h-0 flex-1 gap-6 overflow-hidden px-6 py-6">
          <div className="min-h-0 flex-1 overflow-y-auto py-6">
            <div className="flex flex-col gap-5">
              {renderLessonPlayerContent()}
            </div>
          </div>

          {renderModuleSidebar()}
        </div>
      </div>
    </div>
  )
}
