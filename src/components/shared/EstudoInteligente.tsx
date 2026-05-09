'use client'

import { useState, useEffect } from 'react'
import { Subjects, StudyFlashcards, StudyMaterials } from '@/types'
import { BookText, Image as ImageIcon, Layers, Pencil, Trash2 } from 'lucide-react'
import { ModalFlashcard } from '@/components/shared/ModalFlashcard'
import { ModalStudyMaterial } from '@/components/shared/ModalStudyMaterial'
import { SubjectFilterGroup } from '@/components/shared/SubjectFilterGroup'
import { CreateStudyMaterial, GetStudyMaterialsBySubject, UpdateStudyMaterial } from '@/lib/study_material'
import { toast } from 'sonner'
import { CreateFlashcard, GetFlashcardsBySubject, UpdateFlashcard, DeleteFLashcard } from '@/lib/flashcards'
import { createClient } from '@/lib/supabase/client'

const SMART_ACTION_CARDS = [
  {
    id: 'theory',
    title: 'Material de Estudo',
    description: 'Crie e organize os materiais teóricos de estudo para a matéria selecionada.',
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
    const [isTextMaterialModalOpen, setIsTextMaterialModalOpen] = useState(false)
    const [isFlashcardModalOpen, setIsFlashcardModalOpen] = useState(false)
    const [editingFlashcardMode, setEditingFlashcardMode] = useState<'create' | 'update' | ''>('')
    const [flashcardsBySubjectMap, setFlashcardsBySubjectMap] = useState<Record<string, FlashcardItem[]>>({})
    
    const [materials, setMaterials] = useState<StudyMaterials | null>(null);
    const [flashcards, setFlashcards] = useState<StudyFlashcards[]>([]);
    const [flashcardSelected, setFlashcardSelected] = useState<StudyFlashcards | null>(null)
    const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);
    const hasStudyMaterial = Boolean(
      materials && (materials.content.trim() !== '' || materials.file_url.trim() !== '')
    )

    useEffect(() => {
      const subjectId = selectedSmartSubject?.id;
      const supabase = createClient()
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

      const channel = supabase
        .channel(`study_materials_flashcards_${subjectId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'study_materials',
            filter: `subjects_id=eq.${subjectId}`,
          },
          () => {
            loadSubjectData()
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'study_flashcards',
            filter: `subjects_id=eq.${subjectId}`,
          },
          () => {
            loadSubjectData()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }, [selectedSmartSubject?.id]);

    async function handleCreateMaterial(html: string, path: string, mode: string){
      if (mode === 'create'){
        const {error} = await CreateStudyMaterial(String(selectedSmartSubject?.id), html, path)
        if(error){
          toast.error(error.message)
          return
        }
        toast.success("Conteúdo salvo com sucesso !!")
      } else if (mode === 'update'){
        const {error} = await UpdateStudyMaterial(html, path, String(materials?.id))
        if (error) {
          toast.error(error.message)
          return
        }
        toast.success("Conteúdo atualizado com sucesso!!")
      }
    }

    async function handleCreateFlashcard(front: string, back: string, mode: string){
      if (mode === 'create'){
        const {error} = await CreateFlashcard(String(selectedSmartSubject?.id),front, back)
        if(error){
          toast.error(error.message)
          return
        }
        setIsFlashcardModalOpen(false)
        toast.success("Flashcard criado com sucesso!!")
      } else if (mode === 'update'){
        const {error} = await UpdateFlashcard(String(flashcardSelected?.id), front, back)
        if(error){
          toast.error(error.message)
          return
        }
        setIsFlashcardModalOpen(false)
        toast.success("Flashcard atualizado com sucesso!!")
      }
    }

    async function handleDeleteFlashcard(flashcardDeleteId: string){
      const {error} = await DeleteFLashcard(flashcardDeleteId)
      if(error){
        toast.error(error.message)
        return
      }
      toast.success("Flashcard deletado com sucesso!!")
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
                    selectedRelatedFilter={selectedSmartSubject?.id ?? ''}
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
                        const isTheoryCard = card.id === 'theory'
                        const theoryNeedsCreation = isTheoryCard && !hasStudyMaterial

                        const cardDescription = theoryNeedsCreation
                          ? 'Nenhum material cadastrado ainda. Crie o conteúdo em texto (obrigatório); a imagem de apoio é opcional.'
                          : card.description

                        const cardButtonLabel = isTheoryCard
                          ? (hasStudyMaterial ? 'Editar material' : 'Criar material')
                          : card.buttonLabel

                        return (
                          <article
                            key={card.id}
                            className={`flex flex-col gap-3 rounded-xl border p-4 ${
                              theoryNeedsCreation
                                ? 'border-primary/40 bg-primary/5'
                                : 'border-border bg-card'
                            }`}
                          >
                            <div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted">
                              <Icon className="h-4 w-4 text-foreground" aria-hidden />
                            </div>
                            <h3 className="text-base font-bold text-foreground">
                              {card.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {cardDescription}
                            </p>
                            {theoryNeedsCreation ? (
                              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                                Material pendente
                              </p>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => {
                                if (card.id === 'theory') {
                                  setIsTextMaterialModalOpen(true)
                                }
                                if (card.id === 'flashcards') {
                                  setFlashcardSelected(null)
                                  setEditingFlashcardMode('create')
                                  setIsFlashcardModalOpen(true)
                                }
                              }}
                              className="mt-auto inline-flex items-center justify-center rounded-full border border-primary bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                            >
                              {cardButtonLabel}
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
                                  setFlashcardSelected(flashcard)
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
                                onClick={() => handleDeleteFlashcard(flashcard.id)}
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
                mode={hasStudyMaterial ? 'update' : 'create'}
              />

              <ModalFlashcard
                open={isFlashcardModalOpen}
                mode={editingFlashcardMode}
                subjectName={selectedSmartSubject?.name}
                flashcardSelected={flashcardSelected ?? null}
                onClose={() => {
                  setIsFlashcardModalOpen(false)
                  setFlashcardSelected(null)
                }}
                onSave={handleCreateFlashcard}
              />
              </section>
        </div>
    )
}