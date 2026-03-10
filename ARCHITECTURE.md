# Architecture

## Overview

Single Next.js 15 app with Payload CMS 3 embedded. Two route groups serve different purposes:

```
src/app/
  (payload)/          Admin panel + API (Payload-managed)
    admin/            /admin — content management UI
    api/              /api/* — auto-generated REST + GraphQL
    layout.tsx        Imports Payload CSS, wraps with RootLayout
    custom.scss       Minimal admin style overrides

  (frontend)/         Tenant-facing website
    page.tsx          / — homepage (hero + features)
    blog/             /blog, /blog/[slug] — blog listing + detail
    layout.tsx        Loads tenant config, injects template chrome
    globals.css       Scoped to .frontend class to avoid admin leaks
```

## Multi-Tenancy

Powered by `@payloadcms/plugin-multi-tenant`. Each tenant is isolated by a `tenant` foreign key on content collections.

**Tenant resolution**: `src/lib/tenant.ts` reads the `Host` header and matches it against the `domain` field in the Tenants collection.

**Data isolation**: Posts, Media, Services, and Staff are all scoped per tenant. Admins see all tenants; editors see only their assigned tenant.

## Collections

| Collection | Group | Multi-tenant | Purpose |
|---|---|---|---|
| Users | Settings | No | Auth, roles (admin / editor) |
| Templates | Platform | No | HTML/CSS template definitions |
| Tenants | Platform | No | Site config (domain, branding, nav, SEO) |
| Posts | Content | Yes | Blog articles with rich text |
| Media | Content | Yes | Image uploads (processed by Sharp) |
| Services | Content | Yes | Service listings (extension) |
| Staff | Content | Yes | Team member profiles (extension) |

## Template System

Templates live in `/template/{category}/{slug}/` with four files:

| File | Purpose |
|---|---|
| `config.json` | Font URLs, external stylesheets |
| `tokens.css` | CSS custom properties (`--fg`, `--bg`, `--font`, etc.) |
| `chrome.html` | Header/footer HTML with `{{title}}`, `{{nav}}`, `{{content}}` placeholders |
| `chrome.css` | Styles for the header/footer chrome |

At runtime, `src/templates/loader.ts` reads template records from the DB. The frontend layout injects tokens + chrome around page content.

**Available templates**: `real-estate-1`, `real-estate-2`, `legal-1`, `legal-2`

## Access Control

Defined in `src/access/roles.ts`:

- **Admin**: Full CRUD on all collections, sees all tenants
- **Editor**: Can manage Posts and Media within their assigned tenant

## Key Design Decisions

1. **CSS isolation**: Frontend `globals.css` is scoped under `.frontend` to prevent leaking into Payload admin. The admin layout explicitly imports `@payloadcms/next/css`.

2. **No custom dashboard**: Uses Payload's built-in admin UI with nav groups (Settings, Content, Platform) rather than a custom React dashboard.

3. **Template-driven frontend**: Tenants pick a template; the frontend renders it server-side with no client JS framework for the public site.

4. **Extension collections**: Industry-specific collections (Services, Staff) live in `collections/extensions/` and are opt-in per template category.
