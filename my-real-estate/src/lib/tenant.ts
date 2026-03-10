import { getPayload } from 'payload'
import config from '../payload.config'
import { headers } from 'next/headers'

export async function getCurrentTenant() {
  const payload = await getPayload({ config })
  const headersList = await headers()

  // 1. Check x-tenant-id header (set by middleware in production)
  const tenantId = headersList.get('x-tenant-id')
  if (tenantId) {
    try {
      return await payload.findByID({ collection: 'tenants', id: tenantId, depth: 1 })
    } catch { /* fall through */ }
  }

  // 2. Check x-tenant-domain header (set by middleware)
  const domain = headersList.get('x-tenant-domain') || headersList.get('host')
  if (domain) {
    const result = await payload.find({
      collection: 'tenants',
      where: { domain: { equals: domain } },
      limit: 1,
      depth: 1,
    })
    if (result.docs[0]) return result.docs[0]
  }

  // 3. Fallback: first tenant
  const { docs } = await payload.find({ collection: 'tenants', limit: 1, depth: 1 })
  return docs[0] || null
}
