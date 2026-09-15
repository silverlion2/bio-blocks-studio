# Workspace Layout

Last updated: 2026-09-15

- `app/`: Next.js page/API routes and auth boundary.
- `components/admin/`: scoped editor and recovery UI.
- `lib/`, `types/`, `constants/`: config validation/materialization, draft codec, data contracts.
- `tests/`: unit draft codec and production-build `e2e/` browser journeys.
- `scripts/run-admin-e2e.mjs`, `playwright.config.ts`: owned exclusive local server and browser settings; outputs under ignored `output/playwright/`.
- `.github/workflows/admin-e2e.yml`: PR/main automation with read-only repository permissions and no deployment.
- `docs/`: product, architecture, design/state, test matrix, release/rollback and project log.
- `.website-sop.yml`, `AGENTS.md`: hard project-local SOP contract and safety rules.

No files are moved or normalized merely to match a template. The saved checkout at `D:\workspace\Personal Homepage` is outside this worktree and is not a write target.
