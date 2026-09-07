# Architecture

Last updated: 2026-09-08

## System boundary

The public site remains read-only. Admin writes remain limited to authenticated API routes. `SiteConfig` continues to be the single validated content document; Vercel Blob remains the production source of truth and browser storage is only a recoverable unpublished draft.

## Draft data flow

1. `/admin` verifies the signed admin session server-side.
2. The server loads Blob config or the built-in fallback and passes a boolean remote-persistence capability flag; no token value reaches the client.
3. The editor checks its versioned local-storage record after mount.
4. Every valid dirty edit replaces that browser-local record.
5. Automatic serialization redacts variant access codes. Restore revalidates the record with the same `validateSiteConfig` boundary used for remote saves and imports, then retains access codes only from the currently loaded server config.
6. Remote save still calls authenticated `PUT /api/admin/config`, which validates with Zod and writes Blob.
7. Only a successful response clears the local record. Failure preserves it and returns the editor to an explicit local-only/error state.

## Trust boundaries

- `ADMIN_PASSWORD`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET`, and `BLOB_READ_WRITE_TOKEN` remain server-only.
- The client receives only `remotePersistenceAvailable: boolean`.
- Local drafts are not encrypted and must contain no secrets or private data. Variant access codes are redacted before storage; hidden variants remain presentation hints, not authorization.
- Imported and recovered documents cross the same Zod validation boundary before entering editor state.

## Failure and retry behavior

- Missing Blob token: fail closed for remote save; keep a valid browser draft and show setup guidance.
- Invalid/corrupt draft: do not apply it; show an error state and allow explicit discard.
- Storage unavailable/quota exceeded: keep editing state in memory and show that browser backup failed.
- Network or Blob write error: keep the modal open, keep the draft, and allow retry or export.
- Successful save: update the server timestamp, clear the local draft, and mark the editor saved.

## Rollback

Removing the draft UI and helper restores the previous server-only persistence behavior. Existing local-storage data is namespaced and inert if the feature is rolled back.
