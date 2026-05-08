'use client'

import { useMemo, useState } from 'react'
import { Subjects } from '@/types'
import { BookText, Image as ImageIcon, Layers, Pencil, Trash2 } from 'lucide-react'
import { ModalFlashcard } from '@/components/shared/ModalFlashcard'
import { ModalImageMaterial } from '@/components/shared/ModalImageMaterial'
import { ModalTextMaterial } from '@/components/shared/ModalTextMaterial'

const SMART_ACTION_CARDS = [
    {
      id: 'theory',
      title: 'Texto Teórico',
      description: 'Crie e organize um conteúdo teórico resumido para a matéria selecionada.',
      buttonLabel: 'Abrir editor',
      icon: BookText,
    },
    {
      id: 'support-image',
      title: 'Imagem de Apoio',
      description: 'Adicione uma imagem para reforçar visualmente o estudo do assunto.',
      buttonLabel: 'Selecionar imagem',
      icon: ImageIcon,
    },
    {
      id: 'flashcards',
      title: 'Flashcards',
      description: 'Cadastre perguntas e respostas rápidas para revisão ativa da matéria.',
      buttonLabel: 'Criar flashcard',
      icon: Layers,
    },
  ] as const

const FLASHCARDS_MOCK = [
    {
      id: 'fc-1',
      subjectId: 'placeholder',
      front: 'Qual é o objetivo principal do controle de constitucionalidade?',
      back: 'Garantir a supremacia da Constituição sobre as demais normas.',
    },
    {
      id: 'fc-2',
      subjectId: 'placeholder',
      front: 'No Windows, qual comando abre o Gerenciador de Tarefas?',
      back: 'Ctrl + Shift + Esc.',
    },
    {
      id: 'fc-3',
      subjectId: 'placeholder',
      front: 'O que significa RLS no Supabase?',
      back: 'Row Level Security, regras de acesso por linha.',
    },
] as const

type EstudoInteligenteProps = {
    subjectsData?: Subjects[] | null
}

type FlashcardItem = {
  id: string
  subjectId: string
  front: string
  back: string
}

