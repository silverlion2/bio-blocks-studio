<!-- website-development-sop:start -->
## Website Development SOP

For website work, read this file and `.website-sop.yml`, then use `$website-development-sop` and run `web-sop doctor` before implementation. Run the configured `web-sop check` before handoff; never weaken the project's hard quality gates.
<!-- website-development-sop:end -->

## Project safety and checks

- This worktree is a Bio Blocks Studio checkout. Never use real admin credentials or Blob tokens for local E2E; the production-build browser gate uses a disposable local-only password and cannot write to Blob.
- Run `npm ci`, `npm run verify`, `npm run test:e2e:prod`, and the configured SOP checks for editor changes. E2E runs only against a locally spawned production server; it must reject an already-occupied test port.
- Do not deploy or alter external resources merely to satisfy a test. Preserve authored plans and unrelated worktree changes.
