'use client'

import { useState, useEffect, useRef } from 'react'
import { Subjects, StudyFlashcards, StudyMaterials } from '@/types'
import { BookText, FileUp, Layers, Pencil, Trash2 } from 'lucide-react'
import { ModalFlashcard } from '@/components/shared/ModalFlashcard'
import { SubjectFilterGroup } from '@/components/shared/SubjectFilterGroup'
import {
  CreateStudyMaterial,
  GetStudyMaterialsBySubject,
  UpdateStudyMaterial,
} from '@/lib/study_material'
import { toast } from 'sonner'
import {
  CreateFlashcard,
  GetFlashcardsBySubject,
  UpdateFlashcard,
  DeleteFLashcard,
} from '@/lib/flashcards'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const SMART_ACTION_CARDS = [
  {
    id: 'theory',
    title: 'Material de Estudo',
    description: 'Envie o PDF do material de estudo para a matéria selecionada.',
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

export default function EstudoInteligente({
  subjectsData = [],
}: EstudoInteligenteProps) {
  const pdfInputRef = useRef<HTMLInputElement>(null)
  const [selectedSmartSubject, setSelectedSmartSubjectId] =
    useState<Subjects | null>(null)
  const [selectedRootFilter, setSelectedRootFilter] = useState('')
  const [isFlashcardModalOpen, setIsFlashcardModalOpen] = useState(false)
  const [editingFlashcardMode, setEditingFlashcardMode] = useState<
    'create' | 'update' | ''
  >('')
  const [materials, setMaterials] = useState<StudyMaterials | null>(null)
  const [flashcards, setFlashcards] = useState<StudyFlashcards[]>([])
  const [flashcardSelected, setFlashcardSelected] =
    useState<StudyFlashcards | null>(null)
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false)
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null)
  const [isSavingMaterial, setIsSavingMaterial] = useState(false)

  const hasStudyMaterial = Boolean(materials?.file_url?.trim())

  useEffect(() => {
    setSelectedPdfFile(null)
    if (pdfInputRef.current) pdfInputRef.current.value = ''
  }, [selectedSmartSubject?.id])

  useEffect(() => {
    const subjectId = selectedSmartSubject?.id
    const supabase = createClient()
    if (!subjectId) {
      setMaterials(null)
      setFlashcards([])
      return
    }

    async function loadSubjectData() {
      setIsLoadingMaterials(true)

      const [materialsRes, flashcardsRes] = await Promise.all([
        GetStudyMaterialsBySubject(String(subjectId)),
        GetFlashcardsBySubject(String(subjectId)),
      ])

      if (materialsRes.error) {
        setMaterials(null)
      } else {
        setMaterials(materialsRes.data)
      }

      if (flashcardsRes.error) {
        setFlashcards([])
      } else {
        setFlashcards(flashcardsRes.data)
      }
      setIsLoadingMaterials(false)
    }

    loadSubjectData()

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
        },
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
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedSmartSubject?.id])

  function handlePdfChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) {
      setSelectedPdfFile(null)
      return
    }
    if (file.type !== 'application/pdf') {
      toast.error('Envie apenas arquivos PDF.')
      event.target.value = ''
      setSelectedPdfFile(null)
      return
    }
    setSelectedPdfFile(file)
  }

  async function handleSaveStudyMaterialPdf() {
    if (!selectedSmartSubject) {
      toast.error('Selecione uma matéria relacionada.')
      return
    }
    if (!selectedPdfFile) {
      toast.error('Selecione um PDF para enviar.')
      return
    }

    setIsSavingMaterial(true)
    const supabase = createClient()
    const storagePath = `pdf/${selectedSmartSubject.id}/${Date.now()}-${selectedPdfFile.name}`

    const { error: uploadError } = await supabase.storage
      .from('study_materials_images')
      .upload(storagePath, selectedPdfFile)

    if (uploadError) {
      toast.error(uploadError.message)
      setIsSavingMaterial(false)
      return
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('study_materials_images').getPublicUrl(storagePath)

    const saveError = hasStudyMaterial
      ? (await UpdateStudyMaterial(publicUrl, String(materials?.id))).error
      : (
          await CreateStudyMaterial(
            String(selectedSmartSubject.id),
            publicUrl,
          )
        ).error

    setIsSavingMaterial(false)

    if (saveError) {
      toast.error(saveError.message)
      return
    }

    setSelectedPdfFile(null)
    if (pdfInputRef.current) pdfInputRef.current.value = ''

    const materialsRes = await GetStudyMaterialsBySubject(
      String(selectedSmartSubject.id),
    )
    if (!materialsRes.error) setMaterials(materialsRes.data)

    toast.success(
      hasStudyMaterial
        ? 'PDF atualizado com sucesso!'
        : 'PDF salvo com sucesso!',
    )
  }

  async function handleCreateFlashcard(front: string, back: string, mode: string) {
    if (mode === 'create') {
      const { error } = await CreateFlashcard(
        String(selectedSmartSubject?.id),
        front,
        back,
      )
      if (error) {
        toast.error(error.message)
        return
      }
      setIsFlashcardModalOpen(false)
      toast.success('Flashcard criado com sucesso!!')
    } else if (mode === 'update') {
      const { error } = await UpdateFlashcard(
        String(flashcardSelected?.id),
        front,
        back,
      )
      if (error) {
        toast.error(error.message)
        return
      }
      setIsFlashcardModalOpen(false)
      toast.success('Flashcard atualizado com sucesso!!')
    }
  }

  async function handleDeleteFlashcard(flashcardDeleteId: string) {
    const { error } = await DeleteFLashcard(flashcardDeleteId)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Flashcard deletado com sucesso!!')
  }

  return (
    <div>
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-heading text-lg font-black text-foreground">
              Estudo Inteligente
            </h2>
            <p className="text-sm text-muted-foreground">
              Selecione uma matéria para gerenciar os conteúdos de apoio.
            </p>
          </div>

          <SubjectFilterGroup
            subjectsData={subjectsData}
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

            <div className="flex flex-row gap-3">
              {SMART_ACTION_CARDS.map((card) => {
                const Icon = card.icon
                const isTheoryCard = card.id === 'theory'
                const theoryNeedsCreation = isTheoryCard && !hasStudyMaterial

                return (
                  <article
                    key={card.id}
                    className={cn(
                      'flex flex-col gap-3 rounded-xl border p-4',
                      isTheoryCard && 'md:col-span-2',
                      theoryNeedsCreation
                        ? 'border-primary/40 bg-primary/5'
                        : 'border-border bg-card',
                    )}
                  >
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted">
                      <Icon className="h-4 w-4 text-foreground" aria-hidden />
                    </div>
                    <h3 className="text-base font-bold text-foreground">
                      {card.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isTheoryCard
                        ? theoryNeedsCreation
                          ? 'Nenhum PDF cadastrado. Envie o material em PDF abaixo.'
                          : card.description
                        : card.description}
                    </p>

                    {isTheoryCard ? (
                      <div className="mt-1 flex flex-col gap-3">
                        {hasStudyMaterial && materials?.file_url ? (
                          <a
                            href={materials.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-primary underline-offset-2 hover:underline"
                          >
                            Ver PDF atual
                          </a>
                        ) : null}

                        <label
                          className={cn(
                            'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background px-4 py-6 text-center transition-colors hover:border-primary/40',
                            selectedPdfFile && 'border-primary/50 bg-primary/5',
                          )}
                        >
                          <FileUp className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm font-semibold text-foreground">
                            {selectedPdfFile
                              ? selectedPdfFile.name
                              : 'Selecionar PDF'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Apenas arquivos .pdf
                          </span>
                          <input
                            ref={pdfInputRef}
                            type="file"
                            accept="application/pdf,.pdf"
                            onChange={handlePdfChange}
                            disabled={isSavingMaterial || isLoadingMaterials}
                            className="hidden"
                          />
                        </label>

                        <button
                          type="button"
                          disabled={
                            !selectedPdfFile || isSavingMaterial || isLoadingMaterials
                          }
                          onClick={() => void handleSaveStudyMaterialPdf()}
                          className={cn(
                            'inline-flex items-center justify-center rounded-full border border-primary bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50',
                          )}
                        >
                          {isSavingMaterial
                            ? 'Salvando...'
                            : hasStudyMaterial
                              ? 'Atualizar PDF'
                              : 'Salvar PDF'}
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setFlashcardSelected(null)
                            setEditingFlashcardMode('create')
                            setIsFlashcardModalOpen(true)
                          }}
                          className="mt-auto inline-flex items-center justify-center rounded-full border border-primary bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                        >
                          {card.buttonLabel}
                        </button>
                      </>
                    )}
                  </article>
                )
              })}
            </div>

            <section className="flex flex-row gap-3">
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
              Selecione uma matéria para enviar o PDF e gerenciar os flashcards.
            </p>
          </div>
        )}

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
