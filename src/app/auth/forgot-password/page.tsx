'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail } from 'lucide-react'
import { SendPasswordEmail } from '@/lib/lib-auth'
import { toast } from 'sonner'

function isValidEmail(value: string) {
  return /\S+@\S+\.\S+/.test(value)
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  async function handleResetPassword() {
    if (!email) {
      setError('Informe seu e-mail para continuar.')
      setIsSubmitted(false)
      return
    }

    if (!isValidEmail(email)) {
      setError('Digite um e-mail valido.')
      setIsSubmitted(false)
      return
    }

    setError('')
    setIsSubmitted(true)
    
    const {error} = await SendPasswordEmail(email)
    
    if(error){
      toast.error("Erro ao enviar email de recuperação!")
      setIsSubmitted(false)
      return
    }

    toast.success("Email enviado com sucesso, verifique sua caixa de mensagens.")
    setIsSubmitted(false)
  }

  return (
    <>
      <div className="text-center mb-4">
        <h1 className="font-heading text-lg font-black text-foreground">Recuperar senha</h1>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          Informe seu e-mail para receber<br />
          o link de redefinicao de senha
        </p>
      </div>

      <div className={`flex flex-col gap-2.5 w-full max-w-sm mx-auto`}>
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
            className="w-full bg-primary-foreground border border-border rounded-xl py-3.5 pl-10 pr-4 text-foreground text-sm placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/50"
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
          disabled={isSubmitted}
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

      <div className="relative z-10 flex flex-col items-center gap-2 px-7 pb-8 pt-4">
        <p className="text-xs text-muted-foreground text-center">
          Ainda nao tem conta?{' '}
          <Link href="/auth/signup" className="text-primary font-bold hover:underline">
            Cadastre-se gratis
          </Link>
        </p>
      </div>
    </>
  )
}
