# Bilingual Story Reader Implementation Plan

This plan turns `docs/bilingual-story-reader-design.md` into a working tool in small, verifiable steps. It is intentionally incremental: each phase should leave the codebase in a usable state, with focused tests and clear module boundaries.

## Current Product Decisions

- Use `Bilingual Story Reader` consistently for code paths, route paths, registry id, tests, and docs.
- Canonical route: `/tools/bilingual-story-reader/`.
- No backward compatibility is required while iterating. Delete obsolete fields and UI rather than keeping compatibility layers.
- Setup should be mostly prefilled: known language `English`, target language `Spanish`, level `A1`, length `Short`, and blank theme meaning automatic random theme.
- Language inputs should be dropdowns with recognizable labels/flags plus a custom-language fallback.
- Theme is optional; blank theme instructs the AI to choose a random concrete learner-appropriate theme.
- Removed setup fields: `translationStyle`, `vocabularyFocus`, `tone`, and `avoidTopics`.
- Users should not care about JSON. UI labels should use `AI response`/`response`; JSON should remain an internal/prompt contract detail only.
- Remove user-facing `Format JSON`.
- Copy/paste and error feedback should follow EPUB Maker: direct clipboard actions with toast-style alerts and recoverable inline errors.
- Paste response should not consume a full column. Use a toolbar clipboard action first and a compact manual paste fallback, following EPUB Maker’s Add-from-clipboard/manual-paste pattern.
- Detect and reject the generated prompt when it is pasted into the response path; otherwise the embedded schema example can look like a real story and confuse users.
- Hide setup and paste panels after a valid story loads so reading is immersive.
- Do not use persistent or layout-shifting help. Keep the story full width and show sentence, word/phrase, and paragraph help only as closeable popovers on hover/click/double-click/tap/focus.
- Text highlights must be paint-only; do not change text metrics with padding, font weight, border width, or similar active styles.

## Goals

- Build `/tools/bilingual-story-reader/` as a browser-only language-learning reader.
- Keep prompt generation, AI response parsing, validation, normalization, warnings, and UI rendering separated.
- Make malformed external-AI output recoverable without making the reader components defensive everywhere.
- Preserve a calm reading experience with just-in-time popover help.
- Add enough unit, functional, and accessibility coverage to make future schema changes safe.

## Non-Goals For The First Pass

- Calling an AI model directly.
- Persisting multiple stories.
- EPUB or printable export.
- Advanced spaced repetition.
- Perfect language detection.
- Full linguistic validation for every target language.
- Advanced bottom-sheet snap physics if the existing UI stack does not already provide it.

## Progress Tracker

Status values:

- `[ ]` Not started
- `[~]` In progress
- `[x]` Complete
- `[!]` Blocked or needs decision

### Phase 0: Foundation

- [x] Confirm final AI response schema fields and allowed values from the design doc.
- [x] Add implementation constants for levels, lengths, translation styles, directions, segment kinds, and question difficulty.
- [x] Add route metadata and registry entry for `bilingual-story-reader`.
- [x] Create the empty `/tools/bilingual-story-reader/` page.
- [x] Create `src/features/bilingual-story-reader/` with domain, services, hooks, components, examples, and test fixtures.
- [x] Add a minimal page shell with toolbar, setup panel, paste panel, and placeholder status.
- [x] Validate that the empty tool builds, typechecks, and appears in the tools list.

### Phase 1: Setup Form And Prompt Generation

- [x] Implement setup form state with required fields: known language, target language, level, theme, length, translation style.
- [x] Implement optional fields: vocabulary focus, tone, avoid topics, extra instructions.
- [x] Implement `Custom` level fields, but keep them hidden until `Custom` is selected.
- [x] Implement prompt constraint expansion for length presets.
- [x] Implement prompt constraint expansion for level presets.
- [x] Implement prompt constraint expansion for translation style.
- [x] Generate the prompt from a pure service function.
- [x] Omit blank optional requirement lines from the human-readable prompt section.
- [x] Represent blank optional `generationRequest` values as AI response `null`.
- [x] Add prompt preview.
- [x] Add copy prompt behavior with transient feedback.
- [x] Validate that `Copy Prompt` is disabled until required fields are present.

### Phase 2: AI response Input, Cleanup, And Parsing

