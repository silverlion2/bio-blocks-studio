# Design and State Contract

Last updated: 2026-09-08

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
