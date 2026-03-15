import configPromise from '@/payload.config'
import { getPayload } from 'payload'
import Link from 'next/link'
import { getCurrentTenant, getTenantCategory } from '../../../lib/tenant'

export const dynamic = 'force-dynamic'

export default async function BlogPage() {
  const tenant = await getCurrentTenant()
  const payload = await getPayload({ config: configPromise })

  const category = getTenantCategory(tenant)

  let posts: Awaited<ReturnType<typeof payload.find>>['docs'] = []
  try {
    const where: any = { status: { equals: 'published' } }
    if (category) {
      where.category = { equals: category }
    }
    const result = await payload.find({
      collection: 'posts',
      where,
      sort: '-publishedAt',
      limit: 20,
    })
    posts = result.docs
  } catch {
    // Table may not exist yet before first migration
  }

  return (
    <>
      <div className="page-header">
        <h1>{tenant?.blog?.heading || 'Blog'}</h1>
        {tenant?.blog?.sub && <p>{tenant.blog.sub}</p>}
      </div>

      {posts.length === 0 ? (
        <div className="empty-state">
          <p>No posts yet. Create your first post in the <a href="/admin" style={{ textDecoration: 'underline' }}>admin panel</a>.</p>
        </div>
      ) : (
        <div className="blog-grid">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="blog-card">
              {post.coverImage && typeof post.coverImage === 'object' && (
                <img
                  className="blog-card-img"
                  src={post.coverImage.url || ''}
                  alt={post.coverImage.alt || post.title}
                />
              )}
              <div className="blog-card-body">
                <h2>{post.title}</h2>
                {post.excerpt && <p>{post.excerpt}</p>}
                <div className="blog-card-meta">
                  {post.publishedAt && new Date(post.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
