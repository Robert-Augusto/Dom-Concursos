'use client'

import { useMemo } from 'react'
import { Subjects } from '@/types'

export type SubjectFilterGroupProps = {
  subjectsData?: Subjects[] | null
  subjectFilterSearch: string
  onSubjectFilterSearchChange: (value: string) => void
  selectedRootFilter: string
  selectedRelatedFilter: string
  onSelectedRootFilterChange: (rootId: string) => void
  onSelectedRelatedFilterChange: (relatedId: Subjects | null) => void
  onAfterClear?: () => void
  onAfterRootSelect?: (rootId: string) => void
  onAfterRelatedSelect?: (relatedId: Subjects | null) => void
}

export function SubjectFilterGroup({
  subjectsData,
  subjectFilterSearch,
  onSubjectFilterSearchChange,
  selectedRootFilter,
  selectedRelatedFilter,
  onSelectedRootFilterChange,
  onSelectedRelatedFilterChange,
  onAfterClear,
  onAfterRootSelect,
  onAfterRelatedSelect,
}: SubjectFilterGroupProps) {
  const allSubjects = subjectsData ?? []

  const rootSubjects = useMemo(
    () => allSubjects.filter((subject) => subject.subject_id === null),
    [allSubjects]
  )

  const relatedSubjects = useMemo(
    () => allSubjects.filter((subject) => subject.subject_id !== null),
    [allSubjects]
  )

  const filteredRootSubjects = useMemo(() => {
    const query = subjectFilterSearch.trim().toLowerCase()
    if (!query) return rootSubjects
    return rootSubjects.filter((subject) =>
      subject.name.toLowerCase().includes(query)
    )
  }, [rootSubjects, subjectFilterSearch])

  const filteredRelatedSubjects = useMemo(() => {
    if (!selectedRootFilter) return []
    const query = subjectFilterSearch.trim().toLowerCase()
    const rootChildren = relatedSubjects.filter(
      (subject) => subject.subject_id === selectedRootFilter
    )
    if (!query) return rootChildren
    return rootChildren.filter((subject) =>
      subject.name.toLowerCase().includes(query)
    )
  }, [relatedSubjects, selectedRootFilter, subjectFilterSearch])

  function handleClear() {
    onSelectedRootFilterChange('')
    onSelectedRelatedFilterChange(null)
    onAfterClear?.()
  }

  function handleRootSelect(rootId: string) {
    onSelectedRootFilterChange(rootId)
    onSelectedRelatedFilterChange(null)
    onAfterRootSelect?.(rootId)
  }

  function handleRelatedSelect(relatedId: Subjects) {
    onSelectedRelatedFilterChange(relatedId)
    onAfterRelatedSelect?.(relatedId)
  }

  return (
    <div className="space-y-2 rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleClear}
          className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
            !selectedRootFilter
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-transparent text-muted-foreground hover:border-primary/40 hover:text-foreground'
          }`}
        >
          Tudo
        </button>
        <input
          value={subjectFilterSearch}
          onChange={(e) => onSubjectFilterSearchChange(e.target.value)}
          className="h-8 flex-1 rounded-full border border-border bg-background px-3 text-xs text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50"
          placeholder={
            selectedRootFilter
              ? 'Pesquisar matéria relacionada...'
              : 'Pesquisar matéria principal...'
          }
        />
      </div>

      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        1. Matéria principal
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filteredRootSubjects.map((subject) => {
          const active = selectedRootFilter === subject.id
          return (
            <button
              key={subject.id}
              type="button"
              onClick={() => handleRootSelect(subject.id)}
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
        {filteredRootSubjects.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Nenhuma matéria principal encontrada.
          </p>
        ) : null}
      </div>

      {selectedRootFilter ? (
        <>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            2. Matéria relacionada
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {filteredRelatedSubjects.map((subject) => {
              const active = selectedRelatedFilter === subject.id
              return (
                <button
                  key={subject.id}
                  type="button"
                  onClick={() => handleRelatedSelect(subject)}
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
            {filteredRelatedSubjects.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Nenhuma matéria relacionada para essa principal.
              </p>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  )
}
