'use client'

import Image from 'next/image'
import type { Editor } from '@tiptap/core'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Heading2, Image as ImageIcon, Italic, List, ListOrdered, Upload, X } from 'lucide-react'
import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { StudyMaterials } from '@/types'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

export type ModalStudyMaterialProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  subjectName?: string
  initialContent?: StudyMaterials | null
  onSave?: (html: string, path: string, mode: string) => void
  mode: 'create' | 'update'
}

function EditorToolbar({ editor }: { editor: Editor }) {
  const toolbar = useEditorState({
    editor,
    selector: ({ editor: ed }) => ({
      bold: ed.isActive('bold'),
      italic: ed.isActive('italic'),
      bulletList: ed.isActive('bulletList'),
      orderedList: ed.isActive('orderedList'),
      heading2: ed.isActive('heading', { level: 2 }),
      canBold: ed.can().chain().focus().toggleBold().run(),
      canItalic: ed.can().chain().focus().toggleItalic().run(),
    }),
  })

  if (!toolbar) return null

  return (
    <div
      className="flex flex-wrap gap-1 border-b border-border bg-muted/40 p-2"
      role="toolbar"
      aria-label="Formatação do texto"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className={cn(
          toolbar.bold && 'bg-muted text-foreground hover:bg-muted hover:text-foreground'
        )}
        disabled={!toolbar.canBold}
        aria-pressed={toolbar.bold}
        aria-label="Negrito"
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="size-4" aria-hidden />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className={cn(
          toolbar.italic &&
            'bg-muted text-foreground hover:bg-muted hover:text-foreground'
        )}
        disabled={!toolbar.canItalic}
        aria-pressed={toolbar.italic}
        aria-label="Itálico"
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="size-4" aria-hidden />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className={cn(
          toolbar.bulletList &&
            'bg-muted text-foreground hover:bg-muted hover:text-foreground'
        )}
        aria-pressed={toolbar.bulletList}
        aria-label="Lista com marcadores"
        onClick={() => editor.chain().focus().setParagraph().toggleBulletList().run()}
      >
        <List className="size-4" aria-hidden />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className={cn(
          toolbar.orderedList &&
            'bg-muted text-foreground hover:bg-muted hover:text-foreground'
        )}
        aria-pressed={toolbar.orderedList}
        aria-label="Lista numerada"
        onClick={() => editor.chain().focus().setParagraph().toggleOrderedList().run()}
      >
        <ListOrdered className="size-4" aria-hidden />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className={cn(
          toolbar.heading2 &&
            'bg-muted text-foreground hover:bg-muted hover:text-foreground'
        )}
        aria-pressed={toolbar.heading2}
        aria-label="Título nível 2"
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
      >
        <Heading2 className="size-4" aria-hidden />
      </Button>
    </div>
  )
}

export function ModalStudyMaterial({
  open,
  onOpenChange,
  subjectName,
  initialContent,
  onSave,
  mode
}: ModalStudyMaterialProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'prose prose-invert max-w-none min-h-full p-4 focus:outline-none [&_h2]:text-xl [&_h2]:font-bold [&_h2]:leading-tight [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1',
      },
    },
  })

  useEffect(() => {
    if (!open || !editor) return
    editor.commands.setContent(initialContent?.content ?? '')
  }, [open, editor, initialContent])

  const previewUrl = useMemo(() => {
    if (!selectedFile) return ''
    return URL.createObjectURL(selectedFile)
  }, [selectedFile])

  const currentImageUrl = previewUrl || initialContent?.file_url || ''

  useEffect(() => {
    if (!open) {
      setSelectedFile(null)
    }
  }, [open])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
  }

  async function handleSave() {
    if (!editor) {
      toast.error('Carregando editor…')
      return
    }

    const html = editor.getHTML()
    const textOnly = editor.getText().trim()
    if (textOnly === '') {
      toast.error('Insira o conteúdo em texto.')
      return
    }

    let fileUrl = initialContent?.file_url?.trim() ?? ''

    if (selectedFile) {
      const supabase = createClient()
      const { error: bucketError, data: imageUpload } = await supabase.storage
        .from('study_materials_images')
        .upload(`image/${Date.now()}-${selectedFile.name}`, selectedFile)

      if (bucketError) {
        toast.error(bucketError.message)
        return
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from('study_materials_images')
        .getPublicUrl(imageUpload.path)

      fileUrl = publicUrl
    }

    onSave?.(html, fileUrl, mode)
    onOpenChange(false)
  }

  const title =
    subjectName != null && subjectName !== ''
      ? `Material de Estudo — ${subjectName}`
      : 'Material de Estudo'

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70">
      <div className="flex min-h-full justify-center p-4 py-10">
        <div className="my-auto flex w-full max-w-3xl flex-col rounded-2xl border border-border bg-card p-4 md:p-6">
        <div className="mb-4 flex shrink-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-black text-foreground">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground">
              O texto é obrigatório. A imagem de apoio é opcional.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            aria-label="Fechar modal"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col overflow-hidden rounded-lg border border-border">
            {editor ? <EditorToolbar editor={editor} /> : null}

            <div className="bg-background" style={{ minHeight: '280px' }}>
              {editor ? (
                <EditorContent editor={editor} />
              ) : (
                <p className="p-4 text-sm text-muted-foreground">
                  Carregando editor...
                </p>
              )}
            </div>
          </div>

          <div className="shrink-0 rounded-lg border border-border bg-card/50 p-4">
            <div className="mb-3 flex flex-col gap-1">
              <h4 className="text-sm font-bold text-foreground">
                Imagem de apoio
              </h4>
              <p className="text-xs text-muted-foreground">
                Opcional: envie uma imagem para complementar o material desta matéria.
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background px-4 py-4 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
                <Upload className="h-4 w-4" aria-hidden />
                Selecionar arquivo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              <div className="overflow-hidden rounded-lg border border-border bg-background">
                {currentImageUrl ? (
                  <div className="relative w-full" style={{ height: '240px' }}>
                    <Image
                      src={currentImageUrl}
                      alt="Pré-visualização da imagem selecionada"
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div
                    className="flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground"
                    style={{ minHeight: '160px' }}
                  >
                    <ImageIcon className="h-4 w-4" aria-hidden />
                    Nenhuma imagem selecionada.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex shrink-0 flex-wrap items-center gap-2 border-t border-border pt-4">
          <button
            type="button"
            className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-50"
            disabled={!editor}
            onClick={handleSave}
          >
            Salvar
          </button>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            Cancelar
          </button>
        </div>
        </div>
      </div>
    </div>
  )
}
