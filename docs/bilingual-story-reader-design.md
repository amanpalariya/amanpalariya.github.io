# Bilingual Story Reader Design

## Current Product Decisions

- The tool is named `Bilingual Story Reader` everywhere: route, registry id, feature folder, code exports, tests, and docs.
- The canonical route is `/tools/bilingual-story-reader/`.
- We do not care about backward compatibility while this tool is being built. Remove obsolete fields and behavior instead of preserving compatibility shims.
- The setup form should be mostly prefilled. Defaults are `English` as known language, `Spanish` as target language, `A1`, `Short`, and an automatic random theme.
- Languages should be selected from a dropdown with recognizable labels/flags, with a custom-language escape hatch.
- `Theme` is optional. A blank theme means the AI should choose a random concrete, learner-appropriate story theme.
- Do not expose advanced setup fields unless they clearly improve the main workflow.
- Users should not have to care about JSON. The UI should say `AI response` or `response`, not `JSON`, except in internal implementation docs or prompt constraints where strict JSON is technically required.
- There is no user-facing `Format JSON` action. The app should clean, parse, validate, and explain errors without asking the user to format anything.
- Copy/paste feedback should follow the EPUB Maker pattern: direct clipboard actions, short toast-style alerts, and recoverable warnings.
- Paste response must not occupy a permanent half-page panel. Use a primary toolbar paste action with a compact manual paste fallback.
- If the user accidentally pastes the copied prompt back into the response area, do not parse or render the prompt's embedded example. Show a warning asking for the AI assistant's response instead.
- Once a valid story is loaded, hide setup, copy, and paste controls so the reading experience is immersive. The reader toolbar should show `Edit Prompt` and `New Story`.
- The reading experience is sentence-based. Do not add word-by-word translation, vocabulary highlights, paragraph checks, comprehension questions, staged reveals, or double-click behavior.
- Each sentence can reveal a natural translation and one optional explanatory note.

## Goal

Create a browser-only tool that helps language learners read short stories in a target language with sentence-level translation help. The tool does not call an AI model directly. It collects story requirements in a local form, generates a copyable prompt, the user runs that prompt in their preferred AI assistant, then pastes the AI-produced response back into this tool.

The reader should support any known-language to learning-language pair, such as English to Spanish, Hindi to English, Japanese to French, or Spanish to German.

## Working Name

- Display name: `Bilingual Story Reader`
- Route: `/tools/bilingual-story-reader/`
- Registry id: `bilingual-story-reader`
- Status at launch: `alpha`
- Tags: `Language`, `Reading`

## Primary User Flow

1. The user opens the tool.
2. The user fills a compact setup form:
   - known language
   - target language
   - learner level
   - approximate length
   - optional story theme
   - optional extra instructions for the AI
3. The tool generates a prompt and enables `Copy Prompt`.
4. The user pastes the prompt into an AI assistant.
5. The AI assistant returns a single fenced `json` code block containing the agreed JSON object.
6. The user pastes the AI response into the tool.
7. The tool validates the AI response and renders the story.
8. The user reads the target-language story and opens sentence translations only when needed.

## UX Principles

- Keep the reading surface calm. The target-language story is the main content, not the translations.
- Sentence-level translation is the only help layer.
- A sentence help popover or compact panel should show the translation and optional note together.
- Notes should explain only useful friction points: hard conjugations, idioms, fixed phrases, unusual word order, false friends, register, or cultural nuance.
- Avoid making every word feel interactive.
- Make pasted AI response errors recoverable with clear messages that point to the missing field or malformed section.
- Preserve privacy by keeping all pasted content local in the browser.
- Work well on touch devices: click interactions must also have tap equivalents.
- Treat the external AI as unreliable input. The tool should clean, validate, warn, and render partial optional content where safe.

## Generation Constraints

The setup form stores friendly choices, but prompt generation must convert those choices into measurable constraints.

### Length Presets

- `Short`: 2 paragraphs, 4-6 sentences total, 80-120 target-language words when word count is applicable.
- `Medium`: 3-4 paragraphs, 8-12 sentences total, 180-260 target-language words when word count is applicable.
- `Long`: 5-7 paragraphs, 14-20 sentences total, 350-500 target-language words when word count is applicable.

