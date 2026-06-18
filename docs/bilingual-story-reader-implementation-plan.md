# Bilingual Story Reader Implementation Plan

This plan turns `docs/bilingual-story-reader-design.md` into the simplified sentence-translation reader. The current implementation may contain older reader concepts; remove them directly. No backward compatibility, migrations, compatibility shims, or old-schema fallback paths are required.

## Current Product Decisions

- Use `Bilingual Story Reader` consistently for code paths, route paths, registry id, tests, and docs.
- Canonical route: `/tools/bilingual-story-reader/`.
- Delete obsolete fields and UI rather than preserving compatibility layers.
- Setup should be mostly prefilled: known language `English`, target language `Spanish`, level `A1`, length `Short`, and blank theme meaning automatic random theme.
- Language inputs should be dropdowns with recognizable labels/flags plus a custom-language fallback.
- Theme is optional; blank theme instructs the AI to choose a random concrete learner-appropriate theme.
- Removed setup concepts: translation style, vocabulary focus, tone, avoid topics, and custom level fields.
- Users should not care about JSON. UI labels should use `AI response`/`response`; JSON remains an internal/prompt contract detail only.
- Remove user-facing `Format JSON`.
- Copy/paste and error feedback should follow EPUB Maker: direct clipboard actions with toast-style alerts and recoverable inline errors.
- Paste response should not consume a full permanent column. Use a toolbar clipboard action first and a compact manual paste fallback.
- Detect and reject the generated prompt when it is pasted into the response path.
- Hide setup and paste panels after a valid story loads so reading is immersive.
- The reader has one help layer: sentence translation plus an optional sentence note.
- Remove word/phrase help, segment rendering, word-by-word translation, paragraph checks, comprehension questions, staged reveal state, and double-click behavior.
- Do not include `schemaVersion` in the AI response contract.

## Goals

- Build `/tools/bilingual-story-reader/` as a browser-only language-learning reader.
- Keep prompt generation, AI response cleanup, validation, normalization, warnings, and UI rendering separated.
- Make malformed external-AI output recoverable with plain validation errors.
- Preserve a calm reading experience centered on target-language prose.
- Add focused unit and functional coverage for the simplified schema.

## Non-Goals

- Calling an AI model directly.
- Persisting multiple stories.
- EPUB or printable export.
- Spaced repetition.
- Word-level vocabulary tooling.
- Comprehension quiz tooling.
- Full linguistic validation for every target language.
- Schema migrations or old response support.

## Simplified AI Response Shape

```ts
type StoryResponse = {
  story: {
    title: string;
    targetLanguage: string;
    knownLanguage: string;
    level: string;
    estimatedMinutes?: number;
  };
  paragraphs: Array<{
    sentences: Array<{
      text: string;
      translation: string;
      note?: string;
    }>;
  }>;
};
```

Required fields:

- `story.title`
- `story.targetLanguage`
- `story.knownLanguage`
- `story.level`
- `paragraphs`
- `paragraphs[].sentences`
- `sentences[].text`
- `sentences[].translation`

Optional fields:

- `story.estimatedMinutes`
- `sentences[].note`

Unknown fields should be ignored. They should not be preserved in the renderable view model unless a new product decision requires them.

## Progress Tracker

Status values:

- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete
- `[!]` Blocked or needs decision

### Phase 1: Contract And Types

- [ ] Remove `BILINGUAL_STORY_READER_SCHEMA_VERSION`.
- [ ] Remove segment kind, direction, and question-difficulty constants if no remaining code needs them.
- [ ] Replace renderable story types with the simplified story, paragraph, and sentence shape.
- [ ] Remove `RenderableSegment`, paragraph-help fields, grammar note arrays, usage note arrays, common mistake arrays, and word-by-word arrays.
- [ ] Keep level and length constants only if the setup form still uses them.

### Phase 2: Prompt Generation

- [ ] Update `buildBilingualStoryReaderPrompt` to request the simplified response shape.
- [ ] Remove `schemaVersion`, `generationRequest`, language objects, ids, segments, paragraph checks, vocabulary review, comprehension questions, and quality notes from the prompt example.
- [ ] Replace `naturalTranslation` with `translation`.
- [ ] Ask for `note` only when a sentence has a useful teaching point.
- [ ] Remove highlight-density and word/phrase hint instructions from level constraints.
- [ ] Remove custom-level prompt handling if the setup form removes custom level.
- [ ] Keep prompt-output rules strict: one fenced `json` code block and no surrounding commentary.

