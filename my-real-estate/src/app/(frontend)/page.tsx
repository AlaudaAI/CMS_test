import { getCurrentTenant } from '../../lib/tenant'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const tenant = await getCurrentTenant()
  if (!tenant) return null

  return (
    <>
      <section className="hero">
        <h1>{tenant.hero?.heading}</h1>
        <p>{tenant.hero?.sub}</p>
        {tenant.hero?.cta && (
          <a href="/blog" className="hero-cta">{tenant.hero.cta}</a>
        )}
      </section>

      {tenant.features && tenant.features.length > 0 && (
        <section className="features">
          {tenant.features.map((f: { title: string; desc: string }) => (
            <div key={f.title} className="feature-card">
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </section>
      )}
    </>
  )
}
