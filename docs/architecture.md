# Architecture

Last updated: 2026-09-15

## Local production-build E2E boundary

`scripts/run-admin-e2e.mjs` starts `next start` on an exclusive loopback port after a build, runs the Playwright config/specs, stops its owned child, and fails if the port remains occupied. This explicit lifecycle avoids a Windows Playwright webServer shell-teardown hang. The child server overrides admin password/hash, session secret, Blob token, and Vercel environment with disposable local values; no already-running server is reused. Each Playwright test gets an isolated browser context, and upload/config 401 requests use an unauthenticated request fixture. The suite exercises the real UI and API validation flow but cannot perform a successful Blob write. Downloaded JSON is inspected in test-local output; malformed/invalid/valid imports remain in browser state and do not call remote PUT. Failure artifacts are ignored in `output/playwright/`. Rollback removes the dev-only runner, specs, scripts, and SOP `e2e` command; application runtime behavior is unchanged.

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
- Successful save: acknowledge the submitted immutable configuration snapshot. Update the displayed timestamp, clear the local recovery record and close the save dialog only if it is still the current draft; otherwise preserve the newer draft and its unsaved state.

## 2026-11-06 request ownership

The editor compares current and acknowledged configuration snapshots rather than clearing a dirty flag on every response. An in-flight save ref prevents duplicate requests; an AbortController invalidates completion after unmount. A valid response requires explicit success and a parseable server timestamp. Import reads have request identities plus captured configuration/version/language; a superseded, edited or reselected operation cannot commit its file. The existing draft codec, access-code redaction, reload recovery and missing-storage banner remain intact.

Session signing and validation are extracted to `lib/session-token.ts` for direct crypto-boundary tests. `lib/auth.ts` retains cookie adaptation and secret precedence. Password validation accepts unknown runtime input and rejects non-string JSON values before hashing. The token/cookie format and seven-day validity remain compatible.

## Rollback

Removing the draft UI and helper restores the previous server-only persistence behavior. Existing local-storage data is namespaced and inert if the feature is rolled back.