### Phase 3: Setup UI

- [ ] Keep known language, target language, level, length, theme, and extra instructions.
- [ ] Remove custom-level controls.
- [ ] Keep prompt preview if useful, but make it collapsible or secondary.
- [ ] Keep copy prompt behavior and prompt-pasted-by-mistake detection.
- [ ] Keep compact manual paste fallback.

### Phase 4: Cleanup And Validation

- [ ] Keep AI response cleanup for Markdown fences and surrounding prose.
- [ ] Remove schema-version validation.
- [ ] Validate required simplified story fields.
- [ ] Validate `paragraphs` is a non-empty array.
- [ ] Validate every paragraph has at least one sentence.
- [ ] Validate every sentence has `text` and `translation`.
- [ ] Treat `note` and `estimatedMinutes` as optional.
- [ ] Ignore unknown fields.
- [ ] Produce one renderable story view model consumed by UI components.

### Phase 5: Reader UI

- [ ] Replace the current reader with a sentence-only reader.
- [ ] Render story title, language pair, level, and optional estimated reading time.
- [ ] Render paragraphs as natural prose.
- [ ] Make each sentence selectable without changing text metrics.
- [ ] Use one active sentence state.
- [ ] On click, tap, Enter, or Space, show sentence help with `Translation` and optional `Note`.
- [ ] Remove word/phrase popovers and delayed single-click/double-click handling.
- [ ] Remove paragraph `Check paragraph` controls.
- [ ] Remove warning badges tied to old segment, direction, literal-translation, or clue behavior.
- [ ] Return focus to the triggering sentence when help closes.

### Phase 6: Tests

- [ ] Update prompt-builder tests for the simplified response shape and no `schemaVersion`.
- [ ] Update validation tests for required `translation`.
- [ ] Remove tests for schema version, ids, directions, segment concatenation, paragraph checks, clues, natural/literal translation, and word-by-word content.
- [ ] Keep cleanup tests for Markdown fences, surrounding prose, and syntax errors.
- [ ] Update functional tests so a valid pasted story renders title and prose.
- [ ] Add functional coverage for clicking a sentence and seeing translation plus optional note.
- [ ] Add a regression test that old extra fields are ignored rather than rendered.

### Phase 7: Final Verification

- [ ] Run unit tests.
- [ ] Run functional tests.
- [ ] Run accessibility tests if the page is covered.
- [ ] Run typecheck.
- [ ] Run lint.
- [ ] Run production build.
- [ ] Review the reader at desktop and mobile widths.

## Proposed File Structure

Keep the feature self-contained and expose only a small page-level entry point.

```text
src/features/bilingual-story-reader/
  components/
    BilingualStoryReaderPageView.tsx
    RenderedStoryView.tsx
  domain/
    constants.ts
    types.ts
    constraints.ts
    validate-story.ts
  services/
    prompt-builder.ts
    json-cleanup.ts
    clipboard.ts
  index.ts
```

Remove or avoid creating files dedicated to segments, vocabulary help, paragraph checks, reveal stages, repair-prompt migration, or schema versioning.

## Clean Architecture Boundaries

### Domain Layer

The domain layer is pure TypeScript and should not import React, Chakra, browser APIs, clipboard APIs, or route modules.

Responsibilities:

- Type definitions.
- Level and length constraints.
- Validation.
- Normalization.
- Warning generation where still useful.

Validation functions should return data instead of throwing for expected user-input failures.

```ts
type ParseResult<T> =
  | { ok: true; value: T; warnings: StoryWarning[] }
  | { ok: false; errors: ValidationError[]; warnings: StoryWarning[] };
```

### Services Layer

Responsibilities:

- Prompt generation.
- AI response cleanup.
- Clipboard abstraction.

Prompt generation should be deterministic. Given the same setup state, it should produce the same prompt text.

### Component Layer

Responsibilities:

- Layout.
- Forms.
- Reader rendering.
- Sentence help.
- Warnings and errors.
- Accessibility attributes.

Avoid putting validation rules or prompt string construction inside components.

## Validation Pipeline

Use one pipeline that converts unknown pasted text into a renderable view model.

