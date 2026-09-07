# Product Specification

Last updated: 2026-09-08

## Current milestone: trustworthy local draft recovery

### Problem

The admin editor can be used locally without Vercel Blob, but remote save then fails. Today that failure is only communicated by a transient toast, save-triggering dialogs close even when the request fails, and a reload discards all edits. This creates a high-risk gap in the login → scoped edit → save → reload → export/import journey.

### User and outcome

The primary user is a single site owner editing public portfolio content. They need to know whether a change is only in the current browser or actually persisted remotely, and they need a recovery path that does not require credentials or a live Blob write.

### Narrow release

- Autosave valid unsaved `SiteConfig` edits to browser-local storage.
- Detect a valid local draft on the next admin load and offer Restore, Export backup, or Discard.
- Show a durable local-only state when `BLOB_READ_WRITE_TOKEN` is absent.
- Keep a failed-save dialog open and retain the local draft.
- Clear the local draft only after the authenticated remote save succeeds or the user explicitly discards it.

### Exclusions

- No server-side revision history, multi-user collaboration, production deploy, or real Blob write.
- No claim that hidden variants protect secrets. Automatic drafts redact variant access codes and otherwise contain only public-display configuration already covered by the product's public-data boundary.
- No replacement for the authenticated admin save route, Zod validation, or upload controls.

### Success criteria

1. A valid edit survives a reload when the user chooses Restore.
2. Missing Blob configuration is visible before the user attempts to publish.
3. A failed remote save never clears the draft or closes the active modal.
4. A successful remote save clears the browser draft.
5. Recovery actions are keyboard reachable and usable at phone width.

### Stop conditions

Do not proceed if the implementation requires a real credential, a live external write, weaker validation/authentication, or storing data outside the current browser without explicit user action.
