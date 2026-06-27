'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Eye,
  EyeOff,
  Lock,
} from 'lucide-react'
import { ResetPassword } from '@/lib/lib-auth'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showCofirmPassword, setShowConfirmPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const [isloading, setIsloading] = useState(false)
  const masLenght = 100

  async function handleUpdatePassword(event: React.FormEvent) {
    event.preventDefault()

    if(!password || !confirmPassword) {
        setError("Preencha todos os inputs")
        return
    }

    if(password.length < 8){
        setError("A senha deve ter no mínimo 8 caracteres.")
        return
    }

    if(password !== confirmPassword){
        setError("As senhas não coinscidem.")
        return
    }

    setIsloading(true)
    setError('')
    
    const {error} = await ResetPassword(password)

    if (error) {
      setError(error)
      setIsloading(false)
      return
    }
    
    setIsloading(false)

    router.refresh()

  }

  return (
    <>
      {/* Welcome */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-1.5">
          <h1 className="font-heading text-lg font-black text-foreground">
            Redefinir senha
          </h1>
        </div>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          Insira sua nova senha de acesso
        </p>
      </div>

      {/* Form */}
      <div className={`flex flex-col gap-2.5 w-full max-w-sm mx-auto`}>

        {/* Password */}
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Lock className="h-4 w-4" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Sua nova senha"
            maxLength={masLenght}
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

        {/* Confirm Password */}
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Lock className="h-4 w-4" />
          </div>
          <input
            type={showCofirmPassword ? 'text' : 'password'}
            placeholder="Confirme a nova senha"
            maxLength={masLenght}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-primary-foreground border border-border rounded-xl py-3.5 pl-10 pr-10 text-foreground text-sm placeholder:text-muted-foreground outline-none transition-colors focus:border-primary/50"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showCofirmPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm cursor-pointer"
          >
            {showCofirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <p className="text-xs text-destructive px-1">{error}</p>
        )}

        {/* Forgot password */}
        <div className="text-right -mt-1">
          <Link href="/auth/forgot-password" className="text-xs text-accent cursor-pointer hover:underline">
            Esqueci minha senha
          </Link>
        </div>

        {/* Login button */}
        <button
          onClick={handleUpdatePassword}
          disabled={isloading}
          className="w-full py-4 rounded-xl text-sm font-black tracking-wide text-primary-foreground cursor-pointer transition-all active:scale-95"
          style={{
            background: 'linear-gradient(90deg, color-mix(in oklab, var(--color-primary) 100%, white 0%), color-mix(in oklab, var(--color-primary) 82%, white 18%))',
            boxShadow: '0 8px 24px color-mix(in oklab, var(--color-primary) 35%, transparent)',
          }}
          >
            Atualizar senha
        </button>

        <div className="relative z-10 flex flex-col items-center gap-2 px-7 pb-8 pt-4">
          <p className="text-sm text-muted-foreground text-center">
            Não tem conta?{' '}
            <Link href="/auth/signup" className="text-primary font-bold hover:underline text-sm">
              Cadastre-se grátis
            </Link>
          </p>
        </div>

        </div>
      </>
  )
}