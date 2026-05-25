'use client'

import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Bookmark, Flag} from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useProfile } from '@/context/ProfileContext'
import { CreateQuestionReview, DeleteQuestionReview } from '@/lib/lib-questions-review'
import { CreateSuport } from '@/lib/lib-suport'

export function QuestionCardActions({
    questionId
}: {
    questionId: string
}) {
    const [isMarked, setIsMarked] = useState<boolean | null>(null)
    const [reviewId, setReviewId] = useState('')
    const { profile, loading: profileLoading } = useProfile()
    const [isReportOpen, setIsReportOpen] = useState<boolean>(false)
    const [reportText, setReportText] = useState('')
    const [isSubmittingReport, setIsSubmittingReport] = useState<boolean>(false)

    useEffect(() => {
        async function checkIfMarked() {
          const supabase = createClient()
          const { data } = await supabase
            .from('subjects_questions_review')
            .select('id')
            .eq('subjects_questions_id', questionId)
            .maybeSingle()
      
        setReviewId(data?.id ?? '')
        setIsMarked(!!data)
        }
      
        void checkIfMarked()
      }, [questionId])

    async function handleMarkQuestion(){
        if (profileLoading) return

        if (!profile?.id) {
            toast.error('Faça login para iniciar o estudo.')
            return
        }

        if (isMarked === false) {
            const {error} = await CreateQuestionReview(questionId, profile.id)

            if (error) {
                toast.error(error.message)
                return
            }
            toast.success("Questão marcada para revisar.")
            setIsMarked(true)

        } else if(isMarked === true) {
            const {error} = await DeleteQuestionReview(Number(reviewId))

            if (error) {
                toast.error(error.message)
                return
            }

            toast.info('Questão desmarcada para revisar.')
            setIsMarked(false)
            setReviewId('')
        }   
    }

    async function handleSubmitReport(){
        if (profileLoading) return

        if (!profile?.id) {
            toast.error('Faça login para iniciar o estudo.')
            return
        }
        if(!reportText) return

        const {error} = await CreateSuport(profile.id, 'Denuncia de Questão', reportText, 'open', 'question_report')
        if (error) {
            toast.error(error.message)
            return
        }
        toast.success("Denuncia enviada com sucesso.")
        setReportText('')
        setIsReportOpen(false)
    }
    return (
      <div className="mt-4 -mx-5 -mb-5 overflow-hidden rounded-b-2xl border-t border-amber-500/20 bg-[#0A0A0A]/60">
        <div className="flex items-stretch">
          <button
            type="button"
            onClick={handleMarkQuestion}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 px-4 py-3.5 text-xs font-semibold transition-colors hover:bg-amber-500/5',
              isMarked ? 'text-amber-400' : 'text-amber-500',
            )}
          >
            <Bookmark
              className={cn('h-4 w-4 shrink-0', isMarked && 'fill-current')}
              aria-hidden
            />
            {isMarked ? 'Marcada para revisar' : 'Marcar para revisar'}
          </button>
  
          <div className="my-3 w-px shrink-0 bg-amber-500/25" aria-hidden />
  
          <button
            type="button"
            onClick={() => setIsReportOpen(!isReportOpen)}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 px-4 py-3.5 text-xs font-semibold transition-colors hover:bg-amber-500/5',
              isReportOpen ? 'text-amber-400' : 'text-amber-500',
            )}
          >
            <Flag className="h-4 w-4 shrink-0" aria-hidden />
            Denunciar questão
          </button>
        </div>
  
        {isReportOpen ? (
          <div className="space-y-3 border-t border-amber-500/15 px-4 py-4">
            <label htmlFor={`report-reason-${questionId}`} className="sr-only">
              Motivo da denúncia
            </label>
            <textarea
              id={`report-reason-${questionId}`}
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Descreva o problema com esta questão..."
              rows={3}
              className="w-full resize-none rounded-xl border border-amber-500/30 bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-amber-500/60"
            />
            <button
              type="button"
              disabled={isSubmittingReport || !reportText.trim()}
              onClick={handleSubmitReport}
              className={cn(
                'w-full rounded-xl border py-2.5 text-sm font-bold transition-all',
                reportText.trim() && !isSubmittingReport
                  ? 'border-amber-500 bg-amber-500 text-black hover:brightness-110'
                  : 'cursor-not-allowed border-border bg-muted text-muted-foreground',
              )}
            >
              {isSubmittingReport ? 'Enviando...' : 'Enviar denúncia'}
            </button>
          </div>
        ) : null}
      </div>
    )
  }
  