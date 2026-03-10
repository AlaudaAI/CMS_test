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
        <body className="frontend">
          <main className="content">
            <p style={{ padding: '4rem', textAlign: 'center' }}>
              No tenant configured. Visit <a href="/admin">/admin</a> to set up.
            </p>
          </main>
        </body>
      </html>
    )
  }

  const templateId = typeof tenant.template === 'object' ? tenant.template.id : tenant.template
  const template = await loadTemplate(templateId)

  const navHtml = (tenant.navLinks || [])
    .map((l: any) => `<a href="${l.href}">${l.label}</a>`)
    .join('\n')

  const processed = template.chromeHtml
    .replaceAll('{{title}}', tenant.siteName || tenant.name)
    .replaceAll('{{nav}}', navHtml)
  const parts = processed.split('{{content}}')
  const headerHtml = parts[0] ?? ''
  const footerHtml = parts[1] ?? ''

  return (
    <html lang="en">
      <head>
        <title>{tenant.metaTitle || tenant.siteName || tenant.name}</title>
        <meta name="description" content={tenant.metaDescription || ''} />
        {template.config.fonts?.map((f) => (
          <link key={f} rel="stylesheet" href={f} />
        ))}
        {template.config.externals?.map((f) => (
          <link key={f} rel="stylesheet" href={f} />
        ))}
        <style dangerouslySetInnerHTML={{ __html: template.tokens || '' }} />
        <style dangerouslySetInnerHTML={{ __html: template.chromeCss || '' }} />
      </head>
      <body className="frontend">
        <div dangerouslySetInnerHTML={{ __html: headerHtml }} />
        <main className="content">{children}</main>
        <div dangerouslySetInnerHTML={{ __html: footerHtml }} />
      </body>
    </html>
  )
}
