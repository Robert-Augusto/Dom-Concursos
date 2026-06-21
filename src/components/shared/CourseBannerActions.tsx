'use client'

import { ModalSavedForReviewLessons } from '@/components/shared/ModalSavedForReviewLessons'
import { WhatsAppIcon } from '@/components/shared/WhatsAppIcon'
import type { SavedForReviewCourseLesson } from '@/lib/lib-lessons-server'
import { Bookmark } from 'lucide-react'
import { useState } from 'react'

type CourseBannerActionsProps = {
  savedLessons: SavedForReviewCourseLesson[]
  whatsappGroupUrl: string | null
}

export function CourseBannerActions({
  savedLessons,
  whatsappGroupUrl,
}: CourseBannerActionsProps) {
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const whatsappUrl = whatsappGroupUrl?.trim() ?? ''

  return (
    <>
      <div className="flex flex-wrap gap-2 px-4 pt-3 lg:px-0">
        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-chart-2 px-4 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <WhatsAppIcon className="h-4 w-4 shrink-0" />
            Entrar no grupo do whatsapp
          </a>
        ) : null}

        <button
          type="button"
          onClick={() => setReviewModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-bold text-foreground transition-colors hover:border-primary/40 hover:bg-muted/30"
        >
          <Bookmark className="h-4 w-4 shrink-0 text-primary" />
          Aulas para revisão
          {savedLessons.length > 0 ? (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-black text-primary-foreground">
              {savedLessons.length}
            </span>
          ) : null}
        </button>
      </div>

      <ModalSavedForReviewLessons
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        lessons={savedLessons}
      />
    </>
  )
}
