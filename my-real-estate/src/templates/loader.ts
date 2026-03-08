import fs from 'fs'
import path from 'path'

const templateId = process.env.NEXT_PUBLIC_SITE_TEMPLATE || 'real-estate/real-estate-1'
const templateDir = path.join(process.cwd(), 'template', templateId)

function readFile(name: string): string {
  try { return fs.readFileSync(path.join(templateDir, name), 'utf-8') }
  catch { return '' }
}

const config: { fonts?: string[]; externals?: string[] } =
  JSON.parse(readFile('config.json') || '{}')
const tokens = readFile('tokens.css')
const chromeCss = readFile('chrome.css')
const chromeHtml = readFile('chrome.html')

export const template = { config, tokens, chromeCss, chromeHtml }
