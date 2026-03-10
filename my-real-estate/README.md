# Multi-Tenant CMS Platform

A multi-tenant content management system built with [Payload CMS 3](https://payloadcms.com/) and [Next.js 15](https://nextjs.org/). Each tenant gets an isolated website with its own domain, template, and content — all managed from a single admin panel.

## Quick Start

```bash
cp .env.example .env
# Fill in POSTGRES_URL and PAYLOAD_SECRET

npm install
npm run seed     # creates admin user + sample data
npm run dev      # http://localhost:3000/admin
```

## Default Credentials

| Email | Password | Role |
|---|---|---|
| `admin@platform.com` | `changeme123` | Admin (full access) |

> Created by `npm run seed`. Change the password after first login.

## Environment Variables

| Variable | Description |
|---|---|
| `POSTGRES_URL` | Vercel Postgres connection string |
| `PAYLOAD_SECRET` | Secret key for auth tokens and password hashing |
| `NEXT_PUBLIC_SITE_URL` | Public URL of the deployment |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Generate import map + production build |
| `npm run seed` | Seed database with admin user, templates, tenants, and sample posts |

## Deployment (Vercel)

1. Connect the repo to Vercel
2. Set root directory to `my-real-estate`
3. Add environment variables (`POSTGRES_URL`, `PAYLOAD_SECRET`)
4. Deploy — Vercel runs `npm run build` automatically

## Project Structure

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full system design.
