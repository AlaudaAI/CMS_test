export type ThemeConfig = {
  id: string
  name: string
  tagline: string
  meta: { title: string; description: string }
  hero: { heading: string; sub: string; cta: string }
  features: { title: string; desc: string }[]
  blog: { heading: string; sub: string }
  footer: string
  hasMedia: boolean
  navLinks: { href: string; label: string }[]
}

import realestate from './realestate'
import lawfirm from './lawfirm'

const themes: Record<string, ThemeConfig> = { realestate, lawfirm }

const fallbackId = process.env.NEXT_PUBLIC_SITE_THEME || 'realestate'

/** Default theme (for non-request contexts) */
export const theme: ThemeConfig = themes[fallbackId] || realestate

/** Read theme from cookie (server components only) */
export async function getTheme(): Promise<ThemeConfig> {
  try {
    const { cookies } = await import('next/headers')
    const jar = await cookies()
    const id = jar.get('site-theme')?.value
    if (id && themes[id]) return themes[id]
  } catch {}
  return theme
}
