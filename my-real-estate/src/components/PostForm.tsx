'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Editor from './Editor'

interface PostData {
  id?: string
  title?: string
  slug?: string
  excerpt?: string
  contentHtml?: string
  status?: string
  publishedAt?: string
  coverImage?: { url?: string; id?: string } | string | null
}

export default function PostForm({ post, mode, category }: { post?: PostData; mode: 'create' | 'edit'; category?: string }) {
  const router = useRouter()
  const [title, setTitle] = useState(post?.title || '')
  const [slug, setSlug] = useState(post?.slug || '')
  const [excerpt, setExcerpt] = useState(post?.excerpt || '')
  const [contentHtml, setContentHtml] = useState(post?.contentHtml || '')
  const [status, setStatus] = useState(post?.status || 'draft')
  const [publishedAt, setPublishedAt] = useState(post?.publishedAt?.slice(0, 10) || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const body: Record<string, unknown> = {
      title,
      slug: slug || generateSlug(title),
      excerpt,
      contentHtml,
      status,
      publishedAt: publishedAt || null,
    }
    if (category) {
      body.category = category
    }

    try {
      const url = mode === 'edit' ? `/api/posts/${post?.id}` : '/api/posts'
      const method = mode === 'edit' ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.errors?.[0]?.message || 'Failed to save post')
      }
      router.push('/dashboard/posts')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}

      <div className="post-form-grid">
        <div className="post-form-main">
          <label className="form-field">
            <span>Title</span>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (mode === 'create' && !slug) {
                  setSlug(generateSlug(e.target.value))
                }
              }}
              placeholder="Post title"
              required
            />
          </label>

          <label className="form-field">
            <span>Excerpt</span>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief summary of the post (optional)"
              rows={2}
              maxLength={300}
            />
          </label>

          <div className="form-field">
            <span>Content</span>
            <Editor content={contentHtml} onChange={setContentHtml} />
          </div>
        </div>

        <div className="post-form-sidebar">
          <label className="form-field">
            <span>Slug</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="url-friendly-slug"
            />
          </label>

          <label className="form-field">
            <span>Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>

          <label className="form-field">
            <span>Publish Date</span>
            <input
              type="date"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
            />
          </label>

          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : mode === 'create' ? 'Create Post' : 'Update Post'}
          </button>
        </div>
      </div>
    </form>
  )
}
