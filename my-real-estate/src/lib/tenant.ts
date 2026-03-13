import configPromise from '@/payload.config'
import { getPayload } from 'payload'
import { headers } from 'next/headers'

export async function getCurrentTenant() {
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'

  const payload = await getPayload({ config: configPromise })

  // Try to match by domain
  const result = await payload.find({
    collection: 'tenants',
    where: { domain: { equals: host } },
    limit: 1,
    depth: 1,
  })

  if (result.docs[0]) return result.docs[0]

  // Fallback: return first tenant
  const fallback = await payload.find({
    collection: 'tenants',
    limit: 1,
    depth: 1,
  })

  return fallback.docs[0] || null
}
