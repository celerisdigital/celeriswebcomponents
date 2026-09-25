'use client'

import { useEditorState, type Editor } from '@tiptap/react'
import {
  LuHeading1,
  LuHeading2,
  LuHeading3,
  LuBold,
  LuItalic,
  LuUnderline,
  LuStrikethrough,
  LuAlignLeft,
  LuAlignCenter,
  LuAlignRight,
  LuAlignJustify,
  LuList,
  LuListOrdered,
  LuQuote,
  LuMinus,
  LuRemoveFormatting,
  LuUndo2,
  LuRedo2,
} from 'react-icons/lu'
import { ToolbarButton, ToolbarDivider } from './toolbar-button'
import { RichTextColorButton } from './color-button'

export function RichTextToolbar({ editor }: { editor: Editor }) {
  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      isH1: editor.isActive('heading', { level: 1 }),
      isH2: editor.isActive('heading', { level: 2 }),
      isH3: editor.isActive('heading', { level: 3 }),
      isBold: editor.isActive('bold'),
      isItalic: editor.isActive('italic'),
      isUnderline: editor.isActive('underline'),
      isStrike: editor.isActive('strike'),
      isAlignLeft: editor.isActive({ textAlign: 'left' }),
      isAlignCenter: editor.isActive({ textAlign: 'center' }),
      isAlignRight: editor.isActive({ textAlign: 'right' }),
      isAlignJustify: editor.isActive({ textAlign: 'justify' }),
      isBulletList: editor.isActive('bulletList'),
      isOrderedList: editor.isActive('orderedList'),
      isBlockquote: editor.isActive('blockquote'),
      canUndo: editor.can().undo(),
      canRedo: editor.can().redo(),
    }),
  })

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 px-2 py-1.5">
      <ToolbarButton
        label="Título 1"
        active={state.isH1}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <LuHeading1 size={15} />
      </ToolbarButton>

      <ToolbarButton
        label="Título 2"
        active={state.isH2}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <LuHeading2 size={15} />
      </ToolbarButton>

      <ToolbarButton
        label="Título 3"
        active={state.isH3}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <LuHeading3 size={15} />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        label="Negrito"
        active={state.isBold}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <LuBold size={15} />
      </ToolbarButton>

      <ToolbarButton
        label="Itálico"
        active={state.isItalic}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <LuItalic size={15} />
      </ToolbarButton>

      <ToolbarButton
        label="Sublinhado"
        active={state.isUnderline}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <LuUnderline size={15} />
      </ToolbarButton>

      <ToolbarButton
        label="Tachado"
        active={state.isStrike}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <LuStrikethrough size={15} />
      </ToolbarButton>

      <RichTextColorButton editor={editor} />

      <ToolbarDivider />

      <ToolbarButton
        label="Alinhar à esquerda"
        active={state.isAlignLeft}
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
      >
        <LuAlignLeft size={15} />
      </ToolbarButton>

      <ToolbarButton
        label="Centralizar"
        active={state.isAlignCenter}
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
      >
        <LuAlignCenter size={15} />
      </ToolbarButton>

      <ToolbarButton
        label="Alinhar à direita"
        active={state.isAlignRight}
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
      >
        <LuAlignRight size={15} />
      </ToolbarButton>

      <ToolbarButton
        label="Justificar"
        active={state.isAlignJustify}
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
      >
        <LuAlignJustify size={15} />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        label="Lista com marcadores"
        active={state.isBulletList}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <LuList size={15} />
      </ToolbarButton>

      <ToolbarButton
        label="Lista numerada"
        active={state.isOrderedList}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <LuListOrdered size={15} />
      </ToolbarButton>

      <ToolbarButton
        label="Citação"
        active={state.isBlockquote}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <LuQuote size={15} />
      </ToolbarButton>

      <ToolbarButton label="Linha divisória" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <LuMinus size={15} />
      </ToolbarButton>

      <ToolbarButton
        label="Limpar formatação"
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
      >
        <LuRemoveFormatting size={15} />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton label="Desfazer" disabled={!state.canUndo} onClick={() => editor.chain().focus().undo().run()}>
        <LuUndo2 size={15} />
      </ToolbarButton>

      <ToolbarButton label="Refazer" disabled={!state.canRedo} onClick={() => editor.chain().focus().redo().run()}>
        <LuRedo2 size={15} />
      </ToolbarButton>
    </div>
  )
}
