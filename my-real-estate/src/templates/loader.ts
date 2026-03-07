import configPromise from '@/payload.config'
import { getPayload } from 'payload'

export type TemplateData = {
  tokens: string
  chromeCss: string
  chromeHtml: string
  config: { fonts?: string[]; externals?: string[] }
}

export async function loadTemplate(templateId: number | string): Promise<TemplateData> {
  const payload = await getPayload({ config: configPromise })
  const doc = await payload.findByID({ collection: 'templates', id: templateId })

  return {
    tokens: doc.tokensCss,
    chromeCss: doc.chromeCss,
    chromeHtml: doc.chromeHtml,
    config: JSON.parse(doc.configJson || '{}'),
  }
}
