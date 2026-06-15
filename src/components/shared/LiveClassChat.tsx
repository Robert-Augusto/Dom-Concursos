'use client'

import Image from 'next/image'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react'
import { Loader2, MessageCircle, Send, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { useProfile } from '@/context/ProfileContext'
import {
  CreateLiveClassChatMessage,
  DeleteLiveClassChatMessage,
  GetLiveClassChatMessages,
} from '@/lib/lib-live-classes-chat'
import { createClient } from '@/lib/supabase/client'
import type { LiveClassChatMessage } from '@/types'

type LiveClassChatProps = {
  liveClassId: string
}

type ChatMessageItemProps = {
  message: LiveClassChatMessage
  isOwnMessage: boolean
  isDeleting: boolean
  onDelete: (messageId: string) => void
}

function ChatMessageItem({
  message,
  isOwnMessage,
  isDeleting,
  onDelete,
}: ChatMessageItemProps) {
  return (
    <div className="group flex gap-2.5">
      <div
        className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-black text-white"
        style={
          message.authorAvatarUrl
            ? undefined
            : { background: message.authorColor }
        }
      >
        {message.authorAvatarUrl ? (
          <Image
            src={message.authorAvatarUrl}
            alt={message.authorName ? `Foto de ${message.authorName}` : ''}
            fill
            className="object-cover"
            sizes="32px"
          />
        ) : (
          message.authorInitial
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-xs font-bold text-foreground">
              {message.authorName}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {message.timeLabel}
            </span>
          </div>

          {isOwnMessage ? (
            <button
              type="button"
              onClick={() => onDelete(message.id)}
              disabled={isDeleting}
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-transparent text-muted-foreground opacity-100 transition-all hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Excluir mensagem"
            >
              {isDeleting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              ) : (
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
              )}
            </button>
          ) : null}
        </div>

        <p className="mt-0.5 break-words text-sm leading-relaxed text-foreground/90">
          {message.message}
        </p>
      </div>
    </div>
  )
}

export default function LiveClassChat({ liveClassId }: LiveClassChatProps) {
  const { profile } = useProfile()
  const [messages, setMessages] = useState<LiveClassChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null)

  const listRef = useRef<HTMLDivElement>(null)

  const participantCount = useMemo(() => {
    return new Set(messages.map((message) => message.profileId).filter(Boolean))
      .size
  }, [messages])

  const loadMessages = useCallback(
    async (silent = false) => {
      const pageScrollY = silent ? window.scrollY : null
      const listScrollTop = silent ? listRef.current?.scrollTop ?? null : null

      if (!silent) setIsLoading(true)

      const { data, error } = await GetLiveClassChatMessages(liveClassId)

      if (error) {
        if (!silent) {
          toast.error(error.message)
        }
        setMessages([])
      } else {
        setMessages(data)
      }

      if (!silent) setIsLoading(false)

      if (silent) {
        requestAnimationFrame(() => {
          if (pageScrollY !== null) {
            window.scrollTo({ top: pageScrollY, left: 0 })
          }
          if (listScrollTop !== null && listRef.current) {
            listRef.current.scrollTop = listScrollTop
          }
        })
      }
    },
    [liveClassId],
  )

  useEffect(() => {
    let cancelled = false

    void loadMessages()

    const supabase = createClient()
    const channel = supabase
      .channel(`live_classes_chat:${liveClassId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_classes_chat',
          filter: `live_classes_id=eq.${Number(liveClassId)}`,
        },
        () => {
          if (!cancelled) {
            void loadMessages(true)
          }
        },
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' && !cancelled) {
          void loadMessages(true)
        }
      })

    return () => {
      cancelled = true
      void supabase.removeChannel(channel)
    }
  }, [liveClassId, loadMessages])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (!profile?.id || !draft.trim() || isSending) return

    setIsSending(true)

    try {
      const { data, error } = await CreateLiveClassChatMessage(
        liveClassId,
        profile.id,
        draft,
      )

      if (error) {
        toast.error(error.message)
        return
      }

      setDraft('')

      if (data) {
        const pageScrollY = window.scrollY
        const listScrollTop = listRef.current?.scrollTop ?? 0

        setMessages((prev) => {
          if (prev.some((item) => item.id === data.id)) return prev
          return [...prev, data]
        })

        requestAnimationFrame(() => {
          window.scrollTo({ top: pageScrollY, left: 0 })
          if (listRef.current) {
            listRef.current.scrollTop = listScrollTop
          }
        })
      }
    } finally {
      setIsSending(false)
    }
  }

  async function handleDeleteMessage(messageId: string) {
    if (!profile?.id || deletingMessageId) return

    setDeletingMessageId(messageId)

    try {
      const { error } = await DeleteLiveClassChatMessage(messageId, profile.id)

      if (error) {
        toast.error(error.message)
        return
      }

      setMessages((prev) => prev.filter((item) => item.id !== messageId))
      toast.success('Mensagem excluída.')

      const pageScrollY = window.scrollY
      requestAnimationFrame(() => {
        window.scrollTo({ top: pageScrollY, left: 0 })
      })
    } finally {
      setDeletingMessageId(null)
    }
  }

  return (
    <aside className="flex h-[min(380px,50dvh)] flex-col overflow-hidden rounded-2xl border border-border bg-card lg:h-[min(560px,calc((min(100vw-320px,920px))*9/16))]">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted/40">
            <MessageCircle className="h-4 w-4 text-primary" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-bold text-foreground">Chat ao vivo</p>
            <p className="text-[11px] text-muted-foreground">
              Converse com a turma
            </p>
          </div>
        </div>
      </div>

      <div
        ref={listRef}
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-y-contain px-4 py-4 [overflow-anchor:none]"
      >
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center py-8">
            <Loader2
              className="h-5 w-5 animate-spin text-muted-foreground"
              aria-hidden
            />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
            <p className="text-sm font-semibold text-foreground">
              Nenhuma mensagem ainda
            </p>
            <p className="max-w-[220px] text-xs text-muted-foreground">
              Seja o primeiro a participar do chat desta transmissão.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessageItem
              key={message.id}
              message={message}
              isOwnMessage={message.profileId === profile?.id}
              isDeleting={deletingMessageId === message.id}
              onDelete={handleDeleteMessage}
            />
          ))
        )}
      </div>

      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="border-t border-border p-3"
      >
        <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            disabled={!profile?.id || isSending}
            placeholder={
              profile?.id
                ? 'Envie uma mensagem...'
                : 'Faça login para participar do chat'
            }
            maxLength={500}
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Mensagem do chat ao vivo"
          />
          <button
            type="submit"
            disabled={!profile?.id || !draft.trim() || isSending}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Enviar mensagem"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Send className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>
      </form>
    </aside>
  )
}
