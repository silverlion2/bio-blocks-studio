<div align="center">

<h1>Personal Site Studio</h1>

<p>A visual personal homepage studio for building a bio page, portfolio, link hub, and lightweight project showcase with Next.js.</p>

<p>No traditional database is required. The public page renders your site, <code>/admin</code> edits it, and production content is stored in Vercel Blob.</p>

<p>
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-blue.svg"></a>
  <a href="https://nextjs.org/"><img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black.svg"></a>
  <a href="https://www.typescriptlang.org/"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-blue.svg"></a>
  <a href="https://vercel.com/"><img alt="Vercel" src="https://img.shields.io/badge/Deploy-Vercel-black.svg"></a>
</p>

<p>English | <a href="README.md">中文</a></p>

</div>

---

## What It Is

Personal Site Studio is an open-source template for personal brands, portfolios, creator link pages, and lightweight project homepages. It includes a password-protected visual admin editor, so you can update your homepage by arranging content cards instead of editing code every time.

Good for:

- Personal bio pages, portfolios, and link hubs
- Indie developers, designers, creators, students, and freelancers
- Personal websites that should deploy quickly and remain easy to maintain
- Audience-specific public versions of the same homepage

Not ideal for:

- Complex CMS products, multi-user admin systems, or role-based permissions
- Sites that need to store private data
- Pure GitHub Pages static hosting

## Core Features

- Public personal homepage with avatar, bio, tags, social links, contact entry, and portfolio cards.
- Password-protected admin at `/admin/login` and visual editor at `/admin`.
- Desktop and mobile layout editing with separate card sizes per device.
- Card-based content blocks for projects, links, images, text, status updates, videos, and social links.
- Full-width text blocks for section-style headings and notes; they are blocks, not containers.
- Shared content ordering so cards can sit above, below, or between text blocks.
- Image upload and crop workflow with fixed and custom crop ratios, stored in Vercel Blob.
- Project settings for admin naming, public title, description, URL, SEO, theme, and appearance.
- Multilingual and multi-version content snapshots.
- Hidden audience versions such as `/u1`, persisted for a limited number of homepage visits through HTTP-only cookies.
- JSON config import/export from the admin editor.
- No traditional database; production config is stored in Vercel Blob.

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

## Quick Start

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

The public page works without Vercel Blob. When Blob is not configured, the site falls back to `lib/default-site-config.ts`.

To test admin login, saving, and uploads locally, configure the environment variables below.

## Environment Variables

Create `.env.local` from `.env.example`:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
BLOB_READ_WRITE_TOKEN=
ADMIN_PASSWORD=
```

Simplest production setup:

- `BLOB_READ_WRITE_TOKEN`: Vercel Blob read/write token for saving config and uploaded images.
- `ADMIN_PASSWORD`: admin login password. This is the easiest option for no-code users because it can be typed directly into Vercel Environment Variables; the Value can be the password you want to use.

Optional stronger setup:

- `ADMIN_PASSWORD_HASH`: bcrypt hash for the admin password. If set, it takes priority over `ADMIN_PASSWORD`.
- `SESSION_SECRET`: random session-signing secret. It can be left empty; when it is empty, the app derives a signing secret from the admin credential. If you set it manually, use at least 32 characters.

If you do not want to store a plain password in Vercel, generate the admin password hash:

```bash
node -e "const bcrypt=require('bcryptjs'); bcrypt.hash(process.argv[1], 12).then(console.log)" "your-password"
```

Put the command output into `ADMIN_PASSWORD_HASH`. When logging in to the admin page, use the original plain password, meaning `your-password` from the command above, not the generated hash.

If you want to generate a session secret manually:

```bash
openssl rand -base64 48
```

Never expose `BLOB_READ_WRITE_TOKEN`, `ADMIN_PASSWORD`, `ADMIN_PASSWORD_HASH`, or `SESSION_SECRET` with a `NEXT_PUBLIC_` prefix. They must stay server-only. Only `NEXT_PUBLIC_SITE_URL` is safe to expose to the browser.

## Three Deployment Options

### Option 1: Ask An AI Agent To Deploy It

If you use Codex, Claude Code, Cursor, or another coding agent, copy this prompt and let the agent guide the deployment.

```text
Please help me deploy this project:

GitHub repository: https://github.com/JiahaoTang-Alvin/personal-site-studio
Goal: deploy an editable personal homepage to Vercel.

Please do the following:
1. Fork or clone this repository into my GitHub account and install dependencies.
2. Confirm this is a Next.js App Router app that needs the Vercel runtime. Do not convert it to a GitHub Pages static export.
3. Prepare a Vercel project and enable Vercel Blob.
4. Ask me for an admin login password. Do not write the plain password into code or README files.
5. Use the no-code setup by default: set my chosen admin password as the Vercel environment variable ADMIN_PASSWORD. When I sign in at /admin/login later, I should enter the password I chose.
6. For the safer server-side setup, you may convert that password into a bcrypt hash and set it as ADMIN_PASSWORD_HASH. Important: even when using the hash, I still sign in with the original password. I do not need to remember the hash.
7. SESSION_SECRET is not the admin login password. It is only the session signing key. It can be left empty because the app derives one from the admin credential. If you set it manually, generate random text with at least 32 characters.
8. Set at least these Vercel environment variables. The only login-related variable is ADMIN_PASSWORD:
   NEXT_PUBLIC_SITE_URL=https://my-domain-or-vercel-domain
   BLOB_READ_WRITE_TOKEN=the Vercel Blob read/write token
   ADMIN_PASSWORD=the admin password I provide
