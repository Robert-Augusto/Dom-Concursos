'use client'

import { useMemo, useState } from 'react'
import { ChevronRight, Search, Sparkles } from 'lucide-react'
import { Subjects } from '@/types'

/** Sentinel value for SearchVideo filter logic (not a DB subject id). */
export const LESSON_FILTER_QUESTOES_BANCAS = '__questoes_bancas__' as const

const QUESTOES_BANCAS_LABEL = 'Questões de Bancas'

export type LessonRootSubjectPillFilterProps = {
  subjectsData?: Subjects[] | null
  /** Empty string = "Tudo" */
  selectedRootFilter: string
  onSelectedRootFilterChange: (rootId: string) => void
}

export function LessonRootSubjectPillFilter({
  subjectsData,
  selectedRootFilter,
  onSelectedRootFilterChange,
}: LessonRootSubjectPillFilterProps) {
  const [subjectSearch, setSubjectSearch] = useState('')

  const rootSubjects = useMemo(
    () =>
      (subjectsData ?? []).filter((subject) => subject.subject_id === null),
    [subjectsData]
  )

  const filteredRootSubjects = useMemo(() => {
    const query = subjectSearch.trim().toLowerCase()
    const filtered = query
      ? rootSubjects.filter((subject) =>
          subject.name.toLowerCase().includes(query),
        )
      : rootSubjects

    return [...filtered].sort((a, b) => {
      if (a.name === QUESTOES_BANCAS_LABEL) return -1
      if (b.name === QUESTOES_BANCAS_LABEL) return 1
      return a.name.localeCompare(b.name, 'pt-BR')
    })
  }, [rootSubjects, subjectSearch])

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 md:p-5">
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 h-11 w-1 shrink-0 rounded-full bg-primary shadow-[0_0_12px_hsl(42_50%_55%_/_0.45)]"
          aria-hidden
        />
        <div className="min-w-0">
          <h3 className="font-heading text-base font-black uppercase tracking-wide text-foreground md:text-lg">
            Hora da aula!
          </h3>
          <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-sm italic text-primary">
            <span>Bons estudos</span>
            <Sparkles
              className="inline h-3.5 w-3.5 shrink-0 text-primary"
              aria-hidden
            />
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
          value={subjectSearch}
          onChange={(e) => setSubjectSearch(e.target.value)}
          placeholder="Buscar matéria..."
          className="w-full rounded-full border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50"
        />
      </div>

      <div
        className=" flex items-center justify-end gap-0.5 text-muted-foreground md:hidden"
        aria-hidden
      >
        <span className="text-[10px] font-semibold uppercase tracking-wide">
          Deslize
        </span>
        <ChevronRight className="h-4 w-4 animate-pulse" />
      </div>

      <div className="flex gap-2 overflow-x-auto px-3 pb-3 scrollbar-none">
        <button
          type="button"
          onClick={() => onSelectedRootFilterChange('')}
          className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold whitespace-nowrap transition-all ${
            selectedRootFilter === ''
              ? 'border-primary bg-primary text-primary-foreground shadow-[0_0_14px_hsl(42_50%_55%_/_0.5)]'
              : 'border-border bg-background/80 text-foreground hover:border-primary/50'
          }`}
        >
          Tudo
        </button>
        {filteredRootSubjects.map((subject) => {
          const active = selectedRootFilter === subject.id
          return (
            <button
              key={subject.id}
              type="button"
              onClick={() => onSelectedRootFilterChange(subject.id)}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold whitespace-nowrap transition-all ${
                active
                  ? 'border-primary bg-primary text-primary-foreground shadow-[0_0_14px_hsl(42_50%_55%_/_0.5)]'
                  : 'border-border bg-background/80 text-foreground hover:border-primary/50'
              }`}
            >
              {subject.name}
            </button>
          )
        })}
        {subjectSearch.trim() !== '' && filteredRootSubjects.length === 0 ? (
          <p className="shrink-0 self-center px-2 text-xs text-muted-foreground">
            Nenhuma matéria encontrada.
          </p>
        ) : null}
      </div>
    </div>
  )
}