- [x] Implement raw AI response textarea state.
- [x] Implement common AI-wrapper cleanup.
- [x] Strip Markdown AI response fences.
- [x] Trim surrounding prose using a conservative string-aware JSON object scanner.
- [x] Preserve raw pasted text separately from cleaned AI response text.
- [x] Parse AI response safely and return line/column syntax errors when possible.
- [x] Add invalid AI response validation output in plain language.
- [x] Validate that cleanup warnings render without blocking valid cleaned AI response.

### Phase 3: Schema Validation And Normalization

- [x] Validate `schemaVersion` exactly equals `1.0`.
- [x] Validate required story fields.
- [x] Validate `paragraphs` is a non-empty array.
- [x] Validate every paragraph has an id and at least one sentence.
- [x] Validate paragraph ids are unique.
- [x] Validate every sentence has `id`, `text`, and `naturalTranslation`.
- [x] Validate sentence ids are unique.
- [x] Validate enum fields only accept allowed values.
- [x] Validate segment concatenation after NFC normalization.
- [x] Disable vocabulary highlights for invalid segment sets without blocking the story.
- [x] Normalize missing optional arrays to empty arrays in the renderable view model.
- [x] Normalize missing directions to `auto` with a warning.
- [ ] Normalize translation display order from the requested translation style.
- [x] Produce one renderable story view model consumed by UI components.

### Phase 4: Render Warnings And Repair Prompt

- [ ] Implement warning categories: `cleanup`, `structural`, `request-mismatch`, `quality`.
- [ ] Add deterministic warnings for cleanup, segment mismatch, missing direction, missing literal translation, and count mismatch.
- [ ] Add conservative quality warnings for missing explanations and repeated clues.
- [ ] Keep heuristic warnings visually quieter than structural warnings.
- [ ] Implement repair prompt generation from validation errors and raw pasted output.
- [ ] Include at most 40,000 characters of invalid output in the repair prompt.
- [ ] Prefer the extracted AI response-looking object when raw output contains surrounding prose.
- [ ] Add a truncation note when repair prompt input is clipped.
- [ ] Add `Copy Repair Prompt` only when validation fails.

### Phase 5: Reader Shell

- [x] Render story title, languages, level, estimated reading time, and warning count.
- [x] Render paragraphs and sentences from the normalized view model.
- [x] Render sentence text from `segments[].text` only when segments are valid.
- [x] Render sentence text from `sentence.text` when segments are missing or invalid.
- [x] Add selected help state.
- [x] Remove staged reveal state and `Reset Reveals`; help popovers show the available help immediately.
- [x] Add reading progress such as `Paragraph 2 of 5`.
- [ ] Add paste/read mode switching.
- [ ] Preserve active sentence and scroll target when switching modes.

### Phase 6: Sentence Help

- [x] Replace side panel/bottom panel with closeable popovers.
- [x] Show `Clue`, `Meaning`, `Translation`, and `Why it works` when available without `Reveal next`.
- [x] Render natural translation with literal translation when present.
- [~] Render grammar notes, usage notes, common mistakes, word-by-word rows, and segment morphology under `Why it works`.
- [ ] Hide missing optional reveal sections instead of showing empty placeholders.
- [ ] Return focus to the triggering sentence when help closes.

### Phase 7: Vocabulary And Paragraph Help

- [x] Render hintable segments with dotted underline and keyboard focus.
- [x] Avoid nested native button markup inside sentence controls.
- [x] Open vocabulary popover.
- [ ] Open vocabulary help in the bottom panel on mobile.
- [x] Render lemma, part of speech, meaning, hint, pronunciation/romanization, and notes when available.
- [x] Add paragraph `Check paragraph` controls only when paragraph help exists.
- [x] Render paragraph question, key point, summary, and answer in a popover.

### Phase 8: Mobile And Accessibility Hardening

- [ ] Implement mobile paste mode with full-screen textarea and sticky `Render Story`.
- [ ] Implement mobile help panel that does not cover the active sentence where possible.
- [ ] Defer advanced snap points unless the component is already available.
- [ ] Implement roving focus for sentence navigation.
- [ ] Keep only the active sentence in the normal tab order.
- [ ] Make vocabulary terms in the active sentence keyboard reachable.
- [ ] Add `J` / `K` sentence navigation when text inputs are not focused.
- [ ] Add `Esc` close behavior for popovers and help panels.
- [ ] Add visible labels and associated error text for the AI response textarea.
- [ ] Set `dir` attributes on story and help regions.
- [ ] Add accessible shortcut help in a toolbar menu or dialog.

