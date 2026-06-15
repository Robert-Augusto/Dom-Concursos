'use client'

import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { GetFaqs } from '@/lib/lib-faqs'
import type { Faq } from '@/types'

export function FaqAccordion() {
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [openItemId, setOpenItemId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchFaqs() {
      const { data } = await GetFaqs()
      if (data?.length) {
        setFaqs(data)
        setOpenItemId(data[0].id)
      }
      setIsLoading(false)
    }

    void fetchFaqs()
  }, [])

  const handleToggle = (itemId: string) => {
    setOpenItemId((current) => (current === itemId ? null : itemId))
  }

  return (
    <section>

      {isLoading ? (
        <div className="rounded-xl border border-border bg-card px-5 py-8 text-center">
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      ) : faqs.length === 0 ? (
        <div className="rounded-xl border border-border bg-card px-5 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhuma pergunta cadastrada ainda.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {faqs.map((item) => {
            const isOpen = openItemId === item.id

            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-xl border border-foreground/25 bg-card transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => handleToggle(item.id)}
                  className="flex w-full cursor-pointer items-center justify-between px-5 py-4 transition-colors hover:bg-muted/30"
                >
                  <span className="text-left text-sm font-semibold text-foreground">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen ? (
                  <div className="px-5 pb-4">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                      {item.answer}
                    </p>
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
