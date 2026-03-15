import { getPayload } from 'payload'
import config from '../../../../../../payload.config'
import { requireAuth } from '../../../../../../lib/auth'
import { getCurrentTenant, getTenantCategory } from '../../../../../../lib/tenant'
import DashboardShell from '../../../../../../components/DashboardShell'
import PostForm from '../../../../../../components/PostForm'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth()
  const tenant = await getCurrentTenant()
  const { id } = await params
  const payload = await getPayload({ config })

  let post
  try {
    post = await payload.findByID({ collection: 'posts', id })
  } catch {
    notFound()
  }

  const category = getTenantCategory(tenant) || 'real-estate'
  const postData = {
    id: String(post.id),
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || '',
    contentHtml: (post as unknown as Record<string, unknown>).contentHtml as string || '',
    status: post.status || 'draft',
    publishedAt: post.publishedAt || '',
    coverImage: post.coverImage as { url?: string; id?: string } | null,
  }

  return (
    <DashboardShell userEmail={user.email || ''} themeName={tenant?.siteName || ''} hasMedia={true}>
      <div className="dash-page">
        <div className="dash-page-header">
          <h1>Edit Post</h1>
        </div>
        <PostForm post={postData} mode="edit" category={category} />
      </div>
    </DashboardShell>
  )
}