### Phase 9: Curated Examples

- [ ] Add Spanish A1 example fixture.
- [ ] Add Japanese A2 example fixture with romanization and particle notes.
- [ ] Add one RTL or non-Latin-script example fixture.
- [ ] Ensure examples are valid schema `1.0`.
- [ ] Ensure examples double as parser and renderer regression fixtures.
- [ ] Verify examples render without validation errors.

### Phase 10: Final Integration

- [ ] Run unit tests.
- [ ] Run functional tests.
- [ ] Run accessibility tests.
- [ ] Run typecheck.
- [ ] Run lint.
- [ ] Run production build.
- [ ] Review final page on desktop, tablet, and mobile widths.
- [ ] Confirm no unrelated files were modified.

## Proposed File Structure

Keep the feature self-contained and expose only a small page-level entry point.

```text
src/features/bilingual-story-reader/
  components/
    BilingualStoryReaderPageView.tsx
    BilingualStoryReaderToolbar.tsx
    StorySetupForm.tsx
    PromptPreview.tsx
    JsonPastePanel.tsx
    ValidationSummary.tsx
    ReaderHeader.tsx
    StoryArticle.tsx
    SentenceText.tsx
    SentenceHelpPanel.tsx
    VocabularyHelp.tsx
    ParagraphCheck.tsx
    WarningSummary.tsx
  domain/
    schema.ts
    types.ts
    constraints.ts
    normalize-story.ts
    validate-story.ts
    validate-segments.ts
    warning-types.ts
    count-target-text.ts
  hooks/
    useBilingualStoryReader.ts
    useBilingualStoryReaderKeyboard.ts
    useBilingualStoryReaderFocus.ts
    useTransientFeedback.ts
  services/
    prompt-template.ts
    prompt-builder.ts
    json-cleanup.ts
    repair-prompt.ts
    clipboard.ts
  examples/
    spanish-a1.ts
    japanese-a2.ts
    rtl-example.ts
  fixtures/
    valid-story.ts
    invalid-story.ts
  index.ts
```

Route files:

```text
src/app/tools/bilingual-story-reader/
  layout.tsx
  page.tsx
```

Registry files should follow the existing tools registry pattern in `src/features/tools/`.

## Clean Architecture Boundaries

### Domain Layer

The domain layer is pure TypeScript and should not import React, Chakra, browser APIs, clipboard APIs, or route modules.

Responsibilities:

- Type definitions.
- Allowed values.
- Constraint presets.
- Validation.
- Normalization.
- Segment matching.
- Count utilities.
- Warning generation.

Validation functions should return data instead of throwing for expected user-input failures.

Recommended shape:

```ts
type ParseResult<T> =
  | { ok: true; value: T; warnings: StoryWarning[] }
  | { ok: false; errors: ValidationError[]; warnings: StoryWarning[] };
```

### Services Layer

The services layer handles integration details that are not UI components.

Responsibilities:

- Prompt generation.
- Prompt repair text.
- AI response cleanup.
- Clipboard abstraction.
- Example loading helpers.

Prompt generation should be deterministic. Given the same setup state, it should produce the same prompt text.

### Hooks Layer

Hooks coordinate browser and UI state.

Responsibilities:

- Setup form state.
- Raw and cleaned AI response text.
- Active sentence and paragraph state.
- Reveal state.
- Keyboard handling.
- Focus return.
- Copy feedback.

Hooks may import domain and services. Domain and services must not import hooks.

### Component Layer

Components should be mostly presentational and consume normalized view models.

Responsibilities:

- Layout.
- Forms.
- Reader rendering.
- Help panels.
- Warnings and errors.
- Accessibility attributes.

Avoid putting validation rules or prompt string construction inside components.

## State Model

Use grouped state rather than many unrelated `useState` calls in the page component.

```ts
type BilingualStoryReaderState = {
  setup: SetupState;
  prompt: PromptState;
  jsonInput: JsonInputState;
  validation: ValidationState;
  reader: ReaderState;
  help: HelpPanelState;
};
```

Suggested groups:

- `SetupState`: form values and derived constraints.
- `PromptState`: generated prompt, preview expanded, copy status.
- `JsonInputState`: raw text, cleaned text, formatting status.
- `ValidationState`: parsed story, blocking errors, render warnings.
- `ReaderState`: active paragraph id, active sentence id, reveal levels, paragraph reveal state, scroll target.
- `HelpPanelState`: selected segment, selected paragraph, open/closed state, mobile/desktop mode.

