# Issue 97: Manual EPUB Image Embedding Plan

## UX Direction

Keep EPUB generation as a one-click flow. Only show manual image embedding after a generation attempt finds remote images that could not be fetched because of network or CORS failures.

The recovery prompt should be compact:

- If failed image sources are found, hold the generated EPUB in memory and open the dialog before downloading.
- List only failed image sources, grouped by page title when available, with duplicate source URLs shown once.
- Each row should show an image preview, the source URL with a nearby "Open" icon button, and grouped Upload/Paste replacement actions.
- Default action is to close the dialog with no download; a secondary "Download anyway" action intentionally saves the EPUB with external image references.
- When at least one replacement is provided, the primary button becomes "Regenerate EPUB".

Avoid iframes for remote images. Most CORS-blocked sources will also block useful iframe access, and embedding arbitrary remote pages adds security and layout risk.

## Implementation Plan

1. Extend EPUB build input with optional manual image replacements keyed by resolved image URL.
2. Reuse the existing `FETCH_IMAGE_FAILED` warnings to create a pending failed-image list after generation.
3. Add hook state and actions for opening the review dialog, attaching replacement files or clipboard images, downloading anyway, and regenerating.
4. Add a focused Chakra dialog component for failed images, optimized for small lists and mobile stacking.
5. Keep page content unchanged; replacements should be consumed during EPUB generation only.
6. Add unit tests around replacement registration and warning suppression when a replacement exists.
7. Run typecheck and targeted EPUB maker tests.

## Acceptance Notes

- Users who do not care can explicitly download the generated EPUB with external image references.
- Users do not have to manually fix every failed image before regenerating.
- External previews are attempted from the source URL; uploaded or pasted replacements update the preview.
- Replacements embed as local EPUB assets and no longer count as external image references.
- The flow should work for repeated attempts without duplicating warnings or stale replacements.
