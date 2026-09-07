# Admin Editor Notes

Last updated: 2026-07-08

This document records the current admin editor behavior and the main implementation decisions, so future edits can continue from the same mental model.

## Device editing

- The admin visual editor supports desktop and mobile layout modes.
- On a desktop host, both desktop and mobile layouts can be edited.
- On a mobile host, the editor is forced to mobile mode and desktop editing is disabled.
- Desktop editor layout mirrors the public page: profile on the left, ordered text blocks and card grids on the right.
- Main file: `components/admin/AdminVisualEditor.tsx`.

## Grid sizing

- Blocks use grid row spans instead of arbitrary pixel heights.
- The CSS grid uses a half-height row unit. Existing one-row cards span two CSS rows, which preserves the old visual size while allowing compact text blocks to use a half-height row.
- A 1x1 square is still the visual base cell.
- A 2x1/2 block spans two logical columns and one half-height row.
- A 3x1/2 block spans the full desktop content width and one half-height row.
- A 2x1 block has the same height as a 1x1 block.
- A 2x2 block has the height of two rows plus the row gap.
- Full-width cards can use 3x1, 3x2, or 3x3 presets on desktop; on mobile they remain full width with matching height presets.
- Public and admin block grids use a 12-column CSS grid, but editor placement is interpreted as a simpler logical grid: 3 columns on desktop and 2 columns on mobile.
- Small or partial-width blocks can intentionally sit at the left, center, or right on desktop, or left/right on mobile, without forcing every earlier slot to be filled.
- Optional per-device placement is stored on the block as `placements.desktop.columnStart` / `placements.desktop.rowStart` and `placements.mobile.columnStart` / `placements.mobile.rowStart`.
- Before rendering, admin and public block grids compact saved row placements so a completely empty horizontal row does not keep vertical space.
- Public grid sizing is in `app/globals.css` and `constants/block-layout.ts`.
- Public desktop layout is responsive at the shell level: wide desktop uses the left profile column plus the right content column; narrower desktop/tablet stacks the profile above content; phone width uses the mobile two-logical-column block layout.
- Public desktop content width is content-aware. It uses at least two logical columns and expands to three only when visible non-text blocks occupy the third column. Full-width text blocks do not force the right content area to three columns by themselves.
- Admin grid sizing uses 12 columns:
  - Desktop small/tall: 4 columns.
  - Desktop wide/large-square: 8 columns.
- Desktop full-wide: 12 columns.
- Desktop full-tall/full-square: 12 columns.
- Mobile small/tall: 6 columns.
- Mobile wide/large-square/full-wide/full-tall/full-square: 12 columns.
- Text blocks use `type: "section"` and `size: "section-text"`. They always occupy the full content width: 3 logical columns on desktop and 2 logical columns on mobile.

## Resize behavior

- Resize is handled by dragging the bottom-right handle on each block.
- During drag, the block snaps live to preset grid sizes instead of following arbitrary mouse pixel dimensions.
- Size changes animate with a FLIP-style layout animation.
- The active block surface also animates width/height during size changes.
- Relevant helpers:
  - `getPointerResizeDraft`
  - `getDefaultGridSpan`
  - `getDefaultRowSpan`
  - `animateAdminBlockLayout`

## Section and block editing

