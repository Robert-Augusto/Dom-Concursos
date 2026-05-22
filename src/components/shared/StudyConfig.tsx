'use client'

import { useMemo, useState } from 'react'
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Lightbulb,
  Play,
  Loader2,
  Rocket,
  Search,
  Sparkles,
  Target,
} from 'lucide-react'
import { Subjects, StudyFlashcards, StudyMaterials } from '@/types'
import { cn } from '@/lib/utils'
import { GetStudyMaterialsBySubject } from '@/lib/study_material'
import { GetStudyFlashcardsBySubject } from '@/lib/flashcards'
import { toast } from 'sonner'
import { CreateStudySession } from '@/lib/lib-study-session'
import { useProfile } from '@/context/ProfileContext'

export type StudyStartPayload = {
  subjectId: string
  subjectName: string
  rootSubjectName: string
  studySessionId: string
  flashcardsData: StudyFlashcards[]
  materialsData: StudyMaterials
}

export interface StudyConfigProps {
  subjectsData?: Subjects[] | null
  isLoadingSubjects?: boolean
  onStart: (payload: StudyStartPayload) => void
  onStartingChange?: (starting: boolean) => void
}

export default function StudyConfig({
  subjectsData,
  isLoadingSubjects = false,
  onStart,
  onStartingChange,
}: StudyConfigProps) {
  const { profile, loading: profileLoading } = useProfile()
  const [selectedRootId, setSelectedRootId] = useState('')
  const [selectedRelated, setSelectedRelated] = useState<Subjects | null>(null)
  const [rootSearch, setRootSearch] = useState('')
  const [relatedSearch, setRelatedSearch] = useState('')
  const [isStarting, setIsStarting] = useState(false)

  const allSubjects = subjectsData ?? []

  const rootSubjects = useMemo(
    () => allSubjects.filter((s) => s.subject_id === null),
    [allSubjects],
  )

  const relatedForRoot = useMemo(() => {
    if (!selectedRootId) return []
    return allSubjects.filter((s) => s.subject_id === selectedRootId)
  }, [allSubjects, selectedRootId])

  const selectedRootName = useMemo(
    () => allSubjects.find((s) => s.id === selectedRootId)?.name ?? '',
    [allSubjects, selectedRootId],
  )

  const filteredRoots = useMemo(() => {
    const q = rootSearch.trim().toLowerCase()
    if (!q) return rootSubjects
    return rootSubjects.filter((s) => s.name.toLowerCase().includes(q))
  }, [rootSubjects, rootSearch])

  const filteredRelated = useMemo(() => {
    const q = relatedSearch.trim().toLowerCase()
    if (!q) return relatedForRoot
    return relatedForRoot.filter((s) => s.name.toLowerCase().includes(q))
  }, [relatedForRoot, relatedSearch])

  const canStart = Boolean(selectedRelated)

  function handleRootSelect(rootId: string) {
    setSelectedRootId(rootId)
    setSelectedRelated(null)
    setRelatedSearch('')
  }

  async function handleStart() {
    if (!selectedRelated || isStarting) return
    if (profileLoading) return

    if (!profile?.id) {
      toast.error('Faça login para iniciar o estudo.')
      return
    }

    setIsStarting(true)
    onStartingChange?.(true)
    try {
      const [materialsRes, flashcardsRes] = await Promise.all([
        GetStudyMaterialsBySubject(selectedRelated.id),
        GetStudyFlashcardsBySubject(selectedRelated.id, 3),
      ])

      if (materialsRes.error || !materialsRes.data) {
        toast.error(
          materialsRes.error?.message ??
            'Cadastre o material em PDF para este assunto.',
        )
        return
      }

      if (flashcardsRes.error) {
        toast.error(
          flashcardsRes.error.message ??
            'Não foi possível carregar os flashcards.',
        )
        return
      }

      if (!flashcardsRes.data || flashcardsRes.data.length < 3) {
        toast.error('Cadastre pelo menos 3 flashcards para este assunto.')
        return
      }

      const {data, error} = await CreateStudySession(profile.id, selectedRelated.id, new Date())

      if (error || !data){
        toast.error('Erro ao iniciar sessão de estudo, tente novamente.')
        return
      }

      onStart({
        subjectId: selectedRelated.id,
        subjectName: selectedRelated.name,
        rootSubjectName: selectedRootName,
        studySessionId: String(data.id),
        flashcardsData: flashcardsRes.data,
        materialsData: materialsRes.data,
      })
    } finally {
      setIsStarting(false)
      onStartingChange?.(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading flex items-center gap-2 text-2xl font-black text-foreground">
          <Target className="h-6 w-6 shrink-0 text-primary" />
          Estudo por Assunto
        </h1>
        <p className="text-sm text-muted-foreground">
          Escolha a matéria e o assunto específico para iniciar sua sessão focada.
        </p>
      </div>

      <button
        type="button"
        className="flex w-full cursor-pointer items-center gap-3 self-start rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-accent/40 sm:w-auto"
      >
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{
            background: 'linear-gradient(135deg, #3D7FFF, #5A9FFF)',
            boxShadow: '0 4px 14px rgba(61,127,255,0.4)',
          }}
        >
          <Play className="ml-0.5 h-4 w-4 fill-white text-white" />
        </span>
        <span className="flex flex-col">
          <span className="text-sm font-bold text-foreground">
            Como funciona o Estudo Inteligente?
          </span>
          <span className="mt-0.5 text-xs text-muted-foreground">
            Assista ao vídeo explicativo · 2 min
          </span>
        </span>
      </button>

      <div className="flex items-start gap-3 rounded-xl border border-primary/25 bg-primary/8 p-4">
        <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <p className="text-sm leading-relaxed text-foreground">
          Estude{' '}
          <strong className="text-primary">um assunto específico por vez</strong>.
          Primeiro escolha a <strong className="text-primary">matéria principal</strong>
          , depois o <strong className="text-accent">assunto relacionado</strong> — quanto
          mais específico, mais eficaz será o aprendizado.
        </p>
      </div>

      <div
        className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-accent/5 p-5 shadow-[0_8px_32px_rgba(61,127,255,0.12)] ring-1 ring-primary/20"
      >
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-accent/15 blur-3xl"
          aria-hidden
        />

        <div className="relative flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" aria-hidden />
            <h2 className="text-base font-black text-foreground">
              Selecione o que vai estudar
            </h2>
          </div>

          {/* Step 1 — Root */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-black transition-all',
                  selectedRootId
                    ? 'bg-primary text-primary-foreground shadow-[0_0_12px_rgba(61,127,255,0.5)]'
                    : 'animate-pulse bg-primary/20 text-primary',
                )}
              >
                {selectedRootId ? (
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                ) : (
                  '1'
                )}
              </span>
              <div>
                <p className="text-sm font-bold text-foreground">Matéria principal</p>
                <p className="text-xs text-muted-foreground">
                  Ex.: Português, Matemática, Direito Administrativo
                </p>
              </div>
            </div>

            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <input
                type="search"
                value={rootSearch}
                onChange={(e) => setRootSearch(e.target.value)}
                disabled={isLoadingSubjects}
                placeholder="Filtrar matérias..."
                className="w-full rounded-xl border border-border bg-background/90 py-3 pl-10 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/25 disabled:opacity-50"
              />
            </div>

            {isLoadingSubjects ? (
              <p className="text-xs text-muted-foreground">Carregando matérias...</p>
            ) : filteredRoots.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-background/50 px-3 py-4 text-center text-xs text-muted-foreground">
                {rootSubjects.length === 0
                  ? 'Nenhuma matéria cadastrada ainda.'
                  : 'Nenhuma matéria encontrada para essa busca.'}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {filteredRoots.map((subject) => {
                  const active = selectedRootId === subject.id
                  return (
                    <button
                      key={subject.id}
                      type="button"
                      onClick={() => handleRootSelect(subject.id)}
                      className={cn(
                        'rounded-full border px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all',
                        active
                          ? 'border-primary bg-primary text-primary-foreground shadow-[0_4px_14px_rgba(61,127,255,0.35)] ring-2 ring-primary/30'
                          : 'border-border bg-background/80 text-muted-foreground hover:border-primary/50 hover:text-foreground',
                      )}
                    >
                      {subject.name}
                    </button>
                  )
                })}
              </div>
            )}
          </section>

          {/* Step 2 — Related */}
          <section
            className={cn(
              'flex flex-col gap-3 rounded-xl border p-4 transition-all duration-300',
              selectedRootId
                ? 'border-primary/25 bg-background/60'
                : 'border-dashed border-border/80 bg-muted/20 opacity-70',
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-black transition-all',
                  selectedRelated
                    ? 'bg-primary text-primary-foreground shadow-[0_0_12px_rgba(61,127,255,0.5)]'
                    : selectedRootId
                      ? 'animate-pulse bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground',
                )}
              >
                {selectedRelated ? (
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                ) : (
                  '2'
                )}
              </span>
              <div>
                <p className="text-sm font-bold text-foreground">Assunto relacionado</p>
                <p className="text-xs text-muted-foreground">
                  {selectedRootId
                    ? `Ex.: Uso do hífen, regra de três, interpretação de texto`
                    : 'Selecione uma matéria principal primeiro'}
                </p>
              </div>
            </div>

            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <input
                type="search"
                value={relatedSearch}
                onChange={(e) => setRelatedSearch(e.target.value)}
                disabled={!selectedRootId || isLoadingSubjects}
                placeholder={
                  selectedRootId
                    ? 'Filtrar assuntos...'
                    : 'Escolha a matéria principal acima'
                }
                className="w-full rounded-xl border border-border bg-background/90 py-3 pl-10 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {!selectedRootId ? (
              <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border py-6 text-xs text-muted-foreground">
                <BookOpen className="h-4 w-4 shrink-0" aria-hidden />
                Passo 1 pendente — escolha a matéria principal
              </div>
            ) : filteredRelated.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-background/50 px-3 py-4 text-center text-xs text-muted-foreground">
                {relatedForRoot.length === 0
                  ? 'Nenhum assunto cadastrado para esta matéria.'
                  : 'Nenhum assunto encontrado para essa busca.'}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {filteredRelated.map((subject) => {
                  const active = selectedRelated?.id === subject.id
                  return (
                    <button
                      key={subject.id}
                      type="button"
                      onClick={() => setSelectedRelated(subject)}
                      className={cn(
                        'rounded-full border px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all',
                        active
                          ? 'border-accent bg-accent text-accent-foreground shadow-[0_4px_14px_rgba(255,140,60,0.35)] ring-2 ring-accent/30'
                          : 'border-border bg-background/80 text-muted-foreground hover:border-accent/50 hover:text-foreground',
                      )}
                    >
                      {subject.name}
                    </button>
                  )
                })}
              </div>
            )}
          </section>

          {canStart && selectedRelated ? (
            <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" aria-hidden />
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-semibold text-foreground">Pronto para estudar</p>
                <p className="truncate text-muted-foreground">
                  <span className="text-foreground">{selectedRootName}</span>
                  <ChevronRight className="mx-1 inline h-3.5 w-3.5" aria-hidden />
                  <span className="font-medium text-accent">{selectedRelated.name}</span>
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        disabled={!canStart || isStarting || isLoadingSubjects}
        onClick={() => void handleStart()}
        className={cn(
          'flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-black transition-all',
          canStart && !isStarting && !isLoadingSubjects
            ? 'text-white hover:opacity-95'
            : 'cursor-not-allowed bg-muted text-muted-foreground',
        )}
        style={
          canStart && !isStarting && !isLoadingSubjects
            ? {
                background: 'linear-gradient(90deg, #3D7FFF, #5A9FFF)',
                boxShadow: '0 6px 20px rgba(61,127,255,0.4)',
              }
            : undefined
        }
      >
        {isStarting ? (
          <Loader2 className="h-5 w-5 shrink-0 animate-spin" aria-hidden />
        ) : (
          <Rocket className="h-5 w-5 shrink-0" aria-hidden />
        )}
        {isStarting
          ? 'Preparando estudo...'
          : canStart
            ? 'Iniciar Estudo Focado'
            : 'Selecione matéria e assunto'}
      </button>
    </div>
  )
}
