# my_CMS_test

Multi-theme CMS built with **Payload CMS 3** + **Next.js 15**.
Two industry verticals (Real Estate, Legal) with swappable visual templates.

## Project Structure

```
my_CMS_test/
├── template/                        # Visual templates (pure HTML/CSS, no JS)
│   ├── TEMPLATE_STANDARD.md         #   Template authoring spec
│   ├── real-estate/
│   │   ├── real-estate-1/           #   Brutalist grid layout
│   │   └── real-estate-2/           #   Editorial / magazine layout
│   └── legal/
│       ├── legal-1/                 #   Sidebar navigation layout
│       └── legal-2/                 #   Classic top-nav layout
│
└── my-real-estate/                  # Next.js + Payload app
    └── src/
        ├── payload.config.ts        # Payload config (collections, DB, editor)
        ├── collections/             # Posts, Media, Services, Staff, Users
        ├── themes/                  # Theme content configs (copy, nav links, hero)
        ├── templates/loader.ts      # Reads template files from template/ at build time
        ├── components/              # Dashboard UI components
        └── app/
            ├── (frontend)/
            │   ├── layout.tsx       # Injects template chrome (header/footer)
            │   ├── page.tsx         # Homepage (static from theme config)
            │   ├── blog/            # Blog list + detail (reads from Payload)
            │   └── dashboard/       # Custom admin dashboard
            └── (payload)/           # Payload admin panel + API routes
```

## Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 15** | App Router frontend |
| **Payload CMS 3** | Headless CMS (collections, auth, API) |
| **Vercel Postgres** | Database |
| **Lexical** | Rich text editor (Payload default) |
| **Tiptap** | Rich text editor (custom dashboard) |

## Quick Start

```bash
cd my-real-estate
npm install

# Pick a theme + template
NEXT_PUBLIC_SITE_THEME=realestate NEXT_PUBLIC_SITE_TEMPLATE=real-estate/real-estate-1 npm run dev
# or
NEXT_PUBLIC_SITE_THEME=lawfirm NEXT_PUBLIC_SITE_TEMPLATE=legal/legal-2 npm run dev
```

- **Frontend**: http://localhost:3000
- **Dashboard**: http://localhost:3000/dashboard
- **Payload Admin**: http://localhost:3000/admin

## Environment Variables

| Variable | Purpose | Default |
|---|---|---|
| `NEXT_PUBLIC_SITE_THEME` | Content theme (`realestate` / `lawfirm`) | `realestate` |
| `NEXT_PUBLIC_SITE_TEMPLATE` | Visual template (`real-estate/real-estate-1`, etc.) | `real-estate/real-estate-1` |
| `PAYLOAD_SECRET` | Payload encryption secret | — |
| `POSTGRES_URL` | Database connection string | — |

## Default Accounts

| Theme | Email | Password |
|---|---|---|
| Real Estate | `admin@luxerealty.com` | `changeme123` |
| Law Firm | `admin@sterlinglaw.com` | `changeme123` |
