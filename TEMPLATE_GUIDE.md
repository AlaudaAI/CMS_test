# Template Guide

## How Templates Work

Templates provide the **visual shell** (header, footer, nav, colors, fonts) for tenant websites. Page content comes from CMS collections (Posts, Services, etc.).

```
┌─ Template (shell) ──────────────────────┐
│  header  +  nav                         │
│  ┌─ {{content}} ─────────────────────┐  │
│  │  Rendered by Next.js pages using  │  │
│  │  data from CMS collections        │  │
│  └───────────────────────────────────┘  │
│  footer                                 │
└─────────────────────────────────────────┘
```

**Runtime flow:**

1. Request comes in → `tenant.ts` resolves tenant by `Host` header
2. `layout.tsx` loads the tenant's assigned template from DB
3. `{{title}}` → `tenant.siteName`, `{{nav}}` → `tenant.navLinks`, `{{content}}` → page output
4. CSS tokens + chrome styles injected as `<style>` tags
5. Page components query collections (Posts, Services, etc.) and render inside `{{content}}`

Templates don't know about collections. Collections don't know about templates. They are decoupled — templates handle appearance, collections handle data.

---

## File Structure

Each template lives in `template/{category}/{slug}/` with 4 required files and 2 optional preview files:

```
template/{category}/{slug}/
  tokens.css        CSS custom properties (required)
  chrome.html       Header + content slot + footer (required)
  chrome.css        Styles for chrome elements (required)
  config.json       Font/external links (required)
  homepage.html     Full preview page (optional)
  subpage.html      Full preview subpage (optional)
```

A reference template is available at `template/_reference/`.

---

## tokens.css

All variables must use standard names under `:root`.

### Required Variables

```css
:root {
  --bg:          /* page background */;
  --fg:          /* primary text color */;
  --muted:       /* secondary/dimmed text */;
  --border:      /* border color */;
  --font:        /* primary font-family */;
  --radius:      /* default border-radius */;
  --spacing-sm:  /* small spacing (8-16px) */;
  --spacing-md:  /* medium spacing (16-24px) */;
  --spacing-lg:  /* large spacing (32-48px) */;
  --spacing-xl:  /* extra large spacing (48-80px) */;
}
```

### Optional Variables

```css
:root {
  --card-bg:        /* card/panel background, defaults to --bg */;
  --accent:         /* accent color for buttons/links, defaults to --fg */;
  --accent-fg:      /* text on accent background, defaults to --bg */;
  --font-secondary: /* secondary font-family */;
  --nav-bg:         /* header/nav background */;
  --max-w:          /* content max-width, defaults to 1100px */;
  --transition:     /* default transition */;
  --spacing-xs:     /* extra small spacing */;
  --spacing-2xl:    /* extra extra large spacing */;
  --spacing-3xl:    /* 3x large spacing */;
  /* Add any template-specific vars freely */
}
```

---

## chrome.html

Must contain exactly 3 placeholders:

| Placeholder   | Replaced with                              |
|---------------|--------------------------------------------|
| `{{title}}`   | Site name (text)                           |
| `{{nav}}`     | Navigation links as `<a href="...">Label</a>` |
| `{{content}}` | Page content (single occurrence)           |

### Structure Rules

- `{{content}}` must appear exactly once, wrapped in `<main class="content">`
- `{{nav}}` outputs bare `<a>` tags — do NOT wrap in `<ul>`, use `<div>` or `<nav>` instead
- Layout is free (top-nav, sidebar, split, etc.)

### Example (top-nav)

```html
<!-- HEADER -->
<header class="header">
  <a href="/" class="header__logo">{{title}}</a>
  <nav class="header__nav">{{nav}}</nav>
</header>

<main class="content">{{content}}</main>

<!-- FOOTER -->
<footer class="footer">
  <span>&copy; 2025 {{title}}</span>
</footer>
```

### Example (sidebar)

```html
<!-- HEADER -->
<header class="mobile-header">
  <span class="brand">{{title}}</span>
  <button class="hamburger" aria-label="Menu"><span></span><span></span><span></span></button>
</header>

<aside class="sidebar">
  <div class="sidebar__brand">{{title}}</div>
  <nav class="sidebar__nav">{{nav}}</nav>
</aside>

<main class="content">{{content}}</main>

<!-- FOOTER -->
<footer class="footer">
  <span>&copy; 2025 {{title}}</span>
</footer>
```

---

## chrome.css

Styles for all elements in chrome.html. Rules:

- Only style chrome elements (header, footer, sidebar, nav, etc.)
- Do NOT include page content styles (hero, blog, cards, etc.)
- Do NOT include resets (`*`, `body`, `html`, `a`, `img`)
- Use standard variable names from tokens.css
- Include responsive `@media` rules as needed

