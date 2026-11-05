# Dependency remediation and configuration compatibility

The initial editor candidate had 18 official npm audit entries, including a critical Next.js entry. The remediation updates Next and its ESLint configuration together within major 16, refreshes compatible Blob and transitive packages, and migrates the application's Zod boundary to a patched v4 release. It does not downgrade Next/Blob to npm's suggested unrelated release lines solely to silence transitive audit output.

Product contract: existing valid configuration imports and browser recovery drafts continue to work; invalid content still fails closed with field errors. Preserve the sparse profile visibility record accepted by Zod 3. The [official Zod migration guide](https://zod.dev/v4/changelog) documents required explicit record key schemas and the new exhaustive enum-record behavior; use partialRecord where the old contract permits missing keys. No content rewrite, production credential, remote Blob write or deployment is needed.

Validate real application schemas, current and legacy configuration defaults, scoped snapshots, URL restrictions and duplicate/reference constraints. Extend the existing test runner rather than add another validation framework. Any cross-major transitive override requires an actual consumer check. Then verify clean installation, full/production official audits, lint/types/build, existing draft/auth tests, production browser journeys and both configured SOP modes. Preserve the previous failed audit record as history.

## Implementation

Next and eslint-config-next are pinned to 16.4.5, Blob to 2.8.2 and Zod to 4.6.7. Compatible transitive updates also refresh undici and TypeScript ESLint. The CLI config package still pins an affected Zod 4 release, so its override reuses the application's patched Zod 4 version. Only minimatch major 10 is overridden to 11.0.4; legacy ESLint consumers remain on their patched major 3. This requires Node 20 or >=22, consistent with the existing Node 22 CI.

The actual TypeScript project-service consumer is tested with a matching dotfile and a rejected nonmatching path; caches are cleared between different project-service configurations. The actual Blob -> OIDC -> CLI config dependency chain is resolved and its exported schemas tested using synthetic in-memory values. No global configuration files or tokens are read or written.

Application schemas now specify record key schemas, preserve sparse profile visibility with partialRecord, and infer enum unions directly. Profile.visibleModules describes the existing sparse contract as Partial<Record<ProfileModule, boolean>>. The final schema uses a checked ZodType annotation instead of asserting an incompatible type. Real default, legacy, scoped, invalid and recovery configurations are covered in six new tests; recovery expectations account for JSON dropping undefined properties.

The existing admin-editor CI now runs the same official moderate-or-higher audit gate after npm ci. Newly disclosed dependency problems fail that check instead of appearing only as non-blocking install output. The workflow keeps its existing unit/lint/types/build and production-browser checks.

## Local verification

Clean npm ci installs 429 packages and reports zero audit entries. Full and production-only official audits both exit zero. All 25 unit tests, lint, typecheck and the production build pass. Explicit test:e2e:prod passes 17 Chromium cases in 37.1s; SOP fast passes four commands and SOP release passes all six configured commands, including 17 Chromium cases in 37.5s and the official audit. All 487 non-root lockfile entries have official registry URLs and integrity hashes.

The same production build also passes all 17 Edge browser cases in 39.3s. Both browser runners exit successfully and clean up their owned local server.

Desktop/mobile screenshots were inspected: newer desktop edits remain present after an earlier save acknowledgment, and failed mobile saves retain the editable value and open modal. Test assertions cover retry, imports, scope isolation, recovery, page identity and unexpected browser errors. These are local production-build tests with synthetic credentials and empty Blob credentials; successful save transport is intercepted. Real hosted persistence, production rollout, complete drag/drop and comprehensive accessibility remain separate acceptance work. Browser plugin was unavailable, so verification uses Playwright. React 18 and Edge Runtime deprecation warnings remain follow-up items.
