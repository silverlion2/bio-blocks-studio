# Project Background

Last updated: 2026-07-05

## Purpose

This project is being prepared as a public personal bio / portfolio template. The goal is to let people fork or clone it, replace the sample content, deploy it on Vercel, and maintain their profile through a visual admin editor.

The project should feel like an actual usable personal page, not a marketing landing page for the template itself. The first screen should show the owner profile and content cards.

## Product Model

- The public site is a personal homepage.
- The admin site is a visual editor for the same homepage.
- The content source of truth is a single validated `SiteConfig` object.
- Vercel Blob stores the production config and uploaded images.
- `lib/default-site-config.ts` is sample fallback content for local development and fresh deployments.

## Important Mental Model

Sections are text-shaped full-width blocks. They are not containers that own block cards.

Block cards can be top-level cards by using the internal `__top_level__` section id. Top-level block cards and text sections share one vertical content-order axis. This lets a text section move above or below the top-level block grid without making block cards feel like children of that section.

Do not reintroduce visible blank sections as placeholders. If blocks are detached from a section, make them top-level blocks.

## Main Files

- `app/page.tsx`: public page entry.
- `app/admin/page.tsx`: protected admin entry.
- `components/admin/AdminVisualEditor.tsx`: primary admin editor.
- `components/admin/ImageCropUploader.tsx`: shared image upload/crop dialog.
- `components/admin/BlockForm.tsx`: block editing form.
- `components/site/SiteLayout.tsx`: public layout shell.
- `components/site/ContentArea.tsx`: ordered public content rendering.
- `components/blocks/BlockCard.tsx`: main block card renderer.
- `lib/utils.ts`: render model, ordering helpers, top-level block id.
- `lib/validators.ts`: config validation.
- `lib/blob-config.ts`: Vercel Blob read/write.
- `lib/default-site-config.ts`: sample fallback config.

## Design Direction

- Quiet, content-first personal page.
- Dense but approachable admin UI.
- Avoid large hero marketing sections.
- Avoid decorative gradient blobs or one-note palettes.
- Keep controls direct and concrete: icons for actions, segmented choices for layout, handles for drag/resize.
- Admin behavior should match the visual public page closely.

## Current Constraints

- No database beyond Vercel Blob.
- No multi-user accounts.
- No public write APIs.
- Admin authentication is a single password hash plus signed session cookie.
- Image uploads are public Blob objects.
- Config history and migrations are not yet implemented.

## Future Development Ideas

- Template initialization wizard.
- Import/export config JSON.
- Config backup and restore.
- Richer block templates.
- Better migration handling for older configs.
- Optional analytics integration.
- Theme presets.
