# Admin Editor Notes

Last updated: 2026-07-06

This document records the current admin editor behavior and the main implementation decisions, so future edits can continue from the same mental model.

## Device editing

- The admin visual editor supports desktop and mobile layout modes.
- On a desktop host, both desktop and mobile layouts can be edited.
- On a mobile host, the editor is forced to mobile mode and desktop editing is disabled.
- Desktop editor layout mirrors the public page: profile on the left, ordered text blocks and card grids on the right.
- Main file: `components/admin/AdminVisualEditor.tsx`.

## Grid sizing

- Blocks use grid row spans instead of arbitrary pixel heights.
- A 1x1 square is the base cell.
- A 2x1 block has the same height as a 1x1 block.
- A 2x2 block has the height of two rows plus the row gap.
- Public and admin block grids use a 12-column CSS grid, but editor placement is interpreted as a simpler logical grid: 3 columns on desktop and 2 columns on mobile.
- Small or partial-width blocks can intentionally sit at the left, center, or right on desktop, or left/right on mobile, without forcing every earlier slot to be filled.
- Optional per-device placement is stored on the block as `placements.desktop.columnStart` / `placements.desktop.rowStart` and `placements.mobile.columnStart` / `placements.mobile.rowStart`.
- Before rendering, admin and public block grids compact saved row placements so a completely empty horizontal row does not keep vertical space.
- Public grid sizing is in `app/globals.css` and `constants/block-layout.ts`.
- Admin grid sizing uses 12 columns:
  - Desktop small/tall: 4 columns.
  - Desktop wide/large-square: 8 columns.
  - Desktop full-wide: 12 columns.
  - Mobile small/tall: 6 columns.
- Mobile wide/large-square/full-wide: 12 columns.
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

## Validation and deploy

- Standard checks after editor changes:
  - `npm run typecheck`
  - `npm run lint`
  - `npm run build`
- Template users can deploy with Vercel after setting the required environment variables.
- This local working copy currently uses Vercel production deploys during active development:
  - `npx vercel deploy --prod --yes`
