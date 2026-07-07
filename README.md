# Personal Site Studio

A minimal, block-based personal homepage studio built with Next.js. It gives you a public bio page, a modular portfolio layout, and a password-protected admin editor for updating content without editing code.

This project is intended to become a reusable public template. The current sample content is placeholder data and should be replaced with your own profile, links, projects, and deployment settings.

## Features

- Public personal bio / portfolio page
- Password-protected `/admin` editor
- Visual desktop and mobile layout editing
- Project settings for admin naming, public page title, description, URL, and simple theme controls
- Block cards for projects, links, images, text, status updates, videos, and social links
- Full-width text blocks for section-like headings; they are blocks, not containers
- Shared content ordering so cards can sit above, below, or between text blocks
- Image upload and crop workflow with fixed and custom crop ratios
- JSON config export and import from the admin editor
- JSON config persisted through Vercel Blob
- No traditional database required

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- dnd-kit
- Vercel Blob
- bcryptjs
- Zod
- Lucide React
- Sonner

## Routes

- `/` public profile page
- `/admin/login` admin login
- `/admin` visual admin editor
- `/api/admin/config` authenticated config read/write
- `/api/admin/upload` authenticated image upload

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

The public page works without Vercel Blob. When Blob is not configured, the site falls back to `lib/default-site-config.ts`.

## Environment Variables

Create `.env.local` from `.env.example`.

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
BLOB_READ_WRITE_TOKEN=
ADMIN_PASSWORD_HASH=
SESSION_SECRET=
```

Required for admin save/upload in production:

- `BLOB_READ_WRITE_TOKEN`: Vercel Blob read/write token.
- `ADMIN_PASSWORD_HASH`: bcrypt hash for the admin password.
- `SESSION_SECRET`: random secret with at least 32 characters.

Generate a password hash:

```bash
node -e "const bcrypt=require('bcryptjs'); bcrypt.hash(process.argv[1], 12).then(console.log)" "your-password"
```

Generate a session secret:

```bash
openssl rand -base64 48
```

Never expose `BLOB_READ_WRITE_TOKEN`, `ADMIN_PASSWORD_HASH`, or `SESSION_SECRET` with `NEXT_PUBLIC_`.

## Data Model

The site is driven by one validated config object:

- `profile`: avatar, name, bio, tags, social links, and profile module visibility
- `sections`: legacy field kept empty by the current editor
- `blocks`: project/link/image/text/social/video/status cards plus full-width `section` text blocks
- `theme`: colors, radius, shadow, and font settings
- `settings`: project name, public site title, description, URL, SEO overrides, language settings, variant settings, feature toggles, and internal layout order metadata
- `contentVariants`: optional per-version/per-locale content snapshots keyed as `variantId:locale`

The admin top bar uses `settings.projectName`. The public page metadata uses:

- `settings.siteTitle`
- `settings.siteDescription`
- `settings.siteUrl`
- optional SEO overrides from `settings.seoTitle`, `settings.seoDescription`, `settings.seoCanonicalUrl`, and `settings.seoOgImage`

The root `profile`, `blocks`, `theme`, and metadata are the main version/main language. Extra audience versions are stored in `contentVariants` and fall back to the main content when a snapshot has not been edited yet. Languages are attached under each version; adding a language to a version creates that version/language snapshot, each version can choose its own main language, and hiding a language keeps the snapshot for later.

Hidden variant links use short paths such as `/u1`. A valid access code stores the selected variant in an HTTP-only cookie, redirects back to `/`, and keeps that version active for 10 homepage visits.

Config is saved to Vercel Blob at:

```text
config/site-config.json
```

Uploaded images are saved under:

```text
images/avatar
images/blocks
images/gallery
images/qrcode
```

## Deployment

1. Create a Vercel project from this repository.
2. Add the environment variables above.
3. Enable Vercel Blob for the project.
4. Deploy.
5. Visit `/admin/login` and sign in with the password used to create `ADMIN_PASSWORD_HASH`.
6. Open **项目设置** in the admin editor and set the project name, public site title, description, public URL, SEO fields, versions, and languages inside each version.
7. Save once to persist the production config to Vercel Blob.

## Config Import and Export

The admin editor can export the full `SiteConfig` as JSON from **项目设置**. Importing a JSON config replaces the current editor draft only; click **保存** after reviewing it to write the imported config to Vercel Blob.

Use exported configs for backup, migration between deployments, or local-to-production handoff. Do not put secrets or private notes in the config because the Blob-hosted config is public-readable.

## Validation

```bash
npm run lint
npm run typecheck
npm run build
npm audit --audit-level=moderate
```

## Documentation

- [Admin editor notes](docs/admin-editor-notes.md)
- [Project background for AI agents](docs/project-background.md)
- [Security and deployment notes](docs/security-and-deployment.md)

## Template Status

This is an active template project. Some product decisions are still evolving, especially around block types, export/import flows, and migration tooling. Treat the codebase as usable but still intentionally small and easy to reshape.
