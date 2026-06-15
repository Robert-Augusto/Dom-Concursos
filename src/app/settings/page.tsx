'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { BottomNav } from '@/components/layout/BottomNav'
import { Sidebar } from '@/components/layout/Sidebar'
import Link from 'next/link'
import { Camera, ChevronRight, ImageOff, Lock, LogOut, Mail, Save, Star, User, ChevronLeft } from 'lucide-react'
import { Logout, UpdatePassword } from '@/lib/auth'
import {
  getAuthorColorForPreview,
  getCommunityDefaultHeadline,
} from '@/lib/lib-community-posts'
import {
  MAX_HEADLINE_LENGTH,
  UpdateProfileAvatar,
  UpdateProfileNameAndHeadline,
} from '@/lib/lib-profile'
import { DeleteUserAvatar, UploadUserAvatar } from '@/lib/lib-storage'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useProfile } from '@/context/ProfileContext'

const sectionShell =
  'rounded-2xl border border-border bg-card p-6 shadow-sm'

const saveBtn =
  'inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2 text-sm font-bold text-accent-foreground shadow-md transition hover:opacity-90 active:scale-[0.98]'

const MAX_AVATAR_SIZE_MB = 5
const MIN_PASSWORD_LENGTH = 8

export default function SettingsPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [avatarCleared, setAvatarCleared] = useState(false)
  const [savingAvatar, setSavingAvatar] = useState(false)
  const [name, setName] = useState('')
  const [headline, setHeadline] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const router = useRouter()
  const { profile, loading, refreshProfile } = useProfile()

  useEffect(() => {
    if (!profile) return
    setName(profile.name ?? '')
    setHeadline(profile.headline ?? '')
  }, [profile])

  const displayAvatarUrl =
    previewUrl ?? (avatarCleared ? null : profile?.avatar_url || null)

  const previewName = name.trim() || profile?.name || 'Seu nome'
  const previewHeadline =
    headline.trim() || getCommunityDefaultHeadline(profile?.role)
  const previewAvatarColor = getAuthorColorForPreview(previewName)
  const previewInitial = previewName.charAt(0).toUpperCase()

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function handleAvatarFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Use uma imagem JPG, PNG ou WebP.')
      e.target.value = ''
      return
    }

    if (file.size > MAX_AVATAR_SIZE_MB * 1024 * 1024) {
      toast.error(`A imagem deve ter no máximo ${MAX_AVATAR_SIZE_MB}MB.`)
      e.target.value = ''
      return
    }

    setPreviewUrl((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
    setSelectedFile(file)
    setAvatarCleared(false)
  }

  function handleRemoveAvatar() {
    setPreviewUrl((prev) => {
      if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev)
      return null
    })
    setSelectedFile(null)
    setAvatarCleared(true)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleSaveAvatar() {
    if (!profile) {
      toast.error('Perfil não encontrado.')
      return
    }

    const hasNewFile = selectedFile !== null
    const wantsRemove = avatarCleared && !hasNewFile

    if (!hasNewFile && !avatarCleared) {
      toast.info('Nenhuma alteração para salvar.')
      return
    }

    setSavingAvatar(true)

    try {
      let nextAvatarUrl: string | null = profile.avatar_url || null
      const previousAvatarUrl = profile.avatar_url || null

      if (wantsRemove) {
        if (previousAvatarUrl) {
          const { error: deleteError } = await DeleteUserAvatar(previousAvatarUrl)
          if (deleteError) {
            toast.error(deleteError.message)
            return
          }
        }
        nextAvatarUrl = null
      } else if (hasNewFile && selectedFile) {
        const { publicUrl, uploadError } = await UploadUserAvatar(
          selectedFile,
          profile.id,
        )

        if (uploadError) {
          toast.error(uploadError.message)
          return
        }

        if (previousAvatarUrl) {
          await DeleteUserAvatar(previousAvatarUrl)
        }

        nextAvatarUrl = publicUrl
      }

      const { error } = await UpdateProfileAvatar(nextAvatarUrl)
      if (error) {
        toast.error(error.message)
        return
      }

      await refreshProfile()
      setPreviewUrl((prev) => {
        if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev)
        return null
      })
      setSelectedFile(null)
      setAvatarCleared(false)
      if (fileRef.current) fileRef.current.value = ''
      toast.success('Foto de perfil atualizada.')
    } finally {
      setSavingAvatar(false)
    }
  }

  async function handleSaveProfile() {
    if (!profile) {
      toast.error('Perfil não encontrado.')
      return
    }

    const trimmedName = name.trim()
    const trimmedHeadline = headline.trim()

    if (!trimmedName) {
      toast.error('Informe um nome válido.')
      return
    }

    if (trimmedHeadline.length > MAX_HEADLINE_LENGTH) {
      toast.error(
        `A descrição deve ter no máximo ${MAX_HEADLINE_LENGTH} caracteres.`,
      )
      return
    }

    const unchanged =
      trimmedName === (profile.name ?? '').trim() &&
      trimmedHeadline === (profile.headline ?? '').trim()

    if (unchanged) {
      toast.info('Nenhuma alteração para salvar.')
      return
    }

    setSavingProfile(true)

    try {
      const { error } = await UpdateProfileNameAndHeadline(name, headline)
      if (error) {
        toast.error(error.message)
        return
      }

      await refreshProfile()
      toast.success('Perfil atualizado.')
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleSavePassword() {
    if (!newPassword || !confirmPassword) {
      toast.error('Preencha a nova senha e a confirmação.')
      return
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      toast.error(
        `A senha deve ter no mínimo ${MIN_PASSWORD_LENGTH} caracteres.`,
      )
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem.')
      return
    }

    setSavingPassword(true)

    try {
      const { error } = await UpdatePassword(newPassword)
      if (error) {
        toast.error(error)
        return
      }

      setNewPassword('')
      setConfirmPassword('')
      toast.success('Senha atualizada com sucesso.')
    } finally {
      setSavingPassword(false)
    }
  }

  async function handleLogout(){
    const {error} = await Logout()
    if (error) {
      toast.error(error.message)
      return
    }

    router.refresh()
    router.push('/auth/login')
  }

  function handleStepBack(){
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="min-h-screen pb-20 lg:ml-[240px] lg:pb-0">
        
        <header className="sticky top-0 z-30 border-b border-border bg-background mb-3">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <button
              type="button"
              onClick={handleStepBack}
              className="flex h-12 min-w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-sidebar-accent text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="font-heading truncate text-base font-bold text-foreground">
                Configurações
              </h1>
              <p className="text-sm text-muted-foreground">
                Gerencie as informações da sua conta.
              </p>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[720px] p-6">
          <div className="mb-8">
            <h1 className="font-heading text-2xl font-black tracking-tight text-foreground">
              Configurações
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Atualize seus dados pessoais e preferências da conta.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {!loading &&
              (profile?.role === 'admin' || profile?.role === 'teacher') && (
              <Link
                href="/admin"
                className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-primary/40 bg-card p-5 pr-6 transition-all duration-300 hover:border-primary/80 hover:bg-popover"
                style={{
                  boxShadow:
                    '0 4px 28px color-mix(in oklab, var(--color-primary) 14%, transparent)',
                }}
              >
                <div
                  className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full opacity-50 transition-opacity duration-300 group-hover:opacity-70"
                  style={{
                    background:
                      'radial-gradient(circle, color-mix(in oklab, var(--color-primary) 40%, transparent) 0%, transparent 70%)',
                  }}
                />
                <div
                  className="pointer-events-none absolute -bottom-8 -left-8 h-28 w-28 rounded-full opacity-30"
                  style={{
                    background:
                      'radial-gradient(circle, color-mix(in oklab, var(--color-accent) 35%, transparent) 0%, transparent 70%)',
                  }}
                />

                <div
                  className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105"
                  style={{
                    background:
                      'linear-gradient(135deg, color-mix(in oklab, var(--color-primary) 100%, white 0%), color-mix(in oklab, var(--color-primary) 78%, transparent 22%))',
                    boxShadow:
                      '0 8px 22px color-mix(in oklab, var(--color-primary) 45%, transparent)',
                  }}
                >
                  <Star
                    className="h-7 w-7 text-primary-foreground"
                    strokeWidth={2}
                    fill="none"
                    aria-hidden
                  />
                </div>

                <div className="relative min-w-0 flex-1">
                  <span className="inline-flex items-center rounded-full border border-primary/50 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                    Exclusivo admin
                  </span>
                  <p className="font-heading mt-2 text-lg font-black tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">
                    Painel do Administrador
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Edite tudo do site: aulas, vídeos, IA, simulados
                  </p>
                </div>

                <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted/60 transition-all duration-300 group-hover:border-primary/50 group-hover:bg-primary/10">
                  <ChevronRight
                    className="h-4 w-4 text-muted-foreground transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-primary"
                    aria-hidden
                  />
                </div>
              </Link>
            )}

            {/* Foto de perfil */}
            <section className={sectionShell}>
                <div className="mb-5">
                    <h2 className="font-heading text-base font-black tracking-tight text-foreground">
                    Foto de perfil
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                    Envie uma imagem para personalizar sua conta. Formatos JPG ou PNG.
                    </p>
                </div>

                <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    aria-label="Selecionar arquivo de imagem de perfil"
                    onChange={handleAvatarFileChange}
                />

                {/* Outer column — row + save button stacked */}
                <div className="flex flex-col gap-4">

                    {/* Row — image + buttons side by side */}
                    <div className="flex flex-row items-center gap-4">

                    {/* Image preview */}
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted">
                        {displayAvatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={displayAvatarUrl}
                            alt="Foto de perfil"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Camera className="h-8 w-8 text-muted-foreground" aria-hidden />
                        )}
                    </div>

                    {/* Buttons column — add + remove stacked */}
                    <div className="flex flex-col gap-2">
                        <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-muted"
                        onClick={() => fileRef.current?.click()}
                        >
                        <Camera className="h-4 w-4" />
                        Adicionar imagem
                        </button>
                        <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-destructive/40 bg-transparent px-4 py-2 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
                        onClick={handleRemoveAvatar}
                        >
                        <ImageOff className="h-4 w-4" />
                        Remover imagem
                        </button>
                    </div>
                    </div>

                    {/* Save button — full width below */}
                    <button
                      type="button"
                      className={`${saveBtn} self-end disabled:cursor-not-allowed disabled:opacity-60`}
                      onClick={handleSaveAvatar}
                      disabled={savingAvatar}
                    >
                    <Save className="h-4 w-4" />
                    {savingAvatar ? 'Salvando...' : 'Salvar foto'}
                    </button>

                </div>
                </section>
            {/* Nome de exibição */}
            <section className={sectionShell}>
              <div className="mb-5">
                <h2 className="font-heading text-base font-black tracking-tight text-foreground">
                  Nome de exibição
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                Este nome aparece no painel e na comunidade.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full rounded-xl border border-border bg-primary-foreground py-3.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-accent/60"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="profile-headline"
                    className="text-sm font-semibold text-foreground"
                  >
                    Descrição curta{' '}
                    <span className="font-normal text-muted-foreground">
                      (opcional)
                    </span>
                  </label>
                  <textarea
                    id="profile-headline"
                    value={headline}
                    onChange={(e) => {
                      if (e.target.value.length <= MAX_HEADLINE_LENGTH) {
                        setHeadline(e.target.value)
                      }
                    }}
                    placeholder="Ex.: Concurseiro focado em tribunais"
                    rows={3}
                    maxLength={MAX_HEADLINE_LENGTH}
                    className="w-full resize-none rounded-xl border border-border bg-primary-foreground px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-accent/60"
                  />
                  <p className="text-right text-xs text-muted-foreground">
                    {headline.length}/{MAX_HEADLINE_LENGTH}
                  </p>
                  <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Prévia na comunidade
                    </p>
                    <div className="flex min-w-0 items-start gap-3">
                      <div
                        className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-black text-white"
                        style={
                          displayAvatarUrl
                            ? undefined
                            : { background: previewAvatarColor }
                        }
                      >
                        {displayAvatarUrl ? (
                          <Image
                            src={displayAvatarUrl}
                            alt={previewName ? `Foto de ${previewName}` : 'Foto de perfil'}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : (
                          previewInitial
                        )}
                      </div>
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <p className="text-sm font-black text-foreground">
                            {previewName}
                          </p>
                          {profile?.role === 'admin' ? (
                            <span className="rounded-full bg-chart-5 px-2 py-0.5 text-[10px] font-black text-white">
                              Admin
                            </span>
                          ) : profile?.role === 'teacher' ? (
                            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-black text-primary-foreground">
                              Professor
                            </span>
                          ) : null}
                          <p className="text-xs text-muted-foreground">agora</p>
                        </div>
                        <p
                          className={`text-xs leading-snug ${
                            headline.trim()
                              ? 'text-muted-foreground'
                              : 'text-muted-foreground/70 italic'
                          }`}
                        >
                          {previewHeadline}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className={`${saveBtn} self-end disabled:cursor-not-allowed disabled:opacity-60`}
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                >
                  <Save className="h-4 w-4" />
                  {savingProfile ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </section>

            {/* Senha */}
            <section className={sectionShell}>
              <div className="mb-5">
                <h2 className="font-heading text-base font-black tracking-tight text-foreground">
                  Alterar senha
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Escolha uma senha forte com letras, números e símbolos.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nova senha"
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-border bg-primary-foreground py-3.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-accent/60"
                  />
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmar nova senha"
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-border bg-primary-foreground py-3.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-accent/60"
                  />
                </div>
                <button
                  type="button"
                  className={`${saveBtn} self-end disabled:cursor-not-allowed disabled:opacity-60`}
                  onClick={handleSavePassword}
                  disabled={savingPassword}
                >
                  <Save className="h-4 w-4" />
                  {savingPassword ? 'Salvando...' : 'Salvar senha'}
                </button>
              </div>
            </section>

            {/* Logout */}
            <section className={sectionShell}>
              <div className="mb-5">
                <h2 className="font-heading text-base font-black tracking-tight text-foreground">
                  Sair da conta
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Você será desconectado de todos os dispositivos.
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="self-end flex items-center gap-2 px-5 py-2.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm font-bold hover:bg-destructive/20 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sair da conta
              </button>
            </section>

          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
