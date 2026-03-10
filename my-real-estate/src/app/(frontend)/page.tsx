import { getCurrentTenant } from '../../lib/tenant'

export default async function HomePage() {
  const tenant = await getCurrentTenant()
  if (!tenant) return null

  const hero = tenant.hero as { heading?: string; sub?: string; cta?: string } | undefined
  const features = (tenant.features || []) as { title: string; desc: string }[]

  return (
    <>
      <section className="hero">
        <h1>{hero?.heading || tenant.siteName || tenant.name}</h1>
        {hero?.sub && <p>{hero.sub}</p>}
        {hero?.cta && <a href="/blog" className="hero-cta">{hero.cta}</a>}
      </section>

      {features.length > 0 && (
        <section className="features">
          {features.map((f) => (
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
