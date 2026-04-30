'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckSquare, Mail } from 'lucide-react'

function isValidEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value)
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [shake, setShake] = useState(false)

  function handleResetPassword() {
    if (!email) {
      setError('Informe seu e-mail para continuar.')
      setIsSubmitted(false)
      setShake(true)
      setTimeout(() => setShake(false), 400)
      return
    }

    if (!isValidEmail(email)) {
      setError('Digite um e-mail valido.')
      setIsSubmitted(false)
      setShake(true)
      setTimeout(() => setShake(false), 400)
      return
    }

    setError('')
    setIsSubmitted(true)
    // TODO: Integrar recuperacao de senha com Supabase auth.
  }

  return (
    <div className="relative min-h-screen bg-background flex flex-col overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-20 -right-20 w-72 h-72 rounded-full"
          style={{
            background:
              'radial-gradient(circle, color-mix(in oklab, var(--color-primary) 18%, transparent) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full"
          style={{
            background:
              'radial-gradient(circle, color-mix(in oklab, var(--color-accent) 15%, transparent) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            background:
              'repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(255,255,255,0.5) 30px, rgba(255,255,255,0.5) 31px)',
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col flex-1 px-7 pt-4">
        <div className="flex flex-col items-center mb-4 mt-10">
          <div
            className="mb-2 flex h-13 w-13 items-center justify-center rounded-2xl shadow-lg"
            style={{
              background:
                'linear-gradient(135deg, color-mix(in oklab, var(--color-primary) 100%, white 0%), color-mix(in oklab, var(--color-primary) 82%, white 18%))',
              boxShadow:
                '0 8px 24px color-mix(in oklab, var(--color-primary) 40%, transparent)',
            }}
          >
            <CheckSquare className="h-8 w-8 text-primary-foreground" />
          </div>
          <p className="font-heading text-2xl font-black tracking-tight text-foreground">DOM</p>
          <p className="text-xs text-muted-foreground tracking-widest mt-0.5">CONCURSOS</p>
        </div>

        <div className="text-center mb-4">
          <h1 className="font-heading text-lg font-black text-foreground">Recuperar senha</h1>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Informe seu e-mail para receber<br />
            o link de redefinicao de senha
          </p>
        </div>

        <div className={`flex flex-col gap-2.5 w-full max-w-sm mx-auto ${shake ? 'animate-shake' : ''}`}>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Mail className="h-4 w-4" />
            </div>
            <input
              type="email"
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (error) setError('')
                if (isSubmitted) setIsSubmitted(false)
              }}
              className="w-full bg-card border border-border rounded-xl py-3.5 pl-10 pr-4 text-foreground text-sm placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/50"
            />
          </div>

          {error && <p className="text-xs text-destructive px-1">{error}</p>}

          {isSubmitted && (
            <p className="text-xs text-primary px-1">
              Se o e-mail estiver cadastrado, voce recebera um link para redefinir sua senha.
            </p>
          )}

          <button
            onClick={handleResetPassword}
            className="w-full py-4 rounded-xl text-sm font-black tracking-wide text-primary-foreground cursor-pointer transition-all active:scale-95"
            style={{
              background:
                'linear-gradient(90deg, color-mix(in oklab, var(--color-primary) 100%, white 0%), color-mix(in oklab, var(--color-primary) 82%, white 18%))',
              boxShadow:
                '0 8px 24px color-mix(in oklab, var(--color-primary) 35%, transparent)',
            }}
          >
            Enviar link de recuperacao
          </button>

          <Link
            href="/auth/login"
            className="mt-1 inline-flex items-center justify-center gap-1 text-xs text-accent hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar para o login
          </Link>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-2 px-7 pb-8 pt-4">
        <p className="text-xs text-muted-foreground text-center">
          Ainda nao tem conta?{' '}
          <Link href="/auth/signup" className="text-primary font-bold hover:underline">
            Cadastre-se gratis
          </Link>
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0) }
          25% { transform: translateX(-6px) }
          75% { transform: translateX(6px) }
        }
        .animate-shake { animation: shake 0.35s ease }
      `}</style>
    </div>
  )
}
