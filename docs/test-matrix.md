# Test Matrix

Last updated: 2026-09-08

| Area | Scenario | Expected result | Gate |
|---|---|---|---|
| Draft codec | Empty storage | Returns empty state | Unit |
| Draft codec | Valid versioned draft | Revalidates and returns ready state | Unit |
| Draft privacy | Automatic serialization and restore | Stored JSON contains no variant access code; restore keeps only the current server value | Unit/security scan |
| Draft codec | Malformed JSON / unsupported version / invalid config | Returns explicit invalid state; never applies data | Unit |
| Admin auth | No session | `/admin` redirects to `/admin/login` | Browser |
| Missing Blob | Login with local test password and no Blob token | Admin shows local-only warning before save | Browser |
| Recovery | Edit project name, reload, restore | Edited value returns and remains marked unpublished | Browser |
| Failed save | Save without Blob token from an open modal | Error remains visible, modal stays open, draft remains recoverable | Browser |
| Discard | Discard discovered draft | Local draft is removed and server/fallback content remains | Browser |
| Export | Export recovery backup | Full valid JSON downloads without a remote write | Browser/manual evidence |
| Keyboard | Tab through recovery actions and activate with keyboard | All actions work with visible focus | Browser |
| Mobile | Recovery strip at 390px width | Text and actions wrap without horizontal overflow | Browser |
| Security | Unauthenticated config write / upload | Remain 401; no auth or upload limits changed | Code/security scan |
| Quality | Test, lint, typecheck, production build, audit | All configured gates pass | CLI |
