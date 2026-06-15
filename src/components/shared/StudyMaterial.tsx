'use client'

import { useEffect, useMemo, useState } from 'react'
import { Headphones, Loader2, Star } from 'lucide-react'
import { StudyAgentContentVariantSwitcher } from '@/components/shared/StudyAgentContentVariantSwitcher'
import { StudyFlowLoading } from '@/components/shared/StudyFlowLoading'
import { useProfile } from '@/context/ProfileContext'
import { GetStudyQuestionsBySubject } from '@/lib/lib-questions'
import { CreateNotification } from '@/lib/lib-notifications'
import {
  CreateStudyNote,
  GetStudyNoteByProfileAndSubject,
  UpdateStudyNote,
} from '@/lib/lib-study-notes'
import {
  getDefaultStudyAgentVariant,
  getStudyAgentHtml,
  GetStudyAudioBySubject,
  GetStudyMaterialsAgentBySubject,
  hasStudyAgentContent,
  wrapAgentHtmlForIframe,
} from '@/lib/study_material'
import { cn } from '@/lib/utils'
import type { Questions, StudyAgentHtmlVariant, StudyMaterialsAgent } from '@/types'
import { toast } from 'sonner'

const textareaClass =
  'w-full resize-none rounded-xl border border-border bg-primary-foreground px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50'

export interface StudyMaterialProps {
  subjectId: string
  studySessionId: string
  onContinue: (questions: Questions[]) => void
  onQuestionsLoadingChange?: (loading: boolean) => void
}

