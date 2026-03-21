'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export function CreateUserForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('editor')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.errors?.[0]?.message || 'Failed to create user')
      }
      setEmail('')
      setPassword('')
      setRole('editor')
      setOpen(false)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create user')
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-primary" style={{ marginBottom: '1.5rem' }}>
        + Add User
      </button>
    )
  }

  return (
    <form className="inline-form" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}
      <div className="inline-form-row">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          minLength={6}
        />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Creating...' : 'Create'}
        </button>
        <button type="button" className="btn-small" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  )
}

export function DeleteUserButton({ userId, userEmail }: { userId: string; userEmail: string }) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(`Delete user "${userEmail}"? This cannot be undone.`)) return
    const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' })
    if (res.ok) router.refresh()
    else alert('Failed to delete user.')
  }

  return (
    <button onClick={handleDelete} className="btn-small btn-danger">
      Delete
    </button>
  )
}
