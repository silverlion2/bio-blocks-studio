# Project Log

## 2026-09-15 — repository-owned admin E2E gate

- Based isolated worktree HEAD on freshly fetched `origin/main` `2c29bcc1a02cf4fbd32a0b520d5f850f386064cf`; no writes to `D:\workspace\Personal Homepage`. Saved checkout read-only check: HEAD `d71191f5a7e0937e8d7a1da34ef65f51cf462118`, only untracked `optimization_plan.md`, SHA-256 `4AB07DA12B7EEBC070ABDAFC9D4BAE90630347A660685A4E4B55EEA2B058946A`.
- Read applicable AGENTS/SOP and ran `web-sop doctor` before changes: `AGENTS_MISSING`, `E2E_COMMAND_MISSING`, `VERSION_OUTDATED`. Added project AGENTS and configured E2E; final doctor leaves only SOP version warning (project config `1`, installed `1.0.0`). No managed project content was overwritten.
- Added Playwright Test + pinned lockfile, source-controlled browser specs, an exclusive loopback production-server runner, npm scripts, and read-only GitHub Actions PR/main gate. The runner overrides credentials and Blob token with disposable/empty local values, rejects an occupied port, waits for the owned Next child, and verifies port release. No real password, Blob, deployment, or production write was used.
- Red-to-green evidence: first production E2E was 3/7 green, with strict locator ambiguity (`alert`/`status` includes Next/dnd live regions), a secured page-request GET returning 401, and a false scope expectation against a new version's documented fallback. Corrected test locators and used exported config as the baseline; edited the second version before asserting write isolation. Playwright's Windows `webServer` teardown hung after passing assertions and left a shell/Next process; replaced it with a repository-owned child lifecycle. Full suite then returned actual exit 0 with 7/7 green and no remaining port listener. Tightened keyboard coverage from programmatic focus to actual Tab/Shift+Tab order, checked 44px in both dimensions, and exported/imported a distinct ZH scope after EN/ZH/second-version edits. Final rerun again passed 7/7 with exit 0.
- A separate explicit `npm run test:e2e:prod` rebuild exposed another 6/7 red run: import-success feedback arrived before the asynchronous browser draft serialization, so an immediate assertion read the previous local snapshot. Replaced the loose non-null poll with a poll for the imported profile value in the target ZH snapshot; focused export/import rerun passed 1/1 with exit 0. The full production rerun result is recorded in integration evidence.
- Final lock review changed only the three new Playwright resolved tarball URLs from the local npm mirror to the official registry, preserving exact package versions and integrity hashes. `npm ci --registry=https://registry.npmjs.org` then passed from that final lockfile (429 packages).
- Gates: `npm ci` from updated lockfile passed (429 packages); `npm run verify` passed 7/7 unit, lint, typecheck, and optimized build; `web-sop check --mode fast` passed all four configured checks; final `web-sop check --mode release` passed those plus production-server E2E 7/7 and official npm audit. Official npm full and `--omit=dev` audits found 0 vulnerabilities; `git diff --check` and focused credential-pattern file scan were clean. Separate `npm run test:e2e:prod` rebuilt and reran E2E 7/7 with exit 0 after the import-draft race fix. Final integration/ref checks are reported to the coordinating task after push.
- Explicit gaps: no real Blob success path or deployed production smoke/rollback was permitted. The gate does not cover all drag/drop, all image validation cases, cross-browser visual parity, or full accessibility contrast. A Next Edge Runtime deprecation warning persists from existing code; no runtime code was changed in this slice.
- Rollback: revert this dev-only gate with a reviewed ordinary commit; no content store or deployed version changed. No Release, tag, GitHub settings, or cloud resource was changed.

### Integration evidence

Pre-push review: no test port listener after the production E2E; SOP release exit 0, all six configured commands passed; no production deployment or Blob write. The local commit and live GitHub main full hashes are verified externally after the ordinary push, as a commit cannot record its own hash. Keep this task unarchived until the coordinating task synchronizes central records.

## 2026-09-08 — P1 trustworthy draft recovery

- Selected the admin persistence recovery slice after reviewing the full application and documentation.
- `web-sop doctor` was unavailable because the CLI is not installed; equivalent repository, scripts, dependency, structure, and security-boundary diagnostics were recorded.
- Planned a browser-local unpublished draft, reload recovery actions, proactive missing-Blob status, and save-dialog correctness.
- Production deployment and real external writes are explicitly out of scope.
- Implemented versioned local draft validation, restore/export/discard controls, durable remote-persistence status, and modal-close-on-success behavior.
- Added defense in depth that removes variant access codes from automatic browser storage and retains only current server-loaded codes during restore.
- Fixed the 390px admin header overflow and raised the primary header/recovery actions to 44px minimum targets.
- Added seven draft codec/privacy tests and a single `npm run verify` quality command.
- Upgraded Next.js and its ESLint config from 16.2.10 to 16.3.4, PostCSS from 8.5.16 to 8.5.28, and refreshed vulnerable transitive dependencies; the official npm audit reports zero vulnerabilities.
- Browser evidence covered login, missing-Blob guidance, failed save with modal/draft retention, reload discovery, restore, keyboard activation, and a 390×844 viewport without horizontal overflow. Unauthenticated config writes and uploads returned 401.
- Codex Security diff scan `a06eb326-6602-4ee9-a45c-257f7f820306` reviewed 18/18 original-snapshot items and produced zero reportable findings. The report records that the working tree changed during defense-in-depth hardening.
- Final equivalent SOP gate: unit tests 7/7, lint clean, typecheck clean, production build successful, `git diff --check` clean after whitespace correction, focused secret scan clean, and npm audit clean. The `web-sop` binary remains unavailable, so both `doctor` and `check --mode fast` were replaced by the documented explicit commands.