export default function StudyMaterial({
  subjectId,
  studySessionId,
  onContinue,
  onQuestionsLoadingChange,
}: StudyMaterialProps) {
  const { profile } = useProfile()
  const [agentContent, setAgentContent] = useState<StudyMaterialsAgent | null>(
    null,
  )
  const [contentVariant, setContentVariant] =
    useState<StudyAgentHtmlVariant>('full')
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)
  const [noteId, setNoteId] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')
  const [isLoadingNote, setIsLoadingNote] = useState(false)
  const [isSavingNote, setIsSavingNote] = useState(false)
  const [ratingStars, setRatingStars] = useState(0)
  const [ratingHover, setRatingHover] = useState(0)
  const [ratingComment, setRatingComment] = useState('')
  const [isSavingRating, setIsSavingRating] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  const hasFullContent = Boolean(agentContent?.html_full?.trim())
  const hasSummaryContent = Boolean(agentContent?.html_summary?.trim())
  const activeHtml = getStudyAgentHtml(agentContent, contentVariant)

  useEffect(() => {
    let cancelled = false

    async function loadMaterial() {
      if (!subjectId) {
        setAgentContent(null)
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      const { data, error } = await GetStudyMaterialsAgentBySubject(subjectId)

      if (cancelled) return

      if (error) {
        toast.error(error.message)
        setAgentContent(null)
      } else {
        setAgentContent(data)
        const defaultVariant = getDefaultStudyAgentVariant(data)
        if (defaultVariant) setContentVariant(defaultVariant)
      }

      setIsLoading(false)
    }

    void loadMaterial()
    return () => {
      cancelled = true
    }
  }, [subjectId])

  useEffect(() => {
    let cancelled = false

    async function loadAudio() {
      if (!subjectId) {
        setAudioUrl(null)
        return
      }

      const { data, error } = await GetStudyAudioBySubject(subjectId)
      if (cancelled) return

      if (error) {
        setAudioUrl(null)
        return
      }

      setAudioUrl(data?.file_url ?? null)
    }

    void loadAudio()
    return () => {
      cancelled = true
    }
  }, [subjectId])

  useEffect(() => {
    setNoteId(null)
    setNoteText('')
    setRatingStars(0)
    setRatingHover(0)
    setRatingComment('')
  }, [subjectId])

  useEffect(() => {
    if (!subjectId || !profile?.id) return
    const profileId = profile.id

    let cancelled = false

    async function loadNote() {
      setIsLoadingNote(true)

      const { data, error } = await GetStudyNoteByProfileAndSubject(
        profileId,
        subjectId,
      )

      if (cancelled) return

      if (error) {
        toast.error(error.message)
        setNoteId(null)
        setNoteText('')
      } else if (data) {
        setNoteId(data.id)
        setNoteText(data.note ?? '')
      } else {
        setNoteId(null)
        setNoteText('')
      }

      setIsLoadingNote(false)
    }

    void loadNote()
    return () => {
      cancelled = true
    }
  }, [subjectId, profile?.id])

  useEffect(() => {
    if (!activeHtml && contentVariant === 'full' && hasSummaryContent) {
      setContentVariant('summary')
    } else if (!activeHtml && contentVariant === 'summary' && hasFullContent) {
      setContentVariant('full')
    }
  }, [activeHtml, contentVariant, hasFullContent, hasSummaryContent])

  const previewSrcDoc = useMemo(
    () =>
      activeHtml ? wrapAgentHtmlForIframe(activeHtml, { compactMobile: true }) : '',
    [activeHtml],
  )

  const hasContent = hasStudyAgentContent(agentContent)
  const isHtmlView =
    contentVariant === 'full' || contentVariant === 'summary'
  const showHtmlPanel = isHtmlView && Boolean(activeHtml)

  function goToPrimaryContentView() {
    if (hasFullContent) {
      setContentVariant('full')
    } else if (hasSummaryContent) {
      setContentVariant('summary')
    }
  }

  function resetRatingForm() {
    setRatingStars(0)
    setRatingHover(0)
    setRatingComment('')
  }

  async function handleSaveNote() {
    if (!noteText.trim()) {
      toast.error('Escreva uma anotação antes de salvar.')
      return
    }
    if (!profile?.id) {
      toast.error('Faça login para salvar anotações.')
      return
    }

    setIsSavingNote(true)

    try {
      if (noteId) {
        const { error } = await UpdateStudyNote(noteId, noteText)
        if (error) {
          toast.error(error.message)
          return
        }
        toast.success('Anotação atualizada!')
      } else {
        const { data, error } = await CreateStudyNote(
          profile.id,
          subjectId,
          noteText,
        )
        if (error) {
          toast.error(error.message)
          return
        }
        if (data?.id) setNoteId(String(data.id))
        toast.success('Anotação salva!')
      }

      goToPrimaryContentView()
    } finally {
      setIsSavingNote(false)
    }
  }

  async function handleSaveRating() {
    if (ratingStars === 0) {
      toast.error('Selecione uma nota de 1 a 5 estrelas.')
      return
    }
    if (!profile?.id) {
      toast.error('Faça login para enviar a avaliação.')
      return
    }

    const message = [
      `profile_id: ${profile.id}`,
      `subject_id: ${subjectId}`,
      `estrelas: ${ratingStars}`,
      `mensagem: ${ratingComment.trim() || '(sem comentário)'}`,
    ].join('\n')

    setIsSavingRating(true)

    try {
      const { error } = await CreateNotification(
        'NPS QUESTÃO',
        message,
        'study_nps',
        'admin',
      )

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Avaliação enviada! Obrigado pelo feedback.')
      resetRatingForm()
      goToPrimaryContentView()
    } finally {
      setIsSavingRating(false)
    }
  }

  const displayedRating = ratingHover || ratingStars

  async function handleContinue() {
    setIsLoadingQuestions(true)
    onQuestionsLoadingChange?.(true)

    try {
      const { data, error } = await GetStudyQuestionsBySubject(subjectId)

      if (error) {
        toast.error(error.message)
        return
      }

      if (data.length === 0) {
        toast.error('Nenhuma questão cadastrada para este assunto.')
        return
      }

      onContinue(data)
    } finally {
      setIsLoadingQuestions(false)
      onQuestionsLoadingChange?.(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-col gap-4">
      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center rounded-2xl border border-border bg-card">
          <StudyFlowLoading label="Carregando material de estudo..." />
        </div>
      ) : hasContent ? (
        <section className="flex flex-col gap-3 overflow-hidden rounded-xl border border-accent/35 bg-card ring-1 ring-accent/15 sm:gap-4 sm:rounded-2xl sm:border-2 sm:p-5">
          <div className="flex flex-col gap-2 px-0.5 sm:px-0 mt-3 mx-3">
            <p className="text-sm font-bold text-foreground">
              Escolha como estudar
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Escolha o modo de estudo: conteúdo completo, resumido, anotações ou
              avaliação.
            </p>
            <StudyAgentContentVariantSwitcher
              value={contentVariant}
              onChange={setContentVariant}
              hasFull={hasFullContent}
              hasSummary={hasSummaryContent}
            />
          </div>

          {showHtmlPanel && audioUrl ? (
            <aside
            className="relative mx-3 overflow-hidden rounded-2xl border border-chart-5/30 bg-card"
            style={{
              background:
                'linear-gradient(135deg, rgba(139,92,246,0.14) 0%, rgba(139,92,246,0.05) 42%, hsl(var(--card)) 100%)',
              boxShadow: '0 4px 24px rgba(139,92,246,0.12)',
            }}
            aria-label="Podcast do conteúdo"
          >
            <div
              className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-chart-5/20 blur-2xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-chart-5"
              aria-hidden
            />

            <div className="relative flex gap-3.5 p-4 pb-3 sm:gap-4 sm:p-5 sm:pb-4">
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-chart-5/35 bg-chart-5/15 sm:h-12 sm:w-12"
                style={{
                  boxShadow: '0 4px 16px rgba(139,92,246,0.25)',
                }}
              >
                <Headphones
                  className="h-5 w-5 text-chart-5 sm:h-6 sm:w-6"
                  strokeWidth={2}
                  aria-hidden
                />
              </span>
              <div className="min-w-0 flex-1">
                <p className="mt-1 font-heading text-sm font-bold leading-snug text-foreground sm:text-base">
                  Ouça o conteúdo em áudio
                </p>
                {<p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Ideal para revisar no trânsito ou enquanto faz outra atividade.
                </p>}
              </div>
            </div>

            <div className="relative px-4 pb-4 sm:px-5 sm:pb-5">
              <div>
                <audio
                  controls
                  preload="metadata"
                  src={audioUrl}
                  className="h-12 w-full max-w-full [&::-webkit-media-controls-panel]:bg-transparent"
                  controlsList="nodownload"
                >
                  Seu navegador não suporta reprodução de áudio.
                </audio>
              </div>
            </div>
            </aside>
          ) : null}

          <div className="-mx-2 overflow-hidden rounded-lg border border-border bg-muted/20 sm:mx-0 sm:rounded-xl">
            {showHtmlPanel ? (
              <iframe
                title="Material de estudo"
                srcDoc={previewSrcDoc}
                className="block w-full border-0 bg-transparent"
                style={{ height: 'min(70vh, 640px)' }}
                sandbox="allow-popups allow-scripts"
              />
            ) : contentVariant === 'notes' ? (
              <div
                className="flex flex-col gap-4 p-4 sm:p-6"
                style={{ minHeight: 'min(40vh, 320px)' }}
              >
                <div>
                  <label
                    htmlFor="study-note"
                    className="text-sm font-bold text-foreground"
                  >
                    Suas anotações
                  </label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Registre o que você aprendeu ou pontos importantes deste
                    material para estudar depois.
                  </p>
                </div>
                <textarea
                  id="study-note"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Escreva sua anotação aqui..."
                  rows={8}
                  disabled={isLoadingNote || isSavingNote}
                  className={cn(textareaClass, 'disabled:cursor-not-allowed disabled:opacity-50')}
                />
                <button
                  type="button"
                  onClick={() => void handleSaveNote()}
                  disabled={isLoadingNote || isSavingNote}
                  className="inline-flex items-center justify-center gap-2 self-start rounded-full border border-chart-2 bg-chart-2 px-5 py-2.5 text-xs font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSavingNote ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      Salvando...
                    </>
                  ) : noteId ? (
                    'Atualizar anotação'
                  ) : (
                    'Salvar anotação'
                  )}
                </button>
              </div>
            ) : contentVariant === 'rating' ? (
              <div
                className="flex flex-col gap-5 p-4 sm:p-6"
                style={{ minHeight: 'min(40vh, 320px)' }}
              >
                <div>
                  <p className="text-sm font-bold text-foreground">
                    Avalie este conteúdo
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Sua opinião ajuda a melhorar os materiais de estudo.
                  </p>
                </div>

                <div
                  className="flex flex-col items-center gap-2 rounded-xl border border-chart-5/30 bg-chart-5/5 px-4 py-5"
                  role="group"
                  aria-label="Nota de 1 a 5 estrelas"
                  onMouseLeave={() => setRatingHover(0)}
                >
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingStars(star)}
                        onMouseEnter={() => setRatingHover(star)}
                        className="rounded-lg p-1 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chart-5/60"
                        aria-label={`${star} ${star === 1 ? 'estrela' : 'estrelas'}`}
                      >
                        <Star
                          className={cn(
                            'h-9 w-9 sm:h-10 sm:w-10',
                            star <= displayedRating
                              ? 'fill-chart-5 text-chart-5'
                              : 'text-muted-foreground/40',
                          )}
                          aria-hidden
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-xs font-semibold text-chart-5">
                    {displayedRating > 0
                      ? `${displayedRating} de 5 estrelas`
                      : 'Toque para avaliar'}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="study-rating-comment"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    Comentário (opcional)
                  </label>
                  <textarea
                    id="study-rating-comment"
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    placeholder="Conte o que achou do material..."
                    rows={5}
                    className={textareaClass}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => void handleSaveRating()}
                  disabled={isSavingRating}
                  className="inline-flex items-center justify-center gap-2 self-start rounded-full border border-chart-5 bg-chart-5 px-5 py-2.5 text-xs font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSavingRating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      Enviando...
                    </>
                  ) : (
                    'Enviar avaliação'
                  )}
                </button>
              </div>
            ) : (
              <div
                className="flex items-center justify-center px-6 py-16 text-center"
                style={{ minHeight: 'min(40vh, 320px)' }}
              >
                <p className="text-sm text-muted-foreground">
                  Conteúdo não disponível nesta versão.
                </p>
              </div>
            )}
          </div>
        </section>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-14 text-center">
          <Loader2 className="h-8 w-8 text-muted-foreground opacity-40" aria-hidden />
          <p className="text-sm font-semibold text-foreground">
            Material ainda não disponível
          </p>
          <p className="max-w-sm text-xs text-muted-foreground">
            Não há conteúdo publicado para este assunto. Peça ao administrador
            para gerar o material no painel de Estudo Inteligente.
          </p>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-background/95 px-3 py-3 backdrop-blur-sm sm:p-4 lg:left-[240px]">
        <div className="mx-auto w-full max-w-3xl">
          <button
            type="button"
            onClick={() => void handleContinue()}
            disabled={!hasContent || isLoading || isLoadingQuestions}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-black text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
            style={
              hasContent && !isLoading && !isLoadingQuestions
                ? {
                    background: 'linear-gradient(90deg, #3D7FFF, #5A9FFF)',
                    boxShadow: '0 6px 20px rgba(61,127,255,0.4)',
                  }
                : undefined
            }
          >
            {isLoadingQuestions ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                Carregando questões...
              </>
            ) : (
              'Responder questões'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
