'use client'

import { useMemo, useState } from 'react'
import {
  Check,
  CheckCircle2,
  ChevronRight,
  Lightbulb,
  Play,
  Loader2,
  Rocket,
  Search,
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

function subjectChoiceClass(active: boolean, shape: 'grid' | 'pill') {
  const base =
    'group relative inline-flex items-center font-semibold transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background'

  if (shape === 'grid') {
    return cn(
      base,
      'min-h-[3.5rem] w-full justify-between gap-2 rounded-xl border-2 px-3 py-3 text-left text-[12px] sm:gap-3 sm:px-4 sm:text-[15px]',
      active
        ? 'border-accent bg-accent/15 text-foreground shadow-[0_0_0_1px_rgba(61,127,255,0.3),0_8px_22px_rgba(61,127,255,0.25)]'
        : 'border-foreground/25 bg-card font-bold text-foreground shadow-[0_3px_10px_rgba(0,0,0,0.28)] hover:-translate-y-0.5 hover:border-accent/60 hover:bg-popover hover:shadow-[0_10px_24px_rgba(0,0,0,0.35)]',
    )
  }

  return cn(
    base,
    'gap-1.5 rounded-full border-2 px-4 py-2 text-xs sm:text-sm',
    active
      ? 'border-accent bg-accent text-accent-foreground shadow-[0_4px_14px_rgba(61,127,255,0.4)]'
      : 'border-foreground/25 bg-card font-bold text-foreground shadow-[0_3px_10px_rgba(0,0,0,0.28)] hover:-translate-y-0.5 hover:border-accent/60 hover:bg-popover hover:shadow-[0_6px_18px_rgba(0,0,0,0.35)]',
  )
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
          <span className="w-2 self-stretch rounded-sm bg-primary" />
          Estude por assunto! 🎯
        </h1>
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
        <span className="flex flex-col gap-1">
          <span className="text-sm font-bold text-foreground">
            Como funciona o Estudo Inteligente?
          </span>
          <span className="mt-0.5 text-xs text-muted-foreground">
            Clique aqui e assista o vídeo para entender.
          </span>
          <span className="mt-0.5 text-xs text-muted-foreground">
            2 min
          </span>
        </span>
      </button>

      <div className="flex items-start gap-3 rounded-xl border border-primary/25 bg-primary/8 p-4">
        <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <p className="text-sm leading-relaxed text-foreground">
          Estude <strong className="text-primary">um assunto por vez</strong>. Escolha a matéria, ex: <strong className="text-primary">"Português"</strong>, depois escolha o conteúdo relacionado, ex: <strong className="text-primary">"Interpretação de texto"</strong> ou <strong className="text-primary">"Uso do Hífen"</strong>. Assim você aprende assunto por assunto, sem cansar.
        </p>
      </div>

      <div className="flex flex-col gap-8 rounded-2xl">
        <h2 className="text-lg font-semibold text-foreground sm:text-lg">
          Qual assunto você quer dominar hoje?
        </h2>

        {/* Step 1 — Matéria principal */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-black text-accent-foreground">
              1
            </span>
            <h3 className="text-sm font-bold text-primary sm:text-base">
              ESCOLHA A MATÉRIA
            </h3>
          </div>

          {isLoadingSubjects ? (
            <p className="text-xs text-muted-foreground">Carregando matérias...</p>
          ) : filteredRoots.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-muted/30 px-3 py-4 text-center text-xs text-muted-foreground">
              {rootSubjects.length === 0
                ? 'Nenhuma matéria cadastrada ainda.'
                : 'Nenhuma matéria encontrada para essa busca.'}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {filteredRoots.map((subject) => {
                const active = selectedRootId === subject.id
                return (
                  <button
                    key={subject.id}
                    type="button"
                    onClick={() => handleRootSelect(subject.id)}
                    aria-pressed={active}
                    className={subjectChoiceClass(active, 'grid')}
                  >
                    <span className="font-light min-w-0 flex-1 leading-tight">
                      {subject.name}
                    </span>
                    <span
                      className={cn(
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                        active
                          ? 'border-accent bg-accent text-accent-foreground'
                          : 'border-foreground/35 bg-background/60 group-hover:border-accent/60',
                      )}
                      aria-hidden
                    >
                      {active ? (
                        <Check className="h-3 w-3" strokeWidth={3.5} />
                      ) : null}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-medium text-primary">
              • Não encontrou a matéria?
            </p>
            <div className="relative w-full sm:max-w-[220px] sm:shrink-0">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/70"
                aria-hidden
              />
              <input
                type="search"
                value={rootSearch}
                onChange={(e) => setRootSearch(e.target.value)}
                disabled={isLoadingSubjects}
                placeholder="Pesquisar..."
                className="w-full rounded-lg border border-primary/40 bg-primary-foreground py-2.5 pl-10 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/70 disabled:opacity-50"
              />
            </div>
          </div>
        </section>

        {/* Step 2 — Assunto relacionado */}
        <section
          className={cn(
            'flex flex-col gap-4 transition-opacity duration-300',
            !selectedRootId && 'pointer-events-none opacity-50',
          )}
        >
          <div className="flex items-center gap-2.5">
            <span
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black',
                selectedRootId
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              2
            </span>
            <h3 className="text-sm font-bold text-primary sm:text-base">
              {selectedRootName
                ? `ESCOLHA O ASSUNTO DE ${selectedRootName.toUpperCase()}`
                : 'ESCOLHA O ASSUNTO'}
            </h3>
          </div>

          {!selectedRootId ? (
            <p className="rounded-xl border border-dashed border-border bg-muted/20 px-3 py-5 text-center text-xs text-muted-foreground">
              Selecione uma matéria principal acima
            </p>
          ) : filteredRelated.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-muted/30 px-3 py-4 text-center text-xs text-muted-foreground">
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
                    aria-pressed={active}
                    className={subjectChoiceClass(active, 'pill')}
                  >
                    {active ? (
                      <Check
                        className="h-3.5 w-3.5 shrink-0"
                        strokeWidth={3}
                        aria-hidden
                      />
                    ) : null}
                    <span className="truncate font-light">{subject.name}</span>
                  </button>
                )
              })}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-medium text-primary">
              • Não encontrou o assunto?
            </p>
            <div className="relative w-full sm:max-w-[220px] sm:shrink-0">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/70"
                aria-hidden
              />
              <input
                type="search"
                value={relatedSearch}
                onChange={(e) => setRelatedSearch(e.target.value)}
                disabled={!selectedRootId || isLoadingSubjects}
                placeholder="Pesquisar..."
                className="w-full rounded-lg border border-primary/40 bg-primary-foreground py-2.5 pl-10 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/70 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
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

      <button
        type="button"
        disabled={!canStart || isStarting || isLoadingSubjects}
        onClick={() => void handleStart()}
        className={cn(
          'flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold transition-all',
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
        {isStarting
          ? 'Preparando estudo...'
          : canStart
            ? 'COMEÇAR OS ESTUDOS'
            : 'Selecione matéria e assunto'}
      </button>
    </div>
  )
}
