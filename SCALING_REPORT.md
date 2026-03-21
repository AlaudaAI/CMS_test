# Scaling Report: Payload CMS Architecture & Multi-Site Strategy

## 1. Role of Payload CMS

Payload CMS is the **backend engine** embedded inside our Next.js application. It is not a separate service — it runs in the same process as Next.js.

What it provides:

- **Collections** — We define data models (`Users`, `Posts`, `Media`) in TypeScript config files. Payload creates the database tables and generates TypeScript types automatically.
- **Auto-generated APIs** — Every collection gets REST endpoints (`/api/posts`, `/api/media`, `/api/users`) and GraphQL support with zero extra code. Full CRUD out of the box.
- **Authentication** — Built into the `Users` collection. Handles login, sessions, password hashing, and access control.
- **Admin UI** — A React-based panel at `/admin` for content management. We also built a custom simpler dashboard at `/dashboard`.
- **File uploads** — The `Media` collection handles image uploads with Sharp for resizing.

## 2. Frontend–Backend Integration

```
┌─────────────────────────────────────────────┐
│  Next.js App (single deployment)            │
│                                             │
│  (frontend)                 (payload)       │
│  ┌──────────────┐          ┌──────────────┐ │
│  │ /             │          │ /admin       │ │
│  │ /blog         │◄────────│ /api/posts   │ │
│  │ /dashboard    │  fetch   │ /api/media   │ │
│  │ /dashboard/   │         │ /api/users   │ │
│  │   posts/new   │         │              │ │
│  └──────────────┘          └──────────────┘ │
│         │                        ▲          │
│         │    Server Components   │          │
│         └──► call getPayload()───┘          │
│              directly (no HTTP)             │
└─────────────────────────────────────────────┘
```

Two patterns:

1. **Server-side (direct)** — Next.js Server Components call `getPayload()` to query the database directly. No HTTP round-trip. Used for rendering pages (homepage, blog listing).
2. **Client-side (REST)** — Browser-side code calls `fetch('/api/posts', ...)` for interactive operations (create/edit/delete posts, upload media).

## 3. API Design for Multi-Site

Payload auto-generates these APIs per collection — no manual route writing needed:

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/posts` | GET | List all posts (supports pagination, filtering) |
| `/api/posts` | POST | Create a new post |
| `/api/posts/:id` | GET | Get a single post |
| `/api/posts/:id` | PATCH | Update a post |
| `/api/posts/:id` | DELETE | Delete a post |
| `/api/media` | GET/POST | List or upload media files |
| `/api/users` | GET/POST | User management |
| `/api/users/login` | POST | Authentication |
| `/api/users/me` | GET | Current user info |

To serve multiple clients, add a `SiteConfig` collection to store per-client settings (site name, theme, colors, contact info). The frontend reads this config to render the correct branding.

## 4. Providing Different Styles

Currently, themes are switched via the `NEXT_PUBLIC_SITE_THEME` environment variable. The theme config controls colors, fonts, hero content, and navigation — while Payload collections stay the same.

To support many different styles:

- **Create more theme config files** — one per industry (restaurant, dental, law firm, salon, etc.). Each file defines colors, fonts, hero defaults, section layout.
- **Store client overrides in the database** — Add a `SiteConfig` collection in Payload with fields for colors, logo, tagline, etc. At render time, merge the base theme with client overrides:

```ts
const theme = { ...baseThemeDefaults, ...clientSiteConfig }
```

This way, a dental client and a restaurant client can use completely different visual styles without any code changes — just different config values.

## 5. Handling Different Client Requirements

Three levels of customization:

| Level | Example | How to Implement |
|---|---|---|
| **Config only** | Different colors, logo, contact info, copy | Change values in `SiteConfig` collection. No code changes. |
| **Section layout** | Client A wants a gallery, Client B wants testimonials | Build a library of reusable page sections (Hero, Services, Testimonials, Gallery, FAQ, Contact Form, etc.). Each client's page is a list of section IDs stored in the database. |
| **Unique features** | One client needs online booking, another needs e-commerce | These require custom development per client. Keep them as separate add-on modules that can be enabled/disabled per site. |

Most small business clients (80%+) will only need config-level changes. The section system handles another 15%. Only a small fraction will need custom code.
