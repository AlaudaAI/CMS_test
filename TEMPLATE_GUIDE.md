# Template & Extension Guide

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

## Template File Structure

Each template lives in `template/{category}/{slug}/` with 4 files:

```
template/
  dental/
    dental-1/
      config.json       External resources (fonts, CSS libraries)
      tokens.css        CSS custom properties
      chrome.html       Header/footer HTML with placeholders
      chrome.css        Header/footer styles
```

### Required Files

**tokens.css** — CSS variables under `:root`
```css
:root {
  /* Required */
  --bg: #ffffff;        --fg: #111111;
  --muted: #6b7280;    --border: #e5e7eb;
  --font: 'Inter', sans-serif;
  --radius: 8px;
  --spacing-sm: 12px;  --spacing-md: 20px;
  --spacing-lg: 40px;  --spacing-xl: 64px;

  /* Optional */
  --card-bg: #f9fafb;  --accent: #2563eb;  --accent-fg: #ffffff;
  --nav-bg: #ffffff;   --max-w: 1100px;    --transition: 0.2s ease;
}
```

**chrome.html** — Must contain exactly these 3 placeholders:
```html
<header>
  <a href="/">{{title}}</a>
  <nav>{{nav}}</nav>
</header>

<main class="content">{{content}}</main>

<footer>{{title}} &copy; 2025</footer>
```

**chrome.css** — Styles for header/footer only. Do NOT include body resets or page content styles.

**config.json** — External font/CSS URLs:
```json
{
  "fonts": ["https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap"],
  "externals": []
}
```

A reference template is available at `template/_reference/`.

## Converting Existing HTML Templates

If you have a full HTML page, split it into the 4 files:

1. Extract all CSS variables (colors, fonts, spacing) → `tokens.css`
2. Cut the `<header>...</header>` and `<footer>...</footer>` → `chrome.html`, insert `<main class="content">{{content}}</main>` between them
3. Replace the site name with `{{title}}`, navigation links with `{{nav}}`
4. Move header/footer styles → `chrome.css`
5. Move Google Fonts / external CSS `<link>` tags → `config.json`
6. **Discard** the page body content (hero, features, etc.) — CMS handles that

## Adding a New Industry + Template: Step by Step

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
# Create the collection file
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

## Existing Extension Collections

| Collection | Fields | Use Case |
|---|---|---|
| Services | title, slug, description, icon, status | Service listings (legal, dental, etc.) |
| Staff | name, slug, role, bio, photo | Team member profiles |

Both are multi-tenant (each tenant has their own records) and accessible at `/api/services` and `/api/staff`.
