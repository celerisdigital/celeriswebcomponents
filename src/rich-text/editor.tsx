'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Placeholder } from '@tiptap/extensions'
import { TextAlign } from '@tiptap/extension-text-align'
import { TextStyle, Color } from '@tiptap/extension-text-style'
import { cn } from '../lib/cn'
import { toEditorContent } from './utils'
import { RichTextToolbar } from './toolbar'
import './rich-text.css'

export interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  error?: string
  placeholder?: string
  className?: string
}

export function RichTextEditor({ value, onChange, error, placeholder, className }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ code: false, codeBlock: false }),
      Placeholder.configure({ placeholder: placeholder ?? '' }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
    ],
    content: toEditorContent(value),
    // Evita hydration mismatch: o editor só monta no cliente.
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'rich-text min-h-32 px-3 py-2.5 text-sm focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  if (!editor) return null

  return (
    <div
      className={cn(
        'rounded-lg border bg-white transition-colors',
        error
          ? 'border-red-400 focus-within:ring-2 focus-within:ring-red-200'
          : 'border-gray-300 hover:border-gray-400 focus-within:ring-2 focus-within:ring-gray-300',
        className,
      )}
    >
      <RichTextToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
