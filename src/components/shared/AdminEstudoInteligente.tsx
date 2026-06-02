'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { Subjects, StudyMaterials } from '@/types'
import { BookText, ChevronDown, Eye, FileUp, Loader2, RefreshCw, Sparkles, Wand2 } from 'lucide-react'
import { ModalSubjectPicker } from '@/components/shared/ModalSubjectPicker'
import {
  CreateStudyMaterial,
  DeleteStudyMaterial,
  getStudyMaterialFileType,
  GetStudyMaterialsAgentBySubject,
  GetStudyMaterialsBySubject,
  wrapAgentHtmlForIframe,
} from '@/lib/study_material'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const MAX_FILES = 5
const STUDY_MATERIALS_BUCKET = 'study_materials_images'

const ALLOWED_EXTENSIONS = new Set([
  'pdf',
  'png',
  'jpg',
  'jpeg',
])

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
])

const inputClass =
  'w-full rounded-lg border border-border bg-primary-foreground px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50'

type EstudoInteligenteProps = {
  subjectsData?: Subjects[] | null
}

function getFileExtension(name: string): string {
  return name.split('.').pop()?.toLowerCase() ?? ''
}

function isAllowedStudyFile(file: File): boolean {
  const ext = getFileExtension(file.name)
  if (ALLOWED_EXTENSIONS.has(ext)) return true
  return ALLOWED_MIME_TYPES.has(file.type)
}

function getFileNameFromUrl(url: string): string {
  try {
    const segment = decodeURIComponent(new URL(url).pathname.split('/').pop() ?? '')
    const dashIdx = segment.indexOf('-')
    if (dashIdx > 0 && /^\d+$/.test(segment.slice(0, dashIdx))) {
      return segment.slice(dashIdx + 1)
    }
    return segment || 'Arquivo'
  } catch {
    return 'Arquivo'
  }
}

