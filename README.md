# Personal Site Studio

A minimal, block-based personal homepage studio built with Next.js. It gives you a public bio page, a modular portfolio layout, and a password-protected admin editor for updating content without editing code.

This project is intended to become a reusable public template. The current sample content is placeholder data and should be replaced with your own profile, links, projects, and deployment settings.

## Features

- Public personal bio / portfolio page
- Password-protected `/admin` editor
- Visual desktop and mobile layout editing
- Block cards for projects, links, images, text, status updates, videos, and social links
- Text-section rows that can be moved independently from block cards
- Top-level block grid for cards that do not belong to a section
- Image upload and crop workflow with fixed and custom crop ratios
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
- `sections`: text rows used as visual separators or headings
- `blocks`: project/link/image/text/social/video/status cards
- `theme`: colors, radius, shadow, and font settings
- `settings`: site settings and internal layout order metadata

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
