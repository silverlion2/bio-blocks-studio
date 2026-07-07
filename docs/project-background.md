# Project Background

Last updated: 2026-07-07

## Purpose

This project is being prepared as a public personal bio / portfolio template. The goal is to let people fork or clone it, replace the sample content, deploy it on Vercel, and maintain their profile through a visual admin editor.

The project should feel like an actual usable personal page, not a marketing landing page for the template itself. The first screen should show the owner profile and content cards.

## Product Model

- The public site is a personal homepage.
- The admin site is a visual editor for the same homepage.
- The content source of truth is a single validated `SiteConfig` object.
- Vercel Blob stores the production config and uploaded images.
- `lib/default-site-config.ts` is sample fallback content for local development and fresh deployments.

`SiteConfig` still stays as one Blob-backed document, but it now has two layers:

- The root `profile`, `blocks`, `theme`, and core metadata are the main version and main language content.
- `contentVariants` stores optional content snapshots keyed as `variantId:locale`, for example `u1:en`.

When a version/language snapshot does not exist, rendering falls back to the nearest available content in this order:

1. Requested version + requested locale.
2. Requested version + main locale.
3. Main version + requested locale.
4. Root main version + main locale.

## Important Mental Model

The old `sections` concept is now represented as `Block` records with `type: "section"` and `size: "section-text"`. They are full-width text blocks, not containers that own block cards.

All content blocks use the internal `__top_level__` section id. Normal cards and full-width text blocks share one vertical content-order axis. This lets a text block move above, below, or between card groups without making cards feel like children of that text block.

Do not normalize top-level block `sortOrder` as if it were section-local order. A top-level block's `sortOrder` controls where it appears relative to text sections, so unrelated top-level siblings should keep their global order when another block is dragged or resized.

Block cards should be able to move before or after a text block on the shared content axis. The editor should not force a card into a hidden section-owned grid just because the pointer is near a heading.

If an older config has `sections`, normalize each section into a `type: "section"` block. If an older config has `block.sectionId` pointing at a section, normalize it into the shared content flow and rewrite the block to `__top_level__`; do not preserve section-owned card groups.

Do not reintroduce visible blank sections as placeholders. If blocks are detached from a section, make them top-level blocks.

## Language and Variant Routing

Variants are role or audience versions of the same personal site, such as a developer version, internship version, or company-facing version. Languages are edited inside the selected variant.

The admin editor keeps a `baseConfig` plus a materialized editing view. Switching the top-bar version or language calls `materializeSiteConfig(...)`; edits to non-main content write back through `writeSiteContentSnapshot(...)` into `contentVariants`. Global project settings, the variant list, import, and export still belong to `baseConfig`. Languages are stored inside each variant as `settings.variants.variants[].languages`; `settings.languages` is retained as a legacy compatibility mirror of the main variant only.

The top-bar language picker is filtered by the selected variant. The main locale is always available; other enabled languages appear only when they belong to that selected variant. This prevents one version's language records from leaking into another version.

In project settings, languages and variants share one `多版本&多语言` branch. The main interaction starts from version cards: add a version, then use the plus control inside that version to open the add-language dialog. The dialog lets the editor choose a fixed language code from supported BCP 47-style options and set an editor-only remark name; users do not type locale codes manually. Adding a language to a version creates the matching `variantId:locale` snapshot and a language record only inside that version. The language capsule can be renamed, hidden with its checkbox, promoted to that version's main language after confirmation, or deleted with typed confirmation. The main language is stored per variant so one version's fallback language does not affect another version.

Each version card also exposes a `版本覆盖` action. It copies a full source snapshot from a selected source version and source language into the target version/language, including profile data, blocks, theme, web title/description, and SEO fields. The target is the clicked version plus the current editor language when that language exists in the target version; otherwise it falls back to that target version's main language. The overwrite requires a second confirmation because the target snapshot is replaced directly.

The `网页与域名` and `SEO` settings panels edit the currently selected version/language content snapshot for title, description, canonical URL, and OG image fields. The panels show variant and language badges so the editor can see which public metadata module is being edited. The public site URL remains a global origin; public variant access still uses hidden short suffixes such as `/u1` rather than changing the canonical origin per version.

Public routing uses hidden short access codes:

- `app/[accessCode]/route.ts` checks whether the path matches an enabled variant access code such as `/u1`.
- A valid access code writes HTTP-only variant cookies and redirects to `/`, so the visible URL returns to the normal homepage.
- `proxy.ts` decrements the variant view counter on `/`; after 10 homepage visits it clears the variant cookies.
- `/reset` and `/?reset` clear the public variant cookies immediately and redirect to the main homepage.
- `app/page.tsx` resolves the active variant from cookies and resolves locale from `Accept-Language`.

The short access code namespace must not collide with system paths such as `admin`, `api`, `icon`, `_next`, `favicon.ico`, or `reset`. `lib/validators.ts` enforces this before config save.

## Main Files

- `app/page.tsx`: public page entry.
- `app/[accessCode]/route.ts`: hidden variant access-code entry and redirect.
- `app/admin/page.tsx`: protected admin entry.
- `proxy.ts`: public variant cookie view-count expiry.
- `components/admin/AdminVisualEditor.tsx`: primary admin editor.
- `components/admin/ImageCropUploader.tsx`: shared image upload/crop dialog.
- `components/admin/BlockForm.tsx`: block editing form.
- `components/site/SiteLayout.tsx`: public layout shell.
- `components/site/ContentArea.tsx`: ordered public content rendering.
- `components/blocks/BlockCard.tsx`: main block card renderer.
- `lib/utils.ts`: render model, ordering helpers, top-level block id, language/variant materialization helpers.
- `lib/validators.ts`: config validation.
- `lib/blob-config.ts`: Vercel Blob read/write.
- `lib/public-variant-cookies.ts`: public variant cookie names and 10-view limit.
- `lib/default-site-config.ts`: sample fallback config.

## Design Direction

- Quiet, content-first personal page.
- Dense but approachable admin UI.
- Avoid large hero marketing sections.
- Avoid decorative gradient blobs or one-note palettes.
- Keep controls direct and concrete: icons for actions, segmented choices for layout, handles for drag/resize.
- Admin behavior should match the visual public page closely.

## Public Responsive Layout

The public page has three layout modes:

- Wide desktop: if the viewport has enough width, render the profile module as the left desktop column and render the content modules on the right. The whole shell is centered as `left profile + right content`.
- Narrow desktop / tablet: if the viewport is not wide enough for the two-column desktop shell, stack the profile area above the content area. The content area should keep the personal-site module layout below it instead of forcing a cramped side-by-side layout.
- Mobile: at the narrow phone breakpoint, use the mobile module layout. Block grids use the mobile two-column logical grid, so square blocks can sit left/right and wider blocks span the full mobile content width.

The right content width should be content-aware on desktop. It should use at least two logical columns because text blocks need readable width, and expand to three logical columns only when visible blocks actually use the third column. Text blocks themselves should not force the content area to become three columns.

## Current Constraints

- No database beyond Vercel Blob.
- No multi-user accounts.
- No public write APIs.
- Admin authentication is a single password hash plus signed session cookie.
- Image uploads are public Blob objects.
- Config history and migrations are not yet implemented.
- Public variant selection is cookie-based and intentionally lightweight; it is not authentication or access control.

## Future Development Ideas

- Template initialization wizard.
- Import/export config JSON.
- Config backup and restore.
- Richer block templates.
- Better migration handling for older configs.
- Optional analytics integration.
- Theme presets.
