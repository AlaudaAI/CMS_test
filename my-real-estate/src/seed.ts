import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import { pushDevSchema } from '@payloadcms/drizzle'
import config from './payload.config'

function readTemplateFile(dir: string, name: string): string {
  try { return fs.readFileSync(path.join(dir, name), 'utf-8') }
  catch { return '' }
}

const seed = async () => {
  const payload = await getPayload({ config })
  await pushDevSchema(payload.db as any)

  // 1. Create platform admin
  try {
    await payload.create({
      collection: 'users',
      data: { email: 'admin@platform.com', password: 'changeme123', role: 'admin' },
    })
    console.log('✓ Admin user created: admin@platform.com / changeme123')
  } catch {
    console.log('→ Admin user already exists')
  }

  // 2. Seed templates from /template/ directory
  const templateRoot = path.join(process.cwd(), '..', 'template')
  const categories = ['real-estate', 'legal']
  const templateRecords: Record<string, any> = {}

  for (const category of categories) {
    const categoryDir = path.join(templateRoot, category)
    if (!fs.existsSync(categoryDir)) continue

    const entries = fs.readdirSync(categoryDir, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isDirectory()) continue

      const slug = entry.name
      const dir = path.join(categoryDir, slug)
      const configJson = JSON.parse(readTemplateFile(dir, 'config.json') || '{}')

      try {
        const doc = await payload.create({
          collection: 'templates',
          data: {
            name: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            slug,
            category,
            tokensCss: readTemplateFile(dir, 'tokens.css'),
            chromeCss: readTemplateFile(dir, 'chrome.css'),
            chromeHtml: readTemplateFile(dir, 'chrome.html'),
            configJson,
          },
        })
        templateRecords[slug] = doc
        console.log(`✓ Created template: ${slug}`)
      } catch {
        // Already exists — find it
        const result = await payload.find({
          collection: 'templates',
          where: { slug: { equals: slug } },
          limit: 1,
        })
        if (result.docs[0]) templateRecords[slug] = result.docs[0]
        console.log(`→ Template already exists: ${slug}`)
      }
    }
  }

  // 3. Create tenants
  const tenants = [
    {
      name: 'Luxe Realty',
      domain: 'localhost:3000',
      template: templateRecords['real-estate-1']?.id,
      siteName: 'Luxe Realty',
      tagline: 'Premium Real Estate',
      metaTitle: 'Luxe Realty — Premium Real Estate',
      metaDescription: 'Find your dream property with Luxe Realty',
      industry: 'real-estate',
      hero: {
        heading: 'Find Your Perfect Home',
        sub: 'Premium properties curated for discerning buyers.',
        cta: 'Read Our Insights',
      },
      features: [
        { title: 'Curated Listings', desc: 'Hand-selected properties that meet the highest standards.' },
        { title: 'Market Insights', desc: 'Expert analysis and trends from our real estate team.' },
        { title: 'Concierge Service', desc: 'White-glove support from first viewing to closing day.' },
      ],
      navLinks: [
        { label: 'Home', href: '/' },
        { label: 'Blog', href: '/blog' },
      ],
      footerText: '© 2026 Luxe Realty. All rights reserved.',
    },
    {
      name: 'Sterling & Associates',
      domain: 'localhost:3001',
      template: templateRecords['legal-1']?.id,
      siteName: 'Sterling & Associates',
      tagline: 'Attorneys at Law',
      metaTitle: 'Sterling & Associates — Attorneys at Law',
      metaDescription: 'Experienced legal counsel you can trust.',
      industry: 'legal',
      hero: {
        heading: 'Trusted Legal Counsel',
        sub: 'Decades of experience protecting your rights.',
        cta: 'Read Our Articles',
      },
      features: [
        { title: 'Corporate Law', desc: 'Strategic advice for businesses of every size.' },
        { title: 'Litigation', desc: 'Aggressive courtroom representation backed by research.' },
        { title: 'Estate Planning', desc: 'Protect your legacy with comprehensive strategies.' },
      ],
      navLinks: [
        { label: 'Home', href: '/' },
        { label: 'Insights', href: '/blog' },
      ],
      footerText: '© 2026 Sterling & Associates LLP. All rights reserved.',
    },
  ]

  const tenantRecords: Record<string, any> = {}
  for (const t of tenants) {
    if (!t.template) {
      console.log(`⚠ Skipping tenant ${t.name}: no template found`)
      continue
    }
    try {
      const doc = await payload.create({ collection: 'tenants', data: t as any })
      tenantRecords[t.name] = doc
      console.log(`✓ Created tenant: ${t.name}`)
    } catch {
      const result = await payload.find({
        collection: 'tenants',
        where: { domain: { equals: t.domain } },
        limit: 1,
      })
      if (result.docs[0]) tenantRecords[t.name] = result.docs[0]
      console.log(`→ Tenant already exists: ${t.name}`)
    }
  }

  // 4. Create sample posts per tenant
  const realEstatePosts = [
    {
      title: '5 Tips for First-Time Home Buyers',
      slug: 'first-time-buyer-tips',
      excerpt: 'Essential tips for navigating the real estate market as a new buyer.',
      status: 'published',
      publishedAt: '2026-02-15',
      contentHtml: '<p>Buying your first home is one of the most exciting milestones in life.</p><h2>1. Get Pre-Approved</h2><p>Get a mortgage pre-approval before browsing listings.</p><h2>2. Research the Neighborhood</h2><p>Consider commute times, schools, and local amenities.</p><h2>3. Do Not Skip the Inspection</h2><p>A professional inspection can reveal hidden issues.</p>',
    },
    {
      title: 'Market Trends to Watch This Spring',
      slug: 'market-trends-spring',
      excerpt: 'Interest rates, inventory levels, and what is shaping the market.',
      status: 'published',
      publishedAt: '2026-03-01',
      contentHtml: '<p>Spring is traditionally the busiest season for real estate.</p><h2>Interest Rates Stabilizing</h2><p>Mortgage rates have begun to stabilize, bringing more buyers back.</p><h2>Inventory Is Growing</h2><p>New construction is increasing, giving buyers more choices.</p>',
    },
  ]

  const legalPosts = [
    {
      title: 'What to Do After a Car Accident',
      slug: 'car-accident-guide',
      excerpt: 'Key steps to protect your rights after a motor vehicle accident.',
      status: 'published',
      publishedAt: '2026-02-10',
      contentHtml: '<p>A car accident can be overwhelming. Knowing the right steps matters.</p><h2>Document Everything</h2><p>Take photographs and collect contact information.</p><h2>Seek Medical Attention</h2><p>See a doctor within 24 hours even if you feel fine.</p>',
    },
    {
      title: 'LLC vs. Corporation: Choosing the Right Structure',
      slug: 'llc-vs-corporation',
      excerpt: 'Choosing the right business structure is a critical decision for founders.',
      status: 'published',
      publishedAt: '2026-02-25',
      contentHtml: '<p>The legal structure you choose affects liability, taxes, and fundraising.</p><h2>LLC</h2><p>Flexible management and pass-through taxation. Ideal for small businesses.</p><h2>Corporation</h2><p>Better for raising venture capital but faces double taxation.</p>',
    },
  ]

  const postSets = [
    { tenantName: 'Luxe Realty', posts: realEstatePosts },
    { tenantName: 'Sterling & Associates', posts: legalPosts },
  ]

  for (const { tenantName, posts } of postSets) {
    const tenant = tenantRecords[tenantName]
    if (!tenant) continue
    for (const post of posts) {
      try {
        await payload.create({
          collection: 'posts',
          data: { ...post, tenant: tenant.id } as any,
        })
        console.log(`✓ Created post: ${post.title} (${tenantName})`)
      } catch {
        console.log(`→ Post already exists: ${post.title}`)
      }
    }
  }

  console.log('\nDone! Visit http://localhost:3000/admin to manage content.')
  process.exit(0)
}

seed()
