'use client'

import { useRouter } from 'next/navigation'

export function DeletePostButton({ postId, postTitle }: { postId: string; postTitle: string }) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(`Delete "${postTitle}"? This cannot be undone.`)) return
    const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' })
    if (res.ok) {
      router.refresh()
    } else {
      alert('Failed to delete post.')
    }
  }

  return (
    <button onClick={handleDelete} className="btn-small btn-danger">
      Delete
    </button>
  )
}
