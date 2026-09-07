# Project Log

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