```text
raw pasted text
  -> cleanupExternalAiOutput()
  -> parseJson()
  -> validateRequiredShape()
  -> normalizeStory()
  -> BilingualStoryReaderViewModel
```

Pipeline rules:

- Blocking validation errors stop before rendering.
- Warnings never prevent rendering.
- Cleanup warnings should be shown but not overemphasized.
- Optional fields should be normalized once so components do not repeatedly check for `undefined`.
- Unknown fields should be ignored.
- Do not migrate old field names.

## Unit Testing Strategy

Prompt builder tests:

- Required fields generate requirement lines.
- Blank optional fields are omitted from the requirement list.
- `Short`, `Medium`, and `Long` expand to the correct constraints.
- Level presets expand to the expected guidance.
- Prompt contains the simplified response shape.
- Prompt explicitly says not to include `schemaVersion`.
- Prompt is deterministic for the same setup state.

Cleanup tests:

- Plain AI response is unchanged except trimming.
- Markdown fenced AI response is extracted.
- AI response surrounded by prose is extracted.
- Braces inside quoted strings do not break extraction.
- Empty input returns a useful validation error.

Validation tests:

- Valid fixture parses into a renderable story.
- Missing required story fields are rejected.
- Empty paragraphs are rejected.
- Paragraph without sentences is rejected.
- Missing sentence text or translation is rejected.
- Unknown fields are ignored.
- Optional note can be omitted.
- Optional note is preserved when present.

## Functional Testing Strategy

Setup and prompt flow:

- Tool page loads from `/tools/bilingual-story-reader/`.
- `Copy Prompt` is disabled until required fields are filled.
- Generated prompt updates as form fields change.
- Optional blank fields do not appear in the human-readable prompt requirement list.
- Copy prompt writes expected text to the clipboard.

AI response paste flow:

- Pasting valid example AI response renders the reader.
- Pasting Markdown-wrapped AI response renders with a cleanup warning.
- Pasting invalid AI response shows validation errors.

Reader flow:

- Rendered story shows title, language pair, level, and paragraphs.
- Clicking a sentence opens sentence help.
- Sentence help shows translation.
- Sentence help shows note only when present.
- Closing help returns focus to the triggering sentence.

Mobile flow:

- Mobile viewport uses single-column setup and paste modes.
- Sentence help remains usable on narrow screens.

## Accessibility Testing Strategy

Manual accessibility checks:

- AI response textarea has a visible label and associated error text.
- Sentence control has a useful accessible name, such as `Open translation for sentence 3`.
- Help panel or popover manages focus appropriately.
- Closing help returns focus to the opener.
- Color is not the only indicator of active sentence or warning state.

## Validation Gates

Gate A: Prompt and contract cleanup

- Unit tests for prompt generation pass.
- Prompt no longer contains old fields.
- Typecheck passes.

Gate B: Parser and validator

- Cleanup tests pass.
- Validation tests pass.
- Valid simplified examples parse into normalized view models.
- Old fields are ignored, not migrated.

Gate C: Basic reader

- Valid story renders.
- Sentence selection works.
- Translation and optional note display correctly.
- Word/phrase and paragraph help code paths are gone.

Gate D: Release readiness

- `yarn test:unit`
- `yarn test:functional`
- `yarn test:a11y`
- `yarn typecheck`
- `yarn lint`
- `yarn build`

## Maintainability Rules

- Keep pure logic out of React components.
- Keep prompt text generation in one service.
- Keep validation errors machine-readable internally and user-readable at the UI edge.
- Normalize optional fields once after validation.
- Prefer small, composable validators over one large validator function.
- Do not let UI components inspect raw pasted AI response.
- Do not let UI components know about cleanup or parsing details.
- Do not let domain logic import browser APIs.
- Do not encode language-specific hacks in components.
- Add fixtures for every bug found in pasted AI output.
- Delete obsolete code when product scope shrinks.

## Definition Of Done

- The tool can generate a strict prompt from setup inputs.
- The prompt asks for the simplified no-version response shape.
- The tool can parse and render a valid external-AI story response.
- The reader supports sentence translation and optional sentence note.
- Obsolete reader features are removed, not hidden behind compatibility code.
- Core behavior is covered by unit tests.
- Primary workflows are covered by Playwright functional tests.
- Accessibility checks pass for the page.
