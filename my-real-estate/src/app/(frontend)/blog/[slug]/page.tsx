import configPromise from '@/payload.config'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCurrentTenant } from '../../../../lib/tenant'

export const dynamic = 'force-dynamic'

type Args = { params: Promise<{ slug: string }> }

export default async function BlogPostPage({ params }: Args) {
  const { slug } = await params
  const tenant = await getCurrentTenant()
  if (!tenant) return notFound()

  const payload = await getPayload({ config: configPromise })

  let docs: Awaited<ReturnType<typeof payload.find>>['docs'] = []
  try {
    const result = await payload.find({
      collection: 'posts',
      where: {
        slug: { equals: slug },
        status: { equals: 'published' },
        tenant: { equals: tenant.id },
      },
      limit: 1,
    })
    docs = result.docs
  } catch {
    return notFound()
  }

  const post = docs[0]
  if (!post) return notFound()

  const contentHtml = (post as unknown as Record<string, unknown>).contentHtml as string | undefined

  return (
    <article className="article">
      <Link href="/blog" style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
        &larr; Back to Blog
      </Link>

      <h1 style={{ marginTop: '1.5rem' }}>{post.title}</h1>

      <div className="article-meta">
        {post.publishedAt && new Date(post.publishedAt).toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric',
        })}
      </div>

      {post.coverImage && typeof post.coverImage === 'object' && (
        <img
          className="article-cover"
          src={post.coverImage.url || ''}
          alt={post.coverImage.alt || post.title}
        />
      )}

      {contentHtml ? (
        <div className="article-content" dangerouslySetInnerHTML={{ __html: contentHtml }} />
      ) : (
        <div className="article-content">
          <p>No content available.</p>
        </div>
      )}
    </article>
  )
}
