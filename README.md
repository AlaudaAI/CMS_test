# my_CMS_test

Multi-tenant CMS built with **Payload CMS 3** + **Next.js 15**.
Multiple industry verticals (Real Estate, Legal) with swappable visual templates, all managed through the CMS.

## Architecture

```
Template files (disk)  ──→  npm run seed  ──→  Templates collection (DB)
                                          ──→  Tenants collection (DB)
                                                        │
Host header  ──→  tenant.ts  ──→  find Tenant  ──→  find linked Template
                                                        │
                                          layout.tsx assembles chrome HTML/CSS + page content
```

**Templates** provide the visual shell (header, footer, nav, colors, fonts).
**Tenants** provide site configuration (name, hero, features, nav links).
**Collections** (Posts, Services, Staff) provide page content.

All three are decoupled and composed at runtime in `layout.tsx`.

## Project Structure

```
my_CMS_test/
├── template/                        # Visual templates (pure HTML/CSS)
│   ├── _reference/                  #   Reference template (starting point)
│   ├── real-estate/
│   │   ├── real-estate-1/           #   Brutalist grid layout
│   │   └── real-estate-2/           #   Editorial / magazine layout
│   └── legal/
│       ├── legal-1/                 #   Sidebar navigation layout
│       └── legal-2/                 #   Classic top-nav layout
│
├── TEMPLATE_GUIDE.md                # Template spec + authoring guide
│
└── my-real-estate/                  # Next.js + Payload app
    └── src/
        ├── payload.config.ts        # Payload config (collections, DB, editor)
        ├── collections/             # Posts, Media, Services, Staff, Users, Templates, Tenants
        ├── lib/tenant.ts            # Resolves tenant by Host header
        ├── templates/loader.ts      # Loads template from Payload DB
        ├── components/              # Dashboard UI components
        └── app/
            ├── (frontend)/
            │   ├── layout.tsx       # Injects template chrome (header/footer)
            │   ├── page.tsx         # Homepage (hero + features from Tenant)
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

## Quick Start

```bash
cd my-real-estate
npm install
npm run seed    # imports templates into DB, creates tenants and sample posts
npm run dev
```

- **Frontend**: http://localhost:3000
- **Payload Admin**: http://localhost:3000/admin
- **Dashboard**: http://localhost:3000/dashboard

## Environment Variables

| Variable | Purpose | Default |
|---|---|---|
| `PAYLOAD_SECRET` | Payload encryption secret | — |
| `POSTGRES_URL` | Database connection string | — |

## Default Account

| Email | Password | Role |
|---|---|---|
| `admin@platform.com` | `changeme123` | admin |
