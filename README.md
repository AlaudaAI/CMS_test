# CMS

Multi-tenant CMS built with **Payload CMS 3** + **Next.js 15**.
Supports multiple tenants (e.g. real estate agencies) with domain-based routing and swappable visual templates.

## Project Structure

```
my_CMS_test/
├── template/                        # Visual templates (pure HTML/CSS, no JS)
│   ├── real-estate/
│   │   ├── real-estate-1/           #   Brutalist grid layout
│   │   └── real-estate-2/           #   Editorial / magazine layout
│   └── legal/
│       ├── legal-1/                 #   Sidebar navigation layout
│       └── legal-2/                 #   Classic top-nav layout
│
├── TEMPLATE_GUIDE.md                # Template authoring guide
│
└── my-real-estate/                  # Next.js + Payload app
    └── src/
        ├── payload.config.ts        # Payload config (collections, DB, plugins)
        ├── collections/             # Posts, Media, Services, Staff, Users, Tenants, Templates
        ├── templates/loader.ts      # Reads template from DB + disk at runtime
        ├── lib/tenant.ts            # Tenant resolution via Host header
        └── app/
            ├── (frontend)/
            │   ├── layout.tsx       # Injects template chrome (header/footer)
            │   ├── page.tsx         # Homepage
            │   └── blog/            # Blog list + detail (reads from Payload)
            └── (payload)/           # Payload admin panel + API routes
```

## Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 15** | App Router frontend |
| **Payload CMS 3** | Headless CMS (collections, auth, multi-tenant plugin) |
| **PostgreSQL** | Database |
| **Vercel Blob** | Media storage |
| **Lexical** | Rich text editor |

## Quick Start

```bash
cd my-real-estate
createdb my_cms
cp .env.example .env
# Set POSTGRES_URL=postgres://localhost:5432/my_cms
# Set PAYLOAD_SECRET=replace-this-with-a-random-secret
npm install
npm run seed
npm run dev
```

- PostgreSQL must be installed and running before you seed or start the app.
- **Frontend**: http://localhost:3000
- **Payload Admin**: http://localhost:3000/admin

## Environment Variables

| Variable | Purpose |
|---|---|
| `PAYLOAD_SECRET` | Payload encryption secret |
| `POSTGRES_URL` | Database connection string, for example `postgres://localhost:5432/my_cms` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob storage token (optional, for media uploads) |

## Default Admin Account

| Email | Password |
|---|---|
| `admin@platform.com` | `changeme123` |
