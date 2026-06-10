'use client'

import { MessageCircle } from 'lucide-react'

const WHATSAPP_URL = 'https://wa.me/5511971509703'
const WHATSAPP_MESSAGE = encodeURIComponent(
  'Olá! Preciso de ajuda com a plataforma DOM Concursos.',
)

export function WhatsAppFloatingButton() {
  return (
    <a
      href={`${WHATSAPP_URL}?text=${WHATSAPP_MESSAGE}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-chart-2 text-white shadow-xl shadow-chart-2/45 ring-4 ring-chart-2/30 transition-transform hover:scale-105 active:scale-95 lg:bottom-8 lg:right-6"
      aria-label="Falar no WhatsApp"
    >
      <span
        className="whatsapp-soft-pulse absolute inset-0 rounded-full bg-chart-2/35"
        aria-hidden
      />
      <MessageCircle className="relative h-7 w-7" aria-hidden />
      <style>{`
        @keyframes whatsapp-soft-pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.45; }
        }
        .whatsapp-soft-pulse {
          animation: whatsapp-soft-pulse 4s ease-in-out infinite;
        }
      `}</style>
    </a>
  )
}
