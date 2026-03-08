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
      data: { email: 'admin@luxerealty.com', password: 'changeme123', role: 'admin' },
    })
    console.log('✓ Admin user created: admin@luxerealty.com / changeme123')
  } catch {
    console.log('→ Admin user already exists')
  }

  // Create blog posts with HTML content
  const posts = [
    {
      title: '5 Tips for First-Time Home Buyers in 2026',
      slug: 'first-time-buyer-tips-2026',
      excerpt: 'Navigate the real estate market with confidence using these essential tips for new buyers.',
      status: 'published' as const,
      publishedAt: '2026-02-15',
      contentHtml: '<p>Buying your first home is one of the most exciting milestones in life. Here are five tips to help you navigate the process with confidence.</p><h2>1. Get Pre-Approved First</h2><p>Before you start browsing listings, get a mortgage pre-approval. This tells sellers you are a serious buyer and helps you understand your budget.</p><h2>2. Research the Neighborhood</h2><p>Look beyond the property itself. Consider commute times, school districts, local amenities, and future development plans in the area.</p><h2>3. Do Not Skip the Inspection</h2><p>A professional home inspection can reveal hidden issues that could cost thousands to repair. Always make your offer contingent on a satisfactory inspection.</p><h2>4. Think Long-Term</h2><p>Consider how your needs might change over the next 5-10 years. A home that works for you now should also accommodate future plans.</p><h2>5. Work with an Experienced Agent</h2><p>A knowledgeable real estate agent can negotiate on your behalf, identify potential issues, and guide you through the entire closing process.</p>',
    },
    {
      title: 'Real Estate Market Trends to Watch This Spring',
      slug: 'market-trends-spring-2026',
      excerpt: 'Interest rates, inventory levels, and emerging neighborhoods — here is what is shaping the market.',
      status: 'published' as const,
      publishedAt: '2026-03-01',
      contentHtml: '<p>Spring is traditionally the busiest season for real estate. Here is what we are seeing in the market this year.</p><h2>Interest Rates Stabilizing</h2><p>After years of volatility, mortgage rates have begun to stabilize in the mid-5% range, bringing more buyers back to the market.</p><h2>Inventory Is Growing</h2><p>New construction and returning sellers are increasing inventory levels, giving buyers more choices and reducing bidding wars.</p><h2>Suburban Demand Remains Strong</h2><p>Remote and hybrid work continues to drive demand for suburban homes with dedicated office spaces and larger outdoor areas.</p>',
    },
    {
      title: 'How to Stage Your Home for a Quick Sale',
      slug: 'home-staging-guide',
      excerpt: 'Simple staging techniques that help your property stand out and sell faster.',
      status: 'published' as const,
      publishedAt: '2026-02-20',
      contentHtml: '<p>Professional staging can help your home sell faster and for a higher price. Here are proven techniques you can implement yourself.</p><h2>Declutter and Depersonalize</h2><p>Remove personal photos, excess furniture, and clutter. Buyers need to envision themselves in the space, not see your life story.</p><h2>Focus on Curb Appeal</h2><p>First impressions matter. Fresh paint on the front door, well-maintained landscaping, and clean walkways set the tone for the entire showing.</p><h2>Let in Natural Light</h2><p>Open all curtains, clean windows, and add mirrors to reflect light. Bright spaces feel larger and more inviting.</p>',
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
