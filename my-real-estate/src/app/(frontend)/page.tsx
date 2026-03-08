import { theme } from '../../themes'

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <h1>{theme.hero.heading}</h1>
        <p>{theme.hero.sub}</p>
        <a href="/blog" className="hero-cta">{theme.hero.cta}</a>
      </section>

      <section className="features">
        {theme.features.map((f) => (
          <div key={f.title} className="feature-card">
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </section>
    </>
  )
}
