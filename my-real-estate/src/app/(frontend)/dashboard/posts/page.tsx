import { getPayload } from 'payload'
import config from '../../../../payload.config'
import { requireAuth } from '../../../../lib/auth'
import { getTheme } from '../../../../themes'
import DashboardShell from '../../../../components/DashboardShell'
import Link from 'next/link'
import { DeletePostButton } from './DeletePostButton'

export const dynamic = 'force-dynamic'

export default async function PostsPage() {
  const user = await requireAuth()
  const theme = await getTheme()
  const payload = await getPayload({ config })
  const { docs: posts } = await payload.find({
    collection: 'posts',
    sort: '-updatedAt',
    limit: 100,
  })

  return (
    <DashboardShell userEmail={user.email || ''} themeName={theme.name} hasMedia={theme.hasMedia}>
      <div className="dash-page">
        <div className="dash-page-header">
          <h1>Posts</h1>
          <Link href="/dashboard/posts/new" className="btn-primary">
            + New Post
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="dash-empty">
            <p>No posts yet.</p>
            <Link href="/dashboard/posts/new" className="btn-primary">
              Create your first post
            </Link>
          </div>
        ) : (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td>
                      <Link href={`/dashboard/posts/${post.id}/edit`} className="dash-table-link">
                        {post.title}
                      </Link>
                    </td>
                    <td>
                      <span className={`status-badge status-${post.status}`}>
                        {post.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="text-muted">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString()
                        : '—'}
                    </td>
                    <td>
                      <div className="dash-actions">
                        <Link
                          href={`/dashboard/posts/${post.id}/edit`}
                          className="btn-small"
                        >
                          Edit
                        </Link>
                        <DeletePostButton postId={String(post.id)} postTitle={post.title} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
