# Story Reader Implementation Plan

This plan turns `docs/story-comprehension-reader-design.md` into a working tool in small, verifiable steps. It is intentionally incremental: each phase should leave the codebase in a usable state, with focused tests and clear module boundaries.

## Goals

- Build `/tools/story-reader/` as a browser-only language-learning reader.
- Keep prompt generation, JSON parsing, validation, normalization, warnings, and UI rendering separated.
- Make malformed external-AI output recoverable without making the reader components defensive everywhere.
- Preserve a calm reading experience while supporting progressive help.
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

- [ ] Confirm final JSON schema fields and allowed values from the design doc.
- [ ] Add implementation constants for levels, lengths, translation styles, directions, segment kinds, and question difficulty.
- [ ] Add route metadata and registry entry for `story-reader`.
- [ ] Create the empty `/tools/story-reader/` page.
- [ ] Create `src/features/story-reader/` with domain, services, hooks, components, examples, and test fixtures.
- [ ] Add a minimal page shell with toolbar, setup panel, paste panel, and placeholder status.
- [ ] Validate that the empty tool builds, typechecks, and appears in the tools list.

### Phase 1: Setup Form And Prompt Generation

- [ ] Implement setup form state with required fields: known language, target language, level, theme, length, translation style.
- [ ] Implement optional fields: vocabulary focus, tone, avoid topics, extra instructions.
- [ ] Implement `Custom` level fields, but keep them hidden until `Custom` is selected.
- [ ] Implement prompt constraint expansion for length presets.
- [ ] Implement prompt constraint expansion for level presets.
- [ ] Implement prompt constraint expansion for translation style.
- [ ] Generate the prompt from a pure service function.
- [ ] Omit blank optional requirement lines from the human-readable prompt section.
- [ ] Represent blank optional `generationRequest` values as JSON `null`.
- [ ] Add prompt preview.
- [ ] Add copy prompt behavior with transient feedback.
- [ ] Validate that `Copy Prompt` is disabled until required fields are present.

### Phase 2: JSON Input, Cleanup, And Parsing

- [ ] Implement raw JSON textarea state.
- [ ] Implement `Format JSON` for valid parsed content.
- [ ] Implement common AI-wrapper cleanup.
- [ ] Strip Markdown JSON fences.
- [ ] Trim surrounding prose using a conservative string-aware JSON object scanner.
- [ ] Preserve raw pasted text separately from cleaned JSON text.
- [ ] Parse JSON safely and return line/column syntax errors when possible.
- [ ] Add invalid JSON validation output in plain language.
- [ ] Validate that cleanup warnings render without blocking valid cleaned JSON.

### Phase 3: Schema Validation And Normalization

- [ ] Validate `schemaVersion` exactly equals `1.0`.
- [ ] Validate required story fields.
- [ ] Validate `paragraphs` is a non-empty array.
- [ ] Validate every paragraph has an id and at least one sentence.
- [ ] Validate paragraph ids are unique.
- [ ] Validate every sentence has `id`, `text`, and `naturalTranslation`.
- [ ] Validate sentence ids are unique.
- [ ] Validate enum fields only accept allowed values.
- [ ] Validate segment concatenation after NFC normalization.
- [ ] Disable vocabulary highlights for invalid segment sets without blocking the story.
- [ ] Normalize missing optional arrays to empty arrays in the renderable view model.
- [ ] Normalize missing directions to `auto` with a warning.
- [ ] Normalize translation display order from the requested translation style.
- [ ] Produce one renderable story view model consumed by UI components.

### Phase 4: Render Warnings And Repair Prompt

- [ ] Implement warning categories: `cleanup`, `structural`, `request-mismatch`, `quality`.
- [ ] Add deterministic warnings for cleanup, segment mismatch, missing direction, missing literal translation, and count mismatch.
- [ ] Add conservative quality warnings for missing explanations and repeated clues.
- [ ] Keep heuristic warnings visually quieter than structural warnings.
- [ ] Implement repair prompt generation from validation errors and raw pasted output.
- [ ] Include at most 40,000 characters of invalid output in the repair prompt.
- [ ] Prefer the extracted JSON-looking object when raw output contains surrounding prose.
- [ ] Add a truncation note when repair prompt input is clipped.
- [ ] Add `Copy Repair Prompt` only when validation fails.

### Phase 5: Reader Shell

- [ ] Render story title, languages, level, estimated reading time, and warning count.
- [ ] Render paragraphs and sentences from the normalized view model.
- [ ] Render sentence text from `segments[].text` only when segments are valid.
- [ ] Render sentence text from `sentence.text` when segments are missing or invalid.
- [ ] Add active sentence state.
- [ ] Add remembered reveal level per sentence.
- [ ] Add `Reset Reveals`.
- [ ] Add reading progress such as `Paragraph 2 of 5`.
- [ ] Add paste/read mode switching.
- [ ] Preserve active sentence and scroll target when switching modes.

### Phase 6: Sentence Help

- [ ] Implement side panel on desktop and simple bottom help panel on mobile.
- [ ] Add reveal sequence: `Clue`, `Meaning`, `Translation`, `Why it works`.
- [ ] Render natural and literal translation according to display order.
- [ ] Render grammar notes, usage notes, common mistakes, word-by-word rows, and segment morphology under `Why it works`.
- [ ] Hide missing optional reveal sections instead of showing empty placeholders.
- [ ] Make `R` reveal the next available help stage when the textarea is not focused.
- [ ] Return focus to the triggering sentence when help closes.

### Phase 7: Vocabulary And Paragraph Help