- Sections are no longer first-class editable containers. The section-like heading is a block with `type: "section"` and `size: "section-text"`.
- Every block uses the internal `__top_level__` section id; blocks do not belong to any text block.
- Saved, imported, and default configs are normalized so older `sections` become full-width text blocks and older section-owned cards are migrated into the shared content flow immediately after that text block.
- The card grid and text blocks share one vertical content-order axis, so a text block can be moved above, below, or between card groups.
- Top-level block cards keep their own `sortOrder` on the shared content axis; they are not represented by a visible or editable blank section.
- Dragging a card near a text block inserts it before or after that text block on the shared content axis. This lets a square block move above a text block instead of being forced below it.
- Moving a text block only moves that text block. It never carries nearby cards with it.
- Deleting a text block deletes only that text block.
- The editor does not create visible blank section placeholders.
- Text block hover uses a neutral gray background, not a blue drop-container tint.
- Block dragging within a card grid updates only the dragged block's grid placement. It must not renumber unrelated siblings or move top-level siblings across text blocks.
- Dragging between text blocks/card groups uses a drag overlay plus a temporary target placeholder.
- Each visible card group gets its own admin-only content group id. Drag placement uses the nearest real card group, not every top-level card on the page, so a card can move from one group into another group across a text block.
- Text-block dragging can split a visible card group temporarily. When the pointer indicates a position between two visual rows of cards, the preview should render as `cards above + text preview + cards below`, and mouseup should write the same shared content order.
- The overlay follows the pointer while the real block remains as a faint placeholder at the original location.
- Cross-section placement is previewed with a same-sized dashed placeholder, which pushes target-section blocks away before drop.
- Dragging a block records its logical grid column and row in the active device mode, clamped to the valid range for that block size. This supports intentional empty spaces and diagonal placements, such as one small block at top-left and another at bottom-right.
- While dragging within the same section, a same-sized in-flow `放到这里` placeholder moves to the intended logical grid cell before mouseup, so nearby blocks avoid the target cell during preview. The original sortable node is kept mounted for dnd-kit but removed from normal flow and hidden, so the old position does not keep occupying space.
- Normalizing block order preserves top-level block `sortOrder` values, because top-level blocks share vertical order with text sections instead of using section-local numbering.
- Preview placement changes use a lightweight FLIP pass over admin grids, so blocks that avoid the placeholder move through a short transition instead of hard-jumping.
- Sortable block transforms use translation only, not scale, because mixed-size blocks should never be visually resized by dnd-kit while sorting.
- Cross-section insertion resolves the target section only after the drag intent point leaves the source section and enters another section's real rectangle. Then it simulates each possible CSS grid insertion slot and chooses the slot closest to the dragged card's projected position. It intentionally does not rely on dnd-kit's `overBlock`, because `overBlock` can be stale or misleading when the pointer is between blocks or when a preview placeholder is present.
- Pointer location is captured through global `pointermove` / `touchmove` listeners during drag and those listeners actively refresh the preview, because dnd-kit's `over` state can stay unchanged even after the pointer has moved to the intended side.
- Touch dragging uses a 500ms long press before activation, while mouse dragging still starts after a small movement threshold.
- Square drag overlays are normalized to a square rect for `small-square` and `large-square`, preventing temporary rectangular stretching during drag.
- Drag overlays use a dedicated static preview component rather than the full interactive `BlockCard`, so hover states and layout transitions cannot distort the preview while dragging.
- Mobile editor controls show text-block and card edit/delete buttons directly because hover is not available on touch screens.
- Dragging a text block shows a neutral gray drag background. Text-block hover still does not imply that block cards belong inside the text block.
- Drop placeholders set their final grid span immediately and do not animate width or height, which prevents temporary stretching while the target section reflows.
- Admin content spacing uses one visual rhythm: section shell padding plus the outer content gap matches the heading-to-grid gap, so dragging a text section does not change the apparent distance to nearby block grids.
- Relevant state and helpers:
  - `activeDragBlockId`
  - `dragOverlayRect`
  - `dragPreviewPlacement`
  - `targetContentIndex`
  - `getAdminBlockVisualRect`
  - `getCrossSectionInsertionIndex`
  - `getInsertionIndexFromPointer`
  - `BlockDropPreview`

## Drag and drop guardrails

The current drag behavior is intentionally split into three separate layers. Keep them separate when editing this file:

- `DragOverlayBlockPreview` and `DragOverlayTextBlockPreview` are pointer-following visuals only. They should not take part in layout, sorting, hit testing, or saved placement.
- `BlockDropPreview`, `TextBlockDropPreview`, and `StandaloneBlockDropPreview` are target-location previews. They show where mouseup will place the block.
- The real sortable node stays mounted for dnd-kit while dragging. When a target preview is active, the original square card can be visually hidden or removed from normal flow, but the sortable identity should stay stable.

Text block dragging has one extra rule: render at most one text-block drop preview for the active drag. The `didRenderTextPreview` guard prevents the old bug where long-pressing and moving a text block left behind multiple blue preview copies after drop.

Standalone top-level previews are for positions such as the very top of the content list, the gap between two text blocks, or an empty card group. They must stay purely visual:

- Do not add `useDroppable` to `StandaloneBlockDropPreview`.
- Do not nest a `SortableContext` inside the standalone preview.
- Do not put `data-admin-section-grid-id` on the standalone preview shell.

Those attributes make the preview become a live drag target, which can change dnd-kit's `over` result during the same drag and cause flicker, wrong preview positions, or page-level drag crashes.

Square block reordering depends on measured rectangles captured before the preview mutates layout:

- `captureAdminBlockRects` snapshots block rects at drag start.
- `getMeasuredAdminBlockRect` prefers the snapshot while dragging.
- `clearAdminBlockRectsSnapshot` clears the snapshot after drag end/cancel.

This prevents the dashed preview itself from changing the hit-test geometry while the pointer is still moving. Without the snapshot, dragging a left-column square card toward the right half of a right-column card can bounce the preview back to the left because the preview-induced reflow changes the rects being tested.

When the preview is inside an existing card grid, preview placement and actual drop placement must use the same data:

- `dragPreviewPlacement.targetIndex` decides the content insertion point.
- `dragPreviewPlacement.columnStart` and `dragPreviewPlacement.rowStart` decide the active device grid cell.
- `BlockDropPreview` receives those placement values so the preview appears in the same cell the drop will write.
- Non-preview cards pass through `withoutBlockPlacementForDevice` during preview compaction. This lets the temporary preview own the target cell instead of being pulled back by another card's saved placement.

