#!/usr/bin/env node
// Converts a template to standardized format:
//   - Renames CSS variables to standard names (--bg, --fg, --font, etc.)
//   - Adds {{content}} slot to chrome.html
//   - Extracts chrome CSS from homepage.html → chrome.css
//   - Generates config.json (fonts, externals)
//
// Usage: node scripts/convert-template.js <template-dir>

const fs = require('fs')
const path = require('path')

const dir = process.argv[2]
if (!dir) { console.error('Usage: node convert-template.js <template-dir>'); process.exit(1) }
const abs = path.resolve(dir)

const read = f => fs.readFileSync(path.join(abs, f), 'utf-8')
const write = (f, c) => fs.writeFileSync(path.join(abs, f), c)

let tokens = read('tokens.css')
let chrome = read('chrome.html')
let homepage = read('homepage.html')
let subpage = read('subpage.html')

// --- 1. Build token mapping ---

const varDecls = [...tokens.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)]
  .map(m => ({ name: `--${m[1]}`, value: m[2].trim() }))

// Detect what body actually uses
const bodyFont = homepage.match(/body\s*\{[^}]*font-family:\s*var\((--[\w-]+)\)/s)?.[1]
const bodyBg = homepage.match(/body\s*\{[^}]*background(?:-color)?:\s*var\((--[\w-]+)\)/s)?.[1]
const bodyColor = homepage.match(/body\s*\{[^}]*[^-]color:\s*var\((--[\w-]+)\)/s)?.[1]

const mapping = {}
const taken = new Set()

function map(from, to) {
  if (taken.has(to)) return false
  mapping[from] = to
  taken.add(to)
  return true
}

for (const { name: n } of varDecls) {
  // Background
  if (n === bodyBg || /^--bg-primary$/.test(n)) { map(n, '--bg'); continue }
  if (/^--(bg-secondary|bg-card)$/.test(n)) { map(n, '--card-bg'); continue }
  if (/^--bg-header/.test(n)) { map(n, '--nav-bg'); continue }

  // Text
  if (n === bodyColor || /^--text-primary$/.test(n)) { map(n, '--fg'); continue }
  if (/^--(text-muted|text-secondary)$/.test(n)) { map(n, '--muted'); continue }

  // Border
  if (/^--(border-color|border-subtle)$/.test(n) || (n === '--border' && !taken.has('--border'))) {
    map(n, '--border'); continue
  }

  // Font: body font → --font, other → --font-secondary
  if (n === bodyFont) { map(n, '--font'); continue }
  if (/^--font/.test(n) && !taken.has('--font')) { map(n, '--font'); continue }
  if (/^--font/.test(n) && !taken.has('--font-secondary')) { map(n, '--font-secondary'); continue }

  // Spacing: normalize --space-* and --spacing-* → --spacing-*
  const sp = n.match(/^--spac(?:e|ing)-(xs|sm|md|lg|xl|2xl|3xl|4xl)$/)
  if (sp) { map(n, `--spacing-${sp[1]}`); continue }

  // Radius, transition, max-width
  if (/^--radius(-card)?$/.test(n) && !taken.has('--radius')) { map(n, '--radius'); continue }
  if (/^--transition(-smooth)?$/.test(n)) { map(n, '--transition'); continue }
  if (/^--(content-max|max-w)$/.test(n)) { map(n, '--max-w'); continue }

  // Accent
  if (/^--(btn-bg|accent)$/.test(n) && !taken.has('--accent')) { map(n, '--accent'); continue }
  if (/^--(btn-text|accent-fg)$/.test(n)) { map(n, '--accent-fg'); continue }

  // Keep unmapped vars as-is
  mapping[n] = n
}

// Log renames
const renames = Object.entries(mapping).filter(([a, b]) => a !== b)
console.log(`Token renames (${renames.length}):`)
renames.forEach(([a, b]) => console.log(`  ${a} → ${b}`))

// --- 2. Apply renames across all files ---

function applyRenames(content) {
  for (const [from, to] of renames) {
    content = content.replaceAll(from, to)
  }
  return content
}

