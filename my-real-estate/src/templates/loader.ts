import { getPayload } from 'payload'
import config from '../payload.config'

export interface TemplateData {
  config: { fonts?: string[]; externals?: string[] }
  tokens: string
  chromeCss: string
  chromeHtml: string
}

export async function loadTemplate(templateId: string | number): Promise<TemplateData> {
  const payload = await getPayload({ config })
  const template = await payload.findByID({ collection: 'templates', id: templateId })
  return {
    config: (template.configJson as { fonts?: string[]; externals?: string[] }) || {},
    tokens: template.tokensCss || '',
    chromeCss: template.chromeCss || '',
    chromeHtml: template.chromeHtml || '',
  }
}
