'use client'

import { useRouter } from 'next/navigation'
import { Lock, X } from 'lucide-react'

type ModalSignupProps = {
  open: boolean
  onClose: () => void
}

export function ModalSignup({ open, onClose }: ModalSignupProps) {
  const router = useRouter()

  function handleSignupRedirect() {
    onClose()
    router.push('/auth/signup')
  }

  function handleLoginRedirect() {
    onClose()
    router.push('auth/login')
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 md:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Lock className="h-5 w-10" aria-hidden />
            </div>
            <div>
              <h3 className="font-heading text-base font-black text-foreground md:text-lg">
                Crie sua conta para continuar
              </h3>
              <p className="text-sm text-muted-foreground">
                Este recurso está disponível para usuários cadastrados. Faça seu
                cadastro grátis e desbloqueie a plataforma.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            aria-label="Fechar modal"
          >
            <X className="h-5 w-10" aria-hidden />
          </button>
        </div>

        <div className="rounded-xl border border-border bg-background p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Acesso necessário
          </p>
          <p className="mt-1 text-sm text-foreground">
            Cadastre-se para acessar todas as funcionalidades do dashboard.
          </p>
        </div>

        <div className="mt-5 flex items-center gap-2">
          <button
            type="button"
            onClick={handleSignupRedirect}
            className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
          >
            Criar conta grátis
          </button>
          
          <button
            type="button"
            onClick={handleLoginRedirect}
            className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
          >
            Já tenho conta
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            Agora não
          </button>
        </div>
      </div>
    </div>
  )
}