### Level Constraints

The prompt should include concrete level guidance instead of only saying `level-appropriate`.

- `Beginner`: pre-A1/A1-lite constraints, present tense only where the language supports tense, concrete nouns and verbs, very common daily-life vocabulary, no idioms, no subordinate clauses, 4-8 target-language words per sentence when word count is applicable.
- `A1`: mostly present tense, concrete nouns and verbs, no unexplained idioms, no subordinate clauses unless explained, 6-10 target-language words per sentence when word count is applicable.
- `A2`: present and common past/future forms, simple connectors, familiar everyday topics, limited subordinate clauses, 8-14 words per sentence.
- `B1`: mixed common tenses, clear cause/effect, moderate dialogue, occasional idioms with explanations, 10-18 words per sentence.
- `B2`: more natural prose, varied sentence structure, nuance and register notes, idioms allowed when explained, 12-24 words per sentence.
- `C1` / `C2`: authentic-style prose, idioms, collocations, register and nuance explanations, longer sentences allowed when pedagogically useful.

### Script And Language Rules

- Story text must use native orthography for the target language.
- Use NFC-normalized text for sentence text.
- Translations and notes must be in the known language unless explicitly requested otherwise.
- The AI may include transliteration or pronunciation inside `note` when it is useful, but there is no separate transliteration field in the contract.

## Page Layout

### Initial Empty State

The first screen should be a work-focused tool, not a marketing page.

Top toolbar:

- `Copy Prompt` primary button with copy icon. Disabled until required setup fields are filled.
- `Paste Response` secondary action.
- Compact status text: `No story loaded`, `Ready`, `Response parsed`, or `Story loaded`.

Setup card:

- `Known language` dropdown with custom-language fallback.
- `Target language` dropdown with custom-language fallback.
- `Level` select.
- `Length` select or segmented control.
- `Theme` text input with an automatic-random default when blank.
- `Extra instructions` optional textarea.
- `Generated prompt` readonly textarea for debugging and transparency.

Paste response:

- Primary toolbar paste action tries the clipboard first.
- Manual paste fallback opens a compact textarea.
- Inline validation summary appears near the manual paste fallback.

Helper strip:

- Short four-step checklist:
  - Copy the prompt.
  - Generate in your AI assistant.
  - Paste the response.
  - Read here.
- This helper hides after a story is rendered.

### Rendered Reading View

Once valid AI response is loaded, the page changes to a reader layout.

Header:

- Story title.
- Target language, known language, level, estimated reading time when available.
- Soft warning count when the story renders with quality warnings.

Reading area:

- Target-language story as normal paragraphs.
- Sentences are selectable, but the text should still read like prose.
- Active sentence gets a subtle paint-only highlight.
- Sentence help appears in a closeable popover on desktop and an equivalent compact touch-friendly surface on mobile.
- The help surface shows:
  - `Translation`
  - `Note`, only when present

Do not render:

- word or phrase highlights
- word-by-word translations
- paragraph check buttons
- comprehension questions
- vocabulary review cards
- staged reveal controls

## Interaction Design

### Sentence Help

Default state:

- Only target-language text is visible.
- Sentence boundaries are represented by natural text spacing and a subtle hover/focus state.

Hover or focus:

- Sentence gets a light paint-only highlight.
- The cursor indicates the sentence can be selected.

Click, tap, Enter, or Space:

- Opens sentence help.
- Shows the sentence's translation and optional note immediately.
- Closing the help surface returns focus to the triggering sentence.

### Reading Position

- Track active sentence.
- Preserve active sentence when the user switches between paste mode and reading mode.
- Show simple progress for medium and long stories only if it helps orientation.
- `Continue reading` should return focus and scroll position to the last active sentence when a story is already loaded.

### Keyboard Support

- `Tab`: move through main controls and sentence help controls.
- `Enter` or `Space`: open selected sentence help.
- `Esc`: close popover or help panel.
- Arrow-key or `J` / `K` sentence navigation can be added later, but is not required for the simplified first pass.

