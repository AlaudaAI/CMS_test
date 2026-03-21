'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import { useCallback } from 'react'

interface EditorProps {
  content?: string
  onChange: (html: string) => void
  placeholder?: string
}

export default function Editor({ content = '', onChange, placeholder = 'Start writing your post...' }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Image.configure({ allowBase64: true, inline: false }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
    editorProps: {
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items
        if (!items) return false
        for (const item of Array.from(items)) {
          if (item.type.startsWith('image/')) {
            event.preventDefault()
            const file = item.getAsFile()
            if (file) uploadAndInsertImage(file)
            return true
          }
        }
        return false
      },
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files
        if (!files?.length) return false
        for (const file of Array.from(files)) {
          if (file.type.startsWith('image/')) {
            event.preventDefault()
            uploadAndInsertImage(file)
            return true
          }
        }
        return false
      },
    },
  })

  const uploadAndInsertImage = useCallback(
    async (file: File) => {
      if (!editor) return
      const formData = new FormData()
      formData.append('file', file)
      formData.append('alt', file.name.replace(/\.[^.]+$/, ''))
      try {
        const res = await fetch('/api/media', { method: 'POST', body: formData })
        if (!res.ok) throw new Error('Upload failed')
        const data = await res.json()
        const url = data.doc?.url || data.doc?.filename
        if (url) {
          editor.chain().focus().setImage({ src: url }).run()
        }
      } catch {
        // Fallback: insert as base64
        const reader = new FileReader()
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            editor.chain().focus().setImage({ src: reader.result }).run()
          }
        }
        reader.readAsDataURL(file)
      }
    },
    [editor],
  )

  if (!editor) return null

  return (
    <div className="editor-wrap">
      <div className="editor-toolbar">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'active' : ''}
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'active' : ''}
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'active' : ''}
          title="Underline"
        >
          <u>U</u>
        </button>
        <span className="editor-toolbar-sep" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'active' : ''}
          title="Heading"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'active' : ''}
          title="Subheading"
        >
          H3
        </button>
        <span className="editor-toolbar-sep" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'active' : ''}
          title="Bullet List"
        >
          &bull; List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'active' : ''}
          title="Numbered List"
        >
          1. List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'active' : ''}
          title="Quote"
        >
          &ldquo; Quote
        </button>
        <span className="editor-toolbar-sep" />
        <button
          type="button"
          onClick={() => {
            const url = window.prompt('Enter link URL:')
            if (url) editor.chain().focus().setLink({ href: url }).run()
          }}
          className={editor.isActive('link') ? 'active' : ''}
          title="Link"
        >
          Link
        </button>
        <button
          type="button"
          onClick={() => {
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = 'image/*'
            input.onchange = () => {
              const file = input.files?.[0]
              if (file) uploadAndInsertImage(file)
            }
            input.click()
          }}
          title="Insert Image"
        >
          Image
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          ―
        </button>
      </div>

      <EditorContent editor={editor} className="editor-content" />
      <p className="editor-hint">Tip: Paste or drag images directly into the editor.</p>
    </div>
  )
}
