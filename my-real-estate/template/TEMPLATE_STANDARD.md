# Template Standard

## File Structure

```
template/{category}/{name}/
  tokens.css      # CSS variables (required)
  chrome.html     # Header + content slot + footer (required)
  chrome.css      # Styles for chrome elements (required)
  config.json     # Font/external links (required)
  homepage.html   # Full preview page (optional)
  subpage.html    # Full preview subpage (optional)
```

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

## chrome.css

Styles for all elements in chrome.html. Rules:

- Only style chrome elements (header, footer, sidebar, nav, etc.)
- Do NOT include page content styles (hero, blog, cards, etc.)
- Do NOT include resets (`*`, `body`, `html`, `a`, `img`)
- Use standard variable names from tokens.css
- Include responsive `@media` rules as needed

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

## CSS Class Naming

No strict convention required, but:

- Chrome classes should NOT conflict with these CMS page classes:
  `.hero`, `.hero-cta`, `.features`, `.feature-card`, `.blog-grid`, `.blog-card`,
  `.blog-card-img`, `.blog-card-body`, `.blog-card-meta`, `.article`, `.article-meta`,
  `.article-cover`, `.article-content`, `.page-header`, `.empty-state`
- Namespacing with BEM (`header__logo`) or prefix (`t-header`) is recommended

## Usage

```bash
# Set template via environment variable
NEXT_PUBLIC_SITE_TEMPLATE=legal/legal-1 npm run dev

# Convert legacy templates to standard format
node scripts/convert-template.js template/category/name
```