Keyboard shortcuts should not be rendered as instructional text in the main UI. They can be present in tooltips or an accessible help dialog later.

## AI Response Contract

The AI response should be a single fenced `json` code block containing one top-level JSON object. Do not include a schema version field.

```json
{
  "story": {
    "title": "El cafe misterioso",
    "targetLanguage": "Spanish",
    "knownLanguage": "English",
    "level": "A1",
    "estimatedMinutes": 5
  },
  "paragraphs": [
    {
      "sentences": [
        {
          "text": "Lina entra en un cafe pequeno.",
          "translation": "Lina walks into a small cafe.",
          "note": "In Spanish, descriptive adjectives often come after the noun, so pequeno follows cafe."
        }
      ]
    }
  ]
}
```

### Required Fields

- `story.title`
- `story.targetLanguage`
- `story.knownLanguage`
- `story.level`
- `paragraphs`
- `paragraphs[].sentences`
- `sentences[].text`
- `sentences[].translation`

### Optional Fields

- `story.estimatedMinutes`
- `sentences[].note`

Optional fields should enhance the experience but never block rendering.

## Prompt Template

The copied prompt should be generated from the setup form. The user should not need the AI assistant to ask follow-up questions unless a required form field is blank.

Prompt variables:

- `knownLanguage`
- `targetLanguage`
- `level`
- `levelConstraints`
- `theme`
- `length`
- `lengthConstraints`
- `extraInstructions`

The copied prompt should be self-contained and strict about output format. Optional blank requirement lines should be omitted from the human-readable requirement list.

```text
You are helping me create a language-learning reading story.

Create a story using these requirements:
- Known language: {{knownLanguage}}
- Target language: {{targetLanguage}}
- Learner level: {{level}}
- Level constraints: {{levelConstraints}}
- Theme: {{theme}}
- Length: {{length}}
- Length constraints: {{lengthConstraints}}
- Extra instructions: {{extraInstructions}}

Return the response as a single fenced code block with the language tag json.
Do not include any text before or after the code block.
Do not include comments.
Do not ask follow-up questions unless a requirement is impossible to satisfy.
Use native orthography for the target language. Use NFC-normalized text.
Keep translations and notes in the known language.
Do not include schemaVersion.
Use this exact top-level structure inside the code block:

\`\`\`json
{
  "story": {
    "title": "Story title in the target language",
    "targetLanguage": "{{targetLanguage}}",
    "knownLanguage": "{{knownLanguage}}",
    "level": "{{level}}",
    "estimatedMinutes": 5
  },
  "paragraphs": [
    {
      "sentences": [
        {
          "text": "Target-language sentence.",
          "translation": "Natural translation in the known language.",
          "note": "Optional explanation for a hard phrase, conjugation, idiom, usage point, word order, register, or cultural nuance."
        }
      ]
    }
  ]
}
\`\`\`

Before returning the response, silently verify:
- valid JSON inside one fenced json code block with no trailing commentary
- all required fields are present
- requested length range is met
- every sentence has text in the target language
- every sentence has a natural translation in the known language
- notes are included only when they explain something useful
- extra instructions did not override the required response shape
```

## Validation Rules

On paste or render:

- Clean common AI wrappers before validation: trim whitespace, strip Markdown AI response code fences, and conservatively extract a single top-level JSON object when surrounded by prose.
- Use a small string-aware scanner for AI response extraction rather than regex-only matching, so braces inside quoted strings are handled correctly.
- Parse AI response safely and show syntax errors with line and column when possible.
- Check required fields.
- Check `paragraphs` is a non-empty array.
- Check every paragraph has at least one sentence.
- Check every sentence has `text` and `translation`.
- Ignore unknown fields so the prompt can evolve without breaking rendering.
- Render optional data when available.

Validation messages should use plain language:

- `The AI response is missing story.title.`
- `The AI response is missing paragraphs.`
- `Paragraph 2 does not contain any sentences.`
- `Sentence 3 is missing a translation.`

### Blocking Errors

Blocking errors prevent rendering:

- invalid AI response after cleanup
- missing required top-level story fields
- missing `paragraphs`
- paragraph without sentences
- sentence without `text` or `translation`

