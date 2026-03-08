import type { Metadata } from 'next'
import React from 'react'
import './globals.css'
import { theme } from '../../themes'
import { template } from '../../templates/loader'

export const metadata: Metadata = {
  title: theme.meta.title,
  description: theme.meta.description,
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  const navHtml = theme.navLinks.map(l => `<a href="${l.href}">${l.label}</a>`).join('\n')
  const processed = template.chromeHtml
    .replaceAll('{{title}}', theme.name)
    .replaceAll('{{nav}}', navHtml)
  const parts = processed.split('{{content}}')
  const headerHtml = parts[0] ?? ''
  const footerHtml = parts[1] ?? ''

  return (
    <html lang="en">
      <head>
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
