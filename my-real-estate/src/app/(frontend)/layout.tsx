import type { Metadata } from 'next'
import React from 'react'
import './globals.css'
import { getTheme } from '../../themes'
import { template } from '../../templates/loader'

export async function generateMetadata(): Promise<Metadata> {
  const theme = await getTheme()
  return { title: theme.meta.title, description: theme.meta.description }
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const theme = await getTheme()
  const navHtml = theme.navLinks.map(l => `<a href="${l.href}">${l.label}</a>`).join('\n')
  const processed = template.chromeHtml
    .replaceAll('{{title}}', theme.name)
    .replaceAll('{{nav}}', navHtml)
  const [headerHtml, footerHtml] = processed.split('{{content}}')

  return (
    <html lang="en">
      <head>
        {template.config.fonts?.map((f) => (
          <link key={f} rel="stylesheet" href={f} />
        ))}
        {template.config.externals?.map((f) => (
          <link key={f} rel="stylesheet" href={f} />
        ))}
        <style dangerouslySetInnerHTML={{ __html: template.tokens }} />
        <style dangerouslySetInnerHTML={{ __html: template.chromeCss }} />
      </head>
      <body>
        <div dangerouslySetInnerHTML={{ __html: headerHtml }} />
        <main className="content">{children}</main>
        <div dangerouslySetInnerHTML={{ __html: footerHtml }} />
      </body>
    </html>
  )
}