9. Deploy to Vercel.
10. After deployment, open /admin/login and confirm I can log in with the original password.
11. After login, open Project Settings, fill in the site title, description, URL, SEO fields, versions, and languages, then save once to write the production config to Vercel Blob.

Before making changes, tell me which steps need my manual authorization, such as GitHub, Vercel login, or Blob creation.
```

This path is useful if you do not want to manually wire GitHub, Vercel, and environment variables. You still own the admin password; do not write it into a public repository, README, or public chat transcript. To change the password later, update `ADMIN_PASSWORD` in Vercel and redeploy production.

### Option 2: Import From GitHub Directly Into Vercel

1. Fork or copy this repository into your GitHub account.
2. In Vercel, choose **Add New... -> Project** and import the GitHub repository.
3. On the New Project page, keep the default settings:
   - Framework Preset: `Next.js`
   - Root Directory: `./`
4. Expand **Environment Variables** and add these rows in the Key / Value fields:

   ```env
   NEXT_PUBLIC_SITE_URL=https://your-domain.com
   BLOB_READ_WRITE_TOKEN=your-vercel-blob-read-write-token
   ADMIN_PASSWORD=your-admin-login-password
   ```

   The only login-related variable is `ADMIN_PASSWORD`. Its Value can be any strong password you want to use, ideally a phrase you can remember and other people cannot guess.

5. For `Environments`, choose `Production and Preview`, or choose only `Production`.
6. Click **Deploy**.
7. After deployment, enable Vercel Blob in the Vercel project and set the Blob read/write token as `BLOB_READ_WRITE_TOKEN`. If you already created the Blob token before deploying, you can enter it in step 4. If you add or change environment variables after deployment, redeploy production once.
8. Open `https://your-domain.com/admin/login` and log in with the original password from `ADMIN_PASSWORD`.
9. In the admin editor, open Project Settings and set the project name, public title, description, URL, SEO fields, versions, and languages.
10. Save once to persist the production config to Vercel Blob.

To change the admin password later, update `ADMIN_PASSWORD` in **Settings -> Environment Variables** and redeploy production. `SESSION_SECRET` is not the login password; update it only when you want every old login session to expire immediately.

### Option 3: Publish To GitHub Manually, Then Connect Vercel

If you already have a local copy, create a GitHub repository and push the source:

```bash
git init
git add .
git commit -m "Initial personal site studio"
git branch -M main
git remote add origin https://github.com/your-name/your-repo.git
git push -u origin main
```

Then import that GitHub repository into Vercel and follow Option 2 to configure Blob and environment variables.

Important: the full app does not support pure GitHub Pages / static HTML hosting. It uses dynamic Next.js routes, cookies, admin API routes, login sessions, and Vercel Blob writes. GitHub is a good place to host the source code; Vercel remains the recommended runtime host.

## Routes

- `/`: public personal homepage
- `/admin/login`: admin login
- `/admin`: visual admin editor
- `/api/admin/config`: authenticated config read/write
- `/api/admin/upload`: authenticated image upload
- `/[accessCode]`: hidden version entry, such as `/u1`

## Data Model

The site is driven by one validated `SiteConfig` object:

- `profile`: avatar, name, bio, tags, social links, and profile module visibility.
- `sections`: legacy compatibility field; the current editor keeps it empty.
- `blocks`: project, link, image, text, social, video, and status cards, plus full-width `section` text blocks.
- `theme`: colors, radius, shadow, and font settings.
- `settings`: project name, public title, description, URL, SEO, languages, variants, and feature toggles.
- `contentVariants`: optional version/locale content snapshots keyed as `variantId:locale`.

Production config is saved to Vercel Blob at:

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

Blob-hosted config and uploaded images are public-readable. Do not store secrets, private notes, unpublished credentials, or sensitive personal data in the config.

## Config Import And Export

The admin Project Settings panel can export the full `SiteConfig` as JSON. Importing JSON replaces only the current editor draft; click Save after reviewing it to write the imported config to Vercel Blob.

Use exports for backups, deployment migration, local-to-production handoff, or reusing a site structure across multiple deployments.

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

## Design Principles

- Content first: the first screen should show identity and featured work directly.
- Visual maintenance: routine content updates should happen in the admin editor, not through code edits.
- Small and reshapeable: the template stays lightweight so it can adapt to a personal brand.
- Public read, admin write: public pages do not write data; all saves and uploads require an authenticated admin session.
- Clear public-config boundary: Vercel Blob is for public display content, not secrets.

## Template Status

This is a usable template that is still evolving. The current focus is personal homepage content, portfolio cards, visual editing, multilingual/multi-version snapshots, and Vercel Blob persistence. Migration tooling, revision history, login rate limiting, and more complex permission systems are not built in yet.