export default function EstudoInteligente({
    subjectsData = [],
}: EstudoInteligenteProps){
    const allSubjects = subjectsData ?? []

    const [selectedSmartSubjectId, setSelectedSmartSubjectId] = useState<string | null>(null)
    const [subjectFilterSearch, setSubjectFilterSearch] = useState('')
    const [selectedRootFilter, setSelectedRootFilter] = useState('')
    const [selectedRelatedFilter, setSelectedRelatedFilter] = useState('')
    const [isTextMaterialModalOpen, setIsTextMaterialModalOpen] = useState(false)
    const [isImageMaterialModalOpen, setIsImageMaterialModalOpen] = useState(false)
    const [isFlashcardModalOpen, setIsFlashcardModalOpen] = useState(false)
    const [editingFlashcardId, setEditingFlashcardId] = useState<string | null>(null)
    const [savedTheoryHtml, setSavedTheoryHtml] = useState('')
    const [flashcardsBySubjectMap, setFlashcardsBySubjectMap] = useState<Record<string, FlashcardItem[]>>({})
    
    const selectedSmartSubject = useMemo(() => {
    if (!selectedSmartSubjectId) return null
    return allSubjects.find((subject) => subject.id === selectedSmartSubjectId) ?? null
    }, [selectedSmartSubjectId, allSubjects])

    const flashcardsBySubject = useMemo(() => {
      if (!selectedSmartSubjectId) return []

      const existingFlashcards = flashcardsBySubjectMap[selectedSmartSubjectId]
      if (existingFlashcards) return existingFlashcards

      return FLASHCARDS_MOCK.map((flashcard, index) => ({
        ...flashcard,
        id: `${selectedSmartSubjectId}-${index}`,
        subjectId: selectedSmartSubjectId,
      }))
    }, [selectedSmartSubjectId, flashcardsBySubjectMap])

    const editingFlashcard = useMemo(() => {
      if (!editingFlashcardId) return null
      return flashcardsBySubject.find((flashcard) => flashcard.id === editingFlashcardId) ?? null
    }, [editingFlashcardId, flashcardsBySubject])

    const subjectNameById = useMemo(() => {
        const map = new Map<string, string>()
        allSubjects.forEach((subject) => {
          map.set(subject.id, subject.name)
        })
        return map
      }, [allSubjects])
    
      const rootSubjects = useMemo(() => {
        return allSubjects.filter((subject) => subject.subject_id === null)
      }, [allSubjects])
    
      const relatedSubjects = useMemo(() => {
        return allSubjects.filter((subject) => subject.subject_id !== null)
      }, [allSubjects])
    
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


    return (
        <div>
            <section className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-lg font-black text-foreground font-heading">
                      Estudo Inteligente
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Selecione uma matéria para gerenciar os conteúdos de apoio.
                    </p>
                  </div>

                  <div className="space-y-2 rounded-lg border border-border bg-card p-3">
                    <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => {
                        setSelectedRootFilter('')
                        setSelectedRelatedFilter('')
                        setSelectedSmartSubjectId(null)
                        }}
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
                        onChange={(e) => setSubjectFilterSearch(e.target.value)}
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
                        onClick={() => {
                            setSelectedRootFilter(subject.id)
                            setSelectedRelatedFilter('')
                            setSelectedSmartSubjectId(null)
                        }}
                        className={`rounded-full border mb-2 px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
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
                                onClick={() => {
                                  setSelectedRelatedFilter(subject.id)
                                  setSelectedSmartSubjectId(subject.id)
                                }}
                                className={`rounded-full border mb-2 px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
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
                  
                </div>

                {selectedSmartSubject ? (
                  <div className="flex flex-col gap-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Matéria selecionada: {selectedSmartSubject.name}
                    </p>

                    <div className="grid gap-4 md:grid-cols-3">
                      {SMART_ACTION_CARDS.map((card) => {
                        const Icon = card.icon
                        return (
                          <article
                            key={card.id}
                            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
                          >
                            <div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted">
                              <Icon className="h-4 w-4 text-foreground" aria-hidden />
                            </div>
                            <h3 className="text-base font-bold text-foreground">
                              {card.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {card.description}
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                if (card.id === 'theory') {
                                  setIsTextMaterialModalOpen(true)
                                }
                                if (card.id === 'support-image') {
                                  setIsImageMaterialModalOpen(true)
                                }
                                if (card.id === 'flashcards') {
                                  setEditingFlashcardId(null)
                                  setIsFlashcardModalOpen(true)
                                }
                              }}
                              className="mt-auto inline-flex items-center justify-center rounded-full border border-primary bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                            >
                              {card.buttonLabel}
                            </button>
                          </article>
                        )
                      })}
                    </div>

                    <section className="flex flex-col gap-3">
                      <h3 className="text-base font-bold text-foreground">
                        Flashcards da matéria
                      </h3>
                      <div className="flex flex-col gap-2">
                        {flashcardsBySubject.map((flashcard) => (
                          <article
                            key={flashcard.id}
                            className="grid gap-3 rounded-xl border border-border bg-card p-4 md:grid-cols-[1fr_1fr_auto]"
                          >
                            <div className="rounded-lg border border-border bg-background p-3">
                              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Frente
                              </p>
                              <p className="mt-1 text-sm text-foreground">
                                {flashcard.front}
                              </p>
                            </div>
                            <div className="rounded-lg border border-border bg-background p-3">
                              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Verso
                              </p>
                              <p className="mt-1 text-sm text-foreground">
                                {flashcard.back}
                              </p>
                            </div>
                            <div className="flex items-start gap-2 md:flex-col md:justify-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingFlashcardId(flashcard.id)
                                  setIsFlashcardModalOpen(true)
                                }}
                                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                              >
                                <Pencil className="h-3.5 w-3.5" aria-hidden />
                                Editar
                              </button>
                              <button
                                type="button"
                                className="inline-flex items-center gap-1.5 rounded-full border border-destructive/40 px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10"
                              >
                                <Trash2 className="h-3.5 w-3.5" aria-hidden />
                                Excluir
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    </section>
                  </div>
                ) : (
                  <div className="rounded-xl border border-border bg-card px-5 py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      Selecione uma matéria para visualizar as ações e os flashcards.
                    </p>
                  </div>
                )}
              <ModalTextMaterial
                open={isTextMaterialModalOpen}
                onOpenChange={setIsTextMaterialModalOpen}
                subjectName={selectedSmartSubject?.name}
                initialContent={savedTheoryHtml}
                onSave={setSavedTheoryHtml}
              />
              <ModalImageMaterial
                open={isImageMaterialModalOpen}
                onClose={() => setIsImageMaterialModalOpen(false)}
                subjectName={selectedSmartSubject?.name}
              />
              <ModalFlashcard
                open={isFlashcardModalOpen}
                mode={editingFlashcard ? 'edit' : 'create'}
                subjectName={selectedSmartSubject?.name}
                initialFront={editingFlashcard?.front}
                initialBack={editingFlashcard?.back}
                onClose={() => {
                  setIsFlashcardModalOpen(false)
                  setEditingFlashcardId(null)
                }}
                onSave={(front, back) => {
                  if (!selectedSmartSubjectId) return

                  setFlashcardsBySubjectMap((currentMap) => {
                    const currentSubjectFlashcards =
                      currentMap[selectedSmartSubjectId] ??
                      FLASHCARDS_MOCK.map((flashcard, index) => ({
                        ...flashcard,
                        id: `${selectedSmartSubjectId}-${index}`,
                        subjectId: selectedSmartSubjectId,
                      }))

                    if (editingFlashcardId) {
                      return {
                        ...currentMap,
                        [selectedSmartSubjectId]: currentSubjectFlashcards.map((flashcard) =>
                          flashcard.id === editingFlashcardId
                            ? { ...flashcard, front, back }
                            : flashcard
                        ),
                      }
                    }

                    return {
                      ...currentMap,
                      [selectedSmartSubjectId]: [
                        ...currentSubjectFlashcards,
                        {
                          id: `${selectedSmartSubjectId}-${Date.now()}`,
                          subjectId: selectedSmartSubjectId,
                          front,
                          back,
                        },
                      ],
                    }
                  })

                  setIsFlashcardModalOpen(false)
                  setEditingFlashcardId(null)
                }}
              />
              </section>
        </div>
    )
}