## Validation Pipeline

Use one pipeline that converts unknown pasted text into a renderable view model.

```text
raw pasted text
  -> cleanupExternalAiOutput()
  -> parseJson()
  -> validateSchemaVersion()
  -> validateRequiredShape()
  -> validateAllowedValues()
  -> validateIds()
  -> validateSegments()
  -> normalizeStory()
  -> computeRequestMismatchWarnings()
  -> computeQualityWarnings()
  -> BilingualStoryReaderViewModel
```

Pipeline rules:

- Blocking validation errors stop before rendering.
- Warnings never prevent rendering.
- Cleanup warnings should be shown but not overemphasized.
- Optional fields should be normalized once so components do not repeatedly check for `undefined`.
- Segment mismatch should disable highlights only for the affected sentence.
- Unknown fields should be ignored but preserved nowhere unless a future feature needs them.

## Unit Testing Strategy

Unit tests should cover pure behavior first. Most tests belong beside the domain or service file they exercise.

### Prompt Builder Tests

- Required fields generate requirement lines.
- Blank optional fields are omitted from the requirement list.
- Blank optional `generationRequest` values become AI response `null`.
- `Short`, `Medium`, and `Long` expand to the correct constraints.
- `Beginner`, `A1`, `A2`, `B1`, `B2`, `C1`, `C2`, and `Custom` expand correctly.
- Prompt contains the schema version and allowed values.
- Prompt is deterministic for the same setup state.

### AI response Cleanup Tests

- Plain AI response is unchanged except trimming.
- Markdown fenced AI response is extracted.
- AI response surrounded by prose is extracted.
- Braces inside quoted strings do not break extraction.
- Multiple top-level AI response-looking objects are treated conservatively.
- Empty input returns a useful validation error.

### Validation Tests

- Valid fixture parses into a renderable story.
- Unsupported `schemaVersion` is rejected.
- Missing required story fields are rejected.
- Empty paragraphs are rejected.
- Paragraph without sentences is rejected.
- Duplicate paragraph ids are rejected.
- Missing sentence id, text, or natural translation is rejected.
- Duplicate sentence ids are rejected.
- Invalid enum values are rejected.
- Unknown fields are ignored.
- Optional fields can be omitted.

### Segment Tests

- Valid segment concatenation is accepted.
- NFC-equivalent segment text is accepted.
- Accent mismatch disables highlights for that sentence.
- Spacing mismatch disables highlights for that sentence.
- Punctuation mismatch disables highlights for that sentence.
- Invalid segment kind is rejected or disables segment help according to the chosen rule.

### Warning Tests

- Markdown cleanup produces a cleanup warning.
- Extra prose cleanup produces a cleanup warning.
- Missing direction produces an `auto` direction warning.
- Missing literal translation for `Literal` or `Both` produces a warning.
- Paragraph or sentence count outside request range produces a warning.
- Word count is skipped with a warning for non-whitespace languages without character constraints.
- Repeated clues produce a quality warning.
- Missing `Why it works` content produces a quality warning only when the rule applies.

### Repair Prompt Tests

- Validation errors are included.
- Raw invalid output is included.
- Large output is truncated at the configured limit.
- Truncation note is included when clipped.
- Repair prompt asks for AI response only.
- Repair prompt preserves story content unless schema repair requires changes.

## Functional Testing Strategy

Use Playwright for user-visible workflows.

### Setup And Prompt Flow

- Tool page loads from `/tools/bilingual-story-reader/`.
- `Copy Prompt` is disabled until required fields are filled.
- Filling required fields enables `Copy Prompt`.
- Prompt preview updates as form fields change.
- Optional blank fields do not appear in the human-readable prompt requirement list.
- Copy prompt writes expected text to the clipboard.

### AI response Paste Flow

- Pasting valid example AI response renders the reader.
- Pasting Markdown-wrapped AI response renders with a cleanup warning.
- Pasting invalid AI response shows validation errors.
- Invalid AI response shows `Copy Repair Prompt`.

### Reader Flow