export default function EstudoInteligente({
  subjectsData = [],
}: EstudoInteligenteProps) {
  const filesInputRef = useRef<HTMLInputElement>(null)
  const [selectedSmartSubject, setSelectedSmartSubject] =
    useState<Subjects | null>(null)
  const [selectedRootSubjectName, setSelectedRootSubjectName] = useState<
    string | null
  >(null)
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false)
  const [materials, setMaterials] = useState<StudyMaterials[]>([])
  const [removedMaterialIds, setRemovedMaterialIds] = useState<Set<string>>(
    () => new Set(),
  )
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false)
  const [isSavingMaterial, setIsSavingMaterial] = useState(false)
  const [isGeneratingContent, setIsGeneratingContent] = useState(false)
  const [agentHtml, setAgentHtml] = useState<string | null>(null)
  const [isLoadingAgentContent, setIsLoadingAgentContent] = useState(false)

  const savedMaterialCount = materials.length

  const keptExistingMaterials = useMemo(
    () => materials.filter((material) => !removedMaterialIds.has(material.id)),
    [materials, removedMaterialIds],
  )

  const totalFileCount = keptExistingMaterials.length + pendingFiles.length
  const canAddMoreFiles = totalFileCount < MAX_FILES
  const hasPendingChanges =
    pendingFiles.length > 0 || removedMaterialIds.size > 0

  const canGenerateContent =
    savedMaterialCount > 0 &&
    !hasPendingChanges &&
    !isLoadingMaterials &&
    !agentHtml?.trim()

  const hasAgentContent = Boolean(agentHtml?.trim())

  const agentPreviewSrcDoc = useMemo(
    () => (agentHtml ? wrapAgentHtmlForIframe(agentHtml) : ''),
    [agentHtml],
  )

  function resetStaging() {
    setPendingFiles([])
    setRemovedMaterialIds(new Set())
    if (filesInputRef.current) filesInputRef.current.value = ''
  }

  useEffect(() => {
    resetStaging()
    setAgentHtml(null)
  }, [selectedSmartSubject?.id])

  async function loadAgentContent(subjectId: string) {
    setIsLoadingAgentContent(true)

    const agentRes = await GetStudyMaterialsAgentBySubject(subjectId)

    if (agentRes.error) {
      setAgentHtml(null)
      toast.error(agentRes.error.message)
    } else {
      setAgentHtml(agentRes.data?.html?.trim() ? agentRes.data.html : null)
    }

    setIsLoadingAgentContent(false)
  }

  useEffect(() => {
    const subjectId = selectedSmartSubject?.id
    const supabase = createClient()
    if (!subjectId) {
      setMaterials([])
      setAgentHtml(null)
      return
    }

    async function loadSubjectData() {
      setIsLoadingMaterials(true)

      const materialsRes = await GetStudyMaterialsBySubject(String(subjectId))

      if (materialsRes.error) {
        setMaterials([])
      } else {
        setMaterials(materialsRes.data)
      }

      setIsLoadingMaterials(false)
    }

    void loadSubjectData()
    void loadAgentContent(String(subjectId))

    const channel = supabase
      .channel(`study_materials_${subjectId}`)
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
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedSmartSubject?.id])

  function handleFilesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files
    if (!files?.length) return

    const remainingSlots = MAX_FILES - totalFileCount
    if (remainingSlots <= 0) {
      toast.error(`Você pode enviar no máximo ${MAX_FILES} arquivos.`)
      return
    }

    const incoming = Array.from(files)
    const valid: File[] = []
    const invalid: string[] = []

    for (const file of incoming) {
      if (valid.length >= remainingSlots) break
      if (isAllowedStudyFile(file)) {
        valid.push(file)
      } else {
        invalid.push(file.name)
      }
    }

    if (invalid.length > 0) {
      toast.error(
        `Tipo não permitido: ${invalid.join(', ')}. Use apenas PNG, PDF, JPG ou JPEG.`,
      )
    }

    if (valid.length > 0) {
      setPendingFiles((prev) => [...prev, ...valid])
    }
  }

  function removePendingFile(index: number) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index))
  }

  function markMaterialForRemoval(materialId: string) {
    setRemovedMaterialIds((prev) => new Set(prev).add(materialId))
  }

  async function handleSaveMaterials() {
    if (!selectedSmartSubject) {
      toast.error('Selecione uma matéria relacionada.')
      return
    }
    if (!hasPendingChanges) {
      toast.error('Nenhuma alteração para salvar.')
      return
    }

    setIsSavingMaterial(true)
    const supabase = createClient()

    try {
      const materialsToRemove = materials.filter((material) =>
        removedMaterialIds.has(material.id),
      )

      for (const material of materialsToRemove) {
        const { error } = await DeleteStudyMaterial(
          material.id,
          material.file_url,
        )
        if (error) {
          toast.error(error.message)
          return
        }
      }

      for (const file of pendingFiles) {
        const storagePath = `materials/${selectedSmartSubject.id}/${Date.now()}-${file.name}`

        const { error: uploadError } = await supabase.storage
          .from(STUDY_MATERIALS_BUCKET)
          .upload(storagePath, file)

        if (uploadError) {
          toast.error(uploadError.message)
          return
        }

        const {
          data: { publicUrl },
        } = supabase.storage
          .from(STUDY_MATERIALS_BUCKET)
          .getPublicUrl(storagePath)

        const { error: createError } = await CreateStudyMaterial(
          String(selectedSmartSubject.id),
          publicUrl,
          getStudyMaterialFileType(file),
        )

        if (createError) {
          toast.error(createError.message)
          return
        }
      }

      resetStaging()

      const materialsRes = await GetStudyMaterialsBySubject(
        String(selectedSmartSubject.id),
      )
      if (!materialsRes.error) setMaterials(materialsRes.data)

      toast.success('Materiais salvos com sucesso!')
    } finally {
      setIsSavingMaterial(false)
    }
  }

  async function handleGenerateContent() {
    if (!selectedSmartSubject) {
      toast.error('Selecione uma matéria relacionada.')
      return
    }
    if (hasPendingChanges) {
      toast.error('Salve os arquivos antes de gerar o conteúdo.')
      return
    }
    if (savedMaterialCount === 0) {
      toast.error('Envie pelo menos um arquivo de estudo antes de gerar o conteúdo.')
      return
    }

    setIsGeneratingContent(true)

    try {
      const response = await fetch(
        'https://n8n-qao4.srv1444382.hstgr.cloud/webhook/49b6eb10-d312-44ac-aedd-a56ee5da4b58',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subjectId: selectedSmartSubject.id,
          }),
        },
      )

      if (!response.ok) {
        toast.error('Erro ao criar o material de estudo, tente novamente.')
        return
      }

      toast.success(
        'O agente começou a gerar o material. Use "Atualizar visualização" quando o processo terminar.',
      )
    } catch {
      toast.error('Erro ao criar o material de estudo, tente novamente.')
    } finally {
      setIsGeneratingContent(false)
    }
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
              Selecione uma matéria para enviar materiais de estudo.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Matéria
            </span>
            <button
              type="button"
              onClick={() => setIsSubjectModalOpen(true)}
              className={`${inputClass} flex items-center justify-between text-left`}
            >
              <span
                className={
                  selectedSmartSubject ? 'text-foreground' : 'text-muted-foreground'
                }
              >
                {selectedSmartSubject
                  ? selectedRootSubjectName
                    ? `${selectedRootSubjectName} · ${selectedSmartSubject.name}`
                    : selectedSmartSubject.name
                  : 'Selecionar matéria'}
              </span>
              <ChevronDown
                className="h-4 w-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
            </button>
          </div>
        </div>

        {selectedSmartSubject ? (
          <div className="flex flex-col gap-5">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Matéria selecionada:{' '}
              {selectedRootSubjectName
                ? `${selectedRootSubjectName} · ${selectedSmartSubject.name}`
                : selectedSmartSubject.name}
            </p>

            <article
              className={cn(
                'flex flex-col gap-3 rounded-xl border p-4',
                totalFileCount === 0
                  ? 'border-primary/40 bg-primary/5'
                  : 'border-border bg-card',
              )}
            >
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted">
                <BookText className="h-4 w-4 text-foreground" aria-hidden />
              </div>
              <h3 className="text-base font-bold text-foreground">
                Material de Estudo
              </h3>
              <p className="text-sm text-muted-foreground">
                {totalFileCount === 0
                  ? 'Nenhum arquivo cadastrado. Envie PDF, DOCX, PowerPoint ou imagens abaixo.'
                  : 'Gerencie os arquivos de estudo da matéria selecionada.'}
              </p>

              <div className="mt-1 flex flex-col gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Você pode anexar até {MAX_FILES} arquivos ({totalFileCount}{' '}
                    no total)
                  </p>
                </div>

                <input
                  ref={filesInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="sr-only"
                  onChange={(e) => {
                    handleFilesChange(e)
                    e.target.value = ''
                  }}
                />

                <button
                  type="button"
                  onClick={() => filesInputRef.current?.click()}
                  disabled={!canAddMoreFiles || isSavingMaterial || isLoadingMaterials}
                  className={cn(
                    'flex min-h-[140px] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background px-4 py-6 text-center transition-colors hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-50',
                    pendingFiles.length > 0 && 'border-primary/50 bg-primary/5',
                  )}
                >
                  <FileUp className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-semibold text-foreground">
                    Selecionar arquivos
                  </span>
                  <span className="max-w-md text-xs text-muted-foreground">
                    PNG, PDF, JPG e JPEG — até {MAX_FILES} arquivos
                  </span>
                </button>

                {keptExistingMaterials.length > 0 || pendingFiles.length > 0 ? (
                  <ul className="flex flex-col gap-2">
                    {keptExistingMaterials.map((material) => (
                      <li
                        key={material.id}
                        className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2"
                      >
                        <a
                          href={material.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex min-w-0 items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <FileUp className="h-4 w-4 shrink-0" aria-hidden />
                          <span className="truncate">
                            {getFileNameFromUrl(material.file_url)}
                          </span>
                        </a>
                        <button
                          type="button"
                          onClick={() => markMaterialForRemoval(material.id)}
                          disabled={isSavingMaterial}
                          className="shrink-0 text-xs font-semibold text-destructive hover:underline disabled:opacity-50"
                        >
                          Remover
                        </button>
                      </li>
                    ))}
                    {pendingFiles.map((file, index) => (
                      <li
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between gap-2 rounded-lg border border-dashed border-accent/30 bg-accent/5 px-3 py-2"
                      >
                        <span className="flex min-w-0 items-center gap-2 text-sm text-foreground">
                          <FileUp className="h-4 w-4 shrink-0 text-accent" aria-hidden />
                          <span className="truncate">{file.name}</span>
                          <span className="shrink-0 text-[10px] font-semibold uppercase text-accent">
                            Novo
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => removePendingFile(index)}
                          disabled={isSavingMaterial}
                          className="shrink-0 text-xs font-semibold text-destructive hover:underline disabled:opacity-50"
                        >
                          Remover
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}

                <button
                  type="button"
                  disabled={
                    !hasPendingChanges || isSavingMaterial || isLoadingMaterials
                  }
                  onClick={() => void handleSaveMaterials()}
                  className="inline-flex items-center justify-center rounded-full border border-primary bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSavingMaterial ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </article>

            {isLoadingAgentContent ? (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-10">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden />
                <span className="text-sm text-muted-foreground">
                  Carregando conteúdo gerado...
                </span>
              </div>
            ) : hasAgentContent && agentHtml ? (
              <article className="flex flex-col gap-4 rounded-xl border border-chart-2/35 bg-card p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-chart-2/40 bg-chart-2/15">
                      <Eye className="h-5 w-5 text-chart-2" aria-hidden />
                    </span>
                    <div>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-chart-2/35 bg-chart-2/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-chart-2">
                        Conteúdo publicado
                      </span>
                      <h3 className="mt-2 text-base font-bold text-foreground">
                        Pré-visualização do material
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Assim o conteúdo será exibido para os alunos na página de
                        estudo.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      void loadAgentContent(String(selectedSmartSubject.id))
                    }
                    disabled={isLoadingAgentContent}
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:border-primary/40 disabled:opacity-50"
                  >
                    <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                    Atualizar visualização
                  </button>
                </div>

                <div className="overflow-hidden rounded-xl border border-border bg-muted/20">
                  <iframe
                    title="Pré-visualização do material de estudo"
                    srcDoc={agentPreviewSrcDoc}
                    className="block w-full border-0 bg-transparent"
                    style={{ height: 'min(70vh, 640px)' }}
                    sandbox="allow-popups allow-scripts"
                  />
                </div>
              </article>
            ) : (
            <article
              className="relative overflow-hidden rounded-2xl border border-chart-5/35 p-5 sm:p-6"
              style={{
                background:
                  'linear-gradient(135deg, rgba(168,85,247,0.14) 0%, rgba(61,127,255,0.08) 45%, hsl(var(--card)) 100%)',
              }}
            >
              <div
                className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-chart-5/25 blur-3xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -bottom-14 -left-10 h-32 w-32 rounded-full bg-accent/20 blur-3xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-chart-5/10 blur-2xl"
                aria-hidden
              />

              <div className="relative flex flex-col gap-4">
                <div className="flex items-start gap-3 sm:items-center">
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-chart-5/40 bg-chart-5/15"
                    style={{ boxShadow: '0 6px 24px rgba(168,85,247,0.35)' }}
                  >
                    <Wand2 className="h-5 w-5 text-chart-5" aria-hidden />
                  </span>

                  <div className="min-w-0 flex-1">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-chart-5/35 bg-chart-5/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-chart-5">
                      <Sparkles className="h-3 w-3 shrink-0" aria-hidden />
                      IA · Agente Inteligente
                    </span>
                    <h3 className="mt-2 font-heading text-base font-black text-foreground sm:text-lg">
                      Gerar conteúdo de estudo
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      A IA lê todos os arquivos enviados e transforma o material em
                      uma apresentação HTML interativa para os alunos na página de
                      estudo.
                    </p>
                  </div>
                </div>

                <ul className="flex flex-col gap-2 rounded-xl border border-chart-5/20 bg-background/60 px-4 py-3 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 shrink-0 text-chart-5" aria-hidden />
                    {savedMaterialCount}{' '}
                    {savedMaterialCount === 1
                      ? 'arquivo será analisado'
                      : 'arquivos serão analisados'}
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 shrink-0 text-chart-5" aria-hidden />
                    PDF, DOCX, PowerPoint e imagens são interpretados automaticamente
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 shrink-0 text-chart-5" aria-hidden />
                    O resultado aparece como aula teórica na jornada de estudo
                  </li>
                </ul>

                {hasPendingChanges ? (
                  <p className="rounded-lg border border-chart-4/30 bg-chart-4/10 px-3 py-2 text-xs font-medium text-chart-4">
                    Salve os arquivos pendentes antes de gerar o conteúdo com IA.
                  </p>
                ) : null}

                <button
                  type="button"
                  disabled={
                    !canGenerateContent || isGeneratingContent || isSavingMaterial
                  }
                  onClick={() => void handleGenerateContent()}
                  className={cn(
                    'relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-chart-5/50 px-4 py-3.5 text-sm font-bold text-white transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50',
                  )}
                  style={{
                    background:
                      'linear-gradient(90deg, hsl(var(--chart-5)), #9333ea, hsl(var(--accent)))',
                    boxShadow: '0 8px 28px rgba(168,85,247,0.4)',
                  }}
                >
                  {isGeneratingContent ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      A IA está lendo os documentos...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" aria-hidden />
                      Gerar conteúdo com IA
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void loadAgentContent(String(selectedSmartSubject.id))
                  }
                  disabled={isLoadingAgentContent || isGeneratingContent}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-background/80 px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-chart-5/40 hover:text-foreground disabled:opacity-50"
                >
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                  Atualizar visualização
                </button>
              </div>
            </article>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card px-5 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              Selecione uma matéria para enviar os materiais de estudo.
            </p>
          </div>
        )}

        <ModalSubjectPicker
          open={isSubjectModalOpen}
          onClose={() => setIsSubjectModalOpen(false)}
          subjectsData={subjectsData}
          selectedSubjectId={selectedSmartSubject?.id}
          onSelect={({ relatedSubject, rootSubjectName }) => {
            setSelectedSmartSubject(relatedSubject)
            setSelectedRootSubjectName(rootSubjectName)
            setIsSubjectModalOpen(false)
          }}
        />
      </section>
    </div>
  )
}
