import { getPayload } from 'payload'
import config from '../payload.config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function requireAuth() {
  const payload = await getPayload({ config })
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })
  if (!user) redirect('/dashboard/login')
  return user
}

export async function getUser() {
  const payload = await getPayload({ config })
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })
  return user
}
