'use client'

import { useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { CreateSubject, DeleteSubject } from '@/lib/lib-subjects'
import { toast } from 'sonner'
import { SubjectType, Subjects } from "@/types";

export type SubjectFilterGroupProps = {
  subjectsData?: Subjects[] | null
  selectedRootFilter: string
  selectedRelatedFilter: string
  onSelectedRootFilterChange: (rootId: string) => void
  onSelectedRelatedFilterChange: (relatedId: Subjects | null) => void
  onAfterClear?: () => void
  onAfterRootSelect?: (rootId: string) => void
  onAfterRelatedSelect?: (relatedId: Subjects | null) => void
  /** Persist new root subject (optional — e.g. Supabase insert) */
  onSaveNewRootSubject?: (name: string) => void | Promise<void>
  /** Persist new related subject under the selected root (optional) */
  onSaveNewRelatedSubject?: (
    name: string,
    parentRootSubjectId: string
  ) => void | Promise<void>
}

export function SubjectFilterGroup({
  subjectsData,
  selectedRootFilter,
  selectedRelatedFilter,
  onSelectedRootFilterChange,
  onSelectedRelatedFilterChange,
  onAfterClear: _onAfterClear,
  onAfterRootSelect,
  onAfterRelatedSelect,
  onSaveNewRootSubject,
  onSaveNewRelatedSubject,
}: SubjectFilterGroupProps) {
  const allSubjects = subjectsData ?? []

  const [showCreateRootPanel, setShowCreateRootPanel] = useState(false)
  const [showCreateRelatedPanel, setShowCreateRelatedPanel] = useState(false)
  const [newRootSubjectName, setNewRootSubjectName] = useState('')
  const [newRelatedSubjectName, setNewRelatedSubjectName] = useState('')
  const [subjectLevel, setSubjectLevel] = useState<SubjectType>('basic')
  const [subjectSelected, setSubjectSelected] = useState<Subjects | null>(null)
  const [subjectRelatedSelected, setSubjecteRelatedSelected] = useState<Subjects | null>(null)
  const [rootSubjectSearch, setRootSubjectSearch] = useState('')
  const [relatedSubjectSearch, setRelatedSubjectSearch] = useState('')

  const rootSubjects = useMemo(
    () => allSubjects.filter((subject) => subject.subject_id === null),
    [allSubjects]
  )

  const relatedSubjects = useMemo(
    () => allSubjects.filter((subject) => subject.subject_id !== null),
    [allSubjects]
  )

  const selectedRootName = useMemo(() => {
    if (!selectedRootFilter) return ''
    return (
      allSubjects.find((s) => s.id === selectedRootFilter)?.name ?? ''
    )
  }, [allSubjects, selectedRootFilter])

  const selectedRelatedName = useMemo(() => {
    if (!selectedRelatedFilter) return ''
    return (
      allSubjects.find((s) => s.id === selectedRelatedFilter)?.name ?? ''
    )
  }, [allSubjects, selectedRelatedFilter])

  const filteredRootSubjects = useMemo(() => {
    const query = rootSubjectSearch.trim().toLowerCase()
    if (!query) return rootSubjects
    return rootSubjects.filter((subject) =>
      subject.name.toLowerCase().includes(query),
    )
  }, [rootSubjects, rootSubjectSearch])

  const filteredRelatedSubjects = useMemo(() => {
    if (!selectedRootFilter) return []
    const query = relatedSubjectSearch.trim().toLowerCase()
    const rootChildren = relatedSubjects.filter(
      (subject) => subject.subject_id === selectedRootFilter,
    )
    if (!query) return rootChildren
    return rootChildren.filter((subject) =>
      subject.name.toLowerCase().includes(query),
    )
  }, [relatedSubjects, selectedRootFilter, relatedSubjectSearch])

  function handleRootSelect(rootId: string) {
    onSelectedRootFilterChange(rootId)
    onSelectedRelatedFilterChange(null)
    setRelatedSubjectSearch('')
    onAfterRootSelect?.(rootId)
  }

  function handleRelatedSelect(relatedId: Subjects) {
    onSelectedRelatedFilterChange(relatedId)
    setSubjecteRelatedSelected(relatedId)
    onAfterRelatedSelect?.(relatedId)
  }

  function closeCreateRootPanel() {
    setShowCreateRootPanel(false)
    setNewRootSubjectName('')
  }

  function closeCreateRelatedPanel() {
    setShowCreateRelatedPanel(false)
    setNewRelatedSubjectName('')
  }

  function toggleCreateRootPanel() {
    setShowCreateRelatedPanel(false)
    setShowCreateRootPanel((open) => !open)
  }

  function toggleCreateRelatedPanel() {
    setShowCreateRootPanel(false)
    setShowCreateRelatedPanel((open) => !open)
  }

  async function handleSaveNewRoot() {
    const name = newRootSubjectName.trim()
    if (!name) return
    const {error} = await CreateSubject(name, subjectLevel, null)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success("Matéria criada com sucesso!!")
    closeCreateRootPanel() 
  }

  async function handleSaveNewRelated() {
    const name = newRelatedSubjectName.trim()
    if (!name || !subjectSelected) return
    const {error} = await CreateSubject(name, subjectSelected?.type, subjectSelected?.id)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success("Assunto criado com sucesso!!")
    closeCreateRelatedPanel()
    setSubjectSelected(null)
  }

  async function handleDeleteSubjectRoot(){
    if (!subjectSelected) return
    const {error} = await DeleteSubject(subjectSelected.id)
    if(error) {
      if(error.code === '23503'){
        toast.error('Você não pode deletar uma matéria que possui assuntos relacionados.')
        return
      } else {
        toast.error(error.message)
        return
      }
    }
    toast.success("Matéria deletada com sucesso.")
    setSubjectSelected(null)
    onSelectedRootFilterChange('')
  }

  async function handleDeleteSubjectRelated(){
    if (!subjectRelatedSelected) return
    const {error} = await DeleteSubject(subjectRelatedSelected.id)
    if(error) {
      if(error.code === '23503'){
        toast.error('Você não pode deletar um Assunto que está relacionad a uma Matéria.')
        return
      } else {
        toast.error(error.message)
        return
      }
    }
    toast.success("Assunto deletado com sucesso")
    onSelectedRelatedFilterChange(null)
    setSubjecteRelatedSelected(null)
    setSubjectSelected(null)
  }

  return (
    <div className="space-y-2 rounded-lg border border-border bg-card p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        1. Matéria principal
      </p>
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <input
            type="search"
            value={rootSubjectSearch}
            onChange={(e) => setRootSubjectSearch(e.target.value)}
            placeholder="Digite o nome da matéria..."
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50"
          />
        </label>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={toggleCreateRootPanel}
            aria-expanded={showCreateRootPanel}
            className={`mb-2 shrink-0 rounded-full border border-dashed px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
              showCreateRootPanel
                ? 'border-primary bg-primary/15 text-primary'
                : 'border-primary/60 bg-primary/5 text-primary hover:border-primary hover:bg-primary/10'
            }`}
          >
            + Criar Matéria
          </button>
          {filteredRootSubjects.map((subject) => {
            const active = selectedRootFilter === subject.id
            return (
              <button
                key={subject.id}
                type="button"
                onClick={() => {
                  handleRootSelect(subject.id)
                  setSubjectSelected(subject)
                }}
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
            <p className="mb-2 text-xs text-muted-foreground">
              {rootSubjectSearch.trim()
                ? 'Nenhuma matéria principal encontrada para esta busca.'
                : 'Nenhuma matéria principal cadastrada.'}
            </p>
          ) : null}
        </div>

        {selectedRootFilter ? (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-accent/20 bg-accent/5 px-3 py-2">
            <p className="min-w-0 text-xs text-muted-foreground">
              Matéria selecionada:{' '}
              <span className="font-semibold text-foreground">
                {selectedRootName}
              </span>
            </p>
            <button
              type="button"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-destructive/40 bg-background px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10"
              aria-label="Excluir matéria principal"
              onClick={handleDeleteSubjectRoot}
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
              Excluir matéria
            </button>
          </div>
        ) : null}

        {showCreateRootPanel ? (
          <div className="rounded-xl border border-primary/25 bg-gradient-to-b from-primary/5 to-background p-4 shadow-sm ring-1 ring-primary/10">
            <div className="mb-3 flex items-start gap-2">
              <span
                className="mt-1 h-8 w-1 shrink-0 rounded-full bg-primary"
                aria-hidden
              />
              <div>
                <h4 className="text-sm font-bold text-foreground">
                  Nova matéria principal
                </h4>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  Digite o nome da matéria (ex.: Português, Matemática). Ela
                  aparecerá na lista para você organizar assuntos depois.
                </p>
              </div>
            </div>

            <label className="mb-4 flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground">
                Nome da matéria
              </span>
              <input
                id="subject-filter-new-root-name"
                type="text"
                value={newRootSubjectName}
                onChange={(e) => setNewRootSubjectName(e.target.value)}
                placeholder="Ex.: Legislação"
                className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
              />
            </label>

            <label className="flex flex-col gap-1 mb-4">
              <span className="text-xs font-semibold text-muted-foreground">
                Nível da matéria
              </span>
              <select
                value={subjectLevel}
                onChange={(e) =>
                  setSubjectLevel(e.target.value as SubjectType)
                }
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/50"
              >
                <option value="basic">básico</option>
                <option value="specific">específico</option>
              </select>
          </label>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeCreateRootPanel}
                className="rounded-full border border-border bg-transparent px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleSaveNewRoot()}
                className="rounded-full border border-primary bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
              >
                Salvar
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {selectedRootFilter ? (
        <>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mt-5">
            2. Assunto relacionado
          </p>
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1.5">
              <input
                type="search"
                value={relatedSubjectSearch}
                onChange={(e) => setRelatedSubjectSearch(e.target.value)}
                placeholder="Digite o nome do assunto..."
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50"
              />
            </label>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={toggleCreateRelatedPanel}
                aria-expanded={showCreateRelatedPanel}
                className={`mb-2 shrink-0 rounded-full border border-dashed px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                  showCreateRelatedPanel
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-primary/60 bg-primary/5 text-primary hover:border-primary hover:bg-primary/10'
                }`}
              >
                + Criar Assunto
              </button>
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
                <p className="mb-2 text-xs text-muted-foreground">
                  {relatedSubjectSearch.trim()
                    ? 'Nenhum assunto encontrado para esta busca.'
                    : 'Nenhum assunto relacionado para esta matéria principal.'}
                </p>
              ) : null}
            </div>

            {selectedRelatedFilter ? (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-accent/20 bg-accent/5 px-3 py-2">
                <p className="min-w-0 text-xs text-muted-foreground">
                  Assunto selecionado:{' '}
                  <span className="font-semibold text-foreground">
                    {selectedRelatedName}
                  </span>
                </p>
                <button
                  type="button"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-destructive/40 bg-background px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10"
                  aria-label="Excluir assunto relacionado"
                  onClick={handleDeleteSubjectRelated}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  Excluir assunto
                </button>
              </div>
            ) : null}

            {showCreateRelatedPanel ? (
              <div className="rounded-xl border border-primary/25 bg-gradient-to-b from-primary/5 to-background p-4 shadow-sm ring-1 ring-primary/10">
                <div className="mb-3 flex items-start gap-2">
                  <span
                    className="mt-1 h-8 w-1 shrink-0 rounded-full bg-primary"
                    aria-hidden
                  />
                  <div>
                    <h4 className="text-sm font-bold text-foreground">
                      Novo assunto
                    </h4>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      Vinculado à matéria{' '}
                      <span className="font-semibold text-primary">
                        {selectedRootName || 'selecionada'}
                      </span>
                      . Use um nome curto e claro (ex.: Regra de três).
                    </p>
                  </div>
                </div>
                <label className="mb-4 flex flex-col gap-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Nome do assunto
                  </span>
                  <input
                    id="subject-filter-new-related-name"
                    type="text"
                    value={newRelatedSubjectName}
                    onChange={(e) => setNewRelatedSubjectName(e.target.value)}
                    placeholder="Ex.: Funções do 1º grau"
                    className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                  />
                </label>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeCreateRelatedPanel}
                    className="rounded-full border border-border bg-transparent px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={!selectedRootFilter}
                    onClick={() => void handleSaveNewRelated()}
                    className="rounded-full border border-primary bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-40"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  )
}
