# Implementation Plan: Multi-Tenant CMS Platform

## Vision

One Payload CMS instance → many small business websites.
Each tenant (small business owner) gets: their own admin panel view, their own template, their own content, their own domain.

---

## Phase 0: Cleanup — Remove Custom Dashboard

**Why**: Payload already has a full admin panel with auth, CRUD, media management, rich text editing. The custom dashboard (`DashboardShell`, `PostForm`, `Editor`, all dashboard routes) duplicates ~500 lines of code that Payload does better out of the box.

**Delete these files:**
```
src/components/DashboardShell.tsx       # Payload admin has its own shell
src/components/PostForm.tsx             # Payload admin has built-in forms
src/components/Editor.tsx               # Payload uses Lexical editor (already configured)
src/app/(frontend)/dashboard/           # Entire directory (10 files)
  ├── dashboard.css
  ├── layout.tsx
  ├── page.tsx
  ├── login/page.tsx
  ├── posts/page.tsx
  ├── posts/new/page.tsx
  ├── posts/[id]/edit/page.tsx
  ├── posts/DeletePostButton.tsx
  ├── users/page.tsx
  └── users/UsersClient.tsx
src/lib/auth.ts                         # Payload handles auth internally
```

**Remove from package.json:**
```
@tiptap/extension-image
@tiptap/extension-link
@tiptap/extension-placeholder
@tiptap/extension-underline
@tiptap/pm
@tiptap/react
@tiptap/starter-kit
```

