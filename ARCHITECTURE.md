# Architecture

## How It Works

The system has two independent layers:

1. **Template** (`template/`) — visual presentation (HTML chrome + CSS tokens + styles), stored on disk and seeded into DB
2. **Tenant** (DB) — site configuration (site name, domain, hero copy, nav links, features, linked template)

They are combined at render time in `(frontend)/layout.tsx`:

```
npm run seed
  reads template/ directory from disk
  creates Templates records in Postgres
  creates Tenants records in Postgres (each linked to a Template)

Request arrives → tenant.ts reads Host header
  → queries Tenants collection by domain
  → finds linked Template record
  → layout.tsx injects template CSS + chrome HTML around page content
```

### Template → DB Flow

The template loader (`src/templates/loader.ts`) queries the Payload `templates` collection by ID. Templates are seeded from disk files into the database by `npm run seed`. At runtime, templates are always read from the database, not from the filesystem.

### Template File Contract

Each template on disk provides 4 files (see `TEMPLATE_GUIDE.md` for full spec):

| File | Role |
|---|---|
| `tokens.css` | `:root` CSS variables (colors, fonts, spacing) |
| `chrome.html` | Header + `{{content}}` slot + footer |
| `chrome.css` | Styles for chrome elements only |
| `config.json` | External font/icon CDN URLs |

Templates are pure HTML/CSS with 3 placeholders: `{{title}}`, `{{nav}}`, `{{content}}`.

These 4 files become 4 fields in a `templates` DB record after seeding.

## Payload CMS Collections

| Collection | Scope | Fields | Used by |
|---|---|---|---|
| **Templates** | Platform | name, slug, category, tokensCss, chromeCss, chromeHtml, configJson | Template loader |
| **Tenants** | Platform | name, domain, template (rel), siteName, hero, features, navLinks, meta | Tenant resolver |
| **Posts** | Per-tenant | title, slug, coverImage, excerpt, contentHtml, status, publishedAt | Blog pages |
| **Media** | Per-tenant | file upload, alt text | Cover images |
| **Services** | Per-tenant | title, slug, description, icon, status | Service listings |
| **Staff** | Per-tenant | name, slug, role, bio, photo | Team profiles |
| **Users** | Platform | email, password, role (admin/editor) | Auth |

### APIs & Features

- **Local API** (`getPayload` + `payload.find`) — used in pages to query data server-side. No REST/GraphQL calls from the frontend.
- **Access Control** — role-based (`isAdminOrEditor`) on content collections; public read.
- **Upload** — Media collection with image-only MIME filter.
- **Auth** — Payload's built-in cookie auth. Custom dashboard at `/dashboard` also uses it via `src/lib/auth.ts`.
- **Admin Panel** — available at `/admin`.

## Gaps & Future Directions

1. **No dynamic sections** — templates only have `{{content}}`. A template cannot define its own hero or services grid that pulls from CMS collections.
2. **No per-page layouts** — every page gets the same chrome. Homepage and blog post share identical header/footer.
3. **No component slots** — templates are monolithic HTML. You can't mix CMS-driven blocks with template styling.
4. **Multi-tenant plugin** — `@payloadcms/plugin-multi-tenant` is available in package.json but not yet configured. Currently tenant isolation is handled manually in seed and query logic.