tokens = applyRenames(tokens)
chrome = applyRenames(chrome)
homepage = applyRenames(homepage)
subpage = applyRenames(subpage)

// --- 3. Add {{content}} to chrome.html ---

if (!chrome.includes('{{content}}')) {
  const inserted = chrome.replace(
    /(<!--\s*FOOTER\s*-->|<footer)/i,
    '<main class="content">{{content}}</main>\n\n$1'
  )
  if (inserted !== chrome) chrome = inserted
}

// --- 4. Normalize nav: <ul> wrapping {{nav}} → <div>, hardcoded links → {{nav}} ---

chrome = chrome.replace(/<ul([^>]*)>\s*({{nav}})\s*<\/ul>/g, '<div$1>$2</div>')
chrome = chrome.replace(/<nav>\s*(?:<a href="#">[^<]+<\/a>\s*)+<\/nav>/g, '<nav>{{nav}}</nav>')

// --- 5. Extract chrome CSS ---

// Collect class names from chrome.html
const chromeClasses = new Set()
let cm
const clsRe = /class="([^"]+)"/g
while ((cm = clsRe.exec(chrome)) !== null) {
  cm[1].split(/\s+/).forEach(c => chromeClasses.add(c))
}
// Add base chrome selectors
;['header', 'footer', 'nav', 'sidebar', 'mobile', 'hamburger', 'brand'].forEach(c => chromeClasses.add(c))

// Parse homepage <style> into top-level blocks (strip {{tokens}} placeholder)
const styleContent = (homepage.match(/<style>([\s\S]*?)<\/style>/)?.[1] || '')
  .replace(/\{\{tokens\}\}/g, '')

function parseCssBlocks(css) {
  const blocks = []
  let i = 0
  while (i < css.length) {
    while (i < css.length && /\s/.test(css[i])) i++
    if (i >= css.length) break
    let sel = ''
    while (i < css.length && css[i] !== '{') sel += css[i++]
    sel = sel.trim()
    if (!sel || i >= css.length) break
    i++ // skip {
    let depth = 1, body = ''
    while (i < css.length && depth > 0) {
      if (css[i] === '{') depth++
      if (css[i] === '}') depth--
      if (depth > 0) body += css[i]
      i++
    }
    blocks.push({ selector: sel, body, raw: `${sel} {\n${body}\n}` })
  }
  return blocks
}

const allBlocks = parseCssBlocks(styleContent)
const skipSel = /^(\*|:root|html|body|img|a\b|button)\b/
const chromeBlocks = allBlocks.filter(({ selector, body }) => {
  if (skipSel.test(selector.trim())) return false
  const text = selector + ' ' + body
  return [...chromeClasses].some(cls => {
    const re = new RegExp(`\\.${cls.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w-])`)
    return re.test(text)
  })
})

const chromeCss = chromeBlocks.map(b => b.raw).join('\n\n')

// --- 6. Generate config.json ---

const fonts = [...new Set([...homepage.matchAll(/href="(https:\/\/fonts\.googleapis\.com[^"]+)"/g)].map(m => m[1]))]
const externals = [...new Set([...homepage.matchAll(/href="(https:\/\/cdnjs\.cloudflare\.com[^"]+)"/g)].map(m => m[1]))]
const config = { fonts, externals: externals.length ? externals : undefined }

// --- 7. Write ---

write('tokens.css', tokens)
write('chrome.html', chrome)
write('chrome.css', chromeCss)
write('config.json', JSON.stringify(config, null, 2))
write('homepage.html', homepage)
write('subpage.html', subpage)

console.log(`\nOutput:`)
console.log(`  tokens.css  — ${renames.length} vars renamed`)
console.log(`  chrome.html — {{content}} slot: ${chrome.includes('{{content}}') ? 'yes' : 'MISSING'}`)
console.log(`  chrome.css  — ${chromeBlocks.length} rules extracted`)
console.log(`  config.json — ${fonts.length} fonts, ${externals.length} externals`)
