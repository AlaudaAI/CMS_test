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

const id = process.env.NEXT_PUBLIC_SITE_THEME || 'realestate'

export const theme: ThemeConfig = themes[id] || realestate