Do not change one of those values without changing the drop commit path in the same way. The editor should never show a preview in one place and then drop the block somewhere else.

Pointer intent rules:

- On a target square card, the pointer's left half means insert before that card and the right half means insert after it.
- On top-level content gaps, `targetContentIndex` decides whether the square card lands above the first text block, between two text blocks, or below a text block.
- Text blocks are content-flow items. Square cards are grouped top-level blocks. A text block never owns nearby cards.
- When dragging a text block, expand card groups by measured visual row/column order, not only by `sortOrder`. This keeps first-time insertion into the middle of a card group consistent with later drags after the group has already been split.
- When two text blocks are close together, choose the target by the pointer's nearest text-block body or edge. Hovering the lower half of the upper text block should insert below that upper block, not skip to below the next text block.
- Text-block group-splitting preview and final drop must both use the same `targetContentIndex`; do not let the preview depend on one ordering model while the commit path writes another.

Regression checks after touching drag logic:

- Drag a square card from the left column to the right half of the rightmost card; the preview should stay on the right and the drop should match it.
- Drag a square card to the very top above the first text block; the preview should appear there before mouseup and no page crash should occur.
- Drag a square card between two text blocks when no square cards are already between them; the standalone preview should appear and the drop should match.
- Drag a text block by long-press or mouse drag; after drop, no extra blue/gray preview copy should remain.
- Drag a never-moved text block into the gap between two visual rows of cards; the text preview should appear between those rows before mouseup, and the drop should match.
- Drag a text block over the lower half of a text block that has another text block directly below it; the target should be below the hovered text block, not below the next one.
- Drag within a card grid and across text blocks; the page should not show `This page couldn't load`.

## Profile editing

- The profile card is edited inline instead of through one large profile modal.
- Avatar hover shows a small circular icon button.
- Avatar image selection opens a crop dialog with circular preview.
- Display name, headline, bio, and base/location are inline editable.
- Tags open a dedicated tags modal.
- Social buttons appear in the admin profile area below tags and open a dedicated social-links modal.
- Social links support:
  - ordering
  - icon presets
  - automatic icon detection from common links
  - link action or copy action

## Image upload and cropping

- Image upload and crop is shared by avatar and block cover images.
- Main component: `components/admin/ImageCropUploader.tsx`.
- The crop dialog is rendered through a portal into `document.body`, so it is not blocked by section/block z-index.
- The crop UI is light themed.
- Users crop by dragging a visible selection box directly on the image.
- Users can drag the box to move it, drag the corners to resize it, choose aspect presets, choose custom/free ratio for block images, and rotate the image.
- Avatar crop is forced to 1:1 and circular.

## Block editing modal

- Block editing uses a simplified light modal.
- The modal focuses on cover image, title, subtitle, description, link, type, action, badge, icon, and visibility settings. Text blocks hide card-only fields and expose title alignment/size instead.
- Block size is not edited in the modal; size changes happen directly on the visual canvas.
- Delete is placed in the modal footer on the left, aligned with Cancel and Save.
- Dropdown labels are bilingual Chinese/English.
- Icon selection is a button group and includes a `not displayed` option.
- Main file: `components/admin/BlockForm.tsx`.

## Block card display

- If a block has a cover image, the image is shown fully by default.
- The title appears in a white bordered capsule at the bottom-left.
- The title capsule can wrap to two lines and then truncate.
- On hover, the cover image fades to transparent and the detail content appears above it.
- The title capsule hides on hover so the detail content can occupy the top layer.
- The badge uses a matching white bordered capsule style.
- Main file: `components/blocks/BlockCard.tsx`.

## Public profile display

- The default placeholder email `example@example.com` is hidden and removed from the default config.
- Social links can either navigate or copy content.
- Main file: `components/site/ProfileModuleRenderer.tsx`.

## Draft recovery and persistence state

- Valid dirty edits are stored under the versioned `bio-blocks-studio:admin-draft:v1` browser key after mount.
- Automatic drafts redact every variant `accessCode`; restore keeps the access codes from the currently loaded server config and leaves new draft-only variants blank.
- A detected draft is validated before it can enter editor state. Save remains disabled until the user restores or discards it.
- Missing Blob configuration, local-storage failure, and remote-save failure are persistent inline states rather than toast-only feedback.
- Modal save closes only after the authenticated config endpoint returns success. A successful remote save is the only automatic path that clears the draft.
- Recovery controls use native buttons, 44px minimum targets, wrapping action rows, and keyboard activation at mobile width.

## Validation and deploy

- Standard checks after editor changes:
  - `npm run typecheck`
  - `npm run lint`
  - `npm run build`
- Template users can deploy with Vercel after setting the required environment variables.
- This local working copy currently uses Vercel production deploys during active development:
  - `npx vercel deploy --prod --yes`
