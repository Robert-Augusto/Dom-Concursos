'use client'

import type { Editor } from '@tiptap/core'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Heading2, Italic, List, ListOrdered, X } from 'lucide-react'
import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type ModalTextMaterialProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  subjectName?: string
  initialContent?: string
  onSave?: (html: string) => void
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

export function ModalTextMaterial({
  open,
  onOpenChange,
  subjectName,
  initialContent,
  onSave,
}: ModalTextMaterialProps) {
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
    editor.commands.setContent(initialContent ?? '')
  }, [open, editor, initialContent])

  const handleSave = () => {
    if (!editor) return
    onSave?.(editor.getHTML())
    onOpenChange(false)
  }

  const title =
    subjectName != null && subjectName !== ''
      ? `Texto Teórico — ${subjectName}`
      : 'Texto Teórico'

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div
        className="w-full max-w-3xl rounded-2xl border border-border bg-card p-4 md:p-6"
        style={{ maxHeight: '85vh' }}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-black text-foreground">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground">
              Use a barra de formatação para negrito, itálico, listas e título
              (nível 2).
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

        <div className="flex min-h-0 flex-col gap-4 overflow-hidden">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border">
            {editor ? <EditorToolbar editor={editor} /> : null}

            <div
              className="min-h-0 flex-1 overflow-y-auto bg-background"
              style={{ minHeight: '280px' }}
            >
              {editor ? (
                <EditorContent editor={editor} />
              ) : (
                <p className="p-4 text-sm text-muted-foreground">
                  Carregando editor...
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
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
