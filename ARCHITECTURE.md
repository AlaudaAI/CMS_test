# Architecture: CMS + Template Integration

## How It Works Today

The system has two independent layers:

1. **Theme** (`src/themes/`) — content configuration (site name, hero copy, nav links, feature descriptions)
2. **Template** (`my-real-estate/template/`) — visual presentation (HTML chrome + CSS tokens + styles)

They are combined at render time in `layout.tsx`:

```
my-real-estate/template/legal/legal-1/
  tokens.css    →  <style> in <head>         (CSS variables)
  chrome.css    →  <style> in <head>         (header/footer styles)
  chrome.html   →  split on {{content}}      (header HTML before, footer HTML after)
  config.json   →  <link> tags in <head>     (Google Fonts, icon CDNs)

src/themes/lawfirm.ts
  name          →  replaces {{title}} in chrome.html
  navLinks      →  replaces {{nav}} with <a> tags
```

The template loader (`src/templates/loader.ts`) reads files from disk at build time via `fs.readFileSync`. Layout splits the chrome HTML at `{{content}}` and injects header/footer around the React page content.

### Template File Contract

Each template provides 4 files (see `TEMPLATE_GUIDE.md` for full spec):

| File | Role |
|---|---|
| `tokens.css` | `:root` CSS variables (colors, fonts, spacing) |
| `chrome.html` | Header + `<main class="content">{{content}}</main>` + footer |
| `chrome.css` | Styles for chrome elements only |
| `config.json` | External font/icon CDN URLs |

Templates are pure HTML/CSS with 3 placeholders: `{{title}}`, `{{nav}}`, `{{content}}`.

## Payload CMS Features Used

### Collections

| Collection | Fields | Used by |
|---|---|---|
| **Posts** | title, slug, coverImage, excerpt, contentHtml, status, publishedAt | Blog pages |
| **Media** | file upload, alt text | Cover images |
| **Services** | title, slug, description, icon, status | Not yet rendered on frontend |
| **Staff** | name, slug, role, bio, photo | Not yet rendered on frontend |
| **Users** | email, password, role (admin/editor) | Auth + dashboard |

### APIs & Features

- **Local API** (`getPayload` + `payload.find`) — used in blog pages to query posts server-side. No REST/GraphQL calls from the frontend.
- **Access Control** — role-based (`isAdminOrEditor`) on all content collections; public read.
- **Upload** — Media collection with `staticDir: 'media'`, image-only MIME filter.
- **Auth** — Payload's built-in cookie auth, used by the custom dashboard.
- **Admin Panel** — available at `/admin` as fallback, but a custom dashboard at `/dashboard` is the primary editing UI.

### What Is NOT Used

- REST API from client-side
- GraphQL
- Globals
- Hooks / access policies beyond simple role checks
- Versions / drafts (only a manual `status` field)
- Live preview
- Blocks / layout builder

## Gaps: What Templates Cannot Express Today

1. **No dynamic sections** — templates only have `{{content}}`. A template cannot define its own hero, services grid, or team section that pulls from CMS collections.
2. **No per-page layouts** — every page gets the same chrome. A homepage and a blog post share identical header/footer injection.
3. **Fixed collections** — `Services` and `Staff` exist in the DB but templates have no way to render them. Adding a new collection requires code changes.
4. **No component slots** — templates are monolithic HTML. You can't mix CMS-driven blocks with template styling.

## Recommendations for AI-Generated Templates

To let AI generate templates that integrate well with the CMS:

### Short Term (minimal changes)

Add more named slots to `chrome.html`:

```html
<main class="content">
  <section class="slot-hero">{{hero}}</section>
  <section class="slot-services">{{services}}</section>
  {{content}}
</main>
```

The loader would replace `{{services}}` with server-rendered HTML from the Services collection using a simple HTML template string per card. This keeps templates as pure HTML/CSS while giving them access to CMS data.

### Medium Term (block system)

Define a `sections` array in a `page-layout.json` per template:

```json
[
  { "type": "hero", "collection": null },
  { "type": "collection-grid", "collection": "services", "limit": 6 },
  { "type": "content" },
  { "type": "collection-list", "collection": "staff" }
]
```

Each section type has a corresponding HTML partial in the template folder (`hero.html`, `collection-grid.html`, etc.). The loader assembles the page from these partials, filling each with data from the specified collection. AI generates both the layout config and the partials.

### Key Principles for AI Template Generation

1. **Keep templates as HTML/CSS** — no JS, no React components. This keeps the generation problem simple and the output auditable.
2. **Use CSS variables for theming** — AI should generate `tokens.css` with the standard variable names. This ensures compatibility with `globals.css`.
3. **Don't touch collections** — template should adapt to whatever collections exist, not require new ones. Use the slot/block system to map collections to visual sections.
4. **Provide a preview HTML** — `homepage.html` lets you preview the template without running the CMS. AI can validate its own output.
