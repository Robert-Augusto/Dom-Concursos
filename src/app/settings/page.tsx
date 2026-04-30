'use client'

import { useRef, useState } from 'react'
import { BottomNav } from '@/components/layout/BottomNav'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { Camera, ImageOff, Lock, Mail, Save, User } from 'lucide-react'

const sectionShell =
  'rounded-2xl border border-border bg-card p-6 shadow-sm'

const saveBtn =
  'inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2 text-sm font-bold text-accent-foreground shadow-md transition hover:opacity-90 active:scale-[0.98]'

export default function SettingsPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="min-h-screen pb-20 lg:ml-[240px] lg:pb-0">
        <Header />
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
                    onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const url = URL.createObjectURL(file)
                    setPreview((prev) => {
                        if (prev) URL.revokeObjectURL(prev)
                        return url
                    })
                    }}
                />

                {/* Outer column — row + save button stacked */}
                <div className="flex flex-col gap-4">

                    {/* Row — image + buttons side by side */}
                    <div className="flex flex-row items-center gap-4">

                    {/* Image preview */}
                    <div
                        className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted bg-cover bg-center"
                        style={preview ? { backgroundImage: `url(${preview})` } : undefined}
                    >
                        {!preview && (
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
                        onClick={() => {
                            setPreview((prev) => {
                            if (prev) URL.revokeObjectURL(prev)
                            return null
                            })
                            if (fileRef.current) fileRef.current.value = ''
                        }}
                        >
                        <ImageOff className="h-4 w-4" />
                        Remover imagem
                        </button>
                    </div>
                    </div>

                    {/* Save button — full width below */}
                    <button type="button" className={saveBtn+" self-end"}>
                    <Save className="h-4 w-4" />
                    Salvar foto
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
                    placeholder="Seu nome"
                    className="w-full rounded-xl border border-border bg-background py-3.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-accent/60"
                  />
                </div>
                <button type="button" className={saveBtn+" self-end"}>
                  <Save className="h-4 w-4" />
                  Salvar nome
                </button>
              </div>
            </section>

            {/* E-mail */}
            <section className={sectionShell}>
              <div className="mb-5">
                <h2 className="font-heading text-base font-black tracking-tight text-foreground">
                  Alterar e-mail
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Use um e-mail que você acessa com frequência.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    placeholder="novo@email.com"
                    className="w-full rounded-xl border border-border bg-background py-3.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-accent/60"
                  />
                </div>
                <button type="button" className={saveBtn+" self-end"}>
                  <Save className="h-4 w-4" />
                  Salvar e-mail
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
                    placeholder="Nova senha"
                    className="w-full rounded-xl border border-border bg-background py-3.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-accent/60"
                  />
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    placeholder="Confirmar nova senha"
                    className="w-full rounded-xl border border-border bg-background py-3.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-accent/60"
                  />
                </div>
                <button type="button" className={saveBtn+" self-end"}>
                  <Save className="h-4 w-4" />
                  Salvar e-mail
                </button>
              </div>
            </section>
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
