# Design and State Contract

Last updated: 2026-09-15

## Browser gate for interaction states

Production-build checks observe loading/checking recovery, empty/no draft, partial local-only draft, error/missing-Blob save and invalid import, and successful local restore/import. At 390px and desktop width the recovery actions must be visible in real Tab order (including reverse Tab), Enter-activatable, at least 44px wide and high, and the document must not overflow horizontally. This gate does not establish full WCAG conformance, color contrast, visual pixel parity, or all editor icon controls; retain manual design review for those surfaces.

## Recovery status hierarchy

The recovery strip sits below the sticky admin header and above the canvas. It must answer two questions in plain language: whether the draft is protected in this browser, and whether it has been published remotely.

- Loading: neutral strip while browser recovery is checked after hydration.
- Empty: no strip when there is no draft, no failure, and remote persistence is available.
- Partial: amber strip for a valid browser-only draft or missing Blob configuration; explicitly say “not published.”
- Error: red strip for corrupt/unreadable browser data, failed local backup, or failed remote save.
- Success: the existing Saved status and success toast are shown only after the server confirms persistence; the recovery strip disappears.

## Actions

- Restore is the primary action only when a previous valid draft is available.
- Export backup downloads the full recoverable configuration without publishing it.
- Discard requires a deliberate button action and removes only the namespaced local draft.
- Retry uses the existing Save action and never closes the modal on failure.

## Responsive and accessibility contract

- The strip wraps into a vertical layout on narrow screens and keeps actions at least 44px high.
- Status text uses `role="status"`; failures use `role="alert"`.
- Every action is a native button with a visible focus treatment and descriptive text.
- Recovery does not rely on hover, color alone, or pointer-only interaction.

## 2026-11-06 save and import feedback

The existing unsaved indicator remains visible when a prior save completes with newer edits pending. A bilingual notice distinguishes saving the earlier snapshot from saving all edits. Invalid acknowledgment and network failures retain the open dialog and offer retry. A file-read conflict tells the owner that their edits were kept and requests file reselection. No recovery action or responsive layout is removed. Admin tabs now use the title `Site Editor`; complete editor accessibility remains a separate audit.
