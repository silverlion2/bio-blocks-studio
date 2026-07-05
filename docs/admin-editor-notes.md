# Admin Editor Notes

Last updated: 2026-07-05

This document records the current admin editor behavior and the main implementation decisions, so future edits can continue from the same mental model.

## Device editing

- The admin visual editor supports desktop and mobile layout modes.
- On a desktop host, both desktop and mobile layouts can be edited.
- On a mobile host, the editor is forced to mobile mode and desktop editing is disabled.
- Desktop editor layout mirrors the public page: profile on the left, sections and blocks on the right.
- Main file: `components/admin/AdminVisualEditor.tsx`.

## Grid sizing

- Blocks use grid row spans instead of arbitrary pixel heights.
- A 1x1 square is the base cell.
- A 2x1 block has the same height as a 1x1 block.
- A 2x2 block has the height of two rows plus the row gap.
- Public grid sizing is in `app/globals.css` and `constants/block-layout.ts`.
- Admin grid sizing uses 12 columns:
  - Desktop small/tall: 4 columns.
  - Desktop wide/large-square: 8 columns.
  - Desktop full-wide: 12 columns.
  - Mobile small/tall: 6 columns.
  - Mobile wide/large-square/full-wide: 12 columns.

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

- Sections behave as text-shaped blocks, not containers that own block cards.
- Block cards can be top-level items by using the internal `__top_level__` section id; these blocks do not belong to any section.
- The top-level block grid and text sections share one vertical content-order axis, so a text section can be moved above or below the top-level block grid.
- The top-level block grid order is stored in `settings.topLevelBlocksSortOrder`; it is not represented by a visible or editable blank section.
- Moving a section only moves that section text. Any block cards that were still attached to that section are remapped to top-level blocks instead of moving with the section or attaching to the section that moved up.
- Deleting a section does not delete the block cards under it. Those blocks are remapped to top-level blocks.
- Empty sections render as text-only rows; the editor does not create visible blank section placeholders.
- Section title hover in the visual editor does not add a blue background.
- Dragging over a section does not tint the whole section blue; only the normal `放到这里` placeholder is used when a block placement preview is needed.
- Section delete is placed in the modal footer on the left, matching the block delete placement.
- Block dragging within the same section updates order live.
- Block dragging across sections uses a drag overlay plus a temporary target placeholder.
- The overlay follows the pointer while the real block remains as a faint placeholder at the original location.
- Cross-section placement is previewed with a same-sized dashed placeholder, which pushes target-section blocks away before drop.
- Cross-section insertion resolves the target section only after the drag intent point leaves the source section and enters another section's real rectangle. Then it simulates each possible CSS grid insertion slot and chooses the slot closest to the dragged card's projected position. It intentionally does not rely on dnd-kit's `overBlock`, because `overBlock` can be stale or misleading when the pointer is between blocks or when a preview placeholder is present.
- Pointer location is captured through global `pointermove` / `touchmove` listeners during drag and those listeners actively refresh the preview, because dnd-kit's `over` state can stay unchanged even after the pointer has moved to the intended side.
- Touch dragging uses a 500ms long press before activation, while mouse dragging still starts after a small movement threshold.
- Square drag overlays are normalized to a square rect for `small-square` and `large-square`, preventing temporary rectangular stretching during drag.
- Drag overlays use a dedicated static preview component rather than the full interactive `BlockCard`, so hover states and layout transitions cannot distort the preview while dragging.
- Mobile editor controls show section and block edit/delete buttons directly because hover is not available on touch screens.
- Drop placeholders set their final grid span immediately and do not animate width or height, which prevents temporary stretching while the target section reflows.
- Relevant state and helpers:
  - `activeDragBlockId`
  - `dragOverlayRect`
  - `dragPreviewPlacement`
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
- The modal focuses on cover image, title, subtitle, description, link, section, type, action, badge, icon, and visibility settings.
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
