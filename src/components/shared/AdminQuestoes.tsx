'use client'

import { ModalEditQuestion } from '@/components/shared/ModalEditQuestion'
import { SubjectFilterGroup } from '@/components/shared/SubjectFilterGroup'
import { QuestionFormFields } from '@/components/shared/QuestionFormFields'
import { createClient } from '@/lib/supabase/client'
import { Pencil, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  Banca,
  Questions,
  Subjects,
  QuestionsDifficulty,
  DIFFICULTY_SELECT,
} from '@/types'
import { CreateBanca, DeleteBanca, GetBancas } from '@/lib/lib-banca'

type AdminQuestoesProps = {
  subjectsData?: Subjects[] | null
}

export default function AdminQuestoes({
  subjectsData = null,
}: AdminQuestoesProps) {
  const [selectedRootFilter, setSelectedRootFilter] = useState('')
  const [relatedSubject, setRelatedSubject] = useState<Subjects | null>(null)
  const [subjectQuestions, setSubjectQuestions] = useState<
    Questions[] | null
  >(null)
  const [questionTextFilter, setQuestionTextFilter] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<QuestionsDifficulty>('Médio')
  const [bancas, setBancas] = useState<Banca[] | null>(null)
  const [bancaFilter, setBancaFilter] = useState('')
  const [bancaSearch, setBancaSearch] = useState('')
  const [showCreateBancaPanel, setShowCreateBancaPanel] = useState(false)
  const [newBancaName, setNewBancaName] = useState('')
  const [editingQuestion, setEditingQuestion] = useState<Questions | null>(
    null,
  )

  function closeCreateBancaPanel() {
    setShowCreateBancaPanel(false)
    setNewBancaName('')
  }

  function toggleCreateBancaPanel() {
    setShowCreateBancaPanel((open) => !open)
  }

  async function handleSaveNewBanca() {
    const name = newBancaName.trim()
    if (!name) {
      toast.error('Digite o nome da banca.')
      return
    }

    const exists = bancas?.some(
      (b) => b.name.toLowerCase() === name.toLowerCase(),
    )
    if (exists) {
      toast.error('Esta banca já existe na lista.')
      return
    }

    const { error } = await CreateBanca(name)

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Banca adicionada.')
    closeCreateBancaPanel()
  }

  const selectedBanca = useMemo(() => {
    if (!bancaFilter || !bancas) return null
    return bancas.find((b) => b.id === bancaFilter) ?? null
  }, [bancas, bancaFilter])

  async function handleDeleteBanca() {
    if (!selectedBanca) return

    const { error } = await DeleteBanca(selectedBanca.id)

    if (error) {
      if (error.code === '23503') {
        toast.error(
          'Não é possível excluir esta banca porque existem questões vinculadas a ela.',
        )
        return
      }
      toast.error(error.message)
      return
    }

    toast.success('Banca excluída com sucesso.')
    setBancaFilter('')
  }

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()

    async function fetchBancas(showLoading = false) {
      if (showLoading) setBancas(null)

      const { data, error } = await GetBancas()

      if (cancelled) return

      if (error) {
        console.error('banca:', error)
        if (showLoading) {
          toast.error('Não foi possível carregar as bancas.', {
            description: error.message,
          })
        }
        setBancas([])
        return
      }

      setBancas(data)
    }

    void fetchBancas(true)

    const channel = supabase
      .channel('admin_banca')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'banca' },
        () => {
          void fetchBancas(false)
        },
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    if (!bancas || bancas.length === 0) return

    setBancaFilter((current) => {
      if (current && bancas.some((b) => b.id === current)) return current
      return bancas[0].id
    })
  }, [bancas])

  useEffect(() => {
    if (!relatedSubject) {
      setSubjectQuestions(null)
      return
    }

    const subjectId = relatedSubject.id
    let cancelled = false
    const supabase = createClient()

    async function fetchForSubject() {
      setSubjectQuestions(null)

      const { data, error } = await supabase
        .from('subjects_questions')
        .select('*')
        .eq('subjects_id', subjectId)
        .order('created_at', { ascending: false })

      if (cancelled) return

      if (error) {
        console.error('subjects_questions:', error)
        toast.error('Não foi possível carregar as questões.', {
          description: error.message,
        })
        setSubjectQuestions([])
        return
      }

      setSubjectQuestions((data ?? []) as Questions[])
    }

    void fetchForSubject()

    const channel = supabase
      .channel(`admin_subjects_questions_${subjectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subjects_questions',
          filter: `subjects_id=eq.${subjectId}`,
        },
        () => {
          void (async () => {
            const { data, error } = await supabase
              .from('subjects_questions')
              .select('*')
              .eq('subjects_id', subjectId)
              .order('created_at', { ascending: false })

            if (cancelled) return
            if (error) {
              console.error('subjects_questions (realtime refetch):', error)
              return
            }
            setSubjectQuestions((data ?? []) as Questions[])
          })()
        },
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [relatedSubject])

  const questionsSourceList = useMemo(() => {
    if (!relatedSubject || subjectQuestions === null) return []
    return subjectQuestions
  }, [relatedSubject, subjectQuestions])

  const filteredBancas = useMemo(() => {
    if (!bancas) return []
    const query = bancaSearch.trim().toLowerCase()
    if (!query) return bancas
    return bancas.filter((b) => b.name.toLowerCase().includes(query))
  }, [bancas, bancaSearch])

  const filteredQuestionsList = useMemo(() => {
    const q = questionTextFilter.trim().toLowerCase()
    const selectedBancaId = selectedBanca?.id
    return questionsSourceList.filter((item) => {
      const matchesText =
        q === '' || item.question.toLowerCase().includes(q)
      const matchesDifficulty =
        item.difficulty === difficultyFilter
      const matchesBanca =
        !selectedBancaId || item.banca === selectedBancaId
      return matchesText && matchesDifficulty && matchesBanca
    })
  }, [
    questionsSourceList,
    questionTextFilter,
    difficultyFilter,
    selectedBanca,
  ])

  const isQuestionsLoading = subjectQuestions === null
  const isBancasLoading = bancas === null

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-black text-foreground font-heading">
          Questões
        </h2>
        <p className="text-sm text-muted-foreground">
          Selecione uma matéria relacionada para filtrar, criar e listar questões.
        </p>
      </div>

      <SubjectFilterGroup
        subjectsData={subjectsData}
        selectedRootFilter={selectedRootFilter}
        selectedRelatedFilter={relatedSubject?.id ?? ''}
        onSelectedRootFilterChange={setSelectedRootFilter}
        onSelectedRelatedFilterChange={setRelatedSubject}
        onAfterClear={() => setRelatedSubject(null)}
        onAfterRootSelect={() => setRelatedSubject(null)}
      />

      {relatedSubject ? (
        <div className="flex flex-col gap-5">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Matéria relacionada: {relatedSubject.name}
          </p>

          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Filtros
            </p>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="question-text-filter"
                className="text-xs font-semibold text-foreground"
              >
                Filtrar por texto da questão
              </label>
              <input
                id="question-text-filter"
                type="search"
                value={questionTextFilter}
                onChange={(e) => setQuestionTextFilter(e.target.value)}
                placeholder="Digite trechos do enunciado..."
                className="w-full max-w-2xl rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50"
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-foreground">
                Filtrar por dificuldade
              </span>
              <div className="flex flex-wrap gap-2">
                {DIFFICULTY_SELECT.map((opt) => {
                  const active = difficultyFilter === opt
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setDifficultyFilter(opt)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        active
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-transparent text-muted-foreground hover:border-primary/40 hover:text-foreground'
                      }`}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold text-foreground">
                Filtrar por banca
              </span>
              <input
                  type="search"
                  value={bancaSearch}
                  onChange={(e) => setBancaSearch(e.target.value)}
                  placeholder="Digite o nome da banca..."
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50"
              />
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={toggleCreateBancaPanel}
                  aria-expanded={showCreateBancaPanel}
                  className={`mb-2 shrink-0 rounded-full border border-dashed px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                    showCreateBancaPanel
                      ? 'border-primary bg-primary/15 text-primary'
                      : 'border-primary/60 bg-primary/5 text-primary hover:border-primary hover:bg-primary/10'
                  }`}
                >
                  + Criar Banca
                </button>
                {isBancasLoading ? (
                  <span className="mb-2 text-xs text-muted-foreground">
                    Carregando bancas…
                  </span>
                ) : bancas.length === 0 ? (
                  <span className="mb-2 text-xs text-muted-foreground">
                    Nenhuma banca cadastrada.
                  </span>
                ) : filteredBancas.length === 0 ? (
                  <span className="mb-2 text-xs text-muted-foreground">
                    Nenhuma banca encontrada para esta busca.
                  </span>
                ) : (
                  filteredBancas.map((banca) => {
                    const active = bancaFilter === banca.id
                    return (
                      <button
                        key={banca.id}
                        type="button"
                        onClick={() => setBancaFilter(banca.id)}
                        className={`mb-2 shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                          active
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-transparent text-muted-foreground hover:border-primary/40 hover:text-foreground'
                        }`}
                      >
                        {banca.name}
                      </button>
                    )
                  })
                )}
              </div>

              {selectedBanca ? (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-accent/20 bg-accent/5 px-3 py-2">
                  <p className="min-w-0 text-xs text-muted-foreground">
                    Banca selecionada:{' '}
                    <span className="font-semibold text-foreground">
                      {selectedBanca.name}
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={() => void handleDeleteBanca()}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-destructive/40 bg-background px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10"
                    aria-label="Excluir banca"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    Excluir banca
                  </button>
                </div>
              ) : null}

              {showCreateBancaPanel ? (
                <div className="rounded-xl border border-primary/25 bg-gradient-to-b from-primary/5 to-background p-4 shadow-sm ring-1 ring-primary/10">
                  <div className="mb-3 flex items-start gap-2">
                    <span
                      className="mt-1 h-8 w-1 shrink-0 rounded-full bg-primary"
                      aria-hidden
                    />
                    <div>
                      <h4 className="text-sm font-bold text-foreground">
                        Nova banca
                      </h4>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                        Digite o nome da banca examinadora (ex.: CESPE/CEBRASPE,
                        FCC). Ela ficará disponível nos filtros e no cadastro de
                        questões.
                      </p>
                    </div>
                  </div>

                  <label className="mb-4 flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Nome da banca
                    </span>
                    <input
                      id="admin-questoes-new-banca-name"
                      type="text"
                      value={newBancaName}
                      onChange={(e) => setNewBancaName(e.target.value)}
                      placeholder="Ex.: CESPE/CEBRASPE"
                      className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                    />
                  </label>

                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={closeCreateBancaPanel}
                      className="rounded-full border border-border bg-transparent px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveNewBanca}
                      className="rounded-full border border-primary bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 md:p-5">
            <div className="flex flex-col gap-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Nova questão
              </p>
              <p className="text-sm text-muted-foreground">
                Preencha os campos abaixo para cadastrar uma questão nesta
                matéria.
              </p>
            </div>

            <QuestionFormFields
              banca={selectedBanca?.id ?? ''}
              difficulty={difficultyFilter}
              subjectsId={String(relatedSubject.id)}
            />
          </div>

          <p className="text-sm text-muted-foreground">
            {isQuestionsLoading
              ? 'Carregando questões…'
              : `${filteredQuestionsList.length} questão(ões) encontrada(s)`}
          </p>

          {isQuestionsLoading ? (
            <p className="text-sm text-muted-foreground">
              Carregando questões do banco de dados…
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {filteredQuestionsList.length === 0 ? (
                <li className="rounded-xl border border-dashed border-border bg-card px-5 py-8 text-center text-sm text-muted-foreground">
                  Nenhuma questão encontrada para esta matéria com os filtros
                  atuais.
                </li>
              ) : (
                filteredQuestionsList.map((question) => (
                  <li
                    key={question.id}
                    className="rounded-xl border border-border bg-card p-4"
                  >
                    <div className="flex flex-col gap-3">
                      <p className="w-full text-sm font-medium leading-relaxed text-foreground">
                        {question.question}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                          {question.difficulty}
                        </span>
                        <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                          Gabarito: {question.correct_option}
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingQuestion(question)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-muted/50"
                        >
                          <Pencil className="h-3.5 w-3.5" aria-hidden />
                          Editar
                        </button>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card px-5 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Escolha uma matéria principal e, em seguida, uma matéria relacionada
            para gerenciar as questões.
          </p>
        </div>
      )}

      <ModalEditQuestion
        open={editingQuestion !== null}
        question={editingQuestion}
        bancas={bancas ?? []}
        onClose={() => setEditingQuestion(null)}
      />
    </section>
  )
}
