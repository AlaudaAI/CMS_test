# Multi-Tenant CMS

A multi-tenant CMS built with Payload CMS 3 + Next.js 15. Each tenant gets its own website with custom templates — managed from one admin panel.

## Requirements

- **Node.js 22+** — `brew install node@22` (macOS) or [nodejs.org](https://nodejs.org)

That's it. SQLite is used by default — no database to install.

## Get Started

```bash
git clone git@github.com:AlaudaAI/CMS.git
cd CMS/my-real-estate
bash setup.sh        # installs deps, seeds data
npm run dev          # starts the server
```

Open http://localhost:3000 — that's it.

**Admin panel:** http://localhost:3000/admin
**Login:** `admin@platform.com` / `changeme123`

## What's Inside

| URL | What |
|---|---|
| `/` | Homepage (Luxe Realty — real estate template) |
| `/blog` | Blog posts (tenant-isolated) |
| `/admin` | Payload CMS admin panel |

Two demo tenants are seeded: a real estate agency (port 3000) and a law firm (port 3001), each with their own template and blog posts.

## Using PostgreSQL (optional)

For production or if you prefer Postgres, set `POSTGRES_URL` in your `.env`:

```
POSTGRES_URL=postgres://localhost:5432/my_cms
```

## Docs

- [ARCHITECTURE.md](./ARCHITECTURE.md) — System design
- [TEMPLATE_GUIDE.md](./TEMPLATE_GUIDE.md) — How templates work
