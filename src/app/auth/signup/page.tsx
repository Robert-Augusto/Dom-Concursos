'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  User,
} from 'lucide-react'
import { Signup } from '@/lib/lib-auth'

function formatWhatsapp(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  const area = digits.slice(0, 2)
  const ninth = digits.slice(2, 3)
  const first = digits.slice(3, 7)
  const second = digits.slice(7, 11)

  let formatted = ''

  if (area) {
    formatted += `(${area}`
    if (area.length === 2) {
      formatted += ')'
    }
  }

  if (ninth) {
    formatted += ` ${ninth}`
  }

  if (first) {
    formatted += ` ${first}`
  }

  if (second) {
    formatted += `-${second}`
  }

  return formatted
}

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const inputLenght = 100

  async function handleSignup(event: React.FormEvent) {
    event.preventDefault()

    if (!name || !email || !whatsapp || !password) {
      setError('Preencha todos os campos para continuar.')
      return
    }

    if(password.length < 8){
      setError('A senha deve conter no mínimo 8 caracteres.')
      return
    }

    setError('')

    const {error} = await Signup(name, password, email, whatsapp)
    if (error) {
      setError(error.message)
      return
    }

    router.refresh()
    router.push('/dashboard')
  }

  function handleWhatsappChange(value: string) {
    setWhatsapp(formatWhatsapp(value))
  }

  return (
    <>
      {/* Welcome */}
      <div className="text-center mb-4">
        <h1 className="font-heading text-lg font-black text-foreground">
          Crie sua conta
        </h1>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          Cadastre-se para começar sua jornada<br />e conquistar sua aprovação
        </p>
      </div>

      {/* Form */}
      <div className={`flex flex-col gap-2.5 w-full max-w-sm mx-auto`}>
        {/* Nome */}
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
            <User className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Seu nome"
            maxLength={inputLenght}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-primary-foreground border border-border rounded-xl py-3.5 pl-10 pr-4 text-foreground text-sm placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/50"
          />
        </div>

        {/* Email */}
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Mail className="h-4 w-4" />
          </div>
          <input
            type="email"
            placeholder="Seu e-mail"
            maxLength={inputLenght}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-primary-foreground border border-border rounded-xl py-3.5 pl-10 pr-4 text-foreground text-sm placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/50"
          />
        </div>

        {/* WhatsApp */}
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Phone className="h-4 w-4" />
          </div>
          <input
            type="tel"
            placeholder="(00) 0 0000-0000"
            value={whatsapp}
            onChange={(e) => handleWhatsappChange(e.target.value)}
            className="w-full bg-primary-foreground border border-border rounded-xl py-3.5 pl-10 pr-4 text-foreground text-sm placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/50"
          />
        </div>

        {/* Senha */}
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Lock className="h-4 w-4" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Sua senha"
            maxLength={inputLenght}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-primary-foreground border border-border rounded-xl py-3.5 pl-10 pr-10 text-foreground text-sm placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/50"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm cursor-pointer"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <p className="text-xs text-destructive px-1">{error}</p>
        )}

        {/* Signup button */}
        <button
          onClick={handleSignup}
          className="w-full py-4 rounded-xl text-sm font-black tracking-wide text-primary-foreground cursor-pointer transition-all active:scale-95"
          style={{
            background:
              'linear-gradient(90deg, color-mix(in oklab, var(--color-primary) 100%, white 0%), color-mix(in oklab, var(--color-primary) 82%, white 18%))',
            boxShadow:
              '0 8px 24px color-mix(in oklab, var(--color-primary) 35%, transparent)',
          }}
        >
          Criar Conta
        </button>

        <div className="relative z-10 flex flex-col items-center gap-2 px-7 pb-8 pt-4">
          <p className="text-sm text-muted-foreground text-center">
            Já tem conta?{' '}
            <Link href="/auth/login" className="text-primary font-bold hover:underline text-sm">
              Clique Aqui
            </Link>
          </p>
        </div>
      </div>
    </> 
  )
}
