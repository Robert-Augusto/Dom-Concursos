'use client'

import {
  CreateSubject,
  DeleteSubject,
  GetAllSubjects,
  UpdateSubject,
} from '@/lib/lib-subjects'
import { createClient } from '@/lib/supabase/client'
import { SubjectType, Subjects } from '@/types'
import {
  ChevronDown,
  ChevronRight,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

export type SubjectPickerSelection = {
  relatedSubject: Subjects
  rootSubject: Subjects
  rootSubjectName: string
}

export type ModalSubjectPickerProps = {
  open: boolean
  onClose: () => void
  /**
   * Subjects from parent (e.g. admin page with Supabase realtime).
   * Pass `null` while loading. Omit entirely to let the modal fetch + subscribe on its own.
   */
  subjectsData?: Subjects[] | null
  selectedSubjectId?: string | null
  onSelect: (selection: SubjectPickerSelection) => void
}

type FormMode =
  | { kind: 'idle' }
  | { kind: 'create-root' }
  | { kind: 'create-related'; rootId: string }
  | { kind: 'edit'; subject: Subjects }

const inputClass =
  'w-full rounded-lg border border-border bg-primary-foreground px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-chart-5/50'

export function ModalSubjectPicker({
  open,
  onClose,
  subjectsData,
  selectedSubjectId,
  onSelect,
}: ModalSubjectPickerProps) {
  const usesParentSubjects = subjectsData !== undefined

  const [search, setSearch] = useState('')
  const [expandedRootId, setExpandedRootId] = useState<string | null>(null)
  const [fetchedSubjects, setFetchedSubjects] = useState<Subjects[]>([])
  const [isFetching, setIsFetching] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formMode, setFormMode] = useState<FormMode>({ kind: 'idle' })
  const [formName, setFormName] = useState('')
  const [formType, setFormType] = useState<SubjectType>('basic')

  const subjects = usesParentSubjects ? (subjectsData ?? []) : fetchedSubjects
  const isLoading = usesParentSubjects ? subjectsData === null : isFetching

  useEffect(() => {
    if (!open) return

    setSearch('')
    setExpandedRootId(null)
    setFormMode({ kind: 'idle' })
    setFormName('')
    setFormType('basic')
  }, [open])

  useEffect(() => {
    if (!open || usesParentSubjects) return

    const supabase = createClient()
    let cancelled = false

    async function fetchSubjects() {
      setIsFetching(true)
      const { data, error } = await GetAllSubjects()
      if (cancelled) return
      if (error) {
        toast.error(error.message)
        setIsFetching(false)
        return
      }
      setFetchedSubjects(data)
      setIsFetching(false)
    }

    void fetchSubjects()

    const channel = supabase
      .channel('modal_subject_picker')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'subjects' },
        () => {
          void fetchSubjects()
        },
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [open, usesParentSubjects])

  const rootSubjects = useMemo(
    () => subjects.filter((subject) => subject.subject_id === null),
    [subjects],
  )

  const relatedByRootId = useMemo(() => {
    const map = new Map<string, Subjects[]>()
    for (const subject of subjects) {
      if (!subject.subject_id) continue
      const list = map.get(subject.subject_id) ?? []
      list.push(subject)
      map.set(subject.subject_id, list)
    }
    return map
  }, [subjects])

  const filteredRoots = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return rootSubjects

    return rootSubjects.filter((root) => {
      if (root.name.toLowerCase().includes(query)) return true
      const related = relatedByRootId.get(root.id) ?? []
      return related.some((item) => item.name.toLowerCase().includes(query))
    })
  }, [rootSubjects, relatedByRootId, search])

  function resetForm() {
    setFormMode({ kind: 'idle' })
    setFormName('')
    setFormType('basic')
  }

  function openCreateRoot() {
    setFormMode({ kind: 'create-root' })
    setFormName('')
    setFormType('basic')
  }

  function openCreateRelated(rootId: string) {
    setExpandedRootId(rootId)
    setFormMode({ kind: 'create-related', rootId })
    setFormName('')
    const root = subjects.find((s) => s.id === rootId)
    setFormType(root?.type ?? 'basic')
  }

  function openEdit(subject: Subjects) {
    setFormMode({ kind: 'edit', subject })
    setFormName(subject.name)
    setFormType(subject.type)
    if (subject.subject_id) {
      setExpandedRootId(subject.subject_id)
    }
  }

  function toggleRoot(rootId: string) {
    setExpandedRootId((current) => (current === rootId ? null : rootId))
    if (formMode.kind === 'create-related' && formMode.rootId !== rootId) {
      resetForm()
    }
  }

  function getFilteredRelated(rootId: string) {
    const related = relatedByRootId.get(rootId) ?? []
    const query = search.trim().toLowerCase()
    if (!query) return related
    return related.filter((item) => item.name.toLowerCase().includes(query))
  }

  async function handleSaveForm() {
    const name = formName.trim()
    if (!name) {
      toast.error('Digite um nome válido.')
      return
    }

    setIsSaving(true)

    if (formMode.kind === 'create-root') {
      const { error } = await CreateSubject(name, formType, null)
      if (error) {
        toast.error(error.message)
        setIsSaving(false)
        return
      }
      toast.success('Matéria criada com sucesso!')
      resetForm()
      setIsSaving(false)
      return
    }

    if (formMode.kind === 'create-related') {
      const root = subjects.find((s) => s.id === formMode.rootId)
      if (!root) {
        toast.error('Matéria principal não encontrada.')
        setIsSaving(false)
        return
      }
      const { error } = await CreateSubject(name, root.type, root.id)
      if (error) {
        toast.error(error.message)
        setIsSaving(false)
        return
      }
      toast.success('Assunto relacionado criado com sucesso!')
      resetForm()
      setExpandedRootId(root.id)
      setIsSaving(false)
      return
    }

    if (formMode.kind === 'edit') {
      const isRoot = formMode.subject.subject_id === null
      const { error } = await UpdateSubject(
        formMode.subject.id,
        name,
        isRoot ? formType : formMode.subject.type,
      )
      if (error) {
        toast.error(error.message)
        setIsSaving(false)
        return
      }
      toast.success(
        isRoot ? 'Matéria atualizada com sucesso!' : 'Assunto atualizado com sucesso!',
      )
      const parentId = formMode.subject.subject_id
      resetForm()
      if (parentId) setExpandedRootId(parentId)
      else setExpandedRootId(formMode.subject.id)
      setIsSaving(false)
    }
  }

  async function handleDeleteRoot(root: Subjects) {
    setIsSaving(true)
    const { error } = await DeleteSubject(root.id)
    if (error) {
      if (error.code === '23503') {
        toast.error(
          'Você não pode excluir uma matéria que possui assuntos relacionados.',
        )
      } else {
        toast.error(error.message)
      }
      setIsSaving(false)
      return
    }
    toast.success('Matéria excluída com sucesso.')
    if (expandedRootId === root.id) setExpandedRootId(null)
    resetForm()
    setIsSaving(false)
  }

  async function handleDeleteRelated(related: Subjects) {
    setIsSaving(true)
    const { error } = await DeleteSubject(related.id)
    if (error) {
      if (error.code === '23503') {
        toast.error(
          'Você não pode excluir um assunto que está em uso na plataforma.',
        )
      } else {
        toast.error(error.message)
      }
      setIsSaving(false)
      return
    }
    toast.success('Assunto excluído com sucesso.')
    if (formMode.kind === 'edit' && formMode.subject.id === related.id) {
      resetForm()
    }
    setIsSaving(false)
  }

  function renderSubjectForm() {
    if (formMode.kind === 'idle') return null

    const isRootForm =
      formMode.kind === 'create-root' ||
      (formMode.kind === 'edit' && formMode.subject.subject_id === null)

    const title =
      formMode.kind === 'create-root'
        ? 'Nova matéria'
        : formMode.kind === 'create-related'
          ? 'Novo assunto relacionado'
          : formMode.subject.subject_id === null
            ? 'Editar matéria'
            : 'Editar assunto'

    return (
      <div className="mx-4 mb-3 rounded-xl border border-chart-5/30 bg-chart-5/5 p-3">
        <p className="mb-2 text-xs font-bold text-chart-5">{title}</p>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Nome..."
            className={inputClass}
            disabled={isSaving}
          />
          {isRootForm ? (
            <select
              value={formType}
              onChange={(e) => setFormType(e.target.value as SubjectType)}
              className={inputClass}
              disabled={isSaving}
            >
              <option value="basic">Básico</option>
              <option value="specific">Específico</option>
            </select>
          ) : null}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={resetForm}
              disabled={isSaving}
              className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => void handleSaveForm()}
              disabled={isSaving}
              className="rounded-full border border-chart-5 bg-chart-5/20 px-3 py-1.5 text-xs font-semibold text-chart-5 transition-colors hover:bg-chart-5/30 disabled:opacity-50"
            >
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4">
      <div
        className="flex max-h-[92vh] w-full flex-col rounded-t-2xl border border-border bg-card sm:max-w-lg sm:rounded-2xl"
        style={{ maxWidth: '512px' }}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <h2 className="font-heading text-base font-black text-foreground">
            Matérias
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-chart-5/40 hover:text-foreground disabled:opacity-50"
            aria-label="Fechar modal"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="flex flex-col gap-3 px-4 py-4">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar matéria..."
              className={inputClass + ' pl-10'}
              disabled={isSaving}
            />
          </div>

          <button
            type="button"
            onClick={openCreateRoot}
            disabled={isSaving}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-chart-5/50 bg-chart-5/10 py-2.5 text-sm font-semibold text-chart-5 transition-colors hover:bg-chart-5/15 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Criar Matéria
          </button>
        </div>

        {formMode.kind === 'create-root' ? renderSubjectForm() : null}

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Carregando matérias...
            </p>
          ) : filteredRoots.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              Nenhuma matéria encontrada.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {filteredRoots.map((root) => {
                const related = getFilteredRelated(root.id)
                const relatedCount = relatedByRootId.get(root.id)?.length ?? 0
                const isExpanded = expandedRootId === root.id
                const isEditingRoot =
                  formMode.kind === 'edit' &&
                  formMode.subject.id === root.id

                return (
                  <li
                    key={root.id}
                    className={`overflow-hidden rounded-xl border transition-colors ${
                      isExpanded
                        ? 'border-chart-5/50 bg-card'
                        : 'border-border bg-background'
                    }`}
                  >
                    <div className="flex items-center gap-2 p-3">
                      <button
                        type="button"
                        onClick={() => toggleRoot(root.id)}
                        disabled={isSaving}
                        className="flex min-w-0 flex-1 items-center gap-2 text-left disabled:opacity-50"
                      >
                        {isExpanded ? (
                          <ChevronDown
                            className="h-4 w-4 shrink-0 text-muted-foreground"
                            aria-hidden
                          />
                        ) : (
                          <ChevronRight
                            className="h-4 w-4 shrink-0 text-muted-foreground"
                            aria-hidden
                          />
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold text-foreground">
                            {root.name}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {relatedCount}{' '}
                            {relatedCount === 1
                              ? 'assunto relacionado'
                              : 'assuntos relacionados'}
                          </span>
                        </span>
                      </button>

                      {!isExpanded ? (
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setExpandedRootId(root.id)
                              openEdit(root)
                            }}
                            disabled={isSaving}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-chart-5/40 hover:text-foreground disabled:opacity-50"
                            aria-label={`Editar ${root.name}`}
                          >
                            <Pencil className="h-4 w-4" aria-hidden />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              void handleDeleteRoot(root)
                            }}
                            disabled={isSaving}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-destructive transition-colors hover:border-destructive/40 hover:bg-destructive/10 disabled:opacity-50"
                            aria-label={`Excluir ${root.name}`}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden />
                          </button>
                        </div>
                      ) : null}
                    </div>

                    {isEditingRoot ? renderSubjectForm() : null}

                    {isExpanded ? (
                      <div className="border-t border-border px-3 pb-3 pt-2">
                        <p className="mb-2 text-xs font-bold text-chart-5">
                          Assuntos relacionados
                        </p>

                        {related.length === 0 ? (
                          <p className="mb-3 text-xs text-muted-foreground">
                            Nenhum assunto relacionado cadastrado.
                          </p>
                        ) : (
                          <div className="mb-3 flex flex-wrap gap-2">
                            {related.map((item) => {
                              const isSelected = selectedSubjectId === item.id

                              return (
                                <span
                                  key={item.id}
                                  className={`inline-flex items-center overflow-hidden rounded-full border text-xs font-semibold transition-colors gap-2 ${
                                    isSelected
                                      ? 'border-chart-5 bg-chart-5/20 text-foreground'
                                      : 'border-border bg-muted text-foreground'
                                  }`}
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onSelect({
                                        relatedSubject: item,
                                        rootSubject: root,
                                        rootSubjectName: root.name,
                                      })
                                    }
                                    disabled={isSaving}
                                    className="px-3 py-1.5 disabled:opacity-50"
                                  >
                                    {item.name}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openEdit(item)}
                                    disabled={isSaving}
                                    className="border-l border-border px-1.5 py-1.5 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                                    aria-label={`Editar ${item.name}`}
                                  >
                                    <Pencil className="h-5 w-5" aria-hidden />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => void handleDeleteRelated(item)}
                                    disabled={isSaving}
                                    className="border-l border-border px-1.5 py-1.5 text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                                    aria-label={`Excluir ${item.name}`}
                                  >
                                    <X className="h-5 w-5" aria-hidden />
                                  </button>
                                </span>
                              )
                            })}
                          </div>
                        )}

                        {formMode.kind === 'create-related' &&
                        formMode.rootId === root.id
                          ? renderSubjectForm()
                          : null}

                        {formMode.kind === 'edit' &&
                        formMode.subject.subject_id === root.id
                          ? renderSubjectForm()
                          : null}

                        <button
                          type="button"
                          onClick={() => openCreateRelated(root.id)}
                          disabled={isSaving}
                          className="mb-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-chart-5/40 py-2 text-xs font-semibold text-chart-5 transition-colors hover:bg-chart-5/10 disabled:opacity-50"
                        >
                          <Plus className="h-3.5 w-3.5" aria-hidden />
                          Adicionar assunto relacionado
                        </button>

                        <div className="flex flex-wrap items-center gap-7 border-t border-border pt-3">
                          <button
                            type="button"
                            onClick={() => openEdit(root)}
                            disabled={isSaving}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                          >
                            <Pencil className="h-4 w-4" aria-hidden />
                            Editar matéria
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDeleteRoot(root)}
                            disabled={isSaving}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-destructive transition-colors hover:text-destructive/80 disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden />
                            Excluir matéria
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
