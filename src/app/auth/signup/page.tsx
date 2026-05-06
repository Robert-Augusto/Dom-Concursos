'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  CheckSquare,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Mail,
  Phone,
  User,
  Users,
} from 'lucide-react'
import { Signup } from '@/lib/auth'

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
  const [shake, setShake] = useState(false)

  async function handleSignup(event: React.FormEvent) {
    event.preventDefault()

    if (!name || !email || !whatsapp || !password) {
      setError('Preencha todos os campos para continuar.')
      setShake(true)
      setTimeout(() => setShake(false), 400)
      return
    }

    if(password.length < 8){
      setError('A senha deve conter no mínimo 8 caracteres.')
      setShake(true)
      setTimeout(() => setShake(false), 400)
      return
    }

    setError('')

    const {error} = await Signup(name, password, email, whatsapp)
    if (error) {
      setError(error.message)
      setShake(true)
      setTimeout(() => setShake(false), 400)
      return
    }

    router.push('/dashboard')
  }

  function handleWhatsappChange(value: string) {
    setWhatsapp(formatWhatsapp(value))
  }

  return (
    <div className="relative min-h-screen bg-background flex flex-col overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gold circle — top right */}
        <div
          className="absolute -top-20 -right-20 w-72 h-72 rounded-full"
          style={{
            background:
              'radial-gradient(circle, color-mix(in oklab, var(--color-primary) 18%, transparent) 0%, transparent 70%)',
          }}
        />
        {/* Blue circle — bottom left */}
        <div
          className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full"
          style={{
            background:
              'radial-gradient(circle, color-mix(in oklab, var(--color-accent) 15%, transparent) 0%, transparent 70%)',
          }}
        />
        {/* Subtle lines */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            background:
              'repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(255,255,255,0.5) 30px, rgba(255,255,255,0.5) 31px)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1 px-7 pt-4">
        {/* Logo */}
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
        <div className={`flex flex-col gap-2.5 w-full max-w-sm mx-auto ${shake ? 'animate-shake' : ''}`}>
          {/* Nome */}
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              <User className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-card border border-border rounded-xl py-3.5 pl-10 pr-4 text-foreground text-sm placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/50"
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-card border border-border rounded-xl py-3.5 pl-10 pr-4 text-foreground text-sm placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/50"
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
              className="w-full bg-card border border-border rounded-xl py-3.5 pl-10 pr-4 text-foreground text-sm placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/50"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-card border border-border rounded-xl py-3.5 pl-10 pr-10 text-foreground text-sm placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/50"
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
                Entrar
              </Link>
            </p>
          </div>

        </div>
      </div>
      {/* Shake animation */}
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
