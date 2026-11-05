# Release and Rollback Checklist

Last updated: 2026-09-15

- Scope/version: admin-editor production-build Playwright gate on existing `main`, owner: site maintainer.
- Before integration: `npm ci`, `npm run verify`, `npm run test:e2e:prod`, `web-sop check --mode fast`, `web-sop check --mode release`, official `npm audit --audit-level=moderate --registry=https://registry.npmjs.org`, secret/diff checks.
- Local smoke: exclusive `127.0.0.1:3179` Next production server, disposable password and session secret, empty Blob token; login/recovery/scope/import/401/responsive assertions. A real production smoke test is not authorized and must be marked missing, not passed.
- Deployment target/status: none in this task; no Vercel deployment, Release, tag, or cloud mutation.
- Monitoring: inspect CI and local gate results on subsequent source changes; no production telemetry is changed here.
- Rollback evidence: dev-only test/config/scripts/docs can be reverted by a reviewed ordinary commit; no Blob data or user content is touched. Previous runtime version is the parent commit recorded in the project log. A deployed-version rollback is not applicable because there is no deployment.
- Main integration: fetch before push, require HEAD descends from unchanged origin/main, ordinary fast-forward push; independently compare local HEAD, cached tracking ref, and live `refs/heads/main`, then verify clean tree.

## Evidence from 2026-09-15 local gate

- `npm ci`: exit 0, 429 packages; `npm run verify`: exit 0, unit 7/7, lint/typecheck/build pass.
- `web-sop check --mode fast`: exit 0, four configured commands passed.
- `web-sop check --mode release`: exit 0, four fast commands, E2E 7/7 on local production build, official npm audit 0 vulnerabilities.
- Official npm full and production-only audits: exit 0, 0 vulnerabilities each; focused secret scan and `git diff --check`: clean.
- Local production smoke is the only authorized smoke. Actual deployed production smoke and cloud rollback are explicitly not performed; no deployment exists for this change.
- Explicit `npm run test:e2e:prod` after the import-draft polling race fix: exit 0, optimized build and Chromium E2E 7/7. Final release gate rerun on the same code: exit 0, all six configured commands passed.

## 2026-11-06 editor integrity candidate

Candidate work starts from the live remote main `4dd15fe`. Existing recovery and all previous gates are retained. Local install, 17 unit cases, lint/typecheck/build, SOP fast and expanded Edge browser coverage pass. Today's audit has 18 entries, including one critical: dependency remediation and a fresh full release gate are outstanding. Do not interpret the historical audit result above as current. No main integration, push, deployment or real Blob write is performed in this slice. A later candidate must recheck the actual remote base and the complete outgoing scope before any push.
