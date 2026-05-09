'use client'

import { useState, useEffect } from 'react'
import { Subjects, StudyFlashcards, StudyMaterials } from '@/types'
import { BookText, Image as ImageIcon, Layers, Pencil, Trash2 } from 'lucide-react'
import { ModalFlashcard } from '@/components/shared/ModalFlashcard'
import { ModalStudyMaterial } from '@/components/shared/ModalStudyMaterial'
import { SubjectFilterGroup } from '@/components/shared/SubjectFilterGroup'
import { CreateStudyMaterial, GetStudyMaterialsBySubject } from '@/lib/study_material'
import { toast } from 'sonner'
import { CreateFlashcard, GetFlashcardsBySubject } from '@/lib/flashcards'

const SMART_ACTION_CARDS = [
  {
    id: 'theory',
    title: 'Texto Teórico',
    description: 'Crie e organize um conteúdo teórico resumido para a matéria selecionada.',
    buttonLabel: 'Abrir editor',
    icon: BookText,
  },
  {
    id: 'flashcards',
    title: 'Flashcards',
    description: 'Cadastre perguntas e respostas rápidas para revisão ativa da matéria.',
    buttonLabel: 'Criar flashcard',
    icon: Layers,
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
    const [selectedSmartSubject, setSelectedSmartSubjectId] = useState<Subjects | null>(null)
    const [subjectFilterSearch, setSubjectFilterSearch] = useState('')
    const [selectedRootFilter, setSelectedRootFilter] = useState('')
    const [selectedRelatedFilter, setSelectedRelatedFilter] = useState('')
    const [isTextMaterialModalOpen, setIsTextMaterialModalOpen] = useState(false)
    const [isFlashcardModalOpen, setIsFlashcardModalOpen] = useState(false)
    const [editingFlashcardId, setEditingFlashcardId] = useState<string | null>(null)
    const [editingFlashcardMode, setEditingFlashcardMode] = useState('')
    const [flashcardsBySubjectMap, setFlashcardsBySubjectMap] = useState<Record<string, FlashcardItem[]>>({})
    
    const [materials, setMaterials] = useState<StudyMaterials | null>(null);
    const [flashcards, setFlashcards] = useState<StudyFlashcards[]>([]);
    const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);

    useEffect(() => {
      const subjectId = selectedSmartSubject?.id;
      if (!subjectId) {
        setMaterials(null);
        setFlashcards([]);
        return;
      }
    
      async function loadSubjectData() {
        setIsLoadingMaterials(true);
      
        const [materialsRes, flashcardsRes] = await Promise.all([
          GetStudyMaterialsBySubject(String(subjectId)),
          GetFlashcardsBySubject(String(subjectId)),
        ]);
      
        if (materialsRes.error) {
          toast.info("Ainda não há materiais de estudo cadastrados para esse conteúdo!!")
        } else {
          setMaterials(materialsRes.data);
        }
      
        if (flashcardsRes.error) {
          toast.info("Ainda não há flashcards cadastrados para esse conteúdo!!")
        } else {
          setFlashcards(flashcardsRes.data);
        }
      
        setIsLoadingMaterials(false);
      }
    
      loadSubjectData();
    }, [selectedSmartSubject?.id]);

    async function handleCreateMaterial(html: string, path: string){
      const {error} = await CreateStudyMaterial(String(selectedSmartSubject?.id), html, path)
      if(error){
        toast.error(error.message)
        return
      }
      toast.success("Conteúdo salvo com sucesso !!")
    }

    async function handleCreateFlashcard(front: string, back: string){
      const {error} = await CreateFlashcard(String(selectedSmartSubject?.id),front, back)
      if(error){
        toast.error(error.message)
        return
      }
      setIsFlashcardModalOpen(false)
      toast.success("Flashcard criado com sucesso!!")
    }

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

                  <SubjectFilterGroup
                    subjectsData={subjectsData}
                    subjectFilterSearch={subjectFilterSearch}
                    onSubjectFilterSearchChange={setSubjectFilterSearch}
                    selectedRootFilter={selectedRootFilter}
                    selectedRelatedFilter={selectedRelatedFilter}
                    onSelectedRootFilterChange={setSelectedRootFilter}
                    onSelectedRelatedFilterChange={setSelectedSmartSubjectId}
                    onAfterClear={() => setSelectedSmartSubjectId(null)}
                    onAfterRootSelect={() => setSelectedSmartSubjectId(null)}
                    onAfterRelatedSelect={(relatedId) =>
                      setSelectedSmartSubjectId(relatedId)
                    }
                  />
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
                                if (card.id === 'flashcards') {
                                  setEditingFlashcardId(null)
                                  setIsFlashcardModalOpen(true)
                                  setEditingFlashcardMode('create')
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
                        {flashcards.map((flashcard) => (
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
                                  setEditingFlashcardMode('update')
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
              <ModalStudyMaterial
                open={isTextMaterialModalOpen}
                onOpenChange={setIsTextMaterialModalOpen}
                subjectName={selectedSmartSubject?.name}
                initialContent={materials ?? null}
                onSave={handleCreateMaterial}
              />

              <ModalFlashcard
                open={isFlashcardModalOpen}
                mode={editingFlashcardMode ? 'edit' : 'create'}
                subjectName={selectedSmartSubject?.name}
                onClose={() => {
                  setIsFlashcardModalOpen(false)
                  setEditingFlashcardId(null)
                }}
                onSave={handleCreateFlashcard}
              />
              </section>
        </div>
    )
}