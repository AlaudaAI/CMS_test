import { getPayload } from 'payload'
import { pushDevSchema } from '@payloadcms/drizzle'
import config from './payload.config'

const seed = async () => {
  const payload = await getPayload({ config })

  // Push schema to database (creates tables if they don't exist)
  await pushDevSchema(payload.db as any)

  // Create admin user
  try {
    await payload.create({
      collection: 'users',
      data: { email: 'admin@sterlinglaw.com', password: 'changeme123', role: 'admin' },
    })
    console.log('✓ Admin user created: admin@sterlinglaw.com / changeme123')
  } catch {
    console.log('→ Admin user already exists')
  }

  const posts = [
    {
      category: 'legal',
      title: 'What to Do After a Car Accident: A Legal Guide',
      slug: 'car-accident-legal-guide',
      excerpt: 'Key steps to protect your rights and strengthen your claim after a motor vehicle accident.',
      status: 'published' as const,
      publishedAt: '2026-02-10',
      contentHtml: '<p>A car accident can be overwhelming. Knowing the right steps to take can make a significant difference in any future legal proceedings.</p><h2>1. Document Everything</h2><p>Take photographs of the scene, vehicle damage, and any visible injuries. Collect contact information from all parties involved and any witnesses.</p><h2>2. Seek Medical Attention</h2><p>Even if you feel fine, see a doctor within 24 hours. Some injuries are not immediately apparent, and medical records are crucial evidence.</p><h2>3. Do Not Admit Fault</h2><p>Be careful about what you say at the scene and to insurance adjusters. Statements can be used against you later.</p><h2>4. Contact an Attorney</h2><p>An experienced personal injury attorney can help you navigate insurance claims, negotiate settlements, and protect your legal rights throughout the process.</p>',
    },
    {
      category: 'legal',
      title: 'Understanding Business Formation: LLC vs. Corporation',
      slug: 'llc-vs-corporation',
      excerpt: 'Choosing the right business structure is one of the most important decisions a founder makes.',
      status: 'published' as const,
      publishedAt: '2026-02-25',
      contentHtml: '<p>When starting a business, the legal structure you choose affects everything from personal liability to taxes and fundraising.</p><h2>Limited Liability Company (LLC)</h2><p>LLCs offer flexibility in management and tax treatment. Profits pass through to members\u2019 personal tax returns, avoiding double taxation. They are ideal for small businesses and startups that want simplicity.</p><h2>Corporation (C-Corp)</h2><p>C-Corps are better suited for companies that plan to raise venture capital or go public. They offer unlimited growth potential through stock issuance but face double taxation on profits and dividends.</p><h2>Our Recommendation</h2><p>There is no one-size-fits-all answer. Schedule a consultation with our corporate law team to determine which structure best aligns with your goals and growth plans.</p>',
    },
    {
      category: 'legal',
      title: 'Estate Planning Essentials Every Family Should Know',
      slug: 'estate-planning-essentials',
      excerpt: 'A well-crafted estate plan protects your family and ensures your wishes are honored.',
      status: 'published' as const,
      publishedAt: '2026-03-01',
      contentHtml: '<p>Estate planning is not just for the wealthy. Every adult should have basic documents in place to protect their family and assets.</p><h2>The Essential Documents</h2><p>At minimum, you need a will, a durable power of attorney, a healthcare directive, and beneficiary designations on your financial accounts.</p><h2>When to Consider a Trust</h2><p>Trusts can help you avoid probate, reduce estate taxes, and maintain privacy. They are particularly valuable if you have minor children, own property in multiple states, or have a blended family.</p><h2>Review Regularly</h2><p>Life changes — marriage, divorce, births, deaths, and significant financial changes — all warrant a review of your estate plan. We recommend reviewing your plan at least every three years.</p>',
    },
  ]

  for (const post of posts) {
    try {
      await payload.create({ collection: 'posts', data: post as any })
      console.log(`✓ Created post: ${post.title}`)
    } catch {
      console.log(`→ Post already exists: ${post.title}`)
    }
  }

  console.log('\nDone! Visit http://localhost:3000/dashboard to log in.')
  process.exit(0)
}

seed()