- [ ] Render hintable segments with dotted underline and keyboard focus.
- [ ] Avoid nested button markup inside sentence controls.
- [ ] Open vocabulary popover on desktop.
- [ ] Open vocabulary help in the bottom panel on mobile.
- [ ] Render lemma, part of speech, meaning, hint, pronunciation/romanization, and story fragment when available.
- [ ] Add paragraph `Check paragraph` controls only when paragraph help exists.
- [ ] Render paragraph question first, then reveal key point, summary, and answer.
- [ ] Remember paragraph reveal state by paragraph id.

### Phase 8: Mobile And Accessibility Hardening

- [ ] Implement mobile paste mode with full-screen textarea and sticky `Render Story`.
- [ ] Implement mobile help panel that does not cover the active sentence where possible.
- [ ] Defer advanced snap points unless the component is already available.
- [ ] Implement roving focus for sentence navigation.
- [ ] Keep only the active sentence in the normal tab order.
- [ ] Make vocabulary terms in the active sentence keyboard reachable.
- [ ] Add `J` / `K` sentence navigation when text inputs are not focused.
- [ ] Add `Esc` close behavior for popovers and help panels.
- [ ] Add visible labels and associated error text for the JSON textarea.
- [ ] Set `dir` attributes on story and help regions.
- [ ] Add accessible shortcut help in a toolbar menu or dialog.

### Phase 9: Curated Examples

- [ ] Add Spanish A1 example fixture.
- [ ] Add Japanese A2 example fixture with romanization and particle notes.
- [ ] Add one RTL or non-Latin-script example fixture.
- [ ] Ensure examples are valid schema `1.0`.
- [ ] Ensure examples double as parser and renderer regression fixtures.
- [ ] Add `Load Example` menu.
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
src/features/story-reader/
  components/
    StoryReaderPageView.tsx
    StoryReaderToolbar.tsx
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
    useStoryReader.ts
    useStoryReaderKeyboard.ts
    useStoryReaderFocus.ts
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
src/app/tools/story-reader/
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
- JSON cleanup.
- Clipboard abstraction.
- Example loading helpers.

Prompt generation should be deterministic. Given the same setup state, it should produce the same prompt text.

### Hooks Layer

Hooks coordinate browser and UI state.

Responsibilities:

- Setup form state.
- Raw and cleaned JSON text.
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
type StoryReaderState = {
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
  -> StoryReaderViewModel
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
- Blank optional `generationRequest` values become JSON `null`.
- `Short`, `Medium`, and `Long` expand to the correct constraints.
- `Beginner`, `A1`, `A2`, `B1`, `B2`, `C1`, `C2`, and `Custom` expand correctly.
- Translation style rules always require `naturalTranslation`.
- Prompt contains the schema version and allowed values.
- Prompt is deterministic for the same setup state.

### JSON Cleanup Tests

- Plain JSON is unchanged except trimming.
- Markdown fenced JSON is extracted.
- JSON surrounded by prose is extracted.
- Braces inside quoted strings do not break extraction.
- Multiple top-level JSON-looking objects are treated conservatively.
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
- Repair prompt asks for JSON only.
- Repair prompt preserves story content unless schema repair requires changes.

## Functional Testing Strategy

Use Playwright for user-visible workflows.

### Setup And Prompt Flow

- Tool page loads from `/tools/story-reader/`.
- `Copy Prompt` is disabled until required fields are filled.
- Filling required fields enables `Copy Prompt`.
- Prompt preview updates as form fields change.
- Optional blank fields do not appear in the human-readable prompt requirement list.
- Copy prompt writes expected text to the clipboard.

### JSON Paste Flow

- Pasting valid example JSON renders the reader.
- Pasting Markdown-wrapped JSON renders with a cleanup warning.
- Pasting invalid JSON shows validation errors.
- Invalid JSON shows `Copy Repair Prompt`.
- `Format JSON` formats valid JSON and leaves invalid JSON recoverable.

### Reader Flow

- Rendered story shows title, language pair, level, progress, and paragraphs.
- Clicking a sentence opens sentence help.
- Reveal action advances from `Clue` to `Meaning` to `Translation` to `Why it works`.
- Returning to a sentence preserves reveal level.
- `Reset Reveals` resets sentence reveal state.
- Vocabulary segment opens help on desktop.
- Paragraph check shows question first and reveals clue, summary, and answer.
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

- JSON textarea has a visible label and associated error text.
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

- JSON cleanup tests pass.
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
- Do not let UI components inspect raw pasted JSON.
- Do not let UI components know about cleanup or parsing details.
- Do not let domain logic import browser APIs.
- Do not encode language-specific hacks in components.
- Add fixtures for every bug found in pasted AI output.

## Suggested MVP Cut

If scope needs to be reduced, ship this first:

- Setup form.
- Prompt generation and copy.
- Prompt preview.
- JSON paste, cleanup, parsing, validation.
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
- Should examples live as TypeScript fixtures, JSON files under `public`, or both?
- Should `estimatedMinutes` be trusted from JSON or recomputed locally from text length?
- Should `Copy Prompt Again` be merged with `Copy Prompt`, or renamed to `Regenerate Story Prompt`?
- Which existing UI primitive should power desktop popovers and mobile bottom help?
- How much custom language counting should be implemented before deferring to warnings?

## Definition Of Done

- The tool can generate a strict prompt from setup inputs.
- The tool can parse and render a valid external-AI JSON story.
- The tool gives clear recovery steps for malformed pasted output.
- The reader supports progressive sentence help and vocabulary help.
- Invalid optional enhancements do not block reading.
- Core behavior is covered by unit tests.
- Primary workflows are covered by Playwright functional tests.
- Accessibility checks pass for the page.
- The implementation follows the feature module boundaries above.