- Rendered story shows title, language pair, level, progress, and paragraphs.
- Clicking or double-clicking a sentence opens sentence help in a popover; highlighted word/phrase clicks open word help.
- Word/phrase single-clicks are delayed briefly so double-click can cancel word help and open sentence help.
- Sentence help shows available clue, meaning, translation, and explanation without staged reveal controls.
- Vocabulary segment opens word/phrase help in a popover.
- Paragraph check shows question, key point, summary, and answer in a popover.
- Warning count opens or reveals warning details.

### Keyboard Flow

- `J` and `K` move active sentence when text inputs are not focused.
- `R` reveals the next help level.
- `Esc` closes open help.
- Focus returns to the triggering sentence or segment.
- Tab order does not traverse every sentence in long stories.

### Mobile Flow

- Mobile viewport uses single-column setup and paste modes.
- Mobile paste mode uses a full-screen textarea and sticky render action.
- Sentence help opens in the bottom help panel.
- Vocabulary help opens in the bottom help panel.
- Tapping another sentence while help is open updates the help content.

## Accessibility Testing Strategy

Run the existing a11y test suite after the page is registered.

Manual accessibility checks:

- AI response textarea has a visible label and associated error text.
- Active sentence control has a useful accessible name.
- Vocabulary terms are keyboard reachable without nested interactive markup.
- Help panel traps or manages focus appropriately.
- Closing help returns focus to the opener.
- Color is not the only indicator of active sentence or warning state.
- `dir` attributes are applied for target and known language regions.
- Shortcut help is discoverable from a toolbar menu or dialog.

## Validation Gates

Each phase should pass the listed gate before moving on.

### Gate A: Empty Tool

- `yarn typecheck`
- `yarn lint`
- Tool route loads.
- Tools registry shows the new tool.

### Gate B: Prompt Builder

- Prompt builder unit tests pass.
- Setup form functional smoke test passes.
- Prompt preview and clipboard behavior work.

### Gate C: Parser And Validator

- AI response cleanup tests pass.
- Validation tests pass.
- Segment tests pass.
- Valid examples parse into normalized view models.
- Invalid examples produce expected blocking errors.

### Gate D: Basic Reader

- Valid story renders.
- Sentence selection works.
- Reveal state works.
- Segment fallback works.
- Warnings render without blocking.

### Gate E: Full Reader

- Vocabulary help works.
- Paragraph checks work.
- Keyboard navigation works.
- Mobile help behavior works at a basic level.
- Accessibility tests pass.

### Gate F: Release Readiness

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
- Prefer discriminated unions for parse results, warning categories, help selections, and reveal stages.
- Do not let UI components inspect raw pasted AI response.
- Do not let UI components know about cleanup or parsing details.
- Do not let domain logic import browser APIs.
- Do not encode language-specific hacks in components.
- Add fixtures for every bug found in pasted AI output.

## Suggested MVP Cut

If scope needs to be reduced, ship this first:

- Setup form.
- Prompt generation and copy.
- Prompt preview.
- AI response paste, cleanup, parsing, validation.
- Repair prompt.
- Basic rendered reader.
- Sentence reveal stages.
- Segment highlighting with fallback.
- Warning summary.
- Spanish A1 curated example.
- Unit tests for prompt generation, cleanup, validation, normalization, and segments.
- Functional tests for prompt copy, valid paste, invalid paste, sentence reveal, and mobile paste mode.

Defer:

- Advanced bottom-sheet snap points.
- Full roving focus polish.
- Japanese and RTL examples if time is tight, but keep the schema ready.
- Heuristic language leakage detection.
- Sophisticated quality warnings.
- Persistent storage.

## Open Implementation Decisions

- Should invalid `segments[].kind` block rendering, or only disable that segment/sentence highlight?
- Should paragraph id uniqueness block all rendering, or can ids be regenerated during normalization?
- Should examples live as TypeScript fixtures, AI response files under `public`, or both?
- Should `estimatedMinutes` be trusted from AI response or recomputed locally from text length?
- Which existing UI primitive should power desktop popovers and mobile bottom help?
- How much custom language counting should be implemented before deferring to warnings?

## Definition Of Done

- The tool can generate a strict prompt from setup inputs.
- The tool can parse and render a valid external-AI AI response story.
- The tool gives clear recovery steps for malformed pasted output.
- The reader supports progressive sentence help and vocabulary help.
- Invalid optional enhancements do not block reading.
- Core behavior is covered by unit tests.
- Primary workflows are covered by Playwright functional tests.
- Accessibility checks pass for the page.
- The implementation follows the feature module boundaries above.
