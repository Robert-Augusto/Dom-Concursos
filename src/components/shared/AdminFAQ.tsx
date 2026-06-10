'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  CircleHelp,
  MessageCircleQuestion,
  MoreVertical,
  Pencil,
  Trash2,
  TriangleAlert,
  X,
  type LucideIcon,
} from 'lucide-react'
import { CreateFaq, DeleteFaq, GetFaqs, UpdateFaq } from '@/lib/lib-faqs'
import type { Faq } from '@/types'
import { toast } from 'sonner'

const fieldLabelClass =
  'text-[11px] font-bold uppercase tracking-wider text-muted-foreground'

const inputClass =
  'w-full rounded-lg border border-border bg-primary-foreground px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50'

const textareaClass = `${inputClass} min-h-[120px] resize-y`

type FaqKebabMenuItem = {
  label: string
  icon: LucideIcon
  onClick: () => void
  variant?: 'default' | 'destructive'
  disabled?: boolean
}

type FaqKebabMenuProps = {
  items: FaqKebabMenuItem[]
  disabled?: boolean
  ariaLabel?: string
}

function FaqKebabMenu({
  items,
  disabled = false,
  ariaLabel = 'Abrir menu',
}: FaqKebabMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={disabled}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-accent/40 hover:bg-muted/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-1 min-w-[9.5rem] overflow-hidden rounded-xl border border-border bg-popover py-1 shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
        >
          {items.map((item) => {
            const Icon = item.icon

            return (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  if (item.disabled) return
                  setIsOpen(false)
                  item.onClick()
                }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold transition-colors hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-50 ${
                  item.variant === 'destructive'
                    ? 'text-destructive'
                    : 'text-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

export default function AdminFAQ() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Faq | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    async function fetchFaqs() {
      const { data, error } = await GetFaqs()
      if (error) {
        toast.error('Erro ao carregar as FAQs.')
        return
      }
      if (data) setFaqs(data)
      setIsLoading(false)
    }

    void fetchFaqs()
  }, [])

  function resetForm() {
    setEditingFaqId(null)
    setQuestion('')
    setAnswer('')
  }

  function startEditFaq(faq: Faq) {
    resetForm()
    setEditingFaqId(faq.id)
    setQuestion(faq.question ?? '')
    setAnswer(faq.answer ?? '')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    resetForm()
  }

  async function refreshFaqs() {
    const { data, error } = await GetFaqs()
    if (!error && data) setFaqs(data)
  }

  async function handleCreateFaq() {
    const { data, error } = await CreateFaq(question, answer)

    if (error || !data?.id) {
      toast.error(error?.message ?? 'Erro ao adicionar a FAQ.')
      return
    }

    await refreshFaqs()
    resetForm()
    toast.success('FAQ adicionada com sucesso!')
  }

  async function handleUpdateFaq() {
    if (!editingFaqId) return

    const { error } = await UpdateFaq(editingFaqId, question, answer)

    if (error) {
      toast.error(error.message)
      return
    }

    await refreshFaqs()
    resetForm()
    toast.success('FAQ atualizada com sucesso!')
  }

  async function handleDeleteFaq() {
    if (!deleteTarget) return

    setIsDeleting(true)

    try {
      const { error } = await DeleteFaq(deleteTarget.id)

      if (error) {
        toast.error(error.message)
        return
      }

      if (editingFaqId === deleteTarget.id) resetForm()

      setFaqs((prev) => prev.filter((item) => item.id !== deleteTarget.id))
      setDeleteTarget(null)
      toast.success('FAQ excluída com sucesso!')
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (!question.trim() || !answer.trim()) {
      toast.error('Preencha a pergunta e a resposta.')
      return
    }

    setIsSaving(true)

    try {
      if (editingFaqId) {
        await handleUpdateFaq()
      } else {
        await handleCreateFaq()
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="relative flex flex-col gap-8">
      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-4 md:p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                  <TriangleAlert className="h-4 w-4" aria-hidden />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground md:text-lg">
                    Confirmar exclusão
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Esta ação remove a pergunta da lista.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-50"
                aria-label="Fechar modal"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <div className="rounded-xl border border-border bg-background p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                FAQ selecionada
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {deleteTarget.question ?? 'Sem título'}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={isDeleting}
                className="rounded-full border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/20 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => void handleDeleteFaq()}
              >
                {isDeleting ? 'Excluindo...' : 'Confirmar exclusão'}
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {editingFaqId ? (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3">
            <p className="text-sm font-semibold text-foreground">
              Editando FAQ
            </p>
            <button
              type="button"
              onClick={cancelEdit}
              disabled={isSaving}
              className="text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        ) : null}

        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-lg font-black text-foreground">
            {editingFaqId ? 'Atualizar pergunta frequente' : 'Nova pergunta frequente'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {editingFaqId
              ? 'Altere a pergunta ou resposta selecionada.'
              : 'Cadastre perguntas e respostas para a área de FAQ da plataforma.'}
          </p>
        </div>

        <article className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="faq-question" className={fieldLabelClass}>
              Pergunta
            </label>
            <input
              id="faq-question"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ex: Como funciona o plano Plus?"
              className={inputClass}
              disabled={isSaving}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="faq-answer" className={fieldLabelClass}>
              Resposta
            </label>
            <textarea
              id="faq-answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Escreva a resposta completa para o aluno..."
              className={textareaClass}
              disabled={isSaving}
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full rounded-xl border border-primary bg-primary py-3.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving
              ? 'Salvando...'
              : editingFaqId
                ? 'Salvar alterações'
                : 'Adicionar FAQ'}
          </button>
        </article>
      </form>

      <section className="flex flex-col gap-3">
        <h3 className="text-base font-bold text-foreground">
          Perguntas cadastradas
        </h3>

        {isLoading ? (
          <div className="flex items-center justify-center rounded-xl border border-border bg-card px-6 py-14">
            <p className="text-sm text-muted-foreground">Carregando...</p>
          </div>
        ) : faqs.length === 0 ? (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-muted/30">
                <CircleHelp
                  className="h-5 w-5 text-muted-foreground"
                  aria-hidden
                />
              </span>
              <p className="text-sm font-semibold text-foreground">
                Nenhuma FAQ cadastrada
              </p>
              <p className="max-w-sm text-xs text-muted-foreground">
                As perguntas que você adicionar aparecerão aqui.
              </p>
            </div>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {faqs.map((faq) => (
              <li
                key={faq.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/40 bg-primary/10">
                    <MessageCircleQuestion
                      className="h-4 w-4 text-primary"
                      aria-hidden
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-foreground">
                      {faq.question}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                      {faq.answer}
                    </p>
                  </div>
                  <FaqKebabMenu
                    disabled={
                      isSaving || isDeleting || editingFaqId === faq.id
                    }
                    ariaLabel={`Ações da FAQ: ${faq.question ?? 'Sem título'}`}
                    items={[
                      {
                        label: 'Editar',
                        icon: Pencil,
                        disabled:
                          isSaving ||
                          isDeleting ||
                          editingFaqId === faq.id,
                        onClick: () => startEditFaq(faq),
                      },
                      {
                        label: 'Excluir',
                        icon: Trash2,
                        variant: 'destructive',
                        disabled:
                          isSaving ||
                          isDeleting ||
                          editingFaqId === faq.id,
                        onClick: () => setDeleteTarget(faq),
                      },
                    ]}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  )
}