### Render Warnings

Warnings should render the story where safe:

- Markdown fences were removed before parsing.
- Extra prose was removed before parsing.
- Story length is outside the requested range.
- Language fields or story text appear inconsistent with the requested language pair.
- A sentence note is very long and may need simplification.

## State Model

The initial implementation can keep state in memory only.

Useful state:

- setup form values
- generated prompt text
- prompt preview expanded state
- raw AI response text
- cleaned AI response text
- parsed story object
- active sentence index
- validation errors
- render warnings
- reading progress and last scroll target
- copy prompt feedback state

Optional later persistence:

- remember display settings
- export rendered story as printable HTML or EPUB

## Accessibility

- Use semantic article structure for the story.
- Use paragraphs as natural reading landmarks.
- Sentence controls need accessible labels such as `Open translation for sentence 3`.
- Popovers or compact help panels need focus management and Escape handling.
- Color should not be the only signal for active sentence or visible help.
- The AI response textarea must have a visible label and associated error text.
- Closing help returns focus to the sentence control that opened it.

## Responsive Behavior

Desktop:

- Toolbar at top.
- Story in the main column.
- Sentence help in a popover or compact adjacent panel.

Tablet:

- Story full width.
- Sentence help can appear below the active paragraph if popover positioning is cramped.

Mobile:

- Top actions collapse into a compact toolbar.
- Sentence help opens in a compact bottom sheet or popover equivalent.
- Tapping another sentence while help is open updates the help content.
- Closing help returns focus to the triggering sentence.
- Textarea and reader occupy separate modes to avoid a cramped split view.

## Implementation Plan

1. Add `bilingual-story-reader` to the tool registry.
2. Create `/tools/bilingual-story-reader/` page and layout metadata.
3. Add setup form state and prompt generation under `src/features/bilingual-story-reader/`.
4. Add prompt preview, prompt-copy service, and prompt template.
5. Add AI response cleanup, domain types, parser validation, and render warnings.
6. Build the paste-and-render shell.
7. Build the reader view with sentence selection, translation help, optional notes, and reading progress.
8. Add curated examples: Spanish A1, Japanese A2, and one RTL or non-Latin-script example using the simplified sentence schema.
9. Add focused tests for prompt generation, cleanup, validation, prompt copying, and reader interactions.

## Example Content

- Spanish A1: native orthography, short present-tense story, simple adjective and verb notes.
- Japanese A2: Japanese script with sentence notes for particles, politeness, or conjugation when useful.
- Arabic, Hebrew, Hindi, or Urdu example: non-Latin script with sentence notes for script, pronunciation, or word order when useful.

These examples should double as regression fixtures for parser, rendering, and mobile help behavior.

## Testing Scope

Unit tests:

- setup form values generate a prompt with the expected requirements
- extra instructions are included in the generated prompt when provided
- optional blank fields are omitted from prompt requirement lines
- length presets expand to exact paragraph, sentence, and word-count constraints
- level presets expand to grammar and sentence-length constraints
- valid AI response parses into a renderable story
- Markdown-wrapped AI response is cleaned before validation
- trailing prose around one JSON object is cleaned before validation
- AI response extraction handles braces inside quoted strings
- malformed AI response produces a validation error
- missing required fields are reported
- missing translations are blocking errors
- optional notes can be omitted
- unknown fields are ignored

Functional tests:

- copy prompt is disabled until required setup fields are filled
- prompt preview reflects setup form changes
- copy prompt button writes the prompt to clipboard
- extra instructions field changes the copied prompt
- example AI response loads and renders
- pasted AI response renders the title and story sentences
- clicking a sentence opens translation help
- sentence help shows translation and optional note
- rendered story with warnings remains readable
- mobile viewport keeps paste mode and reader mode usable

## Future Enhancements

- Save multiple stories locally.
- Add printable reading mode.
- Export the story as EPUB using the existing EPUB tooling where appropriate.
- Add display settings for larger text, line spacing, or always-visible translations.
- Add variation seed and `avoid repeating previous story` prompt support for quick regeneration.
