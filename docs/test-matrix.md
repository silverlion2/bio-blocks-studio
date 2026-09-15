# Test Matrix

Last updated: 2026-09-15

| Area | Scenario | Expected result | Gate |
|---|---|---|---|
| Draft codec | Empty storage | Returns empty state | Unit |
| Draft codec | Valid versioned draft | Revalidates and returns ready state | Unit |
| Draft privacy | Automatic serialization and restore | Stored JSON contains no variant access code; restore keeps only the current server value | Unit/security scan |
| Draft codec | Malformed JSON / unsupported version / invalid config | Returns explicit invalid state; never applies data | Unit |
| Admin auth | No session, wrong then disposable local password | Redirect, error, successful editor login | Production Playwright |
| Missing Blob | Login with local test password and no Blob token | Admin shows local-only/not-published warning before save | Production Playwright |
| Scope isolation | Add one version and another language; edit titles in main EN, ZH, and second version | New version may inherit before first edit; after independent edits all three retain their own titles | Production Playwright |
| Recovery | Edit project name, reload, restore with Enter | Edited value returns and remains marked unpublished | Production Playwright |
| Failed save | Save without Blob token from an open modal | API error visible, modal open, browser draft remains | Production Playwright |
| Discard | Discard discovered draft | Local draft is removed and server/fallback content remains | Browser |
| Config export/import | Export ZH after distinct EN/ZH/second-version edits, malformed/invalid and valid JSON imports | Target exported; other titles absent; invalid files cannot mutate draft; valid import changes only ZH, no PUT | Production Playwright |
| Keyboard | Tab and Shift+Tab through recovery actions, activate Restore/Discard with Enter | Actions occur in browser Tab order and work with keyboard | Production Playwright |
| Mobile + desktop | 390px and 1280px recovery strip | No horizontal overflow; critical header/recovery actions at least 44px wide and high | Production Playwright |
| Security | Unauthenticated config write / upload | Both remain 401 on actual production-build server | Production Playwright |
| External persistence | Successful Blob save/upload | Not exercised; no real Blob token permitted | Explicit gap, never counted as pass |
| Scope variants | Real deployed content and drag-drop | Not exercised by this slice | Explicit gap/manual review |
| Quality | Test, lint, typecheck, production build, E2E, audit | All configured gates pass | CLI/SOP fast + release |
