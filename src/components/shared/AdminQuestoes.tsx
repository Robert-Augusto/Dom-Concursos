'use client'

import { SubjectFilterGroup } from '@/components/shared/SubjectFilterGroup'
import { ModalGenerateQuestoes } from '@/components/shared/ModalGenerateQuestoes'
import { ModalQuestion } from '@/components/shared/ModalQuestion'
import { createClient } from '@/lib/supabase/client'
import { Pencil } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { BANCA_OPTIONS, Questions, Subjects } from '@/types'

const DIFFICULTY_OPTIONS = ['Todas', 'Fácil', 'Médio', 'Difícil'] as const

const BANCA_FILTER_OPTIONS = ['Todas', ...BANCA_OPTIONS] as const

type AdminQuestoesProps = {
  subjectsData?: Subjects[] | null
}

export default function AdminQuestoes({
  subjectsData = null,
}: AdminQuestoesProps) {
  const [subjectFilterSearch, setSubjectFilterSearch] = useState('')
  const [selectedRootFilter, setSelectedRootFilter] = useState('')
  const [relatedSubject, setRelatedSubject] = useState<Subjects | null>(null)
  const [subjectQuestions, setSubjectQuestions] = useState<
    Questions[] | null
  >(null)
  const [questionTextFilter, setQuestionTextFilter] = useState('')
  const [difficultyFilter, setDifficultyFilter] =
    useState<(typeof DIFFICULTY_OPTIONS)[number]>('Todas')
  const [bancaFilter, setBancaFilter] =
    useState<(typeof BANCA_FILTER_OPTIONS)[number]>('Todas')
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false)
  const [questionModalDetail, setQuestionModalDetail] =
    useState<Questions | null>(null)

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

  const filteredQuestionsList = useMemo(() => {
    const q = questionTextFilter.trim().toLowerCase()
    return questionsSourceList.filter((item) => {
      const matchesText =
        q === '' || item.question.toLowerCase().includes(q)
      const matchesDifficulty =
        difficultyFilter === 'Todas' || item.difficulty === difficultyFilter
      const matchesBanca =
        bancaFilter === 'Todas' || item.banca === bancaFilter
      return matchesText && matchesDifficulty && matchesBanca
    })
  }, [questionsSourceList, questionTextFilter, difficultyFilter, bancaFilter])

  const isQuestionsLoading = subjectQuestions === null

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
        subjectFilterSearch={subjectFilterSearch}
        onSubjectFilterSearchChange={setSubjectFilterSearch}
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
                {DIFFICULTY_OPTIONS.map((opt) => {
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

            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-foreground">
                Filtrar por banca
              </span>
              <div className="flex flex-wrap gap-2">
                {BANCA_FILTER_OPTIONS.map((opt) => {
                  const active = bancaFilter === opt
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setBancaFilter(opt)}
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
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {isQuestionsLoading
                ? 'Carregando questões…'
                : `${filteredQuestionsList.length} questão(ões) encontrada(s)`}
            </p>
            <button
              type="button"
              onClick={() => setIsGenerateModalOpen(true)}
              className="inline-flex items-center justify-center rounded-full border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Criar nova questão
            </button>
          </div>

          <ModalGenerateQuestoes
            open={isGenerateModalOpen}
            relatedSubject={relatedSubject}
            onClose={() => setIsGenerateModalOpen(false)}
          />

          <ModalQuestion
            open={isQuestionModalOpen}
            question={questionModalDetail}
            onClose={() => {
              setIsQuestionModalOpen(false)
              setQuestionModalDetail(null)
            }}
          />

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
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="min-w-0 flex-1 text-sm font-medium text-foreground">
                        {question.question}
                      </p>
                    <div className="flex shrink-0 flex-wrap items-start justify-end gap-2">
                        <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                          {question.difficulty}
                        </span>
                        <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                          {question.banca}
                        </span>
                        <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                          Gabarito: {question.correct_option}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setQuestionModalDetail(question)
                            setIsQuestionModalOpen(true)
                          }}
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
    </section>
  )
}
