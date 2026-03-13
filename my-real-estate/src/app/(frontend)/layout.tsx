import React from 'react'
import './globals.css'
import { getCurrentTenant } from '../../lib/tenant'
import { loadTemplate } from '../../templates/loader'

export const dynamic = 'force-dynamic'

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getCurrentTenant()

  if (!tenant) {
    return (
      <html lang="en">
        <body>
          <p>No tenant configured. Run <code>npm run seed</code> to set up.</p>
        </body>
      </html>
    )
  }

  const templateId = typeof tenant.template === 'object' ? tenant.template.id : tenant.template
  const template = await loadTemplate(templateId)

  const navHtml = (tenant.navLinks || [])
    .map((l: { label: string; href: string }) => `<a href="${l.href}">${l.label}</a>`)
    .join('\n')

  const processed = template.chromeHtml
    .replaceAll('{{title}}', tenant.siteName)
    .replaceAll('{{nav}}', navHtml)

  const parts = processed.split('{{content}}')
  const headerHtml = parts[0] ?? ''
  const footerHtml = parts[1] ?? ''

  const metaTitle = tenant.meta?.title || tenant.siteName
  const metaDesc = tenant.meta?.description || ''

  return (
    <html lang="en">
      <head>
        <title>{metaTitle}</title>
        {metaDesc && <meta name="description" content={metaDesc} />}
        {template.config.fonts?.map((f) => (
          <link key={f} rel="stylesheet" href={f} />
        ))}
        {template.config.externals?.map((f) => (
          <link key={f} rel="stylesheet" href={f} />
        ))}
        <style dangerouslySetInnerHTML={{ __html: template.tokens || '' }} />
        <style dangerouslySetInnerHTML={{ __html: template.chromeCss || '' }} />
      </head>
      <body>
        <div dangerouslySetInnerHTML={{ __html: headerHtml }} />
        <main className="content">{children}</main>
        <div dangerouslySetInnerHTML={{ __html: footerHtml }} />
      </body>
    </html>
  )
}
