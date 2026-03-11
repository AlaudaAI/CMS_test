# Multi-Tenant CMS Platform

A multi-tenant content management system built with [Payload CMS 3](https://payloadcms.com/) and [Next.js 15](https://nextjs.org/). Each tenant gets an isolated website with its own domain, template, and content — all managed from a single admin panel.

## Prerequisites

You need these installed before anything else:

| Requirement | macOS Install | Check |
|---|---|---|
| **Node.js 22+** | `brew install node@22` | `node -v` → should show v22.x |
| **PostgreSQL 17** | `brew install postgresql@17` | `psql --version` |

After installing PostgreSQL, **start it**:

```bash
brew services start postgresql@17
```

> **PATH note (macOS):** If `node` or `psql` aren't found after install, add this to your `~/.zshrc`:
> ```bash
> export PATH="/opt/homebrew/opt/node@22/bin:/opt/homebrew/opt/postgresql@17/bin:$PATH"
> ```
> Then restart your terminal or run `source ~/.zshrc`.

## Setup (First Time)

```bash
# 1. Clone the repo
git clone git@github.com:AlaudaAI/CMS.git
cd CMS/my-real-estate

# 2. Install dependencies
npm install

# 3. Create the database
createdb my_cms

# 4. Create your .env file
cp .env.example .env
```

Edit `.env` with these values:

```env
POSTGRES_URL=postgres://localhost:5432/my_cms
PAYLOAD_SECRET=any-random-string-here-make-it-long
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

```bash
# 5. Seed the database (creates admin user, templates, tenants, sample blog posts)
npm run seed

# 6. Start the dev server
npm run dev
```

## What to See

Once the server is running:

| URL | What's There |
|---|---|
| `http://localhost:3000` | **Homepage** — Luxe Realty (real estate template with hero + features) |
| `http://localhost:3000/blog` | **Blog list** — only shows posts belonging to this tenant |
| `http://localhost:3000/blog/first-time-buyer-tips` | **Blog post** — full article page |
| `http://localhost:3000/admin` | **Admin panel** — manage all content, templates, and tenants |

### Test Tenant Isolation

The seed creates two tenants:

| Tenant | Domain | Industry |
|---|---|---|
| Luxe Realty | `localhost:3000` | Real Estate |
| Sterling & Associates | `localhost:3001` | Legal |

Try accessing `http://localhost:3000/blog/car-accident-guide` — this is a Sterling & Associates post. It should return **404** because you're on the Luxe Realty domain. That's tenant isolation working correctly.

## Default Login

| Email | Password | Role |
|---|---|---|
| `admin@platform.com` | `changeme123` | Admin (full access) |

> Created by `npm run seed`. Change the password after first login.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `POSTGRES_URL` | Yes | PostgreSQL connection string, e.g. `postgres://localhost:5432/my_cms` |
| `PAYLOAD_SECRET` | Yes | Secret key for auth tokens and password hashing |
| `NEXT_PUBLIC_SITE_URL` | No | Public URL of the deployment |
| `BLOB_READ_WRITE_TOKEN` | No | Vercel Blob token (for media uploads in production) |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server on http://localhost:3000 |
| `npm run build` | Production build (generates import map first) |
| `npm run seed` | Seed database with admin user, templates, tenants, and sample posts |

## Starting Fresh

If you want to reset everything and start over:

```bash
dropdb my_cms
createdb my_cms
npm run seed
npm run dev
```

## Deployment (Vercel)

1. Connect the repo to Vercel
2. Set root directory to `my-real-estate`
3. Add environment variables (`POSTGRES_URL`, `PAYLOAD_SECRET`, `BLOB_READ_WRITE_TOKEN`)
4. Deploy — Vercel runs `npm run build` automatically

## Project Structure

See [ARCHITECTURE.md](../ARCHITECTURE.md) for the full system design and [TEMPLATE_GUIDE.md](../TEMPLATE_GUIDE.md) for how templates work.
