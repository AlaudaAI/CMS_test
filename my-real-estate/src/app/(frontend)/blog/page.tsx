import configPromise from '@/payload.config'
import { getPayload } from 'payload'
import Link from 'next/link'
import { theme } from '../../../themes'

export const dynamic = 'force-dynamic'

export default async function BlogPage() {
  const payload = await getPayload({ config: configPromise })

  const { docs: posts } = await payload.find({
    collection: 'posts',
    where: { status: { equals: 'published' } },
    sort: '-publishedAt',
    limit: 20,
  })

  return (
    <>
      <div className="page-header">
        <h1>{theme.blog.heading}</h1>
        <p>{theme.blog.sub}</p>
      </div>

      {posts.length === 0 ? (
        <div className="empty-state">
          <p>No posts yet. Create your first post in the <a href="/dashboard" style={{ textDecoration: 'underline' }}>dashboard</a>.</p>
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
