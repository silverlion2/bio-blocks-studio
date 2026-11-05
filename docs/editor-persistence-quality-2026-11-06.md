# Editor persistence and scope integrity

2026-11-06 final browser verification: Edge 17/17 (38.5s) and bundled Chromium 17/17 (39.0s), both with clean runner shutdown. This is local candidate evidence; the dependency audit below remains failed.

## Product and design

An owner must be able to edit while a save is pending without losing the unsaved indicator. A disconnected, rejected or malformed save response must leave the draft intact and allow retry. A JSON import replaces only the selected version/language; if the draft or selection changes while the file is being read, the import must ask the owner to retry rather than overwrite newer work. Export remains a scoped backup, not a complete-site backup. Existing layouts and bilingual controls remain in use.

## Engineering and validation plan

Track the saved configuration snapshot separately from the current draft instead of clearing a mutable dirty flag on any successful request. Permit one save at a time, release its pending state on every outcome, and invalidate completions on unmount. Accept only a valid success response. Import completion must belong to the current request, draft and selection.

Add deterministic browser regression coverage to the existing quality workflow. Use the actual Next.js app with synthetic authentication, disabled Blob credentials and intercepted save transport; exercise real forms, downloads, malformed imports, version/language isolation, delayed saves, failed requests and retries. Also exercise the actual unauthorized and missing-storage API responses. These tests do not certify the hosted Blob service or production deployment, and never persist user content remotely.

Browser plugin not available; use Playwright. Target flow: `/admin/login` → synthetic login → edit content/settings → save/import/export → verify visible state and outgoing content, on desktop and mobile. Keep screenshots and runtime evidence outside the source repository.

Run doctor before implementation, then configured fast checks and browser tests. Preserve the existing untracked planning file. Review the complete outgoing history against live remote main before any push.

## Current implementation and evidence

This candidate starts at remote main `4dd15fe5b3a65b752f1b8eb5e5620d807ec62cfb` and preserves its draft recovery, mobile fixes, strict SOP contract and production-browser runner. Network retry and modal retention already existed on that baseline. New browser cases reproduced the stale-save acknowledgment and malformed-success problems on that baseline before correction. The final implementation also preserves the newer browser draft when an earlier request completes, rejects superseded imports and integrates the independently tested malformed-credential/session-token fix.

The existing seven draft-codec tests and ten auth tests all pass. `npm ci`, `npm run verify`, production-build browser execution and configured SOP fast pass. The final Edge suite contains 17 scenarios, including the seven existing journeys; desktop and mobile use 1280/390px widths. Screenshots and browser assertions confirm draft retention, no horizontal mobile overflow in the tested flow, page identity, no framework overlay and no unexpected console/page errors. Explicitly induced network/400 errors are confined to their corresponding cases.

The same unchanged dependency graph currently reports 18 official npm audit entries (9 moderate, 8 high, 1 critical). Historical zero-audit results do not apply to today's advisory data. Release/integration is not complete while this gate fails. The Edge Runtime deprecation remains separate. Actual Blob persistence, production deployment, complete drag/drop and comprehensive accessibility remain unverified; browser transport success is simulated and no remote data is written.
