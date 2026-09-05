# The Bread Forge

The official full-stack website for **Adullam Cave Christian Network (ACCN)** — a public, content-first
site for browsing sermons and events, plus a single-admin dashboard for publishing them. Built from the
PRD in `TheBreadForge_ACCN_Website_PRD.pdf`.

## Stack

| Layer      | Choice                                                                 |
| ---------- | ----------------------------------------------------------------------- |
| Framework  | Next.js 16 (App Router, Turbopack) + TypeScript                        |
| Styling    | Tailwind CSS v4                                                        |
| Animation  | Framer Motion (scroll reveals, hero, page/menu transitions)            |
| Database   | SQLite via Node's built-in `node:sqlite` (no native deps, zero setup)  |
| Auth       | JWT session cookie (`jose`) + bcrypt password hashing                  |
| File storage | Local disk, streamed back through a custom `/media/[...path]` route |
| Email      | `nodemailer` for password-reset links (falls back to console log)     |

This intentionally swaps a couple of the PRD's suggested choices (Postgres, S3/Cloudinary, NestJS) for
zero-dependency equivalents that need no external services to run. See **Scaling beyond v1** below for
how to swap them back in for a real deployment.

## Getting started

```bash
npm install
cp .env.example .env
# edit .env: set AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run dev
```

Open http://localhost:3000. The admin account named in `.env` is created automatically the first time
the server starts against an empty database. Sign in at `/admin/login`.

Generate a secret for `AUTH_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### Scripts

- `npm run dev` — start the dev server (Turbopack)
- `npm run build` — production build (also runs the TypeScript check)
- `npm run start` — run the production build
- `npm run lint` — ESLint

## Project layout

```
src/
  app/
    (site)/          Public pages: Home, About, Sermons, Events, Partnership, Contact
    admin/
      login|forgot-password|reset-password/   Public auth pages
      (dashboard)/    Protected admin: dashboard, sermons, events, categories CRUD
    api/              Route handlers (auth, categories, sermons, events)
    media/[...path]/   Streams uploaded files from disk (supports HTTP Range for audio/video seeking)
  components/
    site/             Public-facing UI (Navbar, Hero, cards, browsers, motion wrapper)
    admin/            Dashboard UI (forms, shell, auth forms)
  lib/
    db.ts             SQLite connection, schema, admin auto-seed
    repositories/     Data access (admin, category, sermon, event)
    auth.ts / session.ts   JWT session issuing/verification
    uploads.ts         File validation + disk persistence
    mailer.ts          Password-reset email (SMTP or console fallback)
    rate-limit.ts       In-memory rate limiting for login/forgot-password
  proxy.ts            Route protection for /admin/* (Next 16's middleware replacement)
data/                 SQLite database file (gitignored)
storage/uploads/       Uploaded sermon/event files (gitignored)
```

## How it maps to the PRD

- **Admin auth (5.1)** — single admin, seeded from env vars, bcrypt-hashed password, JWT session cookie
  scoped to `/admin/*` and all mutation APIs. Forgot-password issues a time-limited token; the reset link
  is emailed via SMTP if configured, otherwise printed to the server console for local use.
- **Sermon management (5.2/5.3)** — create/edit/delete with title, speaker, date, description, audio/video
  upload, optional cover image, optional PDF notes (used as the download instead of the media file), and
  categories (many-to-many, manageable from `/admin/categories`, creatable inline while editing a sermon).
  Public Sermons page filters by category and searches by title/speaker, with an in-page player and a
  download button.
- **Event management (5.4/5.5)** — create/edit/delete with title, description, date/time, location, and
  multiple attachments (images, video, PDF) per event. Public Events page separates upcoming vs. past
  (newest first) with a tab to view all.
- **Public downloads** — every sermon file and event PDF is reachable with no login, streamed through
  `/media/[...path]` (not Next's static `public/` folder, since that only serves files present at build
  time — admin uploads happen at runtime).
- **Core pages (5.7)** — Home, About (mandate + seven pillars), Partnership/Giving (AKS description +
  static giving account details, no payment processing), Contact (address, phone, service times, socials).
- **Design (5.6)** — warm gold/deep-ink palette, Playfair Display for headings, scroll-reveal and hover
  animations via Framer Motion, mobile-first responsive layout.
- **Non-functional** — rate limiting on login/forgot-password, HTTP Range support for seeking in
  audio/video, path-traversal-safe file serving, indexable metadata per page.

## Scaling beyond v1

- **Database**: swap `src/lib/db.ts` for Postgres (e.g. `pg` or Prisma) once you need concurrent writers
  or a managed backup story — the repository functions in `src/lib/repositories/*` are the only callers
  of `db`, so that's the whole surface to port.
- **File storage**: swap `src/lib/uploads.ts` and `src/app/media/[...path]/route.ts` for S3/Cloudinary +
  CDN once file volume or multi-instance hosting demands it.
- **Rate limiting**: `src/lib/rate-limit.ts` is in-memory and per-process — move to a shared store (e.g.
  Redis) before running more than one server instance.
- **Multi-admin**: the schema has a single `admin` table with no roles; adding staff accounts means adding
  a role column and updating the session/guard logic in `src/lib/session.ts` and `src/proxy.ts`.
- **Online giving**: the Partnership page currently renders static account details only, per the PRD's v1
  scope — wire up a payment gateway there when that's ready.
