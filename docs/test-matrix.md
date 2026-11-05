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

## 2026-11-06 additional regressions

- `tests/password.test.mjs` and `tests/session-token.test.mjs`: malformed credentials; hash precedence; legacy valid session; exact expiry; altered, oversized and structurally invalid tokens. The seven existing draft-codec tests stay in `npm test`.
- `tests/e2e/editor-persistence.spec.ts`: delayed save versus later edit, recovery-record retention and clearing after retry; transport failure; non-JSON and incomplete success acknowledgments; invalid/valid scoped import/export; delayed import versus edits or selected version; overlapping file reads; saved-document version/language boundaries; actual unauthorized/missing-storage responses and mobile draft retention.
- The existing seven `admin-editor.spec.ts` journeys remain required. All browser tests use the existing exclusive local production-server runner. Success transport is intercepted; this is not actual Blob persistence validation.
- `tests/config-validation.test.mjs`: actual default/recovery round-trip, legacy defaults and sparse visibility, scoped metadata/language records, URL policy, duplicate/reference errors and malformed JSON values under patched Zod 4.
- `tests/dependency-consumers.test.mjs`: actual TypeScript project-service matching/rejection through patched minimatch and Blob/OIDC CLI config schemas through patched Zod. Synthetic temporary files and in-memory values only; no user config or credentials.
- Mobile header: 320px/390px project identity width, complete unsaved status, nonoverlapping 44px actions and no overflow. First Linux CI exposed a collapsed identity cell; both new cases fail against the preceding build before the responsive fix.
