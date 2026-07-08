# Security and Deployment Notes

Last updated: 2026-07-07

## Security Boundary

The public page is read-only. All writes happen through authenticated admin routes:

- `PUT /api/admin/config`
- `POST /api/admin/upload`

Admin authentication uses:

- `ADMIN_PASSWORD_HASH`: bcrypt hash of the admin password.
- `SESSION_SECRET`: HMAC signing secret for the session cookie.
- `bio_template_admin_session`: HTTP-only session cookie.
- `bio_variant_id`: HTTP-only public variant selection cookie.
- `bio_variant_remaining`: HTTP-only public variant view counter cookie.

`SESSION_SECRET` must be at least 32 characters. Short or missing secrets make session verification fail.

The public variant cookies do not grant permissions. They only select which enabled public version should render on `/`, and they expire by counter after 10 homepage visits.

## Server-Only Secrets

These variables must stay server-only:

- `BLOB_READ_WRITE_TOKEN`
- `ADMIN_PASSWORD_HASH`
- `SESSION_SECRET`

Do not prefix them with `NEXT_PUBLIC_`.

Only `NEXT_PUBLIC_SITE_URL` is safe to expose to the browser.

## Upload Rules

Uploads require a valid admin session.

The upload route currently allows:

- `image/jpeg`
- `image/png`
- `image/webp`
- `image/gif`

Maximum upload size is 5 MB. File extensions are derived from MIME type, not from the uploaded filename.

Uploaded images are public Vercel Blob objects. Do not upload private or sensitive media.

## Link Validation

Editable links are validated before config save. Allowed URL forms are:

- `http:`
- `https:`
- `mailto:`
- `tel:`
- site-relative paths such as `/about`

Dangerous protocols such as `javascript:` are rejected by `lib/validators.ts`.

## Config Storage

The production config is stored at:

```text
config/site-config.json
```

The config file is public-readable through its Blob URL, so do not store secrets, private notes, unpublished credentials, or sensitive personal data inside `SiteConfig`.

The admin editor can export and import scoped JSON from **项目设置**. The config section shows the active version/language badges; export serializes the current materialized scope, and import validates the JSON before writing its content snapshot into that same current scope. The imported content is written to Vercel Blob only after the admin clicks save.

Current editable project settings include:

- `settings.projectName`: admin top bar and login page name.
- `settings.siteTitle` and `settings.seoTitle`: public browser/metadata title. The admin web-title field writes both so older configs stay compatible while the UI has one title entry point.
- `settings.siteDescription` and `settings.seoDescription`: public metadata description. The admin web-description field writes both for the same reason.
- `settings.siteUrl`: canonical public deployment origin used for metadata.
- `settings.seoCanonicalUrl`, `settings.seoOgImage`: advanced SEO metadata fields.
- `settings.languages`: legacy compatibility mirror of the main variant's language records and main locale.
- `settings.variants`: public versions, main variant, hidden access codes, per-version language records, per-version main language, per-version language visibility, and per-version SEO indexing permission. The main variant defaults to indexable; non-main variants default to `noindex` unless enabled.
- `contentVariants`: optional per-version/per-locale content snapshots keyed as `variantId:locale`.

Variant access codes are public routing hints, not secrets. Use them for audience-specific presentation, not for private content. Reserved paths such as `admin`, `api`, `icon`, `_next`, `favicon.ico`, and `reset` are rejected by validation.

The project settings modal is split into these admin sections:

- Basic/editor identity.
- Web/domain metadata.
- SEO advanced metadata.
- Combined multilingual and multi-version settings, where each version controls its own language snapshots.
- Appearance controls.
- Scoped config import/export.

## Local Development

The app can run without Vercel Blob:

- Public page falls back to `lib/default-site-config.ts`.
- Admin preview can be opened after login if auth env vars are configured.
- Saving and uploads require `BLOB_READ_WRITE_TOKEN`.

## Recommended Production Setup

1. Deploy on Vercel.
2. Enable Vercel Blob.
3. Set `NEXT_PUBLIC_SITE_URL` to the production origin.
4. Set `BLOB_READ_WRITE_TOKEN`.
5. Set `ADMIN_PASSWORD_HASH`.
6. Set a random `SESSION_SECRET` of at least 32 characters.
7. Sign in at `/admin/login`, open **项目设置**, and confirm project name, public title, description, URL, SEO fields, versions, and languages inside each version.
8. Save once so the production Blob config is initialized.
9. Run a production build before publishing major changes.

## Validation Commands

```bash
npm run lint
npm run typecheck
npm run build
npm audit --audit-level=moderate
```

## Known Limitations

- No rate limiting is implemented for admin login.
- No config revision history yet.
- No automatic migration system yet.
- No role-based access control.
- Blob-hosted uploaded media is public.