### CSS Class Naming

No strict convention required, but chrome classes must NOT conflict with these CMS page classes:

`.hero`, `.hero-cta`, `.features`, `.feature-card`, `.blog-grid`, `.blog-card`,
`.blog-card-img`, `.blog-card-body`, `.blog-card-meta`, `.article`, `.article-meta`,
`.article-cover`, `.article-content`, `.page-header`, `.empty-state`

Namespacing with BEM (`header__logo`) or prefix (`t-header`) is recommended.

---

## config.json

```json
{
  "fonts": [
    "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
  ],
  "externals": [
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
  ]
}
```

- `fonts`: Google Fonts URLs (array, can be empty)
- `externals`: Other CDN stylesheets (array, omit if empty)

---

## Converting Existing HTML Templates

If you have a full HTML page, split it into the 4 files:

1. Extract all CSS variables (colors, fonts, spacing) → `tokens.css`
2. Cut the `<header>...</header>` and `<footer>...</footer>` → `chrome.html`, insert `<main class="content">{{content}}</main>` between them
3. Replace the site name with `{{title}}`, navigation links with `{{nav}}`
4. Move header/footer styles → `chrome.css`
5. Move Google Fonts / external CSS `<link>` tags → `config.json`
6. **Discard** the page body content (hero, features, etc.) — CMS handles that

---

## Adding a New Industry + Template

### 1. Create template files on disk

```bash
mkdir -p template/dental/dental-1
# Create the 4 files (tokens.css, chrome.html, chrome.css, config.json)
# Use template/_reference/ as a starting point
```

### 2. Add category to Templates collection (if new)

Edit `src/collections/Templates.ts` — add to the `category` options:

```ts
options: [
  { label: 'Real Estate', value: 'real-estate' },
  { label: 'Legal', value: 'legal' },
  { label: 'Dental', value: 'dental' },        // ← add
],
```

### 3. Register in seed script

Edit `src/seed.ts`:

```ts
// Add category to the scan list
const categories = ['real-estate', 'legal', 'dental']   // ← add

// Add a sample tenant (optional)
const tenants = [
  // ...existing tenants...
  {
    name: 'Bright Smile Dental',
    domain: 'localhost:3002',
    template: templateRecords['dental-1']?.id,
    siteName: 'Bright Smile Dental',
    // ...hero, navLinks, features, etc.
  },
]
```

### 4. Add extension collections (if needed)

If this industry needs custom data (e.g., `Menu` for restaurants), create a collection:

```bash
cat > src/collections/extensions/Menu.ts << 'EOF'
import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../../access/roles'

export const Menu: CollectionConfig = {
  slug: 'menu',
  admin: { useAsTitle: 'name', group: 'Content' },
  access: {
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, admin: { position: 'sidebar' } },
    { name: 'price', type: 'number', required: true },
    { name: 'description', type: 'textarea' },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    {
      name: 'status', type: 'select', defaultValue: 'draft',
      options: [{ label: 'Draft', value: 'draft' }, { label: 'Published', value: 'published' }],
      admin: { position: 'sidebar' },
    },
  ],
}
EOF
```

Then register it in `src/payload.config.ts`:

```ts
import { Menu } from './collections/extensions/Menu'

collections: [Users, Media, Posts, Templates, Tenants, Services, Staff, Menu],

plugins: [
  multiTenantPlugin({
    collections: {
      posts: {},
      media: {},
      services: {},
      staff: {},
      menu: {},          // ← add (enables tenant isolation)
    },
    // ...
  }),
],
```

### 5. Create frontend pages for the collection

Add a page that queries the new collection:

```bash
mkdir -p src/app/\(frontend\)/menu
```

Create `src/app/(frontend)/menu/page.tsx` that fetches from the `menu` collection and renders within the template's `{{content}}` area.

### 6. Seed and test

```bash
npm run seed          # imports templates + creates tenants
npm run dev           # verify at http://localhost:3000
```

---

## Existing Extension Collections

| Collection | Fields | Use Case |
|---|---|---|
| Services | title, slug, description, icon, status | Service listings (legal, dental, etc.) |
| Staff | name, slug, role, bio, photo | Team member profiles |

Both are multi-tenant (each tenant has their own records) and accessible at `/api/services` and `/api/staff`.

---

## Usage

```bash
# Set template via environment variable
NEXT_PUBLIC_SITE_TEMPLATE=legal/legal-1 npm run dev

# Convert legacy templates to standard format
node scripts/convert-template.js template/category/name
```
