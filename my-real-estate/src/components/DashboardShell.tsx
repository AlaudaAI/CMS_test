'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ReactNode } from 'react'

const allNavItems = [
  { href: '/dashboard/posts', label: 'Posts', icon: '📝', requiresMedia: false },
  { href: '/dashboard/media', label: 'Media', icon: '🖼', requiresMedia: true },
  { href: '/dashboard/users', label: 'Users', icon: '👤', requiresMedia: false },
]

export default function DashboardShell({
  children,
  userEmail,
  themeName,
  hasMedia,
}: {
  children: ReactNode
  userEmail: string
  themeName: string
  hasMedia: boolean
}) {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = allNavItems.filter((item) => !item.requiresMedia || hasMedia)

  async function handleLogout() {
    await fetch('/api/users/logout', { method: 'POST' })
    router.push('/dashboard/login')
    router.refresh()
  }

  return (
    <div className="dash">
      <aside className="dash-sidebar">
        <div className="dash-brand">
          <Link href="/">{themeName}</Link>
        </div>
        <nav className="dash-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`dash-nav-item ${pathname.startsWith(item.href) ? 'active' : ''}`}
            >
              <span className="dash-nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="dash-sidebar-footer">
          <div className="dash-user-email">{userEmail}</div>
          <button onClick={handleLogout} className="dash-logout-btn">
            Sign Out
          </button>
        </div>
      </aside>
      <main className="dash-main">{children}</main>
    </div>
  )
}