**Update nav links**: Remove "Dashboard" from theme configs, or point it to `/admin` (Payload's built-in admin).

**Result**: ~500 fewer lines of custom code. Content management happens at `/admin` via Payload's built-in UI.

---

## Phase 1: Templates Collection — Templates as Data, Not Files

**Why**: Currently templates are loaded from the filesystem via `src/templates/loader.ts`. This means adding a new template requires committing files to the repo. For a platform serving many businesses, templates must be stored in the database so they can be created/managed dynamically.

### 1.1 Create `Templates` Collection

**New file**: `src/collections/Templates.ts`

```typescript
// Collection: templates
// Fields:
//   name        - text, required (e.g. "Real Estate Modern", "Law Firm Classic")
//   slug        - text, required, unique (e.g. "real-estate-1", "legal-2")
//   category    - text, required (e.g. "real-estate", "legal", "restaurant")
//   preview     - upload, relationTo: 'media' (screenshot thumbnail)
//   tokensCss   - code/textarea, required (CSS variables)
//   chromeCss   - code/textarea, required (header/footer styles)
//   chromeHtml  - code/textarea, required (HTML with {{title}}, {{nav}}, {{content}})
//   configJson  - json, required ({ fonts: [], externals: [] })
```

### 1.2 Migrate Existing Templates

Write a one-time seed script that reads from `/template/` directory and creates records in the `templates` collection. After migration, `/template/` becomes reference-only.

### 1.3 Update Template Loader

Replace filesystem-based `src/templates/loader.ts` with a function that queries the `templates` collection by slug:

```typescript
// Before: reads from filesystem using NEXT_PUBLIC_SITE_TEMPLATE env var
// After:  queries Payload for template record by tenant's selected template
export async function loadTemplate(templateSlug: string) {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'templates',
    where: { slug: { equals: templateSlug } },
    limit: 1,
  })
  return result.docs[0]
}
```

### 1.4 Keep TEMPLATE_STANDARD.md

The standard (4 files: tokens.css, chrome.html, chrome.css, config.json) is excellent. It becomes the contract that AI-generated templates must follow. The only change is that the 4 files become 4 fields in a database record instead of 4 files on disk.

---

## Phase 2: Tenants — Multi-Tenant Architecture

**Why**: Currently each "site" requires separate env vars + separate build. For serving many businesses from one instance, we need tenant isolation at the data level.

### 2.1 Use `@payloadcms/plugin-multi-tenant`

Already in `package.json`. This plugin:
- Creates a `tenants` collection automatically
- Adds a `tenant` field to every collection you specify
- Filters admin panel data by current user's tenant
- Handles tenant switching in admin UI

### 2.2 Configure the Plugin

In `payload.config.ts`:

```typescript
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'

export default buildConfig({
  plugins: [
    multiTenantPlugin({
      tenantCollection: {
        slug: 'tenants',
        // Additional fields beyond what the plugin provides:
        fields: [
          { name: 'domain', type: 'text', required: true, unique: true },
          { name: 'template', type: 'relationship', relationTo: 'templates', required: true },
          { name: 'siteName', type: 'text', required: true },
          { name: 'tagline', type: 'text' },
          { name: 'metaTitle', type: 'text' },
          { name: 'metaDescription', type: 'textarea' },
          {
            name: 'hero',
            type: 'group',
            fields: [
              { name: 'heading', type: 'text' },
              { name: 'sub', type: 'text' },
              { name: 'cta', type: 'text' },
            ],
          },
          {
            name: 'features',
            type: 'array',
            maxRows: 6,
            fields: [
              { name: 'title', type: 'text', required: true },
              { name: 'desc', type: 'textarea', required: true },
            ],
          },
          {
            name: 'navLinks',
            type: 'array',
            fields: [
              { name: 'label', type: 'text', required: true },
              { name: 'href', type: 'text', required: true },
            ],
          },
          { name: 'footerText', type: 'text' },
          {
            name: 'industry',
            type: 'select',
            options: [
              { label: 'Real Estate', value: 'real-estate' },
              { label: 'Legal', value: 'legal' },
              { label: 'Restaurant', value: 'restaurant' },
              { label: 'Healthcare', value: 'healthcare' },
              { label: 'Other', value: 'other' },
            ],
          },
        ],
      },
      // Collections that should be tenant-scoped:
      collections: ['posts', 'media'],
    }),
  ],
  // ...
})
```

### 2.3 What This Replaces

| Before (hardcoded) | After (in Tenants collection) |
|---|---|
| `src/themes/realestate.ts` | Tenant record: siteName, hero, features, navLinks, footerText |
| `src/themes/lawfirm.ts` | Another tenant record |
| `src/themes/index.ts` | Delete — tenant config fetched from DB at runtime |
| `NEXT_PUBLIC_SITE_THEME` env var | Domain-based lookup in middleware |
| `NEXT_PUBLIC_SITE_TEMPLATE` env var | `tenant.template` relationship field |

**Delete these files:**
```
src/themes/index.ts
src/themes/realestate.ts
src/themes/lawfirm.ts
```

---

## Phase 3: Frontend Routing — Domain-Based Tenant Resolution

**Why**: Instead of env vars selecting the theme, the incoming domain determines which tenant's content and template to render.

### 3.1 Middleware for Tenant Resolution

**New file**: `src/middleware.ts`

```typescript
// On every request:
// 1. Read request hostname (e.g. "joespizza.com" or "joe.yourdomain.com")
// 2. Query tenants collection: where domain equals hostname
// 3. If found: set tenant ID in request headers/cookies
// 4. If not found: show 404 or default landing page
```

### 3.2 Update Frontend Layout

`src/app/(frontend)/layout.tsx` changes from:

```typescript
// Before: import static theme + template at module level
import { theme } from '../../themes'
import { template } from '../../templates/loader'
```

To:

```typescript
// After: fetch tenant + template dynamically per request
export default async function FrontendLayout({ children }) {
  const tenant = await getCurrentTenant()     // from middleware header
  const template = await loadTemplate(tenant.template)  // from DB
  // ... inject template CSS/HTML as before
}
```

### 3.3 Update Frontend Pages

All pages that currently use `theme.xxx` will instead receive tenant data:

- `page.tsx` (homepage): `tenant.hero`, `tenant.features`
- `blog/page.tsx`: `tenant.blog` (or just use a generic heading)
- `blog/[slug]/page.tsx`: No change needed (already queries by slug)

---

## Phase 4: Industry Extensions — Pluggable Collections

**Why**: Different industries need different data. Real estate needs listings, restaurants need menus, law firms need practice areas. But the core platform should work without any of them.

### 4.1 Strategy: Keep Industry Collections Separate but Optional

```
src/collections/
  ├── Posts.ts          # Core — every tenant gets this
  ├── Media.ts          # Core — every tenant gets this
  ├── Users.ts          # Core — every tenant gets this
  ├── Templates.ts      # Core — platform-level (not tenant-scoped)
  └── extensions/       # Industry-specific (tenant-scoped)
      ├── Services.ts   # Generic "services" — works for many industries
      └── Staff.ts      # Generic "team members" — works for many industries
```

### 4.2 How It Works

- `Services` and `Staff` are already generic enough to work across industries
- They get tenant-scoped via the multi-tenant plugin just like Posts
- In the admin panel, each tenant sees only their own Services/Staff
- On the frontend, pages check if the tenant has any Services/Staff records and render them if present
- Future industry collections (e.g. `MenuItems`, `Listings`, `Appointments`) follow the same pattern: add collection, add to multi-tenant plugin config, add optional frontend page

### 4.3 No Need for Blocks Field (Yet)

The current page structure (hero + features + blog) is simple enough that it doesn't warrant a full block-based page builder. Keep it simple:
- Homepage content comes from tenant fields (hero, features)
- Blog comes from Posts collection
- Services/Staff come from their respective collections
- If a tenant has no Services, that page simply doesn't appear

---

## Phase 5: Seed & Onboarding

### 5.1 Replace Hardcoded Seeds

**Delete:**
```
src/seed.ts           # Hardcoded for "Luxe Realty"
src/seed-lawfirm.ts   # Hardcoded for "Sterling & Associates"
```

**New**: `src/seed.ts` that:
1. Creates a platform admin user
2. Seeds all templates from `/template/` directory into Templates collection
3. Creates 2 example tenants (real-estate, law-firm) with sample posts

### 5.2 Tenant Onboarding Flow (Future)

Eventually: a script or API endpoint that:
1. Creates a new tenant record (siteName, domain, template selection)
2. Creates an admin user for that tenant
3. Seeds default pages/posts for the selected industry
4. DNS/domain configuration instructions

---

## Phase 6: Simplify Build & Deploy

### 6.1 Remove Multi-Build Scripts

**Before** (package.json):
```json
"dev:lawfirm": "NEXT_PUBLIC_SITE_THEME=lawfirm next dev",
"build:lawfirm": "...",
"build:both": "...",
"start:both": "..."
```

**After**: Just one build, one deployment. All tenant differences are resolved at runtime.
```json
"dev": "next dev",
"build": "next build",
"start": "next start",
"seed": "tsx src/seed.ts"
```

### 6.2 Remove Theme/Template Env Vars

No more `NEXT_PUBLIC_SITE_THEME` or `NEXT_PUBLIC_SITE_TEMPLATE`. Everything comes from the database via tenant resolution.

---

## Final File Structure

```
src/
├── payload.config.ts              # + multi-tenant plugin, + Templates collection
├── seed.ts                        # Seeds templates + example tenants
├── middleware.ts                   # NEW: domain → tenant resolution
├── collections/
│   ├── Users.ts                   # Unchanged
│   ├── Media.ts                   # + tenant-scoped via plugin
│   ├── Posts.ts                   # + tenant-scoped via plugin
│   ├── Templates.ts               # NEW: stores AI-generated templates as data
│   └── extensions/
│       ├── Services.ts            # + tenant-scoped, optional
│       └── Staff.ts               # + tenant-scoped, optional
├── access/
│   └── roles.ts                   # Unchanged
├── templates/
│   └── loader.ts                  # Rewritten: DB query instead of filesystem
└── app/
    ├── (frontend)/
    │   ├── layout.tsx             # Rewritten: dynamic tenant + template loading
    │   ├── page.tsx               # Updated: use tenant data instead of theme import
    │   ├── blog/
    │   │   ├── page.tsx           # Updated: use tenant data
    │   │   └── [slug]/page.tsx    # Minimal change (already data-driven)
    │   └── globals.css            # Kept
    └── (payload)/                 # Unchanged (auto-generated by Payload)
        ├── admin/
        ├── api/
        └── custom/
```

**Deleted** (~600 lines):
```
src/themes/                        # Entire directory (3 files)
src/components/DashboardShell.tsx
src/components/PostForm.tsx
src/components/Editor.tsx
src/lib/auth.ts
src/app/(frontend)/dashboard/      # Entire directory (10 files)
src/seed-lawfirm.ts
```

---

## Execution Order

| Step | Phase | What | Risk | Est. Files Changed |
|------|-------|------|------|-------------------|
| 1 | Phase 0 | Delete custom dashboard + Tiptap deps | Low (removing code) | -13 files |
| 2 | Phase 1.1 | Create Templates collection | Low | +1 file |
| 3 | Phase 1.2 | Write template migration seed | Low | +1 file |
| 4 | Phase 1.3 | Update template loader to query DB | Low | ~1 file |
| 5 | Phase 2.1-2.2 | Configure multi-tenant plugin + tenant fields | Medium | ~2 files |
| 6 | Phase 2.3 | Delete themes directory | Low | -3 files |
| 7 | Phase 3.1 | Add middleware for tenant resolution | Medium | +1 file |
| 8 | Phase 3.2-3.3 | Update layout + pages to use tenant data | Medium | ~4 files |
| 9 | Phase 4 | Move Services/Staff to extensions/ | Low | ~2 files |
| 10 | Phase 5 | Rewrite seed script | Low | ~2 files |
| 11 | Phase 6 | Simplify package.json scripts | Low | 1 file |

---

## Key Payload Features Used

| Feature | How We Use It |
|---|---|
| **Multi-Tenant Plugin** | Tenant isolation for all content collections |
| **Admin Panel** | Replaces entire custom dashboard (auth, CRUD, media, users) |
| **Lexical Editor** | Already configured — replaces custom Tiptap editor |
| **Local API** (`payload.find/create`) | Frontend fetches tenant + template + content server-side |
| **Relationship Fields** | Tenant → Template link |
| **Access Control** | Tenant-scoped data visibility + role-based permissions |
| **Upload Collection** | Media management (already working) |
| **Admin Groups** | Organize collections in sidebar (Content, Settings, Platform) |

---

## What Stays the Same

1. **Template standard** — The 4-file contract (tokens.css, chrome.css, chrome.html, config.json) is preserved exactly. The only difference is storage location (DB fields vs filesystem).
2. **CSS injection pattern** — Layout still injects template CSS/HTML via `dangerouslySetInnerHTML`. This pattern works well and doesn't need to change.
3. **Posts collection schema** — Title, slug, excerpt, contentHtml, status, publishedAt. All the same.
4. **Next.js App Router** — Same routing structure for frontend pages.
5. **Vercel Postgres** — Same database adapter.